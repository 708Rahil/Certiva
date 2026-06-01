import { getDb, initDb } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

await initDb();

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();
  const id = params.id;

  try {
    // Verify the record belongs to the user
    const record = await db.execute({
      sql: 'SELECT user_id FROM user_certifications WHERE id = ?',
      args: [id],
    });

    if (record.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const row = record.rows[0] as { user_id: string };
    if (row.user_id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await db.execute({
      sql: 'DELETE FROM user_certifications WHERE id = ?',
      args: [id],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user certification:', error);
    return NextResponse.json(
      { error: 'Failed to delete certification' },
      { status: 500 }
    );
  }
}
