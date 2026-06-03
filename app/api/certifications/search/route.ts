import { getSupabase, initDb } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  await initDb();
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  if (!query || query.length < 2) {
    return NextResponse.json([]);
  }

  const supabase = getSupabase();

  try {
    const { data, error } = await supabase
      .from('certifications')
      .select('id, name, provider, industry, difficulty, cost')
      .or(`name.ilike.%${query}%,provider.ilike.%${query}%`)
      .limit(15);

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json(data ?? []);
  } catch (error) {
    console.error('Error searching certifications:', error);
    return NextResponse.json(
      { error: 'Failed to search certifications' },
      { status: 500 }
    );
  }
}
