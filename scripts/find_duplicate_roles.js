const fs = require('fs');
const path = require('path');

const certsDir = path.join(__dirname, '..', 'certs');
const INDUSTRIES = ['cloud', 'cybersecurity', 'data', 'finance', 'marketing', 'management', 'ai_ml', 'business'];

async function main() {
  const allTitles = [];

  for (const industry of INDUSTRIES) {
    const filePath = path.join(certsDir, `${industry}.json`);
    if (!fs.existsSync(filePath)) continue;
    
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const certs = JSON.parse(content);
      
      for (const cert of certs) {
        let titles = [];
        if (cert.target_job_titles) {
          if (Array.isArray(cert.target_job_titles)) {
            titles = cert.target_job_titles;
          } else if (typeof cert.target_job_titles === 'string') {
            try {
              titles = JSON.parse(cert.target_job_titles);
            } catch {
              titles = cert.target_job_titles.split(',').map(t => t.trim());
            }
          }
        }
        
        for (const title of titles) {
          const clean = title.trim();
          if (!clean) continue;
          allTitles.push({ raw: clean, cert: cert.name, file: `${industry}.json` });
        }
      }
    } catch (e) {
      console.error(`Error reading ${industry}.json:`, e.message);
    }
  }

  // Count occurrences of each exact case-insensitive title
  const counts = {};
  allTitles.forEach(t => {
    const key = t.raw.toLowerCase();
    if (!counts[key]) {
      counts[key] = {
        displayName: t.raw,
        count: 0,
        certs: []
      };
    }
    counts[key].count++;
    counts[key].certs.push(`${t.cert} (${t.file})`);
  });

  // Filter for shared titles (count > 1)
  const shared = Object.values(counts)
    .filter(item => item.count > 1)
    .sort((a, b) => b.count - a.count);

  console.log(`=== Job Titles Shared by Multiple Certifications (Total: ${shared.length}) ===\n`);
  shared.forEach(item => {
    console.log(`Role: "${item.displayName}" (Appears in ${item.count} certifications)`);
    item.certs.forEach(c => console.log(`  - ${c}`));
    console.log('');
  });
}

main();
