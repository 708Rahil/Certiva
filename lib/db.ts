import { getSupabase } from './supabase';
import { loadAllCertifications } from './certificationLoader';

export { getSupabase } from './supabase';

/** Seeds certifications from JSON files if the table is empty. */
export async function initDb() {
  const supabase = getSupabase();

  const { count, error: countError } = await supabase
    .from('certifications')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    throw new Error(`Failed to check certifications: ${countError.message}`);
  }

  if ((count ?? 0) > 0) {
    return;
  }

  const certs = loadAllCertifications().map((cert) => ({
    id: cert.id || 0,
    name: cert.name || '',
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
  }));

  const { error: insertError } = await supabase.from('certifications').insert(certs);

  if (insertError) {
    throw new Error(`Failed to seed certifications: ${insertError.message}`);
  }
}
