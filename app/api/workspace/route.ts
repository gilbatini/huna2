import { supabaseServer, displayName } from '@/lib/supabase/server';
import { seed } from '@/lib/seed';

export const dynamic = 'force-dynamic';
const json = (x: unknown, status = 200) => Response.json(x, { status, headers: { 'Cache-Control': 'no-store' } });

export async function GET() {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return json({ error: 'Sign in required' }, 401);
  const { data, error } = await supabase.rpc('huna_workspace');
  if (error) return json({ error: error.message }, 403);
  // The dashboard expects the team list's permissions as JSON strings (D1 format).
  const members = (data.members as Array<Record<string, unknown>>).map((m) => ({ ...m, permissions: JSON.stringify(m.permissions) }));
  return json({ data: data.data, member: data.member, members, user: { name: displayName(user), email: user.email } });
}

export async function POST(req: Request) {
  const origin = req.headers.get('origin');
  if (origin && origin !== new URL(req.url).origin) return json({ error: 'Invalid origin' }, 403);
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return json({ error: 'Sign in required' }, 401);
  let body: { action?: string; payload?: Record<string, unknown> };
  try { body = await req.json(); } catch { return json({ error: 'Invalid request' }, 400); }
  const action = String(body.action || '');
  if (action === 'document') return json({ error: 'Unknown action' }, 400); // only via /api/documents
  const payload = action === 'seed'
    ? { records: seed.map((x) => ({ id: x.id, kind: x.kind, data: JSON.parse(x.data) })) }
    : body.payload || {};
  const { error } = await supabase.rpc('huna_action', { action, payload });
  if (error) return json({ error: error.message }, 400);
  return json({ ok: true });
}
