# OPEC - Career Guidance & Hackathon Platform

**OPEC (Optimized Pathway for Educational Choices)** is a comprehensive career guidance platform built for the **Anveshana Hackathon**. It helps students make informed career decisions through AI-driven insights, interactive simulations, and real-time data.

![Project Banner](https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=1200&q=80)

## 🚀 Key Features

### 1. 🎓 College Directory (VTU)
- Searchable database of **200+ VTU affiliated colleges**.
- Filtering by region (Bangalore, Belagavi, etc.), type (Govt/Private), and status (Autonomous).
- **Real-time Search**: Instant results as you type.

### 2. 🤖 AI Career Coach
- **Gemini-Powered Chat**: Ask questions about careers, courses, and future trends.
- **Context Aware**: Remembers your previous interactions for personalized advice.

### 3. 📊 Career Simulation
- Interactive form to simulate career paths based on your interests and grades.
- **Visual Roadmap**: Mermaid.js powered flowcharts showing your potential journey.
- Salary insights and market trends.

### 4. 🛠️ Tools & Resources
- **Resume Builder**: AI-assisted resume generation.
- **Skill Quiz**: Assess your current skills and get recommendations.
- **Mentor Match**: Find mentors in your field of interest.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React (Vite)
- **Styling**: TailwindCSS + Phosphor Icons / Lucide React
- **Visualizations**: Recharts, Mermaid.js, Framer Motion
- **Deployment**: Vercel

### Backend
- **Framework**: Python Flask
- **AI Engine**: Google Gemini Pro (Generative AI)
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Render

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (v3.11+)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/shree1071/opec-for-anveshana.git
   cd opec-for-anveshana
   ```

2. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   # Windows
   .\venv\Scripts\activate
   # Mac/Linux
   # source venv/bin/activate
   pip install -r requirements.txt
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```

4. **Environment Variables**
   - Create `.env` in `backend/` using `.env.example` as a template.
   - Create `.env` in `frontend/` (if needed) or set Vercel env vars.

### Running Locally

**Backend Terminal:**
```bash
cd backend
python app.py
```

**Frontend Terminal:**
```bash
cd frontend
npm run dev
```

Visit `http://localhost:5173` to view the app!

---

## 🌍 Deployment

### Backend (Render)
- Connect repo to Render.
- Build Command: `pip install -r requirements.txt`
- Start Command: `gunicorn app:app`

### Frontend (Vercel)
- Connect repo to Vercel.
- Framework: Vite
- Build Command: `vite build`
- Output Dir: `dist`

---

## 🤝 Contributing
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

**Built with ❤️ for Anveshana Hackathon**
