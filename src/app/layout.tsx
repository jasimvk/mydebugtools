import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import GoogleAnalytics from "./components/GoogleAnalytics";

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "MyDebugTools - All-in-one Developer Debugging Toolkit",
  description: "A powerful collection of development tools including JSON Formatter, JWT Decoder, Base64 Tools, API Tester, and Icon Finder - all in one place.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} antialiased bg-white text-gray-900 min-h-screen flex flex-col`}>
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        )}
        <main className="flex-1">
          {children}
        </main>
      </body>
    </html>
  );
}
