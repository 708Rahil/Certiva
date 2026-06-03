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
    const byIndustry: Record<string, any[]> = {};

    for (const rec of topRecs) {
        const industry = rec.cert.industry || 'general';

        if (!byIndustry[industry]) {
            byIndustry[industry] = [];
        }

        byIndustry[industry].push(rec.cert);
    }

    
    
    
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
      byIndustry, //LLM test
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

    // 1. Get the user's jobs
    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select('id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (jobsError) throw new Error(jobsError.message);
    if (!jobs || jobs.length === 0) {
      return NextResponse.json([]);
    }

    const jobIds = jobs.map((j: any) => j.id);

    // 2. Get recommendations for those jobs
    const { data: recs, error: recsError } = await supabase
      .from('recommendations')
      .select('cert_id, score')
      .in('job_id', jobIds);

    if (recsError) throw new Error(recsError.message);
    if (!recs || recs.length === 0) {
      return NextResponse.json([]);
    }

    // Deduplicate cert IDs, keeping the highest score for each
    const certScoreMap = new Map<number, number>();
    for (const rec of recs) {
      const existing = certScoreMap.get(rec.cert_id) ?? 0;
      if (rec.score > existing) {
        certScoreMap.set(rec.cert_id, rec.score);
      }
    }
    const certIds = Array.from(certScoreMap.keys());

    // 3. Fetch those certifications
    const { data: certs, error: certsError } = await supabase
      .from('certifications')
      .select('*')
      .in('id', certIds);

    if (certsError) throw new Error(certsError.message);
    if (!certs || certs.length === 0) {
      return NextResponse.json([]);
    }

    // 4. Fetch user certification statuses
    const { data: userCerts } = await supabase
      .from('user_certifications')
      .select('cert_id, status')
      .eq('user_id', userId);

    const userCertMap = new Map<number, string>();
    for (const uc of userCerts ?? []) {
      userCertMap.set(uc.cert_id, uc.status);
    }

    // 5. Fetch ALL certifications for alternative path matching
    const { data: allCertsRaw } = await supabase
      .from('certifications')
      .select('*');

    const allCerts = (allCertsRaw ?? []).map((c: any) => ({
      ...c,
      prerequisites: safeParseJSON(c.prerequisites),
      next_certs: safeParseJSON(c.next_certs),
      primary_skills: safeParseJSON(c.primary_skills),
      secondary_skills: safeParseJSON(c.secondary_skills),
    }));

    // 6. Build enriched cert objects
    const { extractProvider, getProviderColor, findAlternativePaths } = await import('@/lib/roadmapMatcher');

    const enrichedCerts = certs.map((cert: any) => {
      const provider = extractProvider(cert.name);
      const providerColor = getProviderColor(provider);
      const userStatus = userCertMap.get(cert.id) || undefined;

      const certParsed = {
        ...cert,
        prerequisites: safeParseJSON(cert.prerequisites),
        next_certs: safeParseJSON(cert.next_certs),
        primary_skills: safeParseJSON(cert.primary_skills),
        secondary_skills: safeParseJSON(cert.secondary_skills),
      };

      const alternatives = findAlternativePaths(certParsed, allCerts, userCertMap).map((alt: any) => {
        const altProvider = extractProvider(alt.name);
        return {
          id: alt.id,
          name: alt.name,
          difficulty: alt.difficulty,
          provider: altProvider,
          providerColor: getProviderColor(altProvider),
          userStatus: userCertMap.get(alt.id) || undefined,
        };
      });

      return {
        id: cert.id,
        name: cert.name,
        difficulty: cert.difficulty,
        industry: cert.industry || 'general',
        prerequisites: certParsed.prerequisites,
        next_certs: certParsed.next_certs,
        provider,
        providerColor,
        userStatus,
        alternatives,
      };
    });

    return NextResponse.json(enrichedCerts);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

function safeParseJSON(val: any): any[] {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try { return JSON.parse(val); } catch { return []; }
  }
  return [];
}