import { getSupabase, initDb } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  await initDb();
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = 20;
  const offset = (page - 1) * pageSize;

  const search = searchParams.get('search');
  const industry = searchParams.get('industry');
  const difficulty = searchParams.get('difficulty');
  const trending = searchParams.get('trending');
  const sortBy = searchParams.get('sortBy') || 'name';

  const supabase = getSupabase();

  try {
    let query = supabase
      .from('certifications')
      .select(
        'id, name, provider, industry, difficulty, cost, duration_weeks, pass_rate_percent, salary_boost_low, salary_boost_high, trending, official_url',
        { count: 'exact' }
      );

    if (search) {
      query = query.or(`name.ilike.%${search}%,provider.ilike.%${search}%`);
    }

    if (industry && industry !== 'all') {
      query = query.eq('industry', industry);
    }

    if (difficulty && difficulty !== 'all') {
      query = query.eq('difficulty', parseInt(difficulty));
    }

    if (trending === 'true') {
      query = query.eq('trending', true);
    }

    switch (sortBy) {
      case 'difficulty':
        query = query.order('difficulty', { ascending: false });
        break;
      case 'salary':
        query = query.order('salary_boost_high', { ascending: false });
        break;
      case 'trending':
        query = query
          .order('trending', { ascending: false })
          .order('salary_boost_high', { ascending: false });
        break;
      case 'pass-rate':
        query = query.order('pass_rate_percent', { ascending: false });
        break;
      default:
        query = query.order('name', { ascending: true });
    }

    const { data, count, error } = await query.range(offset, offset + pageSize - 1);

    if (error) {
      throw new Error(error.message);
    }

    const { data: industriesData, error: industriesError } = await supabase
      .from('certifications')
      .select('industry')
      .order('industry');

    if (industriesError) {
      throw new Error(industriesError.message);
    }

    const industries = [...new Set((industriesData ?? []).map((r) => r.industry))];

    return NextResponse.json({
      certs: data ?? [],
      total: count ?? 0,
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
