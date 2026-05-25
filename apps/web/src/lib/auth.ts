import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account?.provider === 'google' && profile) {
        const p = profile as { sub?: string; email?: string; name?: string; picture?: string };
        token.googleId = p.sub;
        token.email = p.email;
        token.name = p.name;
        token.picture = p.picture;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub;
        session.user.googleId = (token.googleId ?? token.sub) as string | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};
