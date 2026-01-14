# CareerPath AI - Career Simulation Platform

CareerPath is an AI-powered web application that simulates a user's career journey and generates a personalized 4–6 year career roadmap using a multi-agent AI system.

## Features
- **AI Career Simulation**: Simulates career progression using 5 specialized AI agents (Counselor, Analyst, Skill Gap, Salary, Risk).
- **Personalized Roadmap**: Detailed year-by-year plan with roles, skills, and milestones.
- **Interactive UI**: Modern, responsive interface built with React and Tailwind CSS.
- **Data-Driven**: Analysis of market trends, salary projections, and risk factor.

## Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, Framer Motion
- **Backend**: Python Flask, PyMongo
- **Database**: MongoDB
- **AI**: OpenAI API (simulated)

## Project Structure
```
CareerPath/
├── backend/                # Flask API
│   ├── app.py              # Entry point
│   ├── config.py           # Configs (Env vars)
│   ├── services/           # Business Logic (AI, DB)
│   └── routes/             # API Endpoints
└── frontend/               # React App
    ├── src/
    │   ├── components/     # UI Components (Navbar, Cards, Form)
    │   ├── pages/          # Landing, Simulation, Results
    │   └── App.jsx
    └── tailwind.config.js
```

## Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 16+
- MongoDB (Running locally on default port 27017)

### 1. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create virtual environment and install dependencies:
   ```bash
   python -m venv venv
   # Windows:
   venv\Scripts\activate
   # Mac/Linux:
   # source venv/bin/activate
   pip install -r requirements.txt
   ```
3. Configure Environment:
   - The `.env` file is already created. Add your `OPENAI_API_KEY` if you want real AI results. Otherwise, the system uses a mock response.
4. Run the server:
   ```bash
   python app.py
   ```
   Server runs on `http://localhost:5000`.

### 2. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   App runs on `http://localhost:5173`.

## Usage
1. Open the frontend URL.
2. Click **Start Simulation**.
3. Fill in your details (Education, Skills, Goals).
4. View your personalized **Career Roadmap**!
