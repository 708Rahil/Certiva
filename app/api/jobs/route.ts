import { NextRequest, NextResponse } from 'next/server';
import { initDb, getDb } from '@/lib/db';
import { extractSkills, detectIndustry, matchCertifications, Certification, inferSeniority } from '@/lib/matcher';

export async function POST(req: NextRequest) {
  try {
    await initDb();
    const db = getDb();
    const { title, company, description } = await req.json();

    if (!title || !company || !description) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Extract skills
    const skills = extractSkills(title + ' ' + description);
    const industry = detectIndustry(title, description);

    // Save job
    const jobResult = await db.execute({
      sql: 'INSERT INTO jobs (title, company, description, extracted_skills) VALUES (?, ?, ?, ?)',
      args: [title, company, description, JSON.stringify(skills)],
    });
    const jobId = Number(jobResult.lastInsertRowid);

    // Get all certs
    const certsResult = await db.execute('SELECT * FROM certifications');
    const certs = certsResult.rows as unknown as Certification[];

    // Infer seniority level of the job
    const userLevel = inferSeniority(title, description);

    // Match & rank
    const recommendations = matchCertifications(skills, industry, title, description, certs, userLevel);

    console.log('=== MATCHING RESULTS ===');
    console.log(`Job Title: "${title}" | Detected Industry: "${industry}" | Inferred Seniority: "${userLevel}"`);
    console.log('Extracted Skills:', skills);
    recommendations.forEach(r => {
      console.log(`- ${r.cert.name} (ID: ${r.cert.id}): Score = ${r.score} | SkillOverlap = ${r.skillOverlap}% | IndustryMatch = ${r.industryMatch} | DiffFit = ${r.difficultyFit}% | TitleMatch = ${r.titleMatch}`);
    });
    console.log('=========================');

    // Save top 8 recommendations
    const topRecs = recommendations.slice(0, 8);
    for (const rec of topRecs) {
      await db.execute({
        sql: `INSERT INTO recommendations (job_id, cert_id, score, skill_overlap, industry_match, difficulty_fit, matched_skills, explanation)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          jobId,
          rec.cert.id,
          rec.score,
          rec.skillOverlap,
          rec.industryMatch ? 1 : 0,
          rec.difficultyFit,
          JSON.stringify(rec.matchedSkills),
          rec.explanation,
        ],
      });
    }

    return NextResponse.json({ jobId, skills, industry, recommendationCount: topRecs.length });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function GET() {
  try {
    await initDb();
    const db = getDb();
    const result = await db.execute(
      'SELECT * FROM jobs ORDER BY created_at DESC LIMIT 50'
    );
    return NextResponse.json(result.rows);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
