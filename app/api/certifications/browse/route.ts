import { getDb, initDb } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

await initDb();

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = 20;
  const offset = (page - 1) * pageSize;

  const search = searchParams.get('search');
  const industry = searchParams.get('industry');
  const difficulty = searchParams.get('difficulty');
  const trending = searchParams.get('trending');
  const sortBy = searchParams.get('sortBy') || 'name';

  const db = getDb();

  try {
    let whereClause = '1=1';
    const args: any[] = [];

    if (search) {
      whereClause += ' AND (LOWER(name) LIKE LOWER(?) OR LOWER(provider) LIKE LOWER(?))';
      args.push(`%${search}%`);
      args.push(`%${search}%`);
    }

    if (industry && industry !== 'all') {
      whereClause += ' AND industry = ?';
      args.push(industry);
    }

    if (difficulty && difficulty !== 'all') {
      whereClause += ' AND difficulty = ?';
      args.push(parseInt(difficulty));
    }

    if (trending === 'true') {
      whereClause += ' AND trending = 1';
    }

    let orderBy = 'name ASC';
    switch (sortBy) {
      case 'difficulty':
        orderBy = 'difficulty DESC';
        break;
      case 'salary':
        orderBy = 'salary_boost_high DESC';
        break;
      case 'trending':
        orderBy = 'trending DESC, salary_boost_high DESC';
        break;
      case 'pass-rate':
        orderBy = 'pass_rate_percent DESC';
        break;
    }

    // Get total count
    const countResult = await db.execute({
      sql: `SELECT COUNT(*) as cnt FROM certifications WHERE ${whereClause}`,
      args,
    });
    const total = (countResult.rows[0] as unknown as { cnt: number }).cnt;

    // Get paginated results
    const results = await db.execute({
      sql: `
        SELECT 
          id, name, provider, industry, difficulty, cost, 
          duration_weeks, pass_rate_percent, 
          salary_boost_low, salary_boost_high, trending, official_url
        FROM certifications
        WHERE ${whereClause}
        ORDER BY ${orderBy}
        LIMIT ? OFFSET ?
      `,
      args: [...args, pageSize, offset],
    });

    // Get available industries
    const industriesResult = await db.execute(
      'SELECT DISTINCT industry FROM certifications ORDER BY industry'
    );
    const industries = industriesResult.rows.map((r: any) => r.industry);

    return NextResponse.json({
      certs: results.rows,
      total,
      page,
      pageSize,
      industries,
    });
  } catch (error) {
    console.error('Error fetching certifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch certifications' },
      { status: 500 }
    );
  }
}
