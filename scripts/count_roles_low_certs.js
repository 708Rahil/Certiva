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
  const { data: allCerts, error } = await supabase.from('certifications').select('name, target_job_titles');
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
          certs: []
        });
      }
      // Deduplicate cert names just in case
      const roleObj = rolesMap.get(key);
      if (!roleObj.certs.includes(cert.name)) {
        roleObj.certs.push(cert.name);
      }
    });
  });

  const rolesList = Array.from(rolesMap.values());
  const lowCertRoles = rolesList.filter(r => r.certs.length <= 2);
  
  console.log(`=== Role Certification Statistics ===`);
  console.log(`Total unique roles: ${rolesList.length}`);
  console.log(`Roles with 2 or less certifications: ${lowCertRoles.length} (${((lowCertRoles.length / rolesList.length) * 100).toFixed(1)}% of all roles)\n`);

  // Count exact distribution
  const dist = { 1: 0, 2: 0, 3: 0, '4+': 0 };
  rolesList.forEach(r => {
    const len = r.certs.length;
    if (len === 1) dist[1]++;
    else if (len === 2) dist[2]++;
    else if (len === 3) dist[3]++;
    else dist['4+']++;
  });

  console.log(`Distribution of certifications per role:`);
  console.log(`- 1 Certification: ${dist[1]} roles`);
  console.log(`- 2 Certifications: ${dist[2]} roles`);
  console.log(`- 3 Certifications: ${dist[3]} roles`);
  console.log(`- 4+ Certifications: ${dist['4+']} roles\n`);

  console.log(`=== Examples of roles with 2 or less certifications ===`);
  // Print some examples with their certifications
  lowCertRoles.slice(0, 30).forEach(r => {
    console.log(`- "${r.name}" (${r.certs.length} cert${r.certs.length > 1 ? 's' : ''}): ${r.certs.join(', ')}`);
  });
  
  if (lowCertRoles.length > 30) {
    console.log(`... and ${lowCertRoles.length - 30} more roles.`);
  }
}

main().catch(console.error);
