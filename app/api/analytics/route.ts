import { NextResponse } from 'next/server';
import { initDb, getSupabase } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await initDb();
    const supabase = getSupabase();

    const { count: jobCount, error: jobCountError } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (jobCountError) {
      throw new Error(jobCountError.message);
    }

    const { data: userJobs, error: jobsError } = await supabase
      .from('jobs')
      .select('id, extracted_skills, title, company, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (jobsError) {
      throw new Error(jobsError.message);
    }

    const jobs = userJobs ?? [];
    const jobIds = jobs.map((j) => j.id);

    let topCerts: Array<{
      name: string;
      industry: string;
      difficulty: number;
      count: number;
      total_score: number;
      avg_score: number;
    }> = [];

    if (jobIds.length > 0) {
      const { data: recs, error: recsError } = await supabase
        .from('recommendations')
        .select('score, cert_id, certifications (name, industry, difficulty)')
        .in('job_id', jobIds);

      if (recsError) {
        throw new Error(recsError.message);
      }

      const certStats = new Map<
        number,
        { name: string; industry: string; difficulty: number; count: number; total_score: number }
      >();

      for (const rec of recs ?? []) {
        const cert = rec.certifications as unknown as {
          name: string;
          industry: string;
          difficulty: number;
        } | null;
        if (!cert) continue;

        const existing = certStats.get(rec.cert_id);
        if (existing) {
          existing.count += 1;
          existing.total_score += rec.score;
        } else {
          certStats.set(rec.cert_id, {
            name: cert.name,
            industry: cert.industry,
            difficulty: cert.difficulty,
            count: 1,
            total_score: rec.score,
          });
        }
      }

      topCerts = [...certStats.values()]
        .map((c) => ({
          ...c,
          avg_score: c.total_score / c.count,
        }))
        .sort((a, b) => b.avg_score - a.avg_score)
        .slice(0, 8);
    }

    const skillCounts: Record<string, number> = {};
    for (const row of jobs) {
      const skills: string[] = JSON.parse(row.extracted_skills || '[]');
      for (const skill of skills) {
        skillCounts[skill] = (skillCounts[skill] || 0) + 1;
      }
    }

    const topSkills = Object.entries(skillCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([skill, count]) => ({ skill, count }));

    const { data: allCerts, error: certsError } = await supabase
      .from('certifications')
      .select('skills');

    if (certsError) {
      throw new Error(certsError.message);
    }

    const certSkillCounts: Record<string, number> = {};
    for (const row of allCerts ?? []) {
      const skills: string[] = JSON.parse(row.skills || '[]');
      for (const skill of skills) {
        certSkillCounts[skill] = (certSkillCounts[skill] || 0) + 1;
      }
    }

    const gaps = Object.entries(certSkillCounts)
      .filter(([skill]) => !skillCounts[skill])
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([skill]) => skill);

    const recentJobs = jobs.slice(0, 5).map(({ id, title, company, created_at }) => ({
      id,
      title,
      company,
      created_at,
    }));

    return NextResponse.json({
      jobCount: jobCount ?? 0,
      topCerts,
      topSkills,
      skillGaps: gaps,
      recentJobs,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
