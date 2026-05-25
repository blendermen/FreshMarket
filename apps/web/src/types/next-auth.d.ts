import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      googleId?: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    googleId?: string;
  }
}
