# Agri-Connect: Multi-Tenant Agri-Marketplace SaaS & Mandi Router

## Smart India Hackathon (SIH 2026) — Problem Statement 132 (PS-132)

> **Core Breakthrough:** A breakthrough **Net Profit Mandi Routing Engine** that prevents farmers from falling into the "High Gross Listed Price Trap" by factoring in freight, toll barriers, APMC cess, loading costs, and transit spoilage to compute true **in-pocket net earnings**. Features **3 instant-switch tenant views** (State APMC Board, FPO Collective, Enterprise Buyer) with verified Row-Level Security (RLS) data isolation and an **AI Computer Vision Crop Quality Grader**.

---

## ☁️ Deployment on Render (Production Ready)
LINK - https://sih-teamaura-26132.onrender.com/

Agri-Connect is fully configured for deployment on [Render](https://render.com). You can deploy via **Render Blueprint (1-Click)** or **Manual Web Service Setup**.

### Option 1: 1-Click Deployment via Render Blueprint (Recommended)

1. Push this repository to GitHub/GitLab.
2. Log in to [Render Dashboard](https://dashboard.render.com/).
3. Click **New +** ➔ **Blueprint**.
4. Connect your repository. Render will automatically detect [`render.yaml`](file:///c:/Users/NAVED/OneDrive/Documents/GitHub/SIH-TeamAura-26132/render.yaml) and pre-configure the Web Service:
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Click **Apply**. Render will build and deploy your app instantly!

---

### Option 2: Manual Web Service Setup on Render

1. Log in to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** ➔ **Web Service**.
3. Select your repository.
4. Fill in the service configuration:
   - **Name:** `agri-connect`
   - **Language:** `Python 3`
   - **Branch:** `main`
   - **Root Directory:** `.` (Leave blank or `.`)
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT` (or `python main.py`)
5. Click **Create Web Service**.

Once deployed, your service will be live at `https://your-service-name.onrender.com`.

---

## 🚀 Running Locally

### Option 1: Double-Click `run.bat` (Windows)
Run `agri-connect/run.bat`.

### Option 2: Python Command Line
```bash
# Install dependencies
pip install -r requirements.txt

# Run server
python main.py
```
Open **http://127.0.0.1:8000** in your browser.

---

## ⚡ Key Features & Verification

- **Net Profit Router API:** `/api/optimize-profit` (Computes freight, tolls, cess, spoilage & CO₂ savings)
- **AI Crop Grader API:** `/api/ai/grade-image` (Computer vision analysis with cryptographic AGMARK hash)
- **Multi-Tenant RLS Audit Inspector:** `Ctrl + Shift + A` in UI or `/api/audit/logs`
- **SMS Gateway Simulator:** `/api/sms/send-simulation`
- **System Health Check:** `/api/health`

---

## 📁 Repository Structure

```
.
├── main.py                  # Root application entry point for Render/Uvicorn
├── render.yaml              # Render Infrastructure-as-Code Blueprint configuration
├── Procfile                 # Process file for Render / PaaS web services
├── requirements.txt         # Root Python package dependencies
└── agri-connect/            # Core Agri-Connect Application
    ├── backend/             # FastAPI backend (app.py, database.py, ai_grader.py, profit_optimizer.py)
    ├── frontend/            # HTML5, CSS3, JavaScript multi-tenant frontend UI
    └── test_endpoints.py    # Automated test suite for backend APIs
```
