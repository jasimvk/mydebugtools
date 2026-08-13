import type { Metadata } from 'next';
import AuthPage from '../AuthPage';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Create Account | DebugTools',
  description: 'Create a DebugTools account to save API collections, tool history, and workspaces across devices. The browser-based debugging tools stay free without one.',
  path: '/auth/signup/',
  noindex: true,
});

export default function SignUpPage() {
  return <AuthPage mode="signup" />;
}
