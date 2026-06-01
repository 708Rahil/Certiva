import { NextResponse } from 'next/server';
import { initDb, getDb } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await initDb();
    const db = getDb();

    // Total jobs
    const jobCount = await db.execute({
      sql: 'SELECT COUNT(*) as cnt FROM jobs WHERE user_id = ?',
      args: [userId]
    });

    // Most recommended certifications
    const topCerts = await db.execute({
      sql: `
        SELECT c.name, c.industry, c.difficulty, COUNT(*) as count, AVG(r.score) as avg_score
        FROM recommendations r
        JOIN certifications c ON r.cert_id = c.id
        JOIN jobs j ON r.job_id = j.id
        WHERE j.user_id = ?
        GROUP BY c.id
        ORDER BY count DESC
        LIMIT 8
      `,
      args: [userId]
    });

    // All extracted skills aggregated
    const allJobs = await db.execute({
      sql: 'SELECT extracted_skills FROM jobs WHERE user_id = ?',
      args: [userId]
    });
    
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
    const recentJobs = await db.execute({
      sql: 'SELECT id, title, company, created_at FROM jobs WHERE user_id = ? ORDER BY created_at DESC LIMIT 5',
      args: [userId]
    });

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
