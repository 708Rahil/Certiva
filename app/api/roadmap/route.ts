import { NextRequest, NextResponse } from 'next/server';
import { initDb, getSupabase } from '@/lib/db';
import { matchCertifications, Certification } from '@/lib/matcher';
import { extractJobData } from '@/lib/llmExtractor';
import { generateLlmExplanations } from '@/lib/llmExplainer';
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

    // ── Fetch user profile & completed certs ────────────────────────────────
    let userSkills: string[] = [];
    let completedCertIds: number[] = [];

    if (userId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('current_skills')
        .eq('id', userId)
        .maybeSingle();

      if (profile && profile.current_skills) {
        try {
          userSkills = typeof profile.current_skills === 'string'
            ? JSON.parse(profile.current_skills)
            : profile.current_skills;
        } catch {}
      }

      const { data: completed } = await supabase
        .from('user_certifications')
        .select('cert_id')
        .eq('user_id', userId)
        .eq('status', 'completed');

      if (completed) {
        completedCertIds = completed.map((c: any) => c.cert_id);
      }
    }

    // ── Match & rank ─────────────────────────────────────────────────────────
    const recommendations = matchCertifications(
      skills,
      industry,
      title,
      description,
      (certs ?? []) as Certification[],
      seniority,
      userSkills,
      completedCertIds
    );

    const topRecs = recommendations.slice(0, 8);
    const llmExplanations = await generateLlmExplanations(title, description, topRecs);
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
          explanation: llmExplanations[rec.cert.id] || rec.explanation,
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

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await initDb();
    const supabase = getSupabase();

    // 1. Get the user's jobs to populate selector and find current job
    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select('id, title, company, description, extracted_skills, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (jobsError) throw new Error(jobsError.message);
    if (!jobs || jobs.length === 0) {
      return NextResponse.json({ jobs: [], selectedJob: null, recommendations: [] });
    }

    const { searchParams } = new URL(req.url);
    const queryJobId = searchParams.get('jobId');
    let targetJobId = queryJobId ? parseInt(queryJobId, 10) : null;

    if (!targetJobId || isNaN(targetJobId)) {
      targetJobId = jobs[0].id;
    }

    const selectedJob = jobs.find((j: any) => j.id === targetJobId) || jobs[0];

    // 2. Fetch user profile skills
    let userSkills: string[] = [];
    const { data: profile } = await supabase
      .from('profiles')
      .select('current_skills')
      .eq('id', userId)
      .maybeSingle();

    if (profile && profile.current_skills) {
      try {
        userSkills = typeof profile.current_skills === 'string'
          ? JSON.parse(profile.current_skills)
          : profile.current_skills;
      } catch {}
    }

    // 3. Fetch user certification statuses
    const { data: userCerts } = await supabase
      .from('user_certifications')
      .select('cert_id, status')
      .eq('user_id', userId);

    const userCertMap = new Map<number, string>();
    const completedCertIds: number[] = [];
    for (const uc of userCerts ?? []) {
      userCertMap.set(uc.cert_id, uc.status);
      if (uc.status === 'completed') {
        completedCertIds.push(uc.cert_id);
      }
    }

    // 4. Fetch ALL certifications from database
    const { data: certs, error: certsError } = await supabase
      .from('certifications')
      .select('*');

    if (certsError) throw new Error(certsError.message);

    const allCerts = (certs ?? []).map((c: any) => ({
      ...c,
      prerequisites: safeParseJSON(c.prerequisites),
      next_certs: safeParseJSON(c.next_certs),
      primary_skills: safeParseJSON(c.primary_skills),
      secondary_skills: safeParseJSON(c.secondary_skills),
      exam_parts: safeParseJSON(c.exam_parts),
    }));

    // 5. Run dynamic real-time matching
    const { detectIndustry, inferSeniority } = await import('@/lib/matcher');
    const jobSkills = safeParseJSON(selectedJob.extracted_skills);
    const jobIndustry = detectIndustry(selectedJob.title, selectedJob.description || '');
    const seniority = inferSeniority(selectedJob.title, selectedJob.description || '');

    const recommendations = matchCertifications(
      jobSkills,
      jobIndustry,
      selectedJob.title,
      selectedJob.description || '',
      allCerts as any[],
      seniority,
      userSkills,
      completedCertIds
    );

    // 6. Build enriched cert objects with dynamic scores and explanations
    const { extractProvider, getProviderColor, findAlternativePaths } = await import('@/lib/roadmapMatcher');

    const enrichedCerts = recommendations.map((recResult) => {
      const cert = recResult.cert;
      const provider = extractProvider(cert.name);
      const providerColor = getProviderColor(provider);
      const userStatus = userCertMap.get(cert.id) || undefined;

      const alternatives = findAlternativePaths(cert, allCerts, userCertMap).map((alt: any) => {
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
        prerequisites: cert.prerequisites,
        next_certs: cert.next_certs,
        provider,
        providerColor,
        userStatus,
        alternatives,
        score: recResult.score,
        explanation: recResult.explanation,
        matchedSkills: recResult.matchedSkills,
        official_url: cert.official_url,
        exam_parts: cert.exam_parts,
      };
    });

    // 1. Sort all matches by score descending to get the absolute top matches
    enrichedCerts.sort((a, b) => b.score - a.score);

    // 2. Select only the top 4 matching certifications for a focused roadmap
    const topFourCerts = enrichedCerts.slice(0, 4);

    // 3. Sort the top 4 by difficulty (ascending) to show a progressive path
    topFourCerts.sort((a, b) => {
      if (a.difficulty !== b.difficulty) {
        return a.difficulty - b.difficulty;
      }
      return b.score - a.score;
    });

    // 7. Group all database certifications by industry for the generic path viewer
    const genericCerts = allCerts.map((cert: any) => {
      const provider = extractProvider(cert.name);
      const providerColor = getProviderColor(provider);
      const userStatus = userCertMap.get(cert.id) || undefined;

      const alternatives = findAlternativePaths(cert, allCerts, userCertMap).map((alt: any) => {
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
        prerequisites: cert.prerequisites,
        next_certs: cert.next_certs,
        provider,
        providerColor,
        userStatus,
        alternatives,
        description: cert.description,
        official_url: cert.official_url,
        target_job_titles: safeParseJSON(cert.target_job_titles),
        exam_parts: cert.exam_parts,
      };
    });

    const genericRoadmaps: Record<string, any[]> = {};
    for (const cert of genericCerts) {
      const ind = cert.industry || 'general';
      if (!genericRoadmaps[ind]) {
        genericRoadmaps[ind] = [];
      }
      genericRoadmaps[ind].push(cert);
    }

    return NextResponse.json({
      jobs: jobs.map((j: any) => ({ id: j.id, title: j.title, company: j.company })),
      selectedJob: {
        id: selectedJob.id,
        title: selectedJob.title,
        company: selectedJob.company,
        skills: safeParseJSON(selectedJob.extracted_skills),
      },
      recommendations: topFourCerts,
      genericRoadmaps,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

function safeParseJSON(val: any): any[] {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    const trimmedVal = val.trim();
    if (!trimmedVal) return [];
    try {
      const parsed = JSON.parse(trimmedVal);
      if (Array.isArray(parsed)) return parsed;
      if (typeof parsed === 'string') {
        if (parsed.includes(',')) {
          return parsed.split(',').map(s => s.trim()).filter(Boolean);
        }
        return [parsed];
      }
    } catch {
      if (trimmedVal.includes(',')) {
        return trimmedVal.split(',').map(s => s.trim()).filter(Boolean);
      }
      return [trimmedVal];
    }
  }
  return [];
}