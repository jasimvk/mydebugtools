import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { sendWelcomeEmail } from '@/lib/email';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

async function sendWelcomeEmailSafely(user: { email?: string | null; name?: string | null }) {
  if (!user.email) return;

  try {
    await sendWelcomeEmail({ email: user.email, name: user.name });
  } catch (error) {
    console.warn('Unable to send welcome email:', error);
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }

      const allowedHosts = new Set([
        new URL(baseUrl).host,
        'debugtools.org',
        'www.debugtools.org',
        'mydebugtools-one.vercel.app',
      ]);

      try {
        const nextUrl = new URL(url);

        if (nextUrl.host === 'www.debugtools.org') {
          nextUrl.host = 'debugtools.org';
          return nextUrl.toString();
        }

        return allowedHosts.has(nextUrl.host) ? url : baseUrl;
      } catch {
        return baseUrl;
      }
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || 'free';
      }

      if (account && account.provider === 'google' && user?.email) {
        const supabaseAdmin = getSupabaseAdmin();
        const { data: existingUser } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('email', user.email)
          .single();

        if (!existingUser) {
          const { data: newUser } = await supabaseAdmin
            .from('users')
            .insert({
              email: user.email,
              name: user.name,
              image: user.image,
              role: 'free',
              email_verified: new Date().toISOString(),
            })
            .select()
            .single();

          if (newUser) {
            token.id = newUser.id;
            token.role = newUser.role;

            await supabaseAdmin.from('accounts').insert({
              user_id: newUser.id,
              type: account.type,
              provider: account.provider,
              provider_account_id: account.providerAccountId,
              access_token: account.access_token,
              refresh_token: account.refresh_token,
              expires_at: account.expires_at,
              token_type: account.token_type,
              scope: account.scope,
              id_token: account.id_token,
            });

            await sendWelcomeEmailSafely({ email: newUser.email, name: newUser.name });
          }
        } else {
          token.id = existingUser.id;
          token.role = existingUser.role;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
