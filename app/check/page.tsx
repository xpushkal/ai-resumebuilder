"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, FileText, Upload, CheckCircle, AlertCircle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export default function CheckResume() {
  const [file, setFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const [jobDescription, setJobDescription] = useState("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleAnalyzeResume = () => {
    if (!file && !jobDescription) return

    setIsAnalyzing(true)

    // Simulate AI analysis with a timeout
    setTimeout(() => {
      setIsAnalyzing(false)
      setAnalysisComplete(true)
    }, 3000)
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              <FileText className="h-6 w-6" />
              <span>ResumeAI</span>
            </Link>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link href="/" className="font-medium">
              Home
            </Link>
            <Link href="/check" className="font-medium">
              Check Resume
            </Link>
            <Link href="/build" className="font-medium">
              Build Resume
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 py-12">
        <div className="container px-4 md:px-6">
          <div className="flex items-center gap-2 mb-8">
            <Link href="/" className="inline-flex items-center gap-1 text-sm font-medium">
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Link>
          </div>

          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">AI Resume Checker</h1>
              <p className="text-gray-500 md:text-xl">
                Upload your resume and optionally add a job description to get personalized feedback and improvement
                suggestions.
              </p>

              {!analysisComplete ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Upload Your Resume</CardTitle>
                    <CardDescription>We support PDF, DOCX, and TXT formats</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-slate-50 transition-colors">
                      <Input
                        type="file"
                        id="resume-upload"
                        className="hidden"
                        accept=".pdf,.docx,.txt"
                        onChange={handleFileChange}
                      />
                      <Label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center gap-2">
                        <Upload className="h-10 w-10 text-gray-400" />
                        <span className="font-medium">{file ? file.name : "Click to upload or drag and drop"}</span>
                        <span className="text-sm text-gray-500">
                          {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "PDF, DOCX or TXT (max 5MB)"}
                        </span>
                      </Label>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="job-description">Job Description (Optional)</Label>
                      <Textarea
                        id="job-description"
                        placeholder="Paste the job description here for more targeted analysis..."
                        className="min-h-[150px]"
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                      />
                      <p className="text-sm text-gray-500">
                        Adding a job description helps our AI tailor feedback to the specific role
                      </p>
                    </div>

                    <Button onClick={handleAnalyzeResume} disabled={!file && !jobDescription} className="w-full">
                      {isAnalyzing ? (
                        <>
                          Analyzing Resume... <Progress value={45} className="ml-2 w-20" />
                        </>
                      ) : (
                        <>
                          Analyze Resume <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      Analysis Complete
                    </CardTitle>
                    <CardDescription>Resume: {file?.name || "resume.pdf"}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Overall Score</span>
                        <span className="text-lg font-bold">72/100</span>
                      </div>
                      <Progress value={72} className="h-2" />

                      <p className="text-sm text-gray-500 mt-2">
                        Your resume is good but has room for improvement. See detailed feedback below.
                      </p>

                      <Button className="w-full">Download Detailed Report</Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {analysisComplete && (
              <div className="space-y-6">
                <Tabs defaultValue="summary">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                    <TabsTrigger value="content">Content</TabsTrigger>
                    <TabsTrigger value="keywords">Keywords</TabsTrigger>
                    <TabsTrigger value="format">Format</TabsTrigger>
                  </TabsList>

                  <TabsContent value="summary" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Resume Strengths</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                            <span>Strong professional experience section with quantifiable achievements</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                            <span>Good education credentials that match the industry requirements</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                            <span>Clear contact information and professional summary</span>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Areas for Improvement</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2">
                            <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                            <span>Skills section lacks specific technical skills mentioned in the job description</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                            <span>Work experience bullet points could use more action verbs</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                            <span>Resume is slightly too long at 2.5 pages - consider condensing to 1-2 pages</span>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="content">
                    <Card>
                      <CardHeader>
                        <CardTitle>Content Analysis</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Professional Summary</span>
                            <span className="text-sm font-medium text-amber-500">Needs Improvement</span>
                          </div>
                          <p className="text-sm text-gray-500">
                            Your summary is too generic. Make it more specific to the job you're applying for and
                            highlight your unique value proposition.
                          </p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Work Experience</span>
                            <span className="text-sm font-medium text-green-500">Strong</span>
                          </div>
                          <p className="text-sm text-gray-500">
                            Good use of quantifiable achievements. Consider adding more specific results and metrics to
                            strengthen impact.
                          </p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Skills Section</span>
                            <span className="text-sm font-medium text-amber-500">Needs Improvement</span>
                          </div>
                          <p className="text-sm text-gray-500">
                            Add more technical skills relevant to the job description. Consider organizing skills by
                            category.
                          </p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Education</span>
                            <span className="text-sm font-medium text-green-500">Strong</span>
                          </div>
                          <p className="text-sm text-gray-500">
                            Well-formatted and relevant. Consider adding relevant coursework if you're early in your
                            career.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="keywords">
                    <Card>
                      <CardHeader>
                        <CardTitle>Keyword Analysis</CardTitle>
                        <CardDescription>Based on the job description and industry standards</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <h3 className="font-medium">Missing Keywords</h3>
                          <div className="flex flex-wrap gap-2">
                            <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                              project management
                            </div>
                            <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                              agile methodology
                            </div>
                            <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                              cross-functional teams
                            </div>
                            <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                              stakeholder management
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h3 className="font-medium">Present Keywords</h3>
                          <div className="flex flex-wrap gap-2">
                            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                              data analysis
                            </div>
                            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                              team leadership
                            </div>
                            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                              strategic planning
                            </div>
                            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                              budget management
                            </div>
                          </div>
                        </div>

                        <div className="pt-2">
                          <h3 className="font-medium mb-2">Keyword Density</h3>
                          <div className="space-y-2">
                            <div>
                              <div className="flex items-center justify-between text-sm">
                                <span>leadership</span>
                                <span>3 mentions</span>
                              </div>
                              <Progress value={75} className="h-2" />
                            </div>
                            <div>
                              <div className="flex items-center justify-between text-sm">
                                <span>analysis</span>
                                <span>2 mentions</span>
                              </div>
                              <Progress value={50} className="h-2" />
                            </div>
                            <div>
                              <div className="flex items-center justify-between text-sm">
                                <span>strategic</span>
                                <span>1 mention</span>
                              </div>
                              <Progress value={25} className="h-2" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="format">
                    <Card>
                      <CardHeader>
                        <CardTitle>Format Analysis</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Length</span>
                            <span className="text-sm font-medium text-red-500">Too Long</span>
                          </div>
                          <p className="text-sm text-gray-500">
                            Your resume is 2.5 pages. Consider condensing to 1-2 pages for better readability.
                          </p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Readability</span>
                            <span className="text-sm font-medium text-green-500">Good</span>
                          </div>
                          <p className="text-sm text-gray-500">
                            Font size and spacing are appropriate. Good use of headings and sections.
                          </p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">ATS Compatibility</span>
                            <span className="text-sm font-medium text-amber-500">Moderate</span>
                          </div>
                          <p className="text-sm text-gray-500">
                            Some formatting may cause issues with ATS systems. Avoid tables, headers/footers, and
                            complex formatting.
                          </p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">File Format</span>
                            <span className="text-sm font-medium text-green-500">Good</span>
                          </div>
                          <p className="text-sm text-gray-500">
                            PDF format is appropriate for most applications. Consider having a .docx version available
                            as well.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setAnalysisComplete(false)}>
                    Upload New Resume
                  </Button>
                  <Link href="/build">
                    <Button>Improve with Resume Builder</Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-sm text-gray-500">© 2025 ResumeAI. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#" className="text-sm text-gray-500 hover:underline">
              Terms
            </Link>
            <Link href="#" className="text-sm text-gray-500 hover:underline">
              Privacy
            </Link>
            <Link href="#" className="text-sm text-gray-500 hover:underline">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

