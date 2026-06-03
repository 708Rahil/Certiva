import { NextRequest, NextResponse } from 'next/server';
import { initDb, getSupabase } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initDb();
    const supabase = getSupabase();
    const { id } = await params;

    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (jobError) {
      throw new Error(jobError.message);
    }

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const { userId } = await auth();

    if (job.user_id && job.user_id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: recs, error: recsError } = await supabase
      .from('recommendations')
      .select(`
        id,
        cert_id,
        score,
        skill_overlap,
        industry_match,
        difficulty_fit,
        matched_skills,
        explanation,
        certifications (
          name,
          industry,
          skills,
          difficulty,
          description,
          provider,
          cost,
          duration_weeks,
          pass_rate_percent,
          salary_boost_low,
          salary_boost_high,
          official_url
        )
      `)
      .eq('job_id', id)
      .order('score', { ascending: false });

    if (recsError) {
      throw new Error(recsError.message);
    }

    const recommendations = (recs ?? []).map((rec) => {
      const cert = rec.certifications as unknown as Record<string, unknown> | null;
      const { certifications: _c, industry_match, ...rest } = rec;
      return {
        ...rest,
        ...(cert ?? {}),
        industry_match: industry_match ? 1 : 0,
      };
    });

    return NextResponse.json({ job, recommendations });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initDb();
    const supabase = getSupabase();
    const { id } = await params;
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check ownership
    const { data: job, error: fetchError } = await supabase
      .from('jobs')
      .select('user_id')
      .eq('id', id)
      .maybeSingle();

    if (fetchError || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (job.user_id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Explicitly delete recommendations to be safe
    await supabase.from('recommendations').delete().eq('job_id', id);

    const { error: deleteError } = await supabase
      .from('jobs')
      .delete()
      .eq('id', id);

    if (deleteError) {
      throw new Error(deleteError.message);
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
