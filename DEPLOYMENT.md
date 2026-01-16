# Deployment Guide

This guide details how to deploy the CareerPath application with the new VTU College Directory feature using **Supabase**, **Vercel**, and **Render**.

## 1. Supabase Setup (Database)

1.  **Create Project**: Go to [Supabase](https://supabase.com/) and create a new project.
2.  **Get Credentials**:
    *   Go to **Project Settings** > **API**.
    *   Copy `Project URL` (SUPABASE_URL).
    *   Copy `anon public` key (SUPABASE_KEY / SUPABASE_ANON_KEY).
3.  **Database Migration**:
    *   Go to the **SQL Editor** in Supabase.
    *   Run the following SQL to create the table:
    ```sql
    CREATE TABLE colleges (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      code VARCHAR(10) UNIQUE NOT NULL,
      region VARCHAR(50) NOT NULL,
      location TEXT NOT NULL,
      city VARCHAR(100) NOT NULL,
      autonomous BOOLEAN DEFAULT false,
      type VARCHAR(20) NOT NULL, -- 'government', 'private', 'aided'
      courses JSONB,
      contact_info JSONB,
      website TEXT,
      established_year INTEGER,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX idx_colleges_region ON colleges(region);
    CREATE INDEX idx_colleges_city ON colleges(city);
    CREATE INDEX idx_colleges_name ON colleges USING gin(to_tsvector('english', name));
    ```

## 2. Backend Deployment (Render)

1.  **Create Web Service**:
    *   Connect your GitHub repository to [Render](https://render.com/).
    *   Select the `backend` directory as the root.
    *   **Build Command**: `pip install -r requirements.txt`
    *   **Start Command**: `gunicorn app:app`
2.  **Environment Variables**:
    Add the following variables in the Render dashboard:
    *   `PYTHON_VERSION`: `3.11.0`
    *   `SECRET_KEY`: (Generate a random string)
    *   `SUPABASE_URL`: (From Supabase)
    *   `SUPABASE_KEY`: (From Supabase - use the anon key)
    *   `GEMINI_API_KEY`: (Your Google Gemini API Key)
3.  **Data Seeding** (Post-Deployment):
    To populate the database with the initial ~219 colleges:
    *   Render doesn't easily allow running one-off scripts, so run this locally pointing to your production Supabase instance:
        ```bash
        # In your local backend/.env, set SUPABASE_URL/KEY to your PRODUCTION values
        cd backend
        python scripts/seed_colleges.py
        ```

## 3. Frontend Deployment (Vercel)

1.  **Create Project**:
    *   Connect your GitHub repository to [Vercel](https://vercel.com/).
    *   Select `frontend` as the root directory.
    *   **Framework Preset**: Vite
2.  **Environment Variables**:
    Add the following variables in the Vercel dashboard:
    *   `VITE_API_URL`: `https://your-render-backend-url.onrender.com/api`
    *   `VITE_SUPABASE_URL`: (From Supabase)
    *   `VITE_SUPABASE_ANON_KEY`: (From Supabase)
    *   `VITE_CLERK_PUBLISHABLE_KEY`: (Your Clerk Key)

## Verified Deployment Checklist
- [ ] Supabase tables created
- [ ] Backend deployed and healthy
- [ ] Database seeded with college data
- [ ] Frontend deployed
- [ ] Frontend can fetch data from Supabase
