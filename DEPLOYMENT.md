# Cloud Deployment Guide

This guide details the step-by-step instructions for deploying the **StockVibe** system to cloud providers:
1. Database on **Neon PostgreSQL**
2. Backend API on **Render**
3. Frontend Dashboard on **Vercel**

---

## 🗄️ Step 1: Database Deployment (Neon PostgreSQL)

Neon provides a fully managed, serverless Postgres database.

1. Go to [Neon.tech](https://neon.tech/) and sign up for a free account.
2. Click **Create Project**.
3. Name your project (e.g., `stockvibe-db`), select your preferred cloud region, and click **Create Project**.
4. In the Dashboard under the **Connection string** section, select **SQLAlchemy** (or basic Connection String).
5. Copy the connection string. It will look like this:
   `postgresql://neondb_owner:PASSWORD@ep-random-id-pool.us-east-2.aws.neon.tech/neondb?sslmode=require`
   *(Save this URL safe, we will feed this to the Render backend config as `DB_HOST`, `DB_USER`, etc.)*

---

## ⚙️ Step 2: Backend API Deployment (Render)

Render hosts backend API servers directly from GitHub repositories.

1. Commit your codebase to a **GitHub repository** (either public or private).
2. Create an account or log in to the [Render Dashboard](https://dashboard.render.com/).
3. Click **New +** and select **Web Service**.
4. Connect your GitHub repository.
5. In the Web Service Configuration, enter:
   - **Name**: `stockvibe-backend`
   - **Environment**: `Python`
   - **Region**: Same region as your Neon database (preferred for lower latency).
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Click **Advanced** to add environment variables. Add individual keys, or construct a database connection string. Since our backend uses modular variables, split your Neon connection string like this:
   - `DB_HOST`: Extract the host domain from the Neon link (e.g., `ep-random-id-pool.us-east-2.aws.neon.tech`).
   - `DB_PORT`: `5432`
   - `DB_NAME`: `neondb` (or whatever database name Neon created)
   - `DB_USER`: `neondb_owner` (your database owner role username)
   - `DB_PASSWORD`: Extract your database password from the Neon connection string.
7. Click **Create Web Service**.
8. Render will compile your packages and initialize the server. When done, it will provide a public URL (e.g. `https://stockvibe-backend.onrender.com`). Copy this URL.

---

## 💻 Step 3: Frontend Deployment (Vercel)

Vercel provides optimized hosting for frontend build systems like Vite.

1. Log in to [Vercel](https://vercel.com/) or sign up using your GitHub account.
2. Click **Add New** and select **Project**.
3. Import your GitHub repository.
4. In the Project Configuration:
   - **Framework Preset**: Select **Vite** (Vercel usually auto-detects this).
   - **Root Directory**: Click Edit, select the `frontend` folder, and click Continue.
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Expand the **Environment Variables** section and add:
   - **Key**: `VITE_API_URL`
   - **Value**: The public Render backend URL you copied in Step 2 (e.g. `https://stockvibe-backend.onrender.com`). Ensure there is **no trailing slash** at the end.
6. Click **Deploy**.
7. Vercel will bundle your assets. When done, you will receive a custom `.vercel.app` domain to access your StockVibe Dashboard.

---

## 🔄 Verification & Operations Check

1. Open your Vercel URL.
2. Navigate to **Customers** and create a test customer. If this succeeds, your frontend is successfully communicating with your Render backend, and the backend is talking to Neon PostgreSQL.
3. Open your backend API Swagger interface at `https://your-backend.onrender.com/docs` to inspect active logs.
