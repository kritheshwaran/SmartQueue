# SmartQueue – Hospital Appointment & Queue System

A full-stack hospital appointment booking and live queue tracking system.

**Stack:** React + Vite (JavaScript) + Tailwind CSS · Node.js + Express · SQLite · Axios · Lucide React

## Features

- Browse and search doctors by name/specialty
- Book an appointment (doctor + date + time) with automatic queue token generation
- Live queue tracking: patients ahead + estimated wait time (`patients ahead × 10 min`)
- Doctor demo login, today's queue dashboard, Call Next Patient, Complete Patient
- SQLite database created and seeded automatically — no manual setup required

## Requirements

- Node.js 18+ and npm

## Setup & Run

Open two terminals — one for the backend, one for the frontend.

### 1. Backend (API + SQLite)

```bash
cd server
npm install
npm start
```

The API runs at `http://localhost:5000`. The SQLite database (`server/smartqueue.db`) and sample doctors are created automatically on first run.

### 2. Frontend (React app)

```bash
cd client
npm install
npm run dev
```

The app runs at `http://localhost:5173` and proxies `/api` requests to the backend.

Open `http://localhost:5173` in your browser.

## Doctor Login (Demo)

Go to **Doctor Login**, pick any doctor from the dropdown, and use password:

```
1234
```

## Project Structure

```text
SmartQueue/
├── client/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── App.jsx
│       ├── main.jsx
│       └── index.css
├── server/
│   ├── server.js
│   └── database.js
├── .gitignore
├── .env.example
└── README.md
```
