import { redirect } from 'next/navigation';
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Developer Tools | MyDebugTools',
  description: 'A collection of essential developer tools including JSON formatter, JWT decoder, API tester, regex tester, and more.',
};

export default function ToolsPage() {
  redirect('/tools/all');
} 