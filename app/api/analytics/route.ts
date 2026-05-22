import { NextResponse } from 'next/server';
import { initDb, getDb } from '@/lib/db';

export async function GET() {
  try {
    await initDb();
    const db = getDb();

    // Total jobs
    const jobCount = await db.execute('SELECT COUNT(*) as cnt FROM jobs');

    // Most recommended certifications
    const topCerts = await db.execute(`
      SELECT c.name, c.industry, c.difficulty, COUNT(*) as count, AVG(r.score) as avg_score
      FROM recommendations r
      JOIN certifications c ON r.cert_id = c.id
      GROUP BY c.id
      ORDER BY count DESC
      LIMIT 8
    `);

    // All extracted skills aggregated
    const allJobs = await db.execute('SELECT extracted_skills FROM jobs');
    const skillCounts: Record<string, number> = {};
    for (const row of allJobs.rows) {
      const skills: string[] = JSON.parse(row.extracted_skills as string || '[]');
      for (const skill of skills) {
        skillCounts[skill] = (skillCounts[skill] || 0) + 1;
      }
    }

    const topSkills = Object.entries(skillCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([skill, count]) => ({ skill, count }));

    // Top skill gaps (skills in certs that don't appear in job postings)
    const allCerts = await db.execute('SELECT skills FROM certifications');
    const certSkillCounts: Record<string, number> = {};
    for (const row of allCerts.rows) {
      const skills: string[] = JSON.parse(row.skills as string || '[]');
      for (const skill of skills) {
        certSkillCounts[skill] = (certSkillCounts[skill] || 0) + 1;
      }
    }

    const gaps = Object.entries(certSkillCounts)
      .filter(([skill]) => !skillCounts[skill])
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([skill]) => skill);

    // Recent jobs
    const recentJobs = await db.execute(
      'SELECT id, title, company, created_at FROM jobs ORDER BY created_at DESC LIMIT 5'
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return NextResponse.json({
      jobCount: (jobCount.rows[0] as unknown as { cnt: number }).cnt,
      topCerts: topCerts.rows,
      topSkills,
      skillGaps: gaps,
      recentJobs: recentJobs.rows,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
