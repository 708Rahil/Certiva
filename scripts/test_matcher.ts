import { extractSkills, detectIndustry, matchCertifications, inferSeniority } from '../lib/matcher';
import { loadAllCertifications } from '../lib/certificationLoader';

const title = "Junior Finance Analyst";
const description = `About the Role

We are seeking a detail-oriented and analytical Junior Finance Analyst to join our finance team in Brampton. This role is ideal for early-career professionals who are passionate about data-driven financial analysis and eager to grow their technical and business skills in a fast-paced environment.

You will support financial reporting, budgeting, forecasting, and data analysis initiatives while working closely with senior finance and business stakeholders.



Key Responsibilities

Assist in the preparation of monthly, quarterly, and annual financial reports
Analyze financial data to identify trends, variances, and improvement opportunities
Support budgeting, forecasting, and financial planning activities
Build and maintain financial models and dashboards
Extract, clean, and transform data using SQL, Excel, Power Query, and Python
Automate recurring financial reports and processes to improve efficiency
Ensure accuracy and integrity of financial data
Collaborate with cross-functional teams to support business decision-making
Ad hoc financial and data analysis as required


Required Skills & Qualifications

Bachelor’s degree in Finance, Accounting, Economics, Business Analytics, or a related field
2–6 years of experience in finance, accounting, or analytics (internships and co-ops considered)
Strong proficiency in Microsoft Excel (formulas, PivotTables, Power Query)
Working knowledge of SQL for data extraction and analysis
Basic to intermediate experience with Python (pandas, data analysis, automation)
Solid understanding of financial statements and accounting fundamentals
Strong analytical, problem-solving, and attention-to-detail skills
Ability to communicate insights clearly to both technical and non-technical audiences


Nice-to-Have Skills

Experience with Power BI, Tableau, or other BI tools
Exposure to ERP or financial systems (e.g., SAP, Oracle, NetSuite)
Knowledge of VBA or other automation tools
Progress toward CPA, CFA, or other relevant certifications

Requirements added by the job poster

• 5+ years of experience in Finance

• 5+ years of work experience with Python (Programming Language)

• 4+ years of work experience with Microsoft Excel

• 5+ years of work experience with Azure SQL`;

const skills = extractSkills(title + ' ' + description);
const industry = detectIndustry(title, description);
const userLevel = inferSeniority(title, description);
const certs = loadAllCertifications() as any[];

console.log("Job Title:", title);
console.log("Detected Industry:", industry);
console.log("Inferred Seniority:", userLevel);
console.log("Extracted Skills:", skills);

const recommendations = matchCertifications(skills, industry, title, description, certs, userLevel);
console.log("\nRecommendations:");
recommendations.forEach(r => {
  console.log(`- ${r.cert.name} (ID: ${r.cert.id}): Score = ${r.score} | SkillOverlap = ${r.skillOverlap}% | IndustryMatch = ${r.industryMatch} | DiffFit = ${r.difficultyFit}% | TitleMatch = ${r.titleMatch} | ExplicitMatch = ${r.explanation.includes("Explicitly")}`);
  console.log(`  Explanation: ${r.explanation}`);
});
