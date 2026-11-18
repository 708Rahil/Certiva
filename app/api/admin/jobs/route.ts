import { NextResponse } from 'next/server';
import { getSupabase, initDb } from '@/lib/db';
import { auth, clerkClient } from '@clerk/nextjs/server';

const ADMIN_EMAILS = [
  '708rahil@gmail.com',
  'infobetxapp@gmail.com',
  'marauders.ufc@gmail.com',
];

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clerkClient();
    const currentUser = await client.users.getUser(userId);
    const userEmails = currentUser.emailAddresses.map((e) => e.emailAddress.toLowerCase());

    const isAdmin = userEmails.some((e) => ADMIN_EMAILS.includes(e));
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    await initDb();
    const supabase = getSupabase();

    // Fetch all jobs ordered by most recent first
    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select('id, title, company, description, extracted_skills, user_id, created_at')
      .order('created_at', { ascending: false });

    if (jobsError) {
      throw new Error(jobsError.message);
    }

    // Get unique user IDs to fetch their names/emails from Clerk
    const uniqueUserIds = Array.from(
      new Set((jobs ?? []).map((j) => j.user_id).filter(Boolean))
    ) as string[];

    const userMap: Record<string, { email?: string; name?: string }> = {};

    await Promise.all(
      uniqueUserIds.map(async (uid) => {
        try {
          const u = await client.users.getUser(uid);
          userMap[uid] = {
            email: u.emailAddresses[0]?.emailAddress,
            name: [u.firstName, u.lastName].filter(Boolean).join(' ') || 'User',
          };
        } catch {
          userMap[uid] = { email: 'Unknown', name: 'User' };
        }
      })
    );

    const enrichedJobs = (jobs ?? []).map((j) => {
      let skills: string[] = [];
      try {
        skills = JSON.parse(j.extracted_skills || '[]');
      } catch {
        skills = [];
      }

      return {
        id: j.id,
        title: j.title,
        company: j.company,
        description: j.description,
        skills,
        createdAt: j.created_at,
        isGuest: !j.user_id,
        user: j.user_id ? userMap[j.user_id] || { email: j.user_id, name: 'User' } : null,
      };
    });

    const totalCount = enrichedJobs.length;
    const guestCount = enrichedJobs.filter((j) => j.isGuest).length;
    const registeredCount = totalCount - guestCount;
    const uniqueCompanies = new Set(enrichedJobs.map((j) => j.company.toLowerCase().trim())).size;

    return NextResponse.json({
      stats: {
        total: totalCount,
        guest: guestCount,
        registered: registeredCount,
        companies: uniqueCompanies,
      },
      jobs: enrichedJobs,
    });
  } catch (error: any) {
    console.error('Admin API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
