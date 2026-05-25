'use client';

import { signIn, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { GoogleTokenSync } from '@/components/GoogleTokenSync';

export default function LoginPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/map');
    }
  }, [status, router]);

  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        gap: '1rem',
      }}
    >
      <GoogleTokenSync />
      <h1 style={{ margin: 0 }}>Zaloguj się</h1>
      <p style={{ color: 'var(--muted)', textAlign: 'center', maxWidth: 360 }}>
        Zaloguj przez Google, aby dodawać pinezki na mapie.
      </p>
      <button
        type="button"
        onClick={() => signIn('google', { callbackUrl: '/map' })}
        style={{
          background: 'var(--accent)',
          color: '#fff',
          border: 'none',
          padding: '0.85rem 1.75rem',
          borderRadius: 999,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Kontynuuj z Google
      </button>
      <Link href="/map" style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
        Przeglądaj mapę bez logowania →
      </Link>
    </main>
  );
}
