import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | MyDebugTools',
  description: 'Contact MyDebugTools for support, feedback, or questions about our developer tools.',
  robots: 'index, follow',
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}