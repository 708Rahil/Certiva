import { NextRequest, NextResponse } from 'next/server';
import { initDb, getSupabase } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await initDb();
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      return NextResponse.json({
        id: userId,
        full_name: '',
        goal_job: '',
        current_skills: [],
      });
    }

    let parsedSkills = [];
    try {
      if (typeof data.current_skills === 'string') {
        parsedSkills = JSON.parse(data.current_skills);
      } else if (Array.isArray(data.current_skills)) {
        parsedSkills = data.current_skills;
      }
    } catch {
      parsedSkills = [];
    }

    return NextResponse.json({
      id: data.id,
      full_name: data.full_name || '',
      goal_job: data.goal_job || '',
      current_skills: parsedSkills,
    });
  } catch (e) {
    console.error('Profile GET error:', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { full_name, goal_job, current_skills } = await req.json();

    await initDb();
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        full_name,
        goal_job,
        current_skills: JSON.stringify(current_skills || []),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    let parsedSkills = [];
    try {
      if (typeof data.current_skills === 'string') {
        parsedSkills = JSON.parse(data.current_skills);
      } else if (Array.isArray(data.current_skills)) {
        parsedSkills = data.current_skills;
      }
    } catch {
      parsedSkills = [];
    }

    return NextResponse.json({
      id: data.id,
      full_name: data.full_name || '',
      goal_job: data.goal_job || '',
      current_skills: parsedSkills,
    });
  } catch (e) {
    console.error('Profile POST error:', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
