import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Icon Finder | MyDebugTools',
  description: 'Search and browse popular icon libraries including Heroicons, Material UI, Font Awesome, Simple Icons, Phosphor and Lucide. Download in SVG or PNG format.',
  keywords: 'icon finder, icon search, heroicons, material ui icons, font awesome, simple icons, phosphor icons, lucide icons, svg icons, react icons',
  alternates: {
    canonical: 'https://mydebugtools.com/tools/icons/',
  },
  openGraph: {
    title: 'Icon Finder | MyDebugTools',
    description: 'Search and browse popular icon libraries including Heroicons, Material UI, Font Awesome, Simple Icons, Phosphor and Lucide. Download in SVG or PNG format.',
    url: 'https://mydebugtools.com/tools/icons/',
  },
  twitter: {
    title: 'Icon Finder | MyDebugTools',
    description: 'Search and browse popular icon libraries including Heroicons, Material UI, Font Awesome, Simple Icons, Phosphor and Lucide. Download in SVG or PNG format.',
  },
};

export default function IconFinderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 