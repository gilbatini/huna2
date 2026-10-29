import type { Metadata } from 'next';
import Dashboard from './dashboard-client';

export const metadata: Metadata = {
  title: 'Workspace demo — Huna for Huna',
  robots: { index: false },
};

export default function DashboardPage() {
  return <Dashboard />;
}
