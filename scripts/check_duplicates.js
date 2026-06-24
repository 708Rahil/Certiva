const fs = require('fs');
const path = require('path');

let supabaseUrl = '';
let supabaseKey = '';

try {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    lines.forEach(line => {
      const match = line.match(/^\s*([\w\.\-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
        
        if (key === 'NEXT_PUBLIC_SUPABASE_URL') supabaseUrl = value.trim();
        if (key === 'SUPABASE_SERVICE_ROLE_KEY') supabaseKey = value.trim();
      }
    });
  }
} catch (e) {
  console.error('Error reading env files:', e.message);
}

const { createClient } = require('@supabase/supabase-js');

async function main() {
  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data: allCerts, error } = await supabase.from('certifications').select('target_job_titles');
  if (error) {
    console.error('Error fetching from Supabase:', error.message);
    process.exit(1);
  }

  const uniqueRoles = new Set();
  allCerts.forEach(cert => {
    let titles = [];
    if (cert.target_job_titles) {
      if (typeof cert.target_job_titles === 'string') {
        try {
          titles = JSON.parse(cert.target_job_titles);
        } catch {
          titles = cert.target_job_titles.split(',').map(t => t.trim());
        }
      } else if (Array.isArray(cert.target_job_titles)) {
        titles = cert.target_job_titles;
      }
    }
    titles.forEach(title => {
      const clean = title.trim();
      if (clean) uniqueRoles.add(clean);
    });
  });

  const list = Array.from(uniqueRoles);
  const duplicates = [];

  // Compare every pair
  for (let i = 0; i < list.length; i++) {
    for (let j = i + 1; j < list.length; j++) {
      const r1 = list[i];
      const r2 = list[j];
      
      const n1 = r1.toLowerCase().replace(/[^a-z0-9]/g, '');
      const n2 = r2.toLowerCase().replace(/[^a-z0-9]/g, '');
      
      // Exact string match check (ignoring punctuation/spaces)
      if (n1 === n2) {
        duplicates.push({ type: 'Exact match (punctuation/spacing)', r1, r2 });
      }
      // Check for SRE / Site Reliability Engineer
      else if (
        (r1.toLowerCase() === 'sre' && r2.toLowerCase().includes('site reliability engineer')) ||
        (r2.toLowerCase() === 'sre' && r1.toLowerCase().includes('site reliability engineer'))
      ) {
        duplicates.push({ type: 'Abbreviation match', r1, r2 });
      }
      // Check for parenthetical qualifiers (e.g. "Data Analyst" vs "Data Analyst (Analytics)")
      else if (
        r1.toLowerCase().includes(`(${r2.toLowerCase()})`) ||
        r2.toLowerCase().includes(`(${r1.toLowerCase()})`) ||
        (r1.includes('(') && r2.includes('(') && r1.split('(')[0].trim().toLowerCase() === r2.split('(')[0].trim().toLowerCase())
      ) {
        duplicates.push({ type: 'Parenthetical variant', r1, r2 });
      }
      // Check for common synonyms
      else if (
        r1.replace(/Developer/i, 'Engineer').toLowerCase() === r2.replace(/Developer/i, 'Engineer').toLowerCase() ||
        r1.replace(/Specialist/i, 'Analyst').toLowerCase() === r2.replace(/Specialist/i, 'Analyst').toLowerCase()
      ) {
        duplicates.push({ type: 'Role synonym (Dev/Eng or Spec/Analyst)', r1, r2 });
      }
    }
  }

  console.log(`=== Duplicate & Grouping Duplicates in Supabase (${duplicates.length} found) ===\n`);
  duplicates.forEach(d => {
    console.log(`[${d.type}]`);
    console.log(`  - "${d.r1}"`);
    console.log(`  - "${d.r2}"`);
    console.log('');
  });
}

main().catch(console.error);
