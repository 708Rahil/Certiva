import { getSupabase, initDb } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  await initDb();
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabase();

  try {
    const { data, error } = await supabase
      .from('user_certifications')
      .select(`
        id,
        user_id,
        cert_id,
        status,
        started_date,
        completed_date,
        notes,
        created_at,
        updated_at,
        certifications (
          name,
          provider,
          industry,
          difficulty,
          cost,
          duration_weeks,
          pass_rate_percent,
          official_url,
          salary_boost_low,
          salary_boost_high,
          trending
        )
      `)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    const rows = (data ?? []).map((row) => {
      const cert = row.certifications as unknown as Record<string, unknown> | null;
      const { certifications: _c, ...rest } = row;
      return {
        ...rest,
        ...(cert ?? {}),
        trending: cert?.trending ? 1 : 0,
      };
    });

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching user certifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch certifications' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  await initDb();
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabase();
  const { certId, status, startedDate, completedDate, notes } = await request.json();

  try {
    const { error } = await supabase.from('user_certifications').upsert(
      {
        user_id: userId,
        cert_id: certId,
        status,
        started_date: startedDate || null,
        completed_date: completedDate || null,
        notes: notes || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,cert_id' }
    );

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving user certification:', error);
    return NextResponse.json(
      { error: 'Failed to save certification' },
      { status: 500 }
    );
  }
}
