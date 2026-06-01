import { getDb, initDb } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

await initDb();

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();
  
  try {
    const userCerts = await db.execute({
      sql: `
        SELECT 
          uc.id,
          uc.user_id,
          uc.cert_id,
          uc.status,
          uc.started_date,
          uc.completed_date,
          uc.notes,
          uc.created_at,
          uc.updated_at,
          c.name,
          c.provider,
          c.industry,
          c.difficulty,
          c.cost,
          c.duration_weeks,
          c.pass_rate_percent,
          c.official_url,
          c.salary_boost_low,
          c.salary_boost_high,
          c.trending
        FROM user_certifications uc
        JOIN certifications c ON uc.cert_id = c.id
        WHERE uc.user_id = ?
        ORDER BY uc.updated_at DESC
      `,
      args: [userId],
    });

    return NextResponse.json(userCerts.rows);
  } catch (error) {
    console.error('Error fetching user certifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch certifications' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();
  const { certId, status, startedDate, completedDate, notes } = await request.json();

  try {
    await db.execute({
      sql: `
        INSERT INTO user_certifications (user_id, cert_id, status, started_date, completed_date, notes)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(user_id, cert_id) 
        DO UPDATE SET status = ?, started_date = ?, completed_date = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      `,
      args: [
        userId,
        certId,
        status,
        startedDate || null,
        completedDate || null,
        notes || null,
        status,
        startedDate || null,
        completedDate || null,
        notes || null,
      ],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving user certification:', error);
    return NextResponse.json(
      { error: 'Failed to save certification' },
      { status: 500 }
    );
  }
}
