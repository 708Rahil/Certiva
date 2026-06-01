import { getDb, initDb } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

await initDb();

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  if (!query || query.length < 2) {
    return NextResponse.json([]);
  }

  const db = getDb();

  try {
    const results = await db.execute({
      sql: `
        SELECT id, name, provider, industry, difficulty, cost
        FROM certifications
        WHERE LOWER(name) LIKE LOWER(?)
           OR LOWER(provider) LIKE LOWER(?)
        LIMIT 15
      `,
      args: [`%${query}%`, `%${query}%`],
    });

    return NextResponse.json(results.rows);
  } catch (error) {
    console.error('Error searching certifications:', error);
    return NextResponse.json(
      { error: 'Failed to search certifications' },
      { status: 500 }
    );
  }
}
