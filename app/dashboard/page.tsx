import type { Metadata } from 'next';
import Link from 'next/link';
import '../home.css';

export const metadata: Metadata = {
  title: 'Tenant portal & management — Huna for Huna',
  robots: { index: false },
};

export default function DashboardComingSoon() {
  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, textAlign: 'center' }}>
      <div style={{ maxWidth: 440 }}>
        <p style={{ fontSize: 11, letterSpacing: 2, color: '#82908d' }}>HUNA FOR HUNA</p>
        <h1 style={{ fontSize: 30, letterSpacing: -1, margin: '14px 0', color: '#142b2e' }}>
          The tenant portal is on its way
        </h1>
        <p style={{ fontSize: 14, lineHeight: 1.7, color: '#5f6f6b' }}>
          Resident sign-in, rent records and maintenance requests will open here soon.
          In the meantime, please contact your Huna for Huna property team directly.
        </p>
        <Link href="/" style={{ display: 'inline-block', marginTop: 24, padding: '11px 18px', borderRadius: 6, background: '#233c35', color: '#fff', fontSize: 13 }}>
          Back to homes
        </Link>
      </div>
    </main>
  );
}
