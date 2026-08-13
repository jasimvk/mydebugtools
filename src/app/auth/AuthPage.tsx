'use client';

import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Terminal } from 'lucide-react';

type AuthPageProps = {
  mode: 'signin' | 'signup';
};

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

export default function AuthPage({ mode }: AuthPageProps) {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get('callbackUrl') || '/tools/api';
  const isSignup = mode === 'signup';

  return (
    <main className="min-h-screen bg-[#080b12] px-4 py-10 text-white sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] shadow-[0_30px_100px_rgba(0,0,0,0.45)] backdrop-blur lg:grid-cols-[1.05fr_0.95fr]">
          <section className="border-b border-white/10 p-6 sm:p-10 lg:border-b-0 lg:border-r">
            <Link href="/" className="inline-flex items-center gap-3 text-white">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-slate-950">
                <Terminal className="h-5 w-5" />
              </span>
              <span className="text-sm font-semibold">DebugTools</span>
            </Link>

            <div className="mt-16 max-w-xl">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-blue-200">
                {isSignup ? 'Create workspace' : 'Welcome back'}
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
                {isSignup ? 'Save your tools, history, and API work.' : 'Sign in to sync DebugTools.'}
              </h1>
              <p className="mt-5 max-w-lg text-base leading-7 text-slate-300">
                Local tools stay usable without an account. Sign in when you want cloud sync, tool history, workspaces, and saved API collections.
              </p>
            </div>
          </section>

          <section className="bg-white p-6 text-slate-950 sm:p-10">
            <div className="mx-auto flex h-full max-w-md flex-col justify-center">
              <h2 className="text-2xl font-semibold tracking-tight">
                {isSignup ? 'Sign up' : 'Sign in'}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                One Google login. No forced account for local utilities.
              </p>

              <button
                type="button"
                onClick={() => signIn('google', { callbackUrl })}
                className="mt-8 inline-flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-950 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
              >
                <GoogleIcon />
                {isSignup ? 'Continue with Google' : 'Sign in with Google'}
              </button>

              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-950">Account unlocks</p>
                <ul className="mt-3 grid gap-2 text-sm text-slate-600">
                  <li>Per-tool history across devices</li>
                  <li>API collections, workspaces, and cloud sync</li>
                </ul>
              </div>

              <p className="mt-6 text-center text-sm text-slate-500">
                {isSignup ? 'Already have access?' : 'New here?'}{' '}
                <Link
                  href={`${isSignup ? '/auth/signin' : '/auth/signup'}?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                  className="font-semibold text-blue-600 hover:text-blue-700"
                >
                  {isSignup ? 'Sign in' : 'Create an account'}
                </Link>
              </p>

              <p className="mt-4 text-center text-xs leading-5 text-slate-500">
                By continuing, you agree to the{' '}
                <Link href="/terms-of-service" className="font-medium text-slate-700 hover:text-blue-600">Terms</Link>
                {' '}and{' '}
                <Link href="/privacy-policy" className="font-medium text-slate-700 hover:text-blue-600">Privacy Policy</Link>.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
