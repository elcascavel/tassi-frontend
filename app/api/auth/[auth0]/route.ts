import { handleAuth, handleCallback, Session } from '@auth0/nextjs-auth0';
import { registerUser } from '@/lib/auth/register-user';
import { NextRequest } from 'next/server';

export const GET = handleAuth({
  callback: handleCallback({
    async afterCallback(_req: NextRequest, session: Session) {
      try {
        const authId = session.user.sub;
        const name = session.user.name ?? '';
        await registerUser(authId, name);
      } catch (err) {
        console.error('afterCallback error:', err);
      }

      return session;
    },
  }),
});
