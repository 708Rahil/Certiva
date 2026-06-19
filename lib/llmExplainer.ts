import { RecommendationResult } from './matcher';

export async function generateLlmExplanations(
  jobTitle: string,
  jobDescription: string,
  recs: RecommendationResult[]
): Promise<Record<number, string>> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || recs.length === 0) return {};

  try {
    const certsListStr = recs.map(r => `- ID ${r.cert.id}: ${r.cert.name} (Provider: ${r.cert.provider})`).join('\n');
    const prompt = `You are a career intelligence advisor.
Analyze why these professional certifications are recommended for this job posting.

Job Title: ${jobTitle}
Job Description:
${jobDescription}

Recommended Certifications:
${certsListStr}

For each certification ID, write a concise, compelling 2-sentence explanation of why it is highly relevant to this job description and what specific skills it validates.

Respond with ONLY a valid JSON object matching this structure:
{
  "explanations": {
    "ID": "explanation text",
    ...
  }
}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Anthropic API error: ${err}`);
    }

    const data = await response.json();
    const raw = data?.content?.[0]?.text?.trim();
    if (!raw) throw new Error('Empty response from Anthropic');

    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    const parsed = JSON.parse(cleaned);
    
    const result: Record<number, string> = {};
    for (const [key, val] of Object.entries(parsed.explanations || {})) {
      result[Number(key)] = val as string;
    }
    return result;
  } catch (err) {
    console.error('[generateLlmExplanations] Failed, falling back to rule-based:', err);
    return {};
  }
}
