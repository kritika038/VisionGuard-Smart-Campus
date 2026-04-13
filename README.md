# VisionGuard AI Attendance System

VisionGuard is a full-stack attendance management platform built with React and FastAPI for admin, teacher, and student workflows. It supports QR attendance sessions, classroom attendance records, face-registration flows, timetable management, and cloud-ready MySQL deployment.

## Highlights

- Admin dashboard for students, teachers, subjects, timetable, attendance, and reports
- Teacher portal with QR session generation and attendance marking
- Student portal with attendance history and QR scan flow
- FastAPI backend prepared for Railway using environment-based configuration
- React frontend prepared for Vercel with SPA routing support
- Railway-ready MySQL schema file for bootstrapping tables

## Tech Stack

- Frontend: React, Create React App, Axios, React Router
- Backend: FastAPI, Uvicorn, SQLAlchemy, MySQL Connector
- Database: MySQL
- Deployment: Vercel for frontend, Railway for backend and MySQL

## Repository Structure

```text
frontend/   React client
backend/    FastAPI API, SQL schema, Railway start script
railway.toml Railway backend service config
README.md   Project overview and deployment guide
```

## Features

- Role-based login for admin, teacher, and student users
- Student registration with face image capture workflow
- Teacher-managed QR attendance sessions
- Attendance logs, reports, and timetable management
- Deployment-safe API configuration via environment variables

## Screenshots

Add screenshots here after deployment:

- `docs/screenshots/login.png`
- `docs/screenshots/admin-dashboard.png`
- `docs/screenshots/teacher-session.png`
- `docs/screenshots/student-portal.png`

## Local Setup

### 1. Clone and install

```bash
git clone https://github.com/kritika038/VisionGuard-AI-Attendance-System.git
cd VisionGuard-AI-Attendance-System
```

### 2. Configure backend

```bash
cp backend/.env.example backend/.env
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Update `backend/.env` with your MySQL values.

### 3. Create database tables

```bash
mysql -u root -p < backend/sql/schema.sql
```

### 4. Run backend

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 5. Configure frontend

```bash
cp frontend/.env.example frontend/.env
```

Set:

```env
REACT_APP_API_URL=http://127.0.0.1:8000
```

### 6. Run frontend

```bash
cd frontend
npm install
npm start
```

## Deployment

### Backend on Railway

1. Create a new Railway project.
2. Provision a MySQL service.
3. Add a backend service from this GitHub repo.
4. Set the backend service root to the repository root and let `railway.toml` handle startup.
5. Add environment variables:
   - `DB_HOST`
   - `DB_PORT`
   - `DB_USER`
   - `DB_PASSWORD`
   - `DB_NAME`
   - `CORS_ORIGINS`
6. Run the schema in `backend/sql/schema.sql` against the Railway MySQL instance.
7. Deploy and confirm the `/` endpoint returns `VisionGuard Backend Running`.

### Frontend on Vercel

1. Import the same GitHub repository into Vercel.
2. Set the root directory to `frontend`.
3. Framework preset: `Create React App`.
4. Add environment variable:
   - `REACT_APP_API_URL=https://your-railway-backend.up.railway.app`
5. Deploy. The included `frontend/vercel.json` handles SPA routing for `/`, `/admin`, `/teacher`, and `/student`.

## Demo Credentials

```text
Admin
Email: admin@visionguard.com
Password: admin123
```

Teacher and student logins come from database records in MySQL.

## Production Notes

- Secrets are environment variables only. Do not commit `.env` files.
- Current teacher and student passwords appear to be stored in plain text for compatibility with the existing database. Migrating to bcrypt hashing is strongly recommended as a next step.
- Uploaded face images are ignored by Git and should be stored on persistent cloud storage if you scale beyond a single instance.

## Troubleshooting

- `CORS error`: verify `CORS_ORIGINS` includes your Vercel URL and local dev URLs.
- `Database connection failed`: verify Railway MySQL host, port, username, password, and database name.
- `Frontend shows network error`: check `REACT_APP_API_URL` in Vercel and confirm the Railway backend is healthy.
- `QR scan fails`: ensure the frontend is calling `/qr/scan` or `/qr/mark-attendance` on the deployed backend.
