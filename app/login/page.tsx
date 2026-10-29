import type { Metadata } from 'next';
import LoginForm from './login-form';
import './login.css';

export const metadata: Metadata = { title: 'Sign in — Huna for Huna', robots: { index: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams;
  const safe = next && next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard';
  return (
    <main className="login">
      <a className="login-brand" href="/">huna <em>for</em> huna</a>
      <section className="login-card">
        <p className="login-eyebrow">{safe.includes('portal=tenant') ? 'TENANT PORTAL' : 'PROPERTY WORKSPACE'}</p>
        <h1>Sign in</h1>
        <p className="login-lead">Enter the email address your property team added. We&apos;ll send you a secure sign-in link — no password needed.</p>
        {error && <p className="login-error">That sign-in link has expired or was already used. Request a new one below.</p>}
        <LoginForm next={safe} />
      </section>
    </main>
  );
}
