/**
 * Upsert all certifications from certs/*.json into Supabase.
 * Requires .env.local with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 *
 * Run: node scripts/sync-certs-to-supabase.mjs
 */
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

function loadEnvLocal() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq);
    const val = trimmed.slice(eq + 1).replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(url, key);
const INDUSTRIES = ['cloud', 'cybersecurity', 'data', 'finance', 'marketing', 'management', 'ai_ml', 'business', 'networking'];

function toRow(cert) {
  return {
    id: cert.id,
    name: cert.name,
    provider: cert.provider || '',
    industry: cert.industry || '',
    difficulty: cert.difficulty || 1,
    description: cert.description || '',
    skills: JSON.stringify(cert.skills || []),
    primary_skills: JSON.stringify(cert.primary_skills || []),
    secondary_skills: JSON.stringify(cert.secondary_skills || []),
    prerequisites: JSON.stringify(cert.prerequisites || []),
    target_job_titles: JSON.stringify(cert.target_job_titles || []),
    job_postings_count: cert.job_postings_count || 0,
    next_certs: JSON.stringify(cert.next_certs || []),
    cost: cert.cost || '',
    duration_weeks: cert.duration_weeks || 0,
    study_hours: cert.study_hours || 0,
    exam_format: cert.exam_format || '',
    pass_rate_percent: cert.pass_rate_percent || 0,
    salary_boost_low: cert.salary_boost_low || 0,
    salary_boost_high: cert.salary_boost_high || 0,
    worth_it_rating: cert.worth_it_rating || 0,
    trending: Boolean(cert.trending),
    last_verified: cert.last_verified || '',
    data_confidence: cert.data_confidence || 'medium',
    official_url: cert.official_url || null,
  };
}

const allCerts = [];
for (const industry of INDUSTRIES) {
  const filePath = path.join(process.cwd(), 'certs', `${industry}.json`);
  allCerts.push(...JSON.parse(fs.readFileSync(filePath, 'utf8')));
}

const rows = allCerts.map(toRow);

const { error } = await supabase.from('certifications').upsert(rows, { onConflict: 'id' });

if (error) {
  console.error('Sync failed:', error.message);
  process.exit(1);
}

console.log(`Synced ${rows.length} certifications to Supabase.`);
