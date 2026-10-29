import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

async function signOut(request: Request) {
  const supabase = await supabaseServer();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL('/', request.url), { status: 303 });
}
export const GET = signOut;
export const POST = signOut;
