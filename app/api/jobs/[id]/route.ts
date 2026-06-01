import { NextRequest, NextResponse } from 'next/server';
import { initDb, getDb } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initDb();
    const db = getDb();
    const { id } = await params;

    const jobResult = await db.execute({
      sql: 'SELECT * FROM jobs WHERE id = ?',
      args: [id],
    });

    if (!jobResult.rows.length) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const job = jobResult.rows[0];
    const { userId } = await auth();

    // Secure check: if the job belongs to a registered user, restrict access to the owner
    if (job.user_id && job.user_id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const recsResult = await db.execute({
      sql: `SELECT r.*, c.name, c.industry, c.skills, c.difficulty, c.description, c.provider, c.cost, c.duration_weeks, c.pass_rate_percent, c.salary_boost_low, c.salary_boost_high, c.official_url
            FROM recommendations r
            JOIN certifications c ON r.cert_id = c.id
            WHERE r.job_id = ?
            ORDER BY r.score DESC`,
      args: [id],
    });

    return NextResponse.json({
      job,
      recommendations: recsResult.rows,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
