import { extractSkills, detectIndustry, inferSeniority, UserLevel } from './matcher';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ExtractionResult {
  skills: string[];
  industry: string;
  seniority: UserLevel;
  source: 'llm' | 'keyword'; // which path was used — useful for debugging
}

// ─── Prompt ───────────────────────────────────────────────────────────────────

function buildPrompt(title: string, description: string): string {
  return `You are a career intelligence system analyzing a job posting to extract structured data.

Job Title: ${title}

Job Description:
${description}

Extract the following and respond with ONLY a valid JSON object — no markdown, no explanation, no backticks.

Rules:
- "skills": Array of specific technical skills, tools, platforms, frameworks, methodologies, and domain knowledge required. Include specific product names (e.g. "Kafka", "dbt", "Terraform", "Snowflake"), not just categories. Include soft skills only if explicitly required (e.g. "stakeholder management"). Max 25 skills.
- "industry": The single best industry category. Must be exactly one of: cloud, cybersecurity, data, finance, marketing, management, general
- "seniority": Must be exactly one of: entry, mid, senior

Respond with this exact structure:
{
  "skills": ["skill1", "skill2", ...],
  "industry": "cloud",
  "seniority": "mid"
}`;
}

// ─── LLM Extraction ───────────────────────────────────────────────────────────

async function extractWithLLM(title: string, description: string): Promise<ExtractionResult> {
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
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: buildPrompt(title, description),
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

  // Strip any accidental markdown fences
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  const parsed = JSON.parse(cleaned);

  // Validate structure
  if (!Array.isArray(parsed.skills)) throw new Error('Invalid skills in LLM response');
  if (!parsed.industry) throw new Error('Missing industry in LLM response');
  if (!parsed.seniority) throw new Error('Missing seniority in LLM response');

  // Sanitize
  const validIndustries = ['cloud', 'cybersecurity', 'data', 'finance', 'marketing', 'management', 'general'];
  const validSeniorities: UserLevel[] = ['entry', 'mid', 'senior'];

  return {
    skills: parsed.skills
      .filter((s: unknown) => typeof s === 'string' && s.trim().length > 0)
      .map((s: string) => s.trim())
      .slice(0, 25),
    industry: validIndustries.includes(parsed.industry) ? parsed.industry : 'general',
    seniority: validSeniorities.includes(parsed.seniority) ? parsed.seniority : 'mid',
    source: 'llm',
  };
}

// ─── Keyword Fallback ─────────────────────────────────────────────────────────

function extractWithKeywords(title: string, description: string): ExtractionResult {
  return {
    skills: extractSkills(title + ' ' + description),
    industry: detectIndustry(title, description),
    seniority: inferSeniority(title, description),
    source: 'keyword',
  };
}

// ─── Main Export — LLM with fallback ─────────────────────────────────────────

export async function extractJobData(
  title: string,
  description: string
): Promise<ExtractionResult> {
  // Skip LLM if API key not configured — useful in local dev without .env
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('[extractJobData] No ANTHROPIC_API_KEY — using keyword fallback');
    return extractWithKeywords(title, description);
  }

  try {
    const result = await extractWithLLM(title, description);
    console.log(`[extractJobData] LLM extracted ${result.skills.length} skills, industry=${result.industry}, seniority=${result.seniority}`);
    return result;
  } catch (err) {
    // Always fall back — a failed LLM call should never break a job analysis
    console.error('[extractJobData] LLM extraction failed, falling back to keywords:', err);
    return extractWithKeywords(title, description);
  }
}