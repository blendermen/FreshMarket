'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useRef } from 'react';
import { storeApiTokens, syncGoogleUser } from '@/lib/api';

/** After Google OAuth, exchange profile for NestJS JWT and store in localStorage */
export function GoogleTokenSync() {
  const { data: session, status } = useSession();
  const synced = useRef(false);

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user?.email || synced.current) return;

    const googleId = session.user.googleId ?? session.user.id;
    if (!googleId) return;

    synced.current = true;
    syncGoogleUser({
      googleId,
      email: session.user.email,
      name: session.user.name ?? session.user.email,
      avatarUrl: session.user.image,
    })
      .then(storeApiTokens)
      .catch(() => {
        synced.current = false;
      });
  }, [session, status]);

  return null;
}
