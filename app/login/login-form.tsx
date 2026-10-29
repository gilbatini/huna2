'use client';
import { useState } from 'react';
import { ArrowRight, MailCheck } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase/client';

export default function LoginForm({ next }: { next: string }) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setState('sending');
    const { error } = await supabaseBrowser().auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    if (error) { setError(error.message); setState('idle'); return; }
    setState('sent');
  }

  if (state === 'sent') return (
    <div className="login-sent"><MailCheck size={22} /><div><strong>Check your inbox</strong>
      <p>We sent a sign-in link to {email}. Open it on this device to continue.</p>
      <button type="button" onClick={() => setState('idle')}>Use a different email</button></div></div>
  );

  return (
    <form onSubmit={submit} className="login-form">
      <label>Email address<input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /></label>
      {error && <p className="login-error">{error}</p>}
      <button type="submit" disabled={state === 'sending'}>{state === 'sending' ? 'Sending link…' : 'Send sign-in link'} <ArrowRight size={16} /></button>
    </form>
  );
}
