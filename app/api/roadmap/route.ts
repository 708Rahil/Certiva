import { NextRequest, NextResponse } from 'next/server';
import { initDb, getSupabase } from '@/lib/db';
import { matchCertifications, Certification } from '@/lib/matcher';
import { extractJobData } from '@/lib/llmExtractor';
import { auth } from '@clerk/nextjs/server';

export async function POST(req: NextRequest) {
  try {
    await initDb();
    const supabase = getSupabase();
    const { title, company, description } = await req.json();

    if (!title || !company || !description) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const { userId } = await auth();

    // ── LLM extraction (with keyword fallback) ──────────────────────────────
    const { skills, industry, seniority, source } = await extractJobData(title, description);

    // ── Save job ─────────────────────────────────────────────────────────────
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .insert({
        title,
        company,
        description,
        extracted_skills: JSON.stringify(skills),
        user_id: userId || null,
      })
      .select('id')
      .single();

    if (jobError || !job) {
      throw new Error(jobError?.message || 'Failed to save job');
    }

    const jobId = job.id;

    // ── Fetch certifications ─────────────────────────────────────────────────
    const { data: certs, error: certsError } = await supabase
      .from('certifications')
      .select('*');

    if (certsError) {
      throw new Error(certsError.message);
    }

    // ── Match & rank ─────────────────────────────────────────────────────────
    const recommendations = matchCertifications(
      skills,
      industry,
      title,
      description,
      (certs ?? []) as Certification[],
      seniority
    );

    const topRecs = recommendations.slice(0, 8);
    if (topRecs.length > 0) {
      const { error: recsError } = await supabase.from('recommendations').insert(
        topRecs.map((rec) => ({
          job_id: jobId,
          cert_id: rec.cert.id,
          score: rec.score,
          skill_overlap: rec.skillOverlap,
          industry_match: rec.industryMatch,
          difficulty_fit: rec.difficultyFit,
          matched_skills: JSON.stringify(rec.matchedSkills),
          explanation: rec.explanation,
        }))
      );

      if (recsError) {
        throw new Error(recsError.message);
      }
    }

    return NextResponse.json({
      jobId,
      skills,
      industry,
      seniority,
      extractionSource: source, // 'llm' or 'keyword' — useful for debugging
      recommendationCount: topRecs.length,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await initDb();
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json(data ?? []);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}