import Link from 'next/link';

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center',
        gap: '1.5rem',
      }}
    >
      <h1 style={{ margin: 0, fontSize: 'clamp(1.75rem, 5vw, 2.5rem)' }}>FreshMarket</h1>
      <p style={{ margin: 0, maxWidth: 480, color: 'var(--muted)', lineHeight: 1.6 }}>
        Znajdź na mapie świeże jaja, warzywa i inne produkty od lokalnych hodowców i rolników.
      </p>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link
          href="/map"
          style={{
            background: 'var(--accent)',
            color: '#fff',
            padding: '0.75rem 1.5rem',
            borderRadius: 999,
            fontWeight: 600,
          }}
        >
          Otwórz mapę
        </Link>
        <Link
          href="/login"
          style={{
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            padding: '0.75rem 1.5rem',
            borderRadius: 999,
          }}
        >
          Zaloguj się
        </Link>
      </div>
    </main>
  );
}
