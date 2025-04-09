import kagglehub
import os
import pandas as pd
import pdfplumber
import nltk
from nltk.tokenize import sent_tokenize
from sentence_transformers import SentenceTransformer, InputExample, losses
from sentence_transformers.util import cos_sim
from torch.utils.data import DataLoader
from sentence_transformers.evaluation import EmbeddingSimilarityEvaluator
import random
import spacy
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, accuracy_score
import numpy as np
import torch.optim
from transformers.optimization import get_cosine_schedule_with_warmup

# Download NLTK data
nltk.download('punkt')

# Load spaCy model for tokenization
nlp = spacy.load("en_core_web_sm")

# Step 1: Download the d]
# _+{}"({?P*:dw c 
# \][=P-    ` tasets using kagglehub
print("Downloading gauravduttakiit/resume-dataset...")
path1 = kagglehub.dataset_download("gauravduttakiit/resume-dataset")
print("Path to gauravduttakiit/resume-dataset files:", path1)

print("Downloading snehaanbhawal/resume-dataset...")
path2 = kagglehub.dataset_download("snehaanbhawal/resume-dataset")
print("Path to snehaanbhawal/resume-dataset files:", path2)

# Step 2: Preprocess the datasets
def extract_text_from_pdf(pdf_path):
    """Extract text from a PDF file."""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            text = ""
            for page in pdf.pages:
                text += page.extract_text() or ""
        return text
    except Exception as e:
        return str(e)

def preprocess_text(text):
    """Preprocess text: tokenize into sentences and clean."""
    doc = nlp(text)
    sentences = [sent.text.strip() for sent in doc.sents if sent.text.strip()]
    return " ".join(sentences)

def load_gauravduttakiit_dataset(dataset_path):
    """Load and preprocess the gauravduttakiit/resume-dataset."""
    csv_files = [f for f in os.listdir(dataset_path) if f.endswith('.csv')]
    if not csv_files:
        raise FileNotFoundError("No CSV file found in gauravduttakiit/resume-dataset")
    
    csv_path = os.path.join(dataset_path, csv_files[0])
    df = pd.read_csv(csv_path)
    
    resumes = []
    for idx, row in df.iterrows():
        resume_text = str(row.get('Resume', ''))
        if not resume_text:
            continue
        cleaned_text = preprocess_text(resume_text)
        category = str(row.get('Category', 'Unknown'))
        resumes.append({"text": cleaned_text, "category": category})
    return resumes

def load_snehaanbhawal_dataset(dataset_path):
    """Load and preprocess the snehaanbhawal/resume-dataset."""
    pdf_files = [f for f in os.listdir(dataset_path) if f.endswith('.pdf')]
    resumes = []
    for pdf_file in pdf_files:
        pdf_path = os.path.join(dataset_path, pdf_file)
        resume_text = extract_text_from_pdf(pdf_path)
        if not resume_text:
            continue
        cleaned_text = preprocess_text(resume_text)
        category = pdf_file.split('_')[0] if '_' in pdf_file else 'Unknown'
        resumes.append({"text": cleaned_text, "category": category})
    return resumes


# Load all datasets
print("Loading gauravduttakiit/resume-dataset...")
resumes1 = load_gauravduttakiit_dataset(path1)
print(f"Loaded {len(resumes1)} resumes from gauravduttakiit/resume-dataset")

print("Loading snehaanbhawal/resume-dataset...")
resumes2 = load_snehaanbhawal_dataset(path2)
print(f"Loaded {len(resumes2)} resumes from snehaanbhawal/resume-dataset")



# Combine the datasets
all_resumes = resumes1 + resumes2 
print(f"Total resumes loaded: {len(all_resumes)}")

# Step 3: Create training and validation data
def create_training_pairs(resumes):
    """Create pairs of resumes and job descriptions with match scores."""
    job_descriptions = {
        "Software Engineer": "Looking for a Software Engineer with experience in Python, Java, and machine learning. Must have 3+ years of experience in software development and strong problem-solving skills.",
        "Data Analyst": "Seeking a Data Analyst proficient in data analysis, SQL, Python, and Tableau. Experience with statistical modeling and data visualization is required.",
        "HR Specialist": "Hiring an HR Specialist with expertise in employee relations, recruitment, and talent management. Strong communication skills and 5+ years of experience required.",
        "Machine Learning Engineer": "Looking for a Machine Learning Engineer with expertise in TensorFlow, PyTorch, and deep learning. Experience with NLP and computer vision is a plus.",
        "Product Manager": "Seeking a Product Manager with experience in agile methodologies, product lifecycle management, and stakeholder communication.",
        "Web Developer": "Hiring a Web Developer skilled in JavaScript, React, HTML, CSS, and web development frameworks. Experience with REST APIs and Git is required.",
        "DevOps Engineer": "Looking for a DevOps Engineer with experience in AWS, Docker, Kubernetes, CI/CD pipelines, and infrastructure as code.",
        "Graphic Designer": "Seeking a Graphic Designer with expertise in Adobe Photoshop, Illustrator, and UI/UX design. Experience with branding and print media is a plus.",
        "Marketing Manager": "Hiring a Marketing Manager with skills in digital marketing, SEO, content creation, and campaign management. Strong analytical skills required.",
        "Financial Analyst": "Looking for a Financial Analyst proficient in financial modeling, Excel, and data analysis. Experience in budgeting and forecasting is required.",
        "Cybersecurity Analyst": "Seeking a Cybersecurity Analyst with expertise in network security, penetration testing, and incident response. Certifications like CISSP or CEH are a plus.",
        "Teacher": "Hiring a Teacher with experience in curriculum development, classroom management, and student engagement. Teaching certification required.",
        "Nurse": "Looking for a Nurse with skills in patient care, medical record management, and emergency response. RN license required.",
        "Civil Engineer": "Seeking a Civil Engineer with experience in structural design, project management, and AutoCAD. Knowledge of environmental regulations is a plus.",
        "Accountant": "Hiring an Accountant with expertise in financial reporting, tax preparation, and auditing. CPA certification preferred."
    }

    skill_keywords = {
        "python", "data analysis", "machine learning", "sql", "tableau", "java", "javascript",
        "web development", "software development", "cloud computing", "aws", "azure", "docker",
        "kubernetes", "git", "ci/cd", "agile", "scrum", "project management", "data visualization",
        "statistics", "deep learning", "nlp", "computer vision", "react", "html", "css",
        "photoshop", "illustrator", "ui/ux", "seo", "digital marketing", "financial modeling", "excel",
        "network security", "penetration testing", "incident response", "curriculum development",
        "classroom management", "patient care", "emergency response", "structural design", "autocad",
        "financial reporting", "tax preparation", "auditing"
    }

    pairs = []
    for resume in resumes:
        resume_text = resume['text']
        resume_category = resume['category']
        resume_lower = resume_text.lower()
        resume_skills = set()
        for skill in skill_keywords:
            if skill in resume_lower:
                resume_skills.add(skill)

        for job_title, job_desc in job_descriptions.items():
            job_lower = job_desc.lower()
            job_skills = set()
            for skill in skill_keywords:
                if skill in job_lower:
                    job_skills.add(skill)

            if job_title.lower() in resume_category.lower():
                score = 0.7
            else:
                score = 0.1

            skill_overlap = len(job_skills.intersection(resume_skills)) / len(job_skills) if job_skills else 0
            score = min(1.0, score + skill_overlap * 0.3)
            
            pairs.append({"resume": resume_text, "job_desc": job_desc, "score": score})

    return pairs

# Generate pairs and split into train/validation sets
print("Creating training pairs...")
all_pairs = create_training_pairs(all_resumes)
train_pairs, val_pairs = train_test_split(all_pairs, test_size=0.2, random_state=42)
print(f"Created {len(train_pairs)} training pairs and {len(val_pairs)} validation pairs")

# Convert to InputExamples
train_examples = [InputExample(texts=[pair["resume"], pair["job_desc"]], label=pair["score"]) for pair in train_pairs]
val_examples = [(pair["resume"], pair["job_desc"], pair["score"]) for pair in val_pairs]

# Step 4: Fine-tune the SentenceTransformer model
model = SentenceTransformer('paraphrase-MiniLM-L3-v2')
if hasattr(model[0].auto_model.config, 'hidden_dropout_prob'):
    model[0].auto_model.config.hidden_dropout_prob = 0.1
    model[0].auto_model.config.attention_probs_dropout_prob = 0.1

train_dataloader = DataLoader(train_examples, shuffle=True, batch_size=4)
train_loss = losses.ContrastiveLoss(model)

optimizer = torch.optim.AdamW(model.parameters(), lr=2e-5, weight_decay=0.01)
total_steps = len(train_dataloader) * 8
scheduler = get_cosine_schedule_with_warmup(optimizer, num_warmup_steps=200, num_training_steps=total_steps)

print("Starting model training...")
model.fit(
    train_objectives=[(train_dataloader, train_loss)],
    epochs=8,
    warmup_steps=200,
    optimizer_class=torch.optim.AdamW,
    optimizer_params={'lr': 2e-5, 'weight_decay': 0.01},
    scheduler='WarmupCosine',
    output_path="/Users/pushkalpratapsingh/Downloads/resume-checker-builder/ML/resume_checker_model",
    show_progress_bar=True
)

# Step 5: Evaluate the model on the validation set
print("Evaluating model on validation set...")
val_resume_texts = [pair[0] for pair in val_examples]
val_job_texts = [pair[1] for pair in val_examples]
val_true_scores = [pair[2] for pair in val_examples]

resume_embeddings = model.encode(val_resume_texts, convert_to_tensor=True)
job_embeddings = model.encode(val_job_texts, convert_to_tensor=True)
predicted_scores = cos_sim(resume_embeddings, job_embeddings).diagonal().cpu().numpy()

mse = mean_squared_error(val_true_scores, predicted_scores)
correlation = np.corrcoef(val_true_scores, predicted_scores)[0, 1]
true_labels = [1 if score >= 0.5 else 0 for score in val_true_scores]
pred_labels = [1 if score >= 0.5 else 0 for score in predicted_scores]
accuracy = accuracy_score(true_labels, pred_labels)

print(f"Validation MSE: {mse:.4f}")
print(f"Validation Correlation: {correlation:.4f}")
print(f"Validation Classification Accuracy: {accuracy:.4f}")

print("Model training complete! Model saved to /Users/pushkalpratapsingh/Downloads/resume-checker-builder/ML/resume_checker_model")