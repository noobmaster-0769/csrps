# 🎓 CSRPS — Cloud Student Result Processing System

> **Cloud Computing Lab Project** | IaaS · PaaS · SaaS · DaaS

---

## 📁 Project Structure

```
csrps/
├── schema.sql                  ← Run this on Supabase / PostgreSQL first
│
├── backend/
│   ├── server.js               ← Express app entry point
│   ├── db.js                   ← PostgreSQL connection pool
│   ├── seed.js                 ← Populate demo data
│   ├── package.json
│   ├── Procfile                ← Railway deployment
│   ├── .env.example
│   ├── middleware/
│   │   └── auth.js             ← JWT + role guard
│   └── routes/
│       ├── auth.js             ← POST /api/auth/login|register
│       ├── students.js         ← CRUD /api/students
│       ├── subjects.js         ← CRUD /api/subjects
│       ├── marks.js            ← POST/GET /api/marks
│       ├── results.js          ← GET /api/results/:id
│       └── analytics.js        ← GET /api/analytics
│
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── package.json
    ├── .env.example
    └── src/
        ├── main.jsx
        ├── App.jsx             ← Root component + client routing
        ├── api.js              ← All fetch calls centralised
        ├── index.css
        ├── components/
        │   └── Navbar.jsx
        └── pages/
            ├── Login.jsx
            ├── AdminDashboard.jsx
            ├── TeacherDashboard.jsx
            ├── StudentDashboard.jsx
            └── Analytics.jsx
```

---

## 🗄️ Database Schema

```sql
users    (id, name, email, password, role, student_id)
students (id, name, class, roll_no)
subjects (id, name, max_marks)
marks    (id, student_id → students, subject_id → subjects, marks, entered_by → users)
```

---

## 🚀 LOCAL SETUP (Step-by-Step)

### Prerequisites
- Node.js 18+
- PostgreSQL 14+ (or just use Supabase directly — skip local PG)

---

### Step 1 — Database

**Option A: Local PostgreSQL**
```bash
psql -U postgres
CREATE DATABASE csrps;
\c csrps
\i /path/to/csrps/schema.sql
```

**Option B: Supabase (recommended — free, no install)**
1. Go to https://supabase.com → New project
2. Open the SQL Editor
3. Paste the contents of `schema.sql` → Run
4. Copy your connection string from Settings → Database → Connection string → URI

---

### Step 2 — Backend

```bash
cd backend
cp .env.example .env
# Edit .env — set DATABASE_URL and JWT_SECRET
npm install
node seed.js       # load demo data
npm run dev        # starts on http://localhost:5000
```

Your `.env` should look like:
```
DATABASE_URL=postgresql://postgres:yourpass@localhost:5432/csrps
JWT_SECRET=mySuperSecretKey123!
PORT=5000
NODE_ENV=development
```

---

### Step 3 — Frontend

```bash
cd frontend
npm install
npm run dev        # starts on http://localhost:3000
```

Open http://localhost:3000 — the Vite proxy forwards `/api/*` to the backend automatically.

---

### Step 4 — Login with Demo Accounts

| Role    | Email                | Password    |
|---------|----------------------|-------------|
| Admin   | admin@csrps.com      | password123 |
| Teacher | teacher@csrps.com    | password123 |
| Student | student@csrps.com    | password123 |

Or click the **DEMO ACCOUNTS** buttons on the login page.

---

## ☁️ DEPLOYMENT (Free Tier)

### Step 1 — Push to GitHub

```bash
# From the project root
git init
git add .
git commit -m "Initial CSRPS commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/csrps.git
git push -u origin main
```

---

### Step 2 — Database on Supabase

1. https://supabase.com → Create project (free tier)
2. SQL Editor → paste `schema.sql` → Run
3. Settings → Database → copy **Connection string (URI)**
4. Run seed: update `.env` with Supabase URL → `node seed.js`

---

### Step 3 — Backend on Railway

1. https://railway.app → New Project → Deploy from GitHub
2. Select the repo → set **Root Directory** to `backend`
3. Set environment variables in Railway dashboard:
   ```
   DATABASE_URL = postgresql://...  (from Supabase)
   JWT_SECRET   = your_secret_key
   NODE_ENV     = production
   FRONTEND_URL = https://your-app.vercel.app
   ```
4. Railway auto-detects `Procfile` and runs `node server.js`
5. Copy your Railway URL: `https://csrps-backend.up.railway.app`

---

### Step 4 — Frontend on Vercel

1. https://vercel.com → New Project → Import GitHub repo
2. Set **Root Directory** to `frontend`
3. Add environment variable:
   ```
   VITE_API_URL = https://csrps-backend.up.railway.app
   ```
4. Deploy — Vercel gives you: `https://csrps.vercel.app`

---

## 🌐 DaaS API Documentation

All endpoints require `Authorization: Bearer <token>` header (except login/register).

### Authentication

| Method | Endpoint             | Body                          | Description     |
|--------|----------------------|-------------------------------|-----------------|
| POST   | /api/auth/login      | email, password               | Get JWT token   |
| POST   | /api/auth/register   | name, email, password, role   | Create user     |

### Students (DaaS)

| Method | Endpoint            | Access        | Description           |
|--------|---------------------|---------------|-----------------------|
| GET    | /api/students       | All           | List all students     |
| GET    | /api/students/:id   | All           | Single student        |
| POST   | /api/students       | Admin         | Add student           |
| PUT    | /api/students/:id   | Admin         | Update student        |
| DELETE | /api/students/:id   | Admin         | Delete student        |

### Marks (DaaS)

| Method | Endpoint          | Access          | Description              |
|--------|-------------------|-----------------|--------------------------|
| POST   | /api/marks        | Admin, Teacher  | Enter / update marks     |
| GET    | /api/marks/:id    | All             | Get marks for student    |

### Results (DaaS)

| Method | Endpoint           | Access  | Description                                    |
|--------|--------------------|---------|------------------------------------------------|
| GET    | /api/results/:id   | All*    | Full processed result (grade, %, pass/fail)    |

*Students can only access their own result.

### Analytics (DaaS)

| Method | Endpoint        | Access          | Description                        |
|--------|-----------------|-----------------|-----------------------------------|
| GET    | /api/analytics  | Admin, Teacher  | Averages, pass/fail, top students |

---

### Example API Call (DaaS demo)

```bash
# 1. Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@csrps.com","password":"password123"}'

# 2. Use token to fetch students (DaaS)
curl http://localhost:5000/api/students \
  -H "Authorization: Bearer <token>"

# 3. Get processed result (DaaS)
curl http://localhost:5000/api/results/1 \
  -H "Authorization: Bearer <token>"

# 4. Get analytics (DaaS)
curl http://localhost:5000/api/analytics \
  -H "Authorization: Bearer <token>"
```

---

## 🏗️ Cloud Architecture Explanation

```
┌─────────────────────────────────────────────────────────────────────┐
│                    USER (Browser / Mobile)                          │
└───────────────────────────────┬─────────────────────────────────────┘
                                │ HTTPS
                ┌───────────────▼──────────────┐
                │  VERCEL  (SaaS Layer)         │
                │  React frontend               │
                │  → Delivered as web app to    │
                │    users via CDN              │
                └───────────────┬──────────────┘
                                │ REST API calls
                ┌───────────────▼──────────────┐
                │  RAILWAY  (PaaS Layer)        │
                │  Node.js + Express backend    │
                │  → Developer just pushes code │
                │  → Platform handles server,   │
                │    OS, runtime, scaling       │
                └───────────────┬──────────────┘
                                │ SQL (pg driver)
                ┌───────────────▼──────────────┐
                │  SUPABASE  (PaaS / DaaS)      │
                │  Managed PostgreSQL           │
                │  → No DB admin needed         │
                │  → Also exposes REST/GraphQL  │
                │    APIs (DaaS aspect)         │
                └───────────────┬──────────────┘
                                │
                ┌───────────────▼──────────────┐
                │  CLOUD PROVIDER  (IaaS Layer) │
                │  AWS / GCP / Azure            │
                │  → VMs, containers, network   │
                │  → Managed by Vercel/Railway/ │
                │    Supabase — abstracted away │
                │    from the developer         │
                └──────────────────────────────┘
```

### Cloud Model Mapping (for Viva)

| Layer | Service    | Model | Explanation                                                    |
|-------|------------|-------|----------------------------------------------------------------|
| IaaS  | AWS/GCP    | IaaS  | Underlying VMs/containers that Vercel, Railway, Supabase run on. Developer never manages this directly — it is infrastructure abstracted away. |
| PaaS  | Railway    | PaaS  | Developer pushes Node.js code; Railway handles OS, runtime, ports, scaling. No server config needed. |
| PaaS  | Supabase   | PaaS  | Fully managed PostgreSQL. No installation, patching, or backup setup required. |
| SaaS  | Final app  | SaaS  | End-users (Admin, Teacher, Student) access the system through a browser URL — they consume it as a service. |
| DaaS  | REST APIs  | DaaS  | `/api/students`, `/api/results/:id`, `/api/analytics`, `/api/marks` deliver structured data over HTTP, consumable by any client. |

---

## 🧪 Result Processing Logic

```
Total      = Σ marks across all subjects
Max Total  = Σ max_marks across all subjects
Percentage = (Total / Max Total) × 100

Grade:
  percentage ≥ 90  → A
  percentage ≥ 75  → B
  percentage ≥ 60  → C
  percentage ≥ 40  → D
  percentage < 40  → Fail
```

---

## 👥 Demo Data (after running seed.js)

| Student      | Roll | Maths | Physics | Chemistry | English | CS  | % (approx) | Grade |
|--------------|------|-------|---------|-----------|---------|-----|-----------|-------|
| Alice Johnson| CS001| 92    | 87      | 78        | 95      | 88  | 88%       | B     |
| Bob Smith    | CS002| 75    | 68      | 82        | 79      | 91  | 79%       | B     |
| Carol Davis  | CS003| 45    | 38      | 52        | 61      | 44  | 48%       | D     |
| David Wilson | CS004| 88    | 92      | 85        | 76      | 94  | 87%       | B     |
| Eva Martinez | CS005| 62    | 71      | 58        | 83      | 69  | 68.6%     | C     |

---

## ✅ Quick Viva Answers

**Q: What is IaaS in your project?**
A: The underlying virtual machines and containers provided by AWS/GCP that power Railway, Vercel, and Supabase. The developer does not manage these directly — they are abstracted away.

**Q: What is PaaS in your project?**
A: Railway (backend hosting) and Supabase (managed database). We push code/SQL and the platform handles everything else — runtime, OS, networking, scaling.

**Q: What is SaaS in your project?**
A: The final CSRPS web application. Admins, teachers, and students access it through a browser URL without installing anything — they consume it as a service.

**Q: What is DaaS in your project?**
A: The REST APIs — `GET /api/students`, `GET /api/results/:id`, `GET /api/analytics`, `POST /api/marks` — that deliver structured academic data over HTTP to any consuming client.
