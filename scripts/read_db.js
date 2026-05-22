const { createClient } = require('@libsql/client');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'certiva.db');

async function main() {
  const db = createClient({ url: `file:${dbPath}` });
  
  // Get all jobs to see what's in there
  const jobs = await db.execute('SELECT * FROM jobs ORDER BY id DESC LIMIT 5');
  console.log('JOBS IN DB:');
  for (const job of jobs.rows) {
    console.log(`- ID: ${job.id} | Title: ${job.title} | Company: ${job.company}`);
  }
  
  if (jobs.rows.length === 0) {
    console.log('No jobs found');
    return;
  }
  
  const lastJob = jobs.rows[0];
  console.log('==================================================');
  console.log(`LAST JOB ID: ${lastJob.id}`);
  console.log(`TITLE: ${lastJob.title}`);
  console.log(`COMPANY: ${lastJob.company}`);
  console.log('==================================================');
  
  // Get recommendations
  const recs = await db.execute({
    sql: `SELECT r.*, c.name, c.industry, c.difficulty 
          FROM recommendations r 
          JOIN certifications c ON r.cert_id = c.id 
          WHERE r.job_id = ? 
          ORDER BY r.score DESC`,
    args: [lastJob.id]
  });
  
  console.log('RECOMMENDATIONS:');
  for (const r of recs.rows) {
    console.log(`- Cert: ${r.name} (Score: ${r.score}, Overlap: ${r.skill_overlap}%, Industry Match: ${r.industry_match}, Diff Fit: ${r.difficulty_fit}%)`);
    console.log(`  Explanation: ${r.explanation}`);
  }
  console.log('==================================================');
}

main().catch(console.error);
