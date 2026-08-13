import type { Metadata } from 'next';
import AuthPage from '../AuthPage';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Sign In | DebugTools',
  description: 'Sign in to DebugTools for cloud sync of saved API collections, tool history, and workspaces. Every local-first tool stays usable without an account.',
  path: '/auth/signin/',
  noindex: true,
});

export default function SignInPage() {
  return <AuthPage mode="signin" />;
}
