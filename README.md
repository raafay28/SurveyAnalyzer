# 📋 Premium AI Survey Analyzer

An advanced, full-stack survey analytics dashboard built with **React** and **Flask**. This application transforms raw, unstructured survey CSV exports (from Google Forms, Typeform, SurveyMonkey, etc.) into highly visual, report-ready business insights.

Featuring a custom **AI Analyst Brief** and a dynamic **AI Persona Generator**, this project goes beyond standard bar charts to deliver deep, actionable user understanding.

---

## 🚀 Key Features

### 1. 🧠 AI Analyst Executive Brief
* **Automated Data Synthesizer**: Scans numeric scales, categorical choices, and text feedbacks to write an overall executive summary.
* **Strategic Findings & Recommendations**: Automatically outputs key business findings (e.g., speed lag complaints) and generates structured next steps.

### 2. 👥 AI Persona Generator
* **Demographic Cohort Clustering**: Segment respondents dynamically into three distinct customer profiles:
  * **The Brand Advocate** (High satisfaction ratings & positive text sentiment)
  * **The Skeptical Critic** (Usability/performance pain points & negative sentiment)
  * **The Passive Observer** (Baseline functionality metrics & neutral sentiment)
* **Vivid Profiles**: Each card is styled with customized glowing gradients, initials avatars, lists of needs/frustrations, and interactive speech bubbles displaying actual quotes from the dataset.

### 3. 🎨 Frosted Glassmorphic Interface
* **Premium Theme**: Modern midnight slate radial gradient background with translucent component panels.
* **Micro-Animations**: Scale transforms, keyframe fade-ins, and glowing state indicators on tabs, file upload areas, and action cards.
* **Custom Chart.js Styling**: Upgraded grids, typography, and color datasets fitting the dark dashboard style.

---

## 🛠️ Technology Stack

* **Frontend**: React 18, Chart.js (`react-chartjs-2`), Axios, Vanilla CSS Variables.
* **Backend**: Python, Flask, Pandas, Numpy, Flask-CORS, Gunicorn.
* **Deployment**: Vercel (Frontend), Render (Backend).

---

## 💻 Local Installation & Setup

### 1. Run the Backend
Ensure you have Python 3 installed:

```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Start the Flask app (runs on http://localhost:5001)
python app.py
```

### 2. Run the Frontend
In a new terminal window:

```bash
# Navigate to frontend directory
cd frontend

# Install Node modules
npm install

# Run the React dev server (runs on http://localhost:3000)
npm start
```

Use `sample_survey.csv` included in the root directory to test the upload pipeline.

---

## 🌐 Production Deployment Guide

### 1. Backend Deployment (Render.com)
1. Create a **Web Service** on Render and link your GitHub repository.
2. Configure settings:
   * **Root Directory**: `backend`
   * **Runtime**: `Python 3`
   * **Build Command**: `pip install -r requirements.txt`
   * **Start Command**: `gunicorn app:app`
3. Copy the live Web Service URL (e.g. `https://survey-analyzer-backend.onrender.com`).

### 2. Frontend Deployment (Vercel)
1. Create a new project on Vercel and import your repository.
2. Configure settings:
   * **Root Directory**: `frontend`
   * **Framework Preset**: `Create React App`
3. Add **Environment Variables**:
   * **Key**: `REACT_APP_API_URL`
   * **Value**: *[Paste your Render Backend URL]*
4. Click **Deploy**!
