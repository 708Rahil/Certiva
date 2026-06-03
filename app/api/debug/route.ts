import { NextResponse } from 'next/server';
import { getSupabase, initDb } from '@/lib/db';

export async function GET() {
  try {
    await initDb();
    const supabase = getSupabase();

    const { count: certCount, error: certCountError } = await supabase
      .from('certifications')
      .select('*', { count: 'exact', head: true });

    if (certCountError) {
      throw new Error(certCountError.message);
    }

    const { data: certs, error: certsError } = await supabase
      .from('certifications')
      .select('id, name, primary_skills, secondary_skills')
      .limit(3);

    if (certsError) {
      throw new Error(certsError.message);
    }

    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select('id, title, created_at')
      .order('id', { ascending: false })
      .limit(5);

    if (jobsError) {
      throw new Error(jobsError.message);
    }

    return NextResponse.json({
      certCount: certCount ?? 0,
      certs: certs ?? [],
      jobs: jobs ?? [],
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
