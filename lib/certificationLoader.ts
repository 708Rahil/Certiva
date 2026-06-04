import fs from 'fs';
import path from 'path';

/**
 * Loader to import enriched certification data from JSON files
 * into the database during initialization
 */

export interface EnrichedCertification {
  id: number;
  name: string;
  provider: string;
  industry: string;
  difficulty: number;
  description: string;
  skills: string[];
  primary_skills: string[];
  secondary_skills: string[];
  prerequisites: string[];
  recommended_prior_knowledge: string[];
  target_job_titles: string[];
  job_postings_count: number;
  job_postings_source?: string;
  next_certs: string[];
  cost: string;
  duration_weeks: number;
  study_hours: number;
  exam_hours: number;
  exam_format: string;
  exam_duration_minutes: number;
  passing_score: number;
  pass_rate_percent: number;
  valid_years: number | string;
  renewal_required: boolean;
  renewal_cost: string;
  salary_boost_low: number;
  salary_boost_high: number;
  worth_it_rating: number;
  trending: boolean;
  last_verified: string;
  /** Optional: Link to the official certification page */
  official_url?: string;
  data_confidence: string;
}

const INDUSTRIES = ['cloud', 'cybersecurity', 'data', 'finance', 'marketing', 'management', 'ai_ml', 'business', 'networking'];

export function loadAllCertifications(): EnrichedCertification[] {
  const allCerts: EnrichedCertification[] = [];
  
  for (const industry of INDUSTRIES) {
    try {
      const filePath = path.join(process.cwd(), 'certs', `${industry}.json`);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const certs = JSON.parse(fileContent) as EnrichedCertification[];
      allCerts.push(...certs);
    } catch (error) {
      console.warn(`Could not load certs/${industry}.json:`, error);
    }
  }
  
  return allCerts;
}

export function loadCertificationsByIndustry(industry: string): EnrichedCertification[] {
  try {
    const filePath = path.join(process.cwd(), 'certs', `${industry}.json`);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(fileContent) as EnrichedCertification[];
  } catch (error) {
    console.warn(`Could not load certs/${industry}.json:`, error);
    return [];
  }
}

export function getCertificationById(id: number): EnrichedCertification | null {
  const allCerts = loadAllCertifications();
  return allCerts.find(cert => cert.id === id) || null;
}
