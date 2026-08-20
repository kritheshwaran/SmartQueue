// server.js
// SmartQueue backend API - Express + SQLite (better-sqlite3)
// Handles doctors, appointments, token/queue generation and waiting-time calc.

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;
const MINUTES_PER_PATIENT = 10;

app.use(cors());
app.use(express.json());

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getDoctorOr404(res, doctorId) {
  const doctor = db.prepare('SELECT * FROM doctors WHERE id = ?').get(doctorId);
  if (!doctor) {
    res.status(404).json({ error: 'Doctor not found' });
    return null;
  }
  return doctor;
}

// Number of patients ahead of a given appointment (same doctor/date, lower
// token number, and not yet completed).
function patientsAheadOf(appointment) {
  const row = db
    .prepare(
      `SELECT COUNT(*) AS count FROM appointments
       WHERE doctor_id = ? AND date = ? AND token_number < ? AND status != 'completed'`
    )
    .get(appointment.doctor_id, appointment.date, appointment.token_number);
  return row.count;
}

function withComputedFields(appointment) {
  const ahead = appointment.status === 'completed' ? 0 : patientsAheadOf(appointment);
  return {
    ...appointment,
    patientsAhead: ahead,
    estimatedWaitMinutes: ahead * MINUTES_PER_PATIENT
  };
}

// ---------------------------------------------------------------------------
// Doctor routes
// ---------------------------------------------------------------------------

// GET /api/doctors?search=cardio
app.get('/api/doctors', (req, res) => {
  const { search } = req.query;
  let doctors;
  if (search && search.trim() !== '') {
    const term = `%${search.trim().toLowerCase()}%`;
    doctors = db
      .prepare(
        `SELECT * FROM doctors
         WHERE LOWER(name) LIKE ? OR LOWER(specialty) LIKE ?
         ORDER BY name ASC`
      )
      .all(term, term);
  } else {
    doctors = db.prepare('SELECT * FROM doctors ORDER BY name ASC').all();
  }
  res.json(doctors);
});

// GET /api/doctors/:id
app.get('/api/doctors/:id', (req, res) => {
  const doctor = getDoctorOr404(res, req.params.id);
  if (!doctor) return;
  res.json(doctor);
});

// POST /api/doctor/login  { doctorId, password }
app.post('/api/doctor/login', (req, res) => {
  const { doctorId, password } = req.body;
  if (!doctorId || !password) {
    return res.status(400).json({ error: 'doctorId and password are required' });
  }
  const doctor = db.prepare('SELECT * FROM doctors WHERE id = ?').get(doctorId);
  if (!doctor || doctor.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const { password: _pw, ...safeDoctor } = doctor;
  res.json({ doctor: safeDoctor });
});

// ---------------------------------------------------------------------------
// Appointment / booking routes
// ---------------------------------------------------------------------------

// POST /api/appointments { doctorId, patientName, patientPhone, date, time }
app.post('/api/appointments', (req, res) => {
  const { doctorId, patientName, patientPhone, date, time } = req.body;

  if (!doctorId || !patientName || !patientPhone || !date || !time) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const doctor = getDoctorOr404(res, doctorId);
  if (!doctor) return;

  // Determine next token number for this doctor on this date.
  const row = db
    .prepare(
      `SELECT COALESCE(MAX(token_number), 0) AS maxToken FROM appointments
       WHERE doctor_id = ? AND date = ?`
    )
    .get(doctorId, date);

  const tokenNumber = row.maxToken + 1;

  const insert = db.prepare(`
    INSERT INTO appointments (doctor_id, patient_name, patient_phone, date, time, token_number, status)
    VALUES (?, ?, ?, ?, ?, ?, 'waiting')
  `);
  const result = insert.run(doctorId, patientName.trim(), patientPhone.trim(), date, time, tokenNumber);

  const appointment = db.prepare('SELECT * FROM appointments WHERE id = ?').get(result.lastInsertRowid);

  res.status(201).json({
    appointment: withComputedFields(appointment),
    doctor
  });
});

// GET /api/appointments/:id
app.get('/api/appointments/:id', (req, res) => {
  const appointment = db.prepare('SELECT * FROM appointments WHERE id = ?').get(req.params.id);
  if (!appointment) {
    return res.status(404).json({ error: 'Appointment not found' });
  }
  const doctor = db.prepare('SELECT * FROM doctors WHERE id = ?').get(appointment.doctor_id);
  res.json({
    appointment: withComputedFields(appointment),
    doctor
  });
});

// ---------------------------------------------------------------------------
// Queue routes (patient-facing)
// ---------------------------------------------------------------------------

// GET /api/queue/:doctorId?date=YYYY-MM-DD
app.get('/api/queue/:doctorId', (req, res) => {
  const { doctorId } = req.params;
  const date = req.query.date || new Date().toISOString().slice(0, 10);

  const doctor = getDoctorOr404(res, doctorId);
  if (!doctor) return;

  const appointments = db
    .prepare(
      `SELECT * FROM appointments WHERE doctor_id = ? AND date = ? ORDER BY token_number ASC`
    )
    .all(doctorId, date);

  const current = appointments.find((a) => a.status === 'in-progress') || null;
  const waiting = appointments.filter((a) => a.status === 'waiting');
  const completed = appointments.filter((a) => a.status === 'completed');

  res.json({
    doctor,
    date,
    currentToken: current ? current.token_number : null,
    totalWaiting: waiting.length,
    totalCompleted: completed.length,
    appointments: appointments.map(withComputedFields)
  });
});

// ---------------------------------------------------------------------------
// Doctor dashboard routes
// ---------------------------------------------------------------------------

// GET /api/doctor/:id/queue?date=YYYY-MM-DD
app.get('/api/doctor/:id/queue', (req, res) => {
  const { id } = req.params;
  const date = req.query.date || new Date().toISOString().slice(0, 10);

  const doctor = getDoctorOr404(res, id);
  if (!doctor) return;

  const appointments = db
    .prepare(`SELECT * FROM appointments WHERE doctor_id = ? AND date = ? ORDER BY token_number ASC`)
    .all(id, date);

  const current = appointments.find((a) => a.status === 'in-progress') || null;
  const waiting = appointments.filter((a) => a.status === 'waiting');
  const completed = appointments.filter((a) => a.status === 'completed');

  res.json({
    doctor,
    date,
    current: current ? withComputedFields(current) : null,
    waiting: waiting.map(withComputedFields),
    completed: completed.map(withComputedFields),
    stats: {
      total: appointments.length,
      waiting: waiting.length,
      completed: completed.length
    }
  });
});

// POST /api/doctor/call-next  { doctorId, date }
app.post('/api/doctor/call-next', (req, res) => {
  const { doctorId, date } = req.body;
  if (!doctorId || !date) {
    return res.status(400).json({ error: 'doctorId and date are required' });
  }

  const doctor = getDoctorOr404(res, doctorId);
  if (!doctor) return;

  // Guard: if there's already someone in-progress, don't call another.
  const existingCurrent = db
    .prepare(`SELECT * FROM appointments WHERE doctor_id = ? AND date = ? AND status = 'in-progress'`)
    .get(doctorId, date);

  if (existingCurrent) {
    return res.status(400).json({
      error: 'A patient is already in progress. Complete the current patient first.',
      current: withComputedFields(existingCurrent)
    });
  }

  const next = db
    .prepare(
      `SELECT * FROM appointments WHERE doctor_id = ? AND date = ? AND status = 'waiting'
       ORDER BY token_number ASC LIMIT 1`
    )
    .get(doctorId, date);

  if (!next) {
    return res.status(404).json({ error: 'No waiting patients in the queue' });
  }

  db.prepare(`UPDATE appointments SET status = 'in-progress' WHERE id = ?`).run(next.id);

  const updated = db.prepare('SELECT * FROM appointments WHERE id = ?').get(next.id);
  res.json({ current: withComputedFields(updated) });
});

// POST /api/doctor/complete  { doctorId, appointmentId }
app.post('/api/doctor/complete', (req, res) => {
  const { doctorId, appointmentId } = req.body;
  if (!doctorId || !appointmentId) {
    return res.status(400).json({ error: 'doctorId and appointmentId are required' });
  }

  const appointment = db.prepare('SELECT * FROM appointments WHERE id = ?').get(appointmentId);
  if (!appointment || String(appointment.doctor_id) !== String(doctorId)) {
    return res.status(404).json({ error: 'Appointment not found for this doctor' });
  }

  db.prepare(`UPDATE appointments SET status = 'completed' WHERE id = ?`).run(appointmentId);

  const updated = db.prepare('SELECT * FROM appointments WHERE id = ?').get(appointmentId);
  res.json({ appointment: withComputedFields(updated) });
});

// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'SmartQueue API is running' });
});

app.listen(PORT, () => {
  console.log(`SmartQueue server running on http://localhost:${PORT}`);
});
