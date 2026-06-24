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

  const rolesMap = new Map();

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
      const cleanTitle = title.trim();
      if (!cleanTitle) return;
      const slug = cleanTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const key = slug;
      if (!rolesMap.has(key)) {
        rolesMap.set(key, {
          name: cleanTitle,
          slug,
          count: 0
        });
      }
      rolesMap.get(key).count += 1;
    });
  });

  const rolesList = Array.from(rolesMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  
  console.log(`Found ${rolesList.length} unique roles in Supabase.\n`);
  
  console.log('=== All Roles (Alphabetical) ===');
  rolesList.forEach(r => {
    console.log(`Name: "${r.name}" | Slug: "${r.slug}" | Count: ${r.count}`);
  });
}

main().catch(console.error);
