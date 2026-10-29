import { supabaseServer } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
const BUCKET = 'documents';

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get('id') || '';
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response('Sign in required', { status: 401 });
  const { data: doc, error } = await supabase.rpc('huna_document', { doc_id: id });
  if (error) return new Response(error.message, { status: error.message === 'Not found' ? 404 : 403 });
  const { data: file, error: dl } = await supabase.storage.from(BUCKET).download(id);
  if (dl || !file) return new Response('Not found', { status: 404 });
  const name = String(doc.name || 'document').replace(/[^a-zA-Z0-9._-]/g, '_');
  return new Response(file, {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${name}"`,
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

export async function POST(req: Request) {
  try {
    const origin = req.headers.get('origin');
    if (origin && origin !== new URL(req.url).origin) throw new Error('Invalid origin');
    const supabase = await supabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Sign in required');
    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File) || file.size > 10 * 1024 * 1024) throw new Error('Choose a file up to 10 MB');
    if (!/\.(pdf|docx|xlsx|jpg|jpeg|png)$/i.test(file.name)) throw new Error('Supported: PDF, DOCX, XLSX, JPG, PNG');
    const id = crypto.randomUUID();
    const { error: up } = await supabase.storage.from(BUCKET).upload(id, file, { contentType: 'application/octet-stream', upsert: false });
    if (up) throw new Error(/row-level security|unauthorized|403/i.test(up.message) ? 'Permission denied' : up.message);
    const { error } = await supabase.rpc('huna_action', {
      action: 'document',
      payload: { id, name: file.name, size: file.size, email: String(form.get('email') || '') },
    });
    if (error) { await supabase.storage.from(BUCKET).remove([id]); throw new Error(error.message); }
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 400 });
  }
}
