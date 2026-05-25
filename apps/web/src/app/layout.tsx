import type { Metadata } from 'next';
import { SessionProvider } from '@/components/SessionProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'FreshMarket — lokalne eco i bio',
  description: 'Mapa sprzedawców lokalnej żywności eco i bio',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" suppressHydrationWarning>
      {/* Grammarly and similar extensions inject attributes on <body> before hydration */}
      <body suppressHydrationWarning>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
