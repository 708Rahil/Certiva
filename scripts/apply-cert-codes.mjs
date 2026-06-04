/**
 * One-time helper: add exam codes to cert names and update prerequisite/next_certs refs.
 * Run: node scripts/apply-cert-codes.mjs
 */
import fs from 'fs';
import path from 'path';

const CERTS_DIR = path.join(process.cwd(), 'certs');
const INDUSTRIES = ['cloud', 'cybersecurity', 'data', 'finance', 'marketing', 'management', 'ai_ml', 'business', 'networking'];

/** Official / vendor exam codes where applicable */
const NAME_BY_ID = {
  1: 'AWS Cloud Practitioner (CLF-C02)',
  2: 'AWS Solutions Architect Associate (SAA-C03)',
  3: 'AWS Developer Associate (DVA-C02)',
  6: 'CompTIA Network+ (N10-009)',
  7: 'CompTIA Security+ (SY0-701)',
  21: 'AWS DevOps Engineer Professional (DOP-C02)',
  23: 'HashiCorp Terraform Associate (003)',
  31: 'AWS SAP on AWS Specialty (PAS-C01)',
  50: 'AWS Data Engineer Associate (DEA-C01)',
  51: 'AWS Machine Learning Engineer Associate (MLA-C01)',
  52: 'AWS Database Specialty (DBS-C01)',
  70: 'AWS SysOps Administrator Associate (SOA-C02)',
  71: 'AWS Solutions Architect Professional (SAP-C02)',
  72: 'AWS Advanced Networking Specialty (ANS-C01)',
  74: 'Snowflake SnowPro Core (COF-C02)',
};

/** Old display names → new (for prereq/next_certs text and aliases) */
const RENAME_ALIASES = [
  ['AWS Cloud Practitioner', 'AWS Cloud Practitioner (CLF-C02)'],
  ['AWS Solutions Architect Associate', 'AWS Solutions Architect Associate (SAA-C03)'],
  ['AWS Developer Associate', 'AWS Developer Associate (DVA-C02)'],
  ['AWS DevOps Engineer Professional', 'AWS DevOps Engineer Professional (DOP-C02)'],
  ['AWS Solutions Architect Professional', 'AWS Solutions Architect Professional (SAP-C02)'],
  [
    'AWS Certified Solutions Architect – Professional',
    'AWS Solutions Architect Professional (SAP-C02)',
  ],
  [
    'AWS Certified Solutions Architect \u2013 Professional',
    'AWS Solutions Architect Professional (SAP-C02)',
  ],
  [
    'AWS Certified SysOps Administrator – Associate',
    'AWS SysOps Administrator Associate (SOA-C02)',
  ],
  [
    'AWS Certified SysOps Administrator \u2013 Associate',
    'AWS SysOps Administrator Associate (SOA-C02)',
  ],
  [
    'AWS Certified Advanced Networking – Specialty',
    'AWS Advanced Networking Specialty (ANS-C01)',
  ],
  [
    'AWS Certified Advanced Networking \u2013 Specialty',
    'AWS Advanced Networking Specialty (ANS-C01)',
  ],
  ['AWS Certified Security Specialty', 'AWS Security Specialty (SCS-C02)'],
  ['AWS Certified Security – Specialty', 'AWS Security Specialty (SCS-C02)'],
  ['AWS Security Specialty', 'AWS Security Specialty (SCS-C02)'],
  [
    'AWS Certified Data Engineer – Associate',
    'AWS Data Engineer Associate (DEA-C01)',
  ],
  [
    'AWS Certified Data Engineer \u2013 Associate',
    'AWS Data Engineer Associate (DEA-C01)',
  ],
  [
    'AWS Certified Machine Learning Engineer – Associate',
    'AWS Machine Learning Engineer Associate (MLA-C01)',
  ],
  [
    'AWS Certified Machine Learning Engineer \u2013 Associate',
    'AWS Machine Learning Engineer Associate (MLA-C01)',
  ],
  ['AWS Certified Database – Specialty', 'AWS Database Specialty (DBS-C01)'],
  ['AWS Certified Database \u2013 Specialty', 'AWS Database Specialty (DBS-C01)'],
  [
    'AWS Certified SAP on AWS – Specialty',
    'AWS SAP on AWS Specialty (PAS-C01)',
  ],
  [
    'AWS Certified SAP on AWS \u2013 Specialty',
    'AWS SAP on AWS Specialty (PAS-C01)',
  ],
  ['CompTIA Network+', 'CompTIA Network+ (N10-009)'],
  ['CompTIA Security+', 'CompTIA Security+ (SY0-701)'],
  ['Certified Kubernetes Administrator', 'Certified Kubernetes Administrator (CKA)'],
  ['HashiCorp Terraform Associate', 'HashiCorp Terraform Associate (003)'],
  ['Snowflake SnowPro Core', 'Snowflake SnowPro Core (COF-C02)'],
  ['Power BI Data Analyst Associate', 'Microsoft Power BI Data Analyst Associate (PL-300)'],
  ['Azure Security Engineer (AZ-500)', 'Azure Security Engineer Associate (AZ-500)'],
  [
    'Microsoft Cybersecurity Architect (SC-100)',
    'Microsoft Cybersecurity Architect Expert (SC-100)',
  ],
  ['Google Cloud Professional Architect', 'Professional Cloud Architect'],
  ['Google Cloud Professional Data Engineer', 'Google Cloud Professional Data Engineer'],
  ['Google Cloud Professional ML Engineer', 'Professional Machine Learning Engineer'],
  ['Professional Data Engineer', 'Google Cloud Professional Data Engineer'],
];

function applyAliases(text) {
  let out = text;
  for (const [from, to] of RENAME_ALIASES) {
    if (out.includes(from)) {
      out = out.split(from).join(to);
    }
  }
  return out;
}

function processFile(industry) {
  const filePath = path.join(CERTS_DIR, `${industry}.json`);
  const certs = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let changed = 0;

  for (const cert of certs) {
    if (NAME_BY_ID[cert.id]) {
      cert.name = NAME_BY_ID[cert.id];
      changed++;
    }

    if (cert.prerequisites) {
      cert.prerequisites = cert.prerequisites.map((p) => {
        const next = applyAliases(p);
        if (next !== p) changed++;
        return next;
      });
    }

    if (cert.next_certs) {
      cert.next_certs = cert.next_certs.map((n) => {
        const next = applyAliases(n);
        if (next !== n) changed++;
        return next;
      });
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(certs, null, 2) + '\n');
  console.log(`${industry}.json: updated (${changed} field changes)`);
}

for (const industry of INDUSTRIES) {
  processFile(industry);
}

console.log('Done. Re-run sync to Supabase or update rows in Table Editor.');
