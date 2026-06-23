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
  const { data: allCerts, error } = await supabase.from('certifications').select('name, industry, target_job_titles');
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
          industry: cert.industry || 'general',
          certs: []
        });
      }
      const roleObj = rolesMap.get(key);
      if (!roleObj.certs.includes(cert.name)) {
        roleObj.certs.push(cert.name);
      }
    });
  });

  const singleCertRoles = Array.from(rolesMap.values())
    .filter(r => r.certs.length === 1)
    .sort((a, b) => {
      const indA = a.industry || 'general';
      const indB = b.industry || 'general';
      const indCompare = indA.localeCompare(indB);
      if (indCompare !== 0) return indCompare;
      return a.name.localeCompare(b.name);
    });

  // Build markdown content
  let md = `# Career Roles with Exactly 1 Certification\n\n`;
  md += `This document lists the **${singleCertRoles.length}** career paths on CertRoute that have only **one** targeted certification in their roadmap.\n\n`;
  md += `| # | Career Role | Industry | Target Certification |\n`;
  md += `|---|-------------|----------|----------------------|\n`;

  singleCertRoles.forEach((r, idx) => {
    const formattedIndustry = r.industry.charAt(0).toUpperCase() + r.industry.slice(1);
    md += `| ${idx + 1} | **${r.name}** | ${formattedIndustry} | ${r.certs[0]} |\n`;
  });

  const artifactPath = '/Users/rahilgandhi/.gemini/antigravity-ide/brain/beb2c7a0-390b-4584-a68b-ccdefdd5d01f/roles_with_single_certification.md';
  fs.writeFileSync(artifactPath, md);
  console.log(`Saved list of ${singleCertRoles.length} roles to ${artifactPath}`);
}

main().catch(console.error);
