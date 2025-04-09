import sys
import json
import pdfplumber
import fitz
import spacy
import nltk
from nltk.tokenize import sent_tokenize
from sentence_transformers import SentenceTransformer
from sentence_transformers.util import cos_sim
from langdetect import detect
from transformers import pipeline, set_seed, AutoTokenizer
import torch
import gc

# Download NLTK data
nltk.download('punkt')

# Load spaCy model for tokenization and NER
nlp = spacy.load("en_core_web_sm")

# Load the fine-tuned SentenceTransformer model
model = SentenceTransformer('/Users/pushkalpratapsingh/Downloads/resume-checker-builder/ML/resume_checker_model')


def extract_text_from_pdf(pdf_path):
    """Extract text from a PDF file using pdfplumber, fall back to PyMuPDF if needed."""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            text = ""
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    except Exception as e:
        print(f"pdfplumber failed: {e}")
        text = ""

    if not text.strip():
        print("Falling back to PyMuPDF for text extraction...")
        try:
            doc = fitz.open(pdf_path)
            text = ""
            for page in doc:
                text += page.get_text("text") + "\n"
            doc.close()
        except Exception as e:
            return str(e)

    return text

def preprocess_text(text):
    """Preprocess text: tokenize into sentences."""
    doc = nlp(text)
    sentences = [sent.text for sent in doc.sents]
    return sentences

def parse_resume_sections(text):
    """Parse the resume into sections based on common headers."""
    sections = {
        "experience": [],
        "education": [],
        "skills": [],
        "other": []
    }
    current_section = "other"
    lines = text.split("\n")
    section_headers = {
        "experience": ["experience", "work history", "employment"],
        "education": ["education", "academic background"],
        "skills": ["skills", "technical skills", "abilities"]
    }

    for line in lines:
        line_lower = line.lower().strip()
        for section, headers in section_headers.items():
            if any(header in line_lower for header in headers):
                current_section = section
                continue
        sections[current_section].append(line)

    for section in sections:
        sections[section] = " ".join(sections[section]).strip()

    return sections

def extract_skills(text):
    """Extract skills from the resume using spaCy NER and keyword matching."""
    doc = nlp(text)
    skills = set()
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
    for token in doc:
        if token.text.lower() in skill_keywords:
            skills.add(token.text.lower())
    for ent in doc.ents:
        if ent.label_ in ["ORG", "PRODUCT"] and ent.text.lower() in skill_keywords:
            skills.add(ent.text.lower())
    return list(skills)

def compute_similarity(resume_sentences, keywords, section="other"):
    """Compute semantic similarity with section-based weighting."""
    keyword_list = [kw.strip() for kw in keywords.split(",")]
    if not resume_sentences:
        return [], {kw: 0.0 for kw in keyword_list}
    resume_embeddings = model.encode(resume_sentences, convert_to_tensor=True)
    keyword_embeddings = model.encode(keyword_list, convert_to_tensor=True)

    similarities = cos_sim(resume_embeddings, keyword_embeddings)

    weight = 1.0
    if section == "experience":
        weight = 1.5
    elif section == "skills":
        weight = 1.3
    elif section == "education":
        weight = 0.8

    matched_keywords = []
    keyword_scores = {}
    for j, keyword in enumerate(keyword_list):
        max_similarity = similarities[:, j].max().item() * weight
        max_similarity = min(max_similarity, 1.0)
        keyword_scores[keyword] = max_similarity
        print(f"Similarity score for '{keyword}' in {section}: {max_similarity}")
        if max_similarity > 0.25:
            matched_keywords.append(keyword)

    return matched_keywords, keyword_scores

def calculate_ats_score(matched_keywords, total_keywords, extracted_skills, keywords):
    """Calculate ATS score with a more lenient formula."""
    if total_keywords == 0:
        return 0
    base_score = (len(matched_keywords) / total_keywords) * 70
    keyword_list = [kw.strip().lower() for kw in keywords.split(",")]
    skill_matches = sum(1 for skill in extracted_skills if skill in keyword_list)
    skill_bonus = (skill_matches / total_keywords) * 30
    return min(100, base_score + skill_bonus)

def generate_ai_suggestions(keyword_scores, matched_keywords, extracted_skills, keywords, sections, ats_score):
    """Generate AI-powered suggestions using a language model."""
    suggestions = []
    keyword_list = [kw.strip().lower() for kw in keywords.split(",")]

    # Prepare context for AI generation
    context = f"Resume analysis: ATS score is {ats_score} out of 100. Matched keywords: {', '.join(matched_keywords)}. Extracted skills: {', '.join(extracted_skills)}. Input keywords: {', '.join(keyword_list)}. "
    
    # Add specific conditions to the context
    if not matched_keywords:
        context += "No keywords were strongly matched. "
    for keyword in keyword_list:
        if keyword not in matched_keywords and keyword_scores.get(keyword, 0) < 0.4:
            context += f"The keyword '{keyword}' was not well matched (score: {keyword_scores.get(keyword, 0):.2f}). "
    if not sections["experience"]:
        context += "The resume is missing an Experience section. "
    if not sections["skills"]:
        context += "The resume is missing a Skills section. "
    if ats_score < 80:
        context += "The ATS score is below 80, indicating room for improvement. "

    # Clear memory
    torch.cuda.empty_cache() if torch.cuda.is_available() else torch.mps.empty_cache()  # Clear cache based on device
    gc.collect()

    return suggestions

def main():
    if len(sys.argv) != 3:
        print(json.dumps({"error": "Invalid arguments. Usage: python resume-checker.py <pdf_path> <keywords>"}))
        sys.exit(1)

    pdf_path = sys.argv[1]
    keywords = sys.argv[2]

    resume_text = extract_text_from_pdf(pdf_path)
    if not resume_text:
        print(json.dumps({"error": "Failed to extract text from PDF"}))
        sys.exit(1)

    # Detect language
    try:
        language = detect(resume_text)
        if language != 'en':
            print(json.dumps({"warning": f"Resume appears to be in {language}. The model is trained on English data, so results may be inaccurate."}))
    except Exception as e:
        print(json.dumps({"warning": "Could not detect language. Assuming English."}))

    print("Extracted Resume Text:", resume_text)

    sections = parse_resume_sections(resume_text)
    print("Parsed Sections:", {k: v[:100] + "..." for k, v in sections.items() if v})

    extracted_skills = extract_skills(resume_text)
    print("Extracted Skills:", extracted_skills)

    all_matched_keywords = set()
    all_keyword_scores = {}
    for section, text in sections.items():
        if not text:
            continue
        sentences = preprocess_text(text)
        matched_keywords, keyword_scores = compute_similarity(sentences, keywords, section)
        all_matched_keywords.update(matched_keywords)
        for kw, score in keyword_scores.items():
            if kw not in all_keyword_scores or score > all_keyword_scores[kw]:
                all_keyword_scores[kw] = score

    total_keywords = len(keywords.split(","))
    ats_score = calculate_ats_score(list(all_matched_keywords), total_keywords, extracted_skills, keywords)
    suggestions = generate_ai_suggestions(all_keyword_scores, list(all_matched_keywords), extracted_skills, keywords, sections, ats_score)

    result = {
        "ats_score": int(ats_score),
        "matched_keywords": list(all_matched_keywords),
        "extracted_skills": extracted_skills,
        "suggestions": suggestions
    }
    print(json.dumps(result))

if __name__ == "__main__":
    main()