# FastX - Online Bus Ticket Booking System

Full-stack milestone project: Angular frontend + Flask REST API + MySQL.

Documentation: `docs/FastX_Documentation.pdf`

## Requirements

- Python 3.10+
- Node.js 18+ and npm
- Docker and Docker Compose

## Run

```bash
# Terminal 1 - Database + Backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
docker compose up -d
python3 app.py

# Terminal 2 - Frontend
cd frontend
npm install
npm start
```

MySQL runs on port **3307** (avoids conflict with existing MySQL on 3306).
Default DB password is `root` — no extra env vars needed.

Open **http://localhost:4200**

## Deploy for free

See **[DEPLOY.md](DEPLOY.md)** for step-by-step hosting on Netlify + Render + Aiven (all free tiers).

## Default Logins

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@fastx.com | admin123 |
| Operator | operator@fastx.com | operator123 |
| Passenger | Register at /register | — |

## Share with colleague (zip without docs)

```bash
bash package.sh
```

Creates `Milestone-pro.zip` with project code only (no `docs/` folder).

## Structure

```
Milestone-pro/
├── backend/     Flask API + MySQL (Docker)
├── frontend/    Angular app
├── docs/        Documentation PDF
└── README.md
```
