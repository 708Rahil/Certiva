import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { extractSkills } from '@/lib/matcher';

function buildPrompt(resumeText: string): string {
  return `You are a career intelligence system analyzing a candidate's resume to extract their professional technical skills.
  
Resume Content:
${resumeText}

Extract the list of skills, tools, platforms, programming languages, and technical frameworks mentioned in the resume. 
Respond with ONLY a valid JSON object — no markdown, no explanation, no backticks.

Rules:
- Output specific technical skills (e.g. "Python", "React", "AWS", "Kubernetes", "Docker", "SQL").
- Max 30 skills.
- Only include technical skills mentioned in the resume. Do not assume or extrapolate skills not explicitly or implicitly listed.

Respond with this exact structure:
{
  "skills": ["skill1", "skill2", ...]
}`;
}

async function extractWithLLM(resumeText: string): Promise<string[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      messages: [
        {
          role: 'user',
          content: buildPrompt(resumeText),
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Anthropic API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const raw = data?.content?.[0]?.text?.trim();

  if (!raw) throw new Error('Empty response from Anthropic');

  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  const parsed = JSON.parse(cleaned);

  if (!Array.isArray(parsed.skills)) throw new Error('Invalid skills in LLM response');

  return parsed.skills
    .filter((s: unknown) => typeof s === 'string' && s.trim().length > 0)
    .map((s: string) => s.trim())
    .slice(0, 30);
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { resumeText } = await req.json();
    if (!resumeText || typeof resumeText !== 'string') {
      return NextResponse.json({ error: 'Invalid or missing resumeText' }, { status: 400 });
    }

    // Check if Anthropic API key is available
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const skills = await extractWithLLM(resumeText);
        return NextResponse.json({ skills, source: 'llm' });
      } catch (err) {
        console.error('LLM resume skill extraction failed, falling back to keywords:', err);
      }
    }

    // Fallback: extract using local keyword library
    const skills = extractSkills(resumeText);
    return NextResponse.json({ skills, source: 'keywords' });
  } catch (e) {
    console.error('Extract resume skills error:', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
