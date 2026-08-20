// database.js
// Sets up the SQLite database automatically (no manual install needed),
// creates the required tables if they don't exist, and seeds a few
// sample doctors so the app is usable immediately.

const path = require('path');
const Database = require('better-sqlite3');

const DB_PATH = path.join(__dirname, 'smartqueue.db');
const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ---------- Schema ----------
db.exec(`
  CREATE TABLE IF NOT EXISTS doctors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    specialty TEXT NOT NULL,
    experience INTEGER NOT NULL,
    rating REAL NOT NULL,
    bio TEXT NOT NULL,
    avatar_color TEXT NOT NULL,
    initials TEXT NOT NULL,
    password TEXT NOT NULL DEFAULT '1234'
  );

  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    doctor_id INTEGER NOT NULL,
    patient_name TEXT NOT NULL,
    patient_phone TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    token_number INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'waiting', -- waiting | in-progress | completed
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (doctor_id) REFERENCES doctors(id)
  );
`);

// ---------- Seed sample doctors (only if table is empty) ----------
const doctorCount = db.prepare('SELECT COUNT(*) AS count FROM doctors').get().count;

if (doctorCount === 0) {
  const insertDoctor = db.prepare(`
    INSERT INTO doctors (name, specialty, experience, rating, bio, avatar_color, initials, password)
    VALUES (@name, @specialty, @experience, @rating, @bio, @avatar_color, @initials, @password)
  `);

  const sampleDoctors = [
    {
      name: 'Dr. Ananya Sharma',
      specialty: 'Cardiologist',
      experience: 12,
      rating: 4.9,
      bio: 'Specialist in heart health, hypertension and preventive cardiology with over a decade of clinical experience.',
      avatar_color: '#6366F1',
      initials: 'AS',
      password: '1234'
    },
    {
      name: 'Dr. Rohan Mehta',
      specialty: 'Dermatologist',
      experience: 8,
      rating: 4.7,
      bio: 'Expert in skin care, cosmetic dermatology and treatment of chronic skin conditions.',
      avatar_color: '#0EA5E9',
      initials: 'RM',
      password: '1234'
    },
    {
      name: 'Dr. Priya Nair',
      specialty: 'Pediatrician',
      experience: 10,
      rating: 4.8,
      bio: 'Dedicated to child healthcare, vaccinations and developmental screenings for infants and teens.',
      avatar_color: '#F97316',
      initials: 'PN',
      password: '1234'
    },
    {
      name: 'Dr. Arjun Verma',
      specialty: 'Orthopedic Surgeon',
      experience: 15,
      rating: 4.9,
      bio: 'Focused on joint replacement, sports injuries and spine care with a patient-first approach.',
      avatar_color: '#10B981',
      initials: 'AV',
      password: '1234'
    },
    {
      name: 'Dr. Kavya Iyer',
      specialty: 'Neurologist',
      experience: 9,
      rating: 4.6,
      bio: 'Experienced in treating migraines, epilepsy and neurodegenerative disorders.',
      avatar_color: '#A855F7',
      initials: 'KI',
      password: '1234'
    },
    {
      name: 'Dr. Sameer Khan',
      specialty: 'General Physician',
      experience: 14,
      rating: 4.8,
      bio: 'A trusted general physician providing comprehensive primary care for the whole family.',
      avatar_color: '#EF4444',
      initials: 'SK',
      password: '1234'
    }
  ];

  const insertMany = db.transaction((doctors) => {
    for (const doc of doctors) insertDoctor.run(doc);
  });

  insertMany(sampleDoctors);
  console.log(`Seeded ${sampleDoctors.length} sample doctors.`);
}

module.exports = db;
