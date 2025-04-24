import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Developer Tools | MyDebugTools',
  description: 'A collection of essential developer tools including JSON formatter, JWT decoder, API tester, regex tester, and more.',
};

export default function Page() {
  redirect('/tools/json');
}
