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

  // Group certs by industry
  const industryStats = {};
  
  allCerts.forEach(cert => {
    const ind = cert.industry || 'general';
    if (!industryStats[ind]) {
      industryStats[ind] = {
        certNames: new Set(),
        roleNames: new Set(),
        roleCounts: {}
      };
    }
    
    industryStats[ind].certNames.add(cert.name);
    
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
      industryStats[ind].roleNames.add(cleanTitle);
      
      const key = cleanTitle.toLowerCase();
      if (!industryStats[ind].roleCounts[key]) {
        industryStats[ind].roleCounts[key] = new Set();
      }
      industryStats[ind].roleCounts[key].add(cert.name);
    });
  });

  console.log('=== Industry Statistics (Certifications vs. Roles) ===\n');
  
  const statsList = Object.entries(industryStats).map(([ind, data]) => {
    const certCount = data.certNames.size;
    const roleCount = data.roleNames.size;
    
    const roleList = Object.values(data.roleCounts);
    const singleCertRoles = roleList.filter(certsSet => certsSet.size === 1).length;
    const singleCertPct = roleCount > 0 ? (singleCertRoles / roleCount) * 100 : 0;
    
    return {
      industry: ind,
      certCount,
      roleCount,
      singleCertRoles,
      singleCertPct,
      density: roleCount > 0 ? (certCount / roleCount).toFixed(2) : 0
    };
  }).sort((a, b) => a.density - b.density); // Sort by lowest density first

  console.log('| Industry | Certs in DB | Unique Roles | Single-Cert Roles | % Single-Cert Roles | Certs/Roles Ratio |');
  console.log('|----------|-------------|--------------|-------------------|-------------------|-------------------|');
  statsList.forEach(s => {
    console.log(`| ${s.industry.padEnd(10)} | ${String(s.certCount).padEnd(11)} | ${String(s.roleCount).padEnd(12)} | ${String(s.singleCertRoles).padEnd(17)} | ${s.singleCertPct.toFixed(1)}%`.padEnd(58) + ` | ${s.density} |`);
  });

  console.log('\n=== Analysis and Recommendations ===');
  statsList.forEach(s => {
    if (s.singleCertPct > 80 && s.certCount < 15) {
      console.log(`\n- INDUSTRY: "${s.industry.toUpperCase()}" (CRITICAL SHORTAGE)`);
      console.log(`  * Only has ${s.certCount} certifications in total, but lists ${s.roleCount} unique roles.`);
      console.log(`  * ${s.singleCertPct.toFixed(1)}% of these roles have only 1 certification.`);
      console.log(`  * Recommendation: Add more certifications in this area (e.g. specialized providers, intermediate steps).`);
    } else if (s.singleCertPct > 85) {
      console.log(`\n- INDUSTRY: "${s.industry.toUpperCase()}" (HIGH SHORTAGE)`);
      console.log(`  * Has ${s.certCount} certifications, but the roles are highly fragmented (${s.roleCount} roles).`);
      console.log(`  * ${s.singleCertPct.toFixed(1)}% of roles have only 1 certification.`);
    }
  });
}

main().catch(console.error);
