import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Color Picker | MyDebugTools',
  description: 'Online color picker tool with RGB, HEX, HSL, CMYK, and HSV color formats. Copy, convert, and manage colors with ease.',
  keywords: 'color picker, online color picker, hex to rgb, rgb to hex, color converter, web color tools, color formats, color palette',
  alternates: {
    canonical: 'https://mydebugtools.com/tools/color/',
  },
  openGraph: {
    title: 'Color Picker | MyDebugTools',
    description: 'Online color picker tool with RGB, HEX, HSL, CMYK, and HSV color formats. Copy, convert, and manage colors with ease.',
    url: 'https://mydebugtools.com/tools/color/',
  },
  twitter: {
    title: 'Color Picker | MyDebugTools',
    description: 'Online color picker tool with RGB, HEX, HSL, CMYK, and HSV color formats. Copy, convert, and manage colors with ease.',
  },
};

export default function ColorPickerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 