import { spawn } from "child_process";
import multer from "multer";
import path from "path";
import { promises as fs } from "fs";
import { Pool } from "pg";

const pool = new Pool({
  user: "resume_user",
  host: "localhost",
  database: "resume_checker_db",
  password: "your_secure_password",
  port: 5432,
});

// Configure multer for file uploads
// Save uploaded files to the uploads/ folder
const uploadDir = path.resolve(__dirname, "../../uploads");
const upload = multer({ dest: uploadDir });

// Disable Next.js default body parser for multipart/form-data
export const config = {
  api: {
    bodyParser: false,
  },
};

// API handler
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Process file upload with multer
  upload.single("resume")(req, res, async (err) => {
    if (err) {
      console.error("Multer error:", err);
      return res.status(500).json({ error: "File upload failed", details: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No resume file uploaded" });
    }

    const pdfPath = req.file.path;
    const jobKeywords = req.body.keywords || "python,machine learning,data analysis";

    console.log("PDF Path:", pdfPath);
    console.log("Job Keywords:", jobKeywords);

    try {
      // Define the absolute path to the Python script
      const pythonScriptPath = "/Users/pushkalpratapsingh/Downloads/resume-checker-builder/ML/resume-checker.py";
      console.log("Python Script Path:", pythonScriptPath);

      // Define the absolute path to the python3 executable in the virtual environment
      const pythonExecutable = "/Users/pushkalpratapsingh/Downloads/resume-checker-builder/.venv/bin/python3";
      console.log("Python Executable Path:", pythonExecutable);

      // Run Python script with python3
      const pythonProcess = spawn(pythonExecutable, [pythonScriptPath, pdfPath, jobKeywords]);

      let output = "";
      let errorOutput = "";

      pythonProcess.stdout.on("data", (data) => {
        output += data.toString();
        console.log("Python stdout:", data.toString());
      });

      pythonProcess.stderr.on("data", (data) => {
        errorOutput += data.toString();
        console.error("Python stderr:", data.toString());
      });

      pythonProcess.on("error", (error) => {
        console.error("Spawn error:", error);
      });

      pythonProcess.on("close", async (code) => {
        console.log("Python process exited with code:", code);

        // Clean up the temporary uploaded file
        try {
          await fs.unlink(pdfPath);
        } catch (cleanupError) {
          console.error("Failed to delete temp file:", cleanupError);
        }

        if (code !== 0) {
          return res.status(500).json({
            error: "Python script failed",
            details: errorOutput || "Unknown error",
            exitCode: code,
          });
        }

        let result;
        try {
          result = JSON.parse(output);
        } catch (parseError) {
          console.error("JSON parse error:", parseError);
          return res.status(500).json({ error: "Invalid Python output", details: parseError.message });
        }

        if (result.error) {
          return res.status(400).json(result);
        }

        // Save to PostgreSQL (optional - remove if not using a database)
        try {
          const client = await pool.connect();
          await client.query(
            "INSERT INTO resume_checks (ats_score, matched_keywords, suggestions, created_at) VALUES ($1, $2, $3, $4)",
            [result.ats_score, result.matched_keywords, result.suggestions, new Date()]
          );
          client.release();
        } catch (dbError) {
          console.error("Database error:", dbError);
        }

        res.status(200).json(result);
      });
    } catch (error) {
      console.error("Server error:", error);
      // Clean up the temporary file in case of an error
      await fs.unlink(pdfPath).catch(() => {});
      res.status(500).json({ error: "Server error", details: error.message });
    }
  });
}