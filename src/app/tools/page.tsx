import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Developer Tools | MyDebugTools',
  description: 'A collection of essential developer tools including JSON formatter, JWT decoder, API tester, regex tester, and more.',
};

export default function ToolsPage() {
  redirect('/tools/json');
  // To add a visible link to the Database Query Tool, update the redirect logic or navigation UI here:
  // <a href="/tools/database" className="block p-4 bg-white rounded shadow mb-2 hover:bg-blue-50 transition">Database Query Tool (SQLite)</a>
} 