import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();
    
    // Check table info
    const tableInfo = await db.execute("PRAGMA table_info(certifications)");
    
    // Check sample record
    const certs = await db.execute("SELECT id, name, primary_skills, secondary_skills FROM certifications LIMIT 3");
    
    // Check jobs
    const jobs = await db.execute("SELECT id, title, created_at FROM jobs ORDER BY id DESC LIMIT 5");
    
    return NextResponse.json({
      tableInfo: tableInfo.rows,
      certs: certs.rows,
      jobs: jobs.rows
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
