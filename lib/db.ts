import { createClient } from '@libsql/client';
import path from 'path';
import { loadAllCertifications } from './certificationLoader';

const dbPath = path.join(process.cwd(), 'certiva.db');

let _client: ReturnType<typeof createClient> | null = null;

export function getDb() {
  if (!_client) {
    _client = createClient({ url: `file:${dbPath}` });
  }
  return _client;
}

export async function initDb() {
  const db = getDb();

  await db.execute(`
    CREATE TABLE IF NOT EXISTS certifications (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      provider TEXT NOT NULL,
      industry TEXT NOT NULL,
      difficulty INTEGER NOT NULL,
      description TEXT NOT NULL,
      skills TEXT NOT NULL,
      primary_skills TEXT,
      secondary_skills TEXT,
      prerequisites TEXT,
      target_job_titles TEXT,
      job_postings_count INTEGER,
      next_certs TEXT,
      cost TEXT,
      duration_weeks INTEGER,
      study_hours INTEGER,
      exam_format TEXT,
      pass_rate_percent INTEGER,
      salary_boost_low INTEGER,
      salary_boost_high INTEGER,
      worth_it_rating REAL,
      trending INTEGER,
      last_verified TEXT,
      data_confidence TEXT,
      official_url TEXT
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      company TEXT NOT NULL,
      description TEXT NOT NULL,
      extracted_skills TEXT NOT NULL,
      user_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  try {
    await db.execute('ALTER TABLE jobs ADD COLUMN user_id TEXT');
  } catch {
    // Column already exists or database is brand new
  }

  await db.execute(`
    CREATE TABLE IF NOT EXISTS recommendations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_id INTEGER NOT NULL,
      cert_id INTEGER NOT NULL,
      score REAL NOT NULL,
      skill_overlap REAL NOT NULL,
      industry_match INTEGER NOT NULL,
      difficulty_fit REAL NOT NULL,
      matched_skills TEXT NOT NULL,
      explanation TEXT NOT NULL,
      FOREIGN KEY (job_id) REFERENCES jobs(id),
      FOREIGN KEY (cert_id) REFERENCES certifications(id)
    )
  `);

  // Seed certifications if empty
  const count = await db.execute('SELECT COUNT(*) as cnt FROM certifications');
  if ((count.rows[0] as unknown as { cnt: number }).cnt === 0) {
    await seedCertifications(db);
  }
}

async function seedCertifications(db: ReturnType<typeof createClient>) {
  const certs = loadAllCertifications();
  
  for (const cert of certs) {
    await db.execute({
      sql: `INSERT INTO certifications (
        id, name, provider, industry, difficulty, description, skills,
        primary_skills, secondary_skills, prerequisites, target_job_titles,
        job_postings_count, next_certs, cost, duration_weeks, study_hours,
        exam_format, pass_rate_percent, salary_boost_low, salary_boost_high,
        worth_it_rating, trending, last_verified, data_confidence, official_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        cert.id || 0,
        cert.name || '',
        cert.provider || '',
        cert.industry || '',
        cert.difficulty || 1,
        cert.description || '',
        JSON.stringify(cert.skills || []),
        JSON.stringify(cert.primary_skills || []),
        JSON.stringify(cert.secondary_skills || []),
        JSON.stringify(cert.prerequisites || []),
        JSON.stringify(cert.target_job_titles || []),
        cert.job_postings_count || 0,
        JSON.stringify(cert.next_certs || []),
        cert.cost || '',
        cert.duration_weeks || 0,
        cert.study_hours || 0,
        cert.exam_format || '',
        cert.pass_rate_percent || 0,
        cert.salary_boost_low || 0,
        cert.salary_boost_high || 0,
        cert.worth_it_rating || 0,
        cert.trending ? 1 : 0,
        cert.last_verified || '',
        cert.data_confidence || 'medium',
        cert.official_url || null,
      ],
    });
  }
}


const CERTIFICATIONS = [];
