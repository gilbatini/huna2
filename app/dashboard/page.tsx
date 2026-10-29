import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';
import Dashboard from './dashboard-client';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Workspace — Huna for Huna', robots: { index: false } };

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ portal?: string }> }) {
  const { portal } = await searchParams;
  const here = portal === 'tenant' ? '/dashboard?portal=tenant' : '/dashboard';
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=' + encodeURIComponent(here));

  const { error } = await supabase.rpc('huna_workspace');
  if (error) {
    return (
      <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, textAlign: 'center' }}>
        <div style={{ maxWidth: 440 }}>
          <p style={{ fontSize: 11, letterSpacing: 2, color: '#82908d' }}>HUNA FOR HUNA</p>
          <h1 style={{ fontSize: 28, letterSpacing: -1, margin: '14px 0', color: '#142b2e' }}>No access yet</h1>
          <p style={{ fontSize: 14, lineHeight: 1.7, color: '#5f6f6b' }}>
            You&apos;re signed in as <b>{user.email}</b>, but this account hasn&apos;t been added to the workspace.
            Ask your property manager to add this email address.
          </p>
          <a href="/auth/signout" style={{ display: 'inline-block', marginTop: 24, padding: '11px 18px', borderRadius: 6, background: '#233c35', color: '#fff', fontSize: 13 }}>
            Sign out
          </a>
        </div>
      </main>
    );
  }
  return <Dashboard />;
}
