'use client';

import type { ComponentType } from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
  Bars3Icon,
  BeakerIcon,
  ChevronDownIcon,
  CommandLineIcon,
  DocumentTextIcon,
  HashtagIcon,
  InformationCircleIcon,
  WrenchIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { Braces, Database, Github, KeyRound, Link2, LogOut, Palette, Terminal, UserRound } from 'lucide-react';
import GitHubStars from './GitHubStars';

type IconComponent = ComponentType<{ className?: string }>;

const primaryNav: Array<{
  name: string;
  href: string;
  icon: IconComponent;
  activeRoot?: string;
}> = [
  { name: 'API Workbench', href: '/tools/api', icon: BeakerIcon },
  { name: 'Utilities', href: '/tools/all', icon: WrenchIcon, activeRoot: '/tools' },
  { name: 'Docs', href: '/answers', icon: InformationCircleIcon },
];

const toolNav: Array<{ name: string; href: string; icon: IconComponent }> = [
  { name: 'API Workbench', href: '/tools/api', icon: BeakerIcon },
  { name: 'JSON', href: '/tools/json', icon: Braces },
  { name: 'JWT', href: '/tools/jwt', icon: KeyRound },
  { name: 'Base64', href: '/tools/base64', icon: DocumentTextIcon },
  { name: 'Hash', href: '/tools/hash', icon: HashtagIcon },
  { name: 'URL', href: '/tools/url', icon: Link2 },
  { name: 'Regex', href: '/tools/regex', icon: CommandLineIcon },
  { name: 'HTML', href: '/tools/html', icon: DocumentTextIcon },
  { name: 'Color', href: '/tools/color', icon: Palette },
  { name: 'SQLite', href: '/tools/database', icon: Database },
  { name: 'More utilities', href: '/tools/all', icon: WrenchIcon },
];

const projectLinks = [
  { name: 'Workspaces', href: '/workspace' },
  { name: 'Roadmap', href: '/roadmap' },
  { name: 'Releases', href: '/releases' },
  { name: 'Changelog', href: '/changelog' },
  { name: 'Contribute', href: '/contributing' },
  { name: 'Report issue', href: 'https://github.com/jasimvkarim/mydebugtools/issues/new' },
];

interface SiteHeaderProps {
  maxWidth?: string;
  showToolRail?: boolean;
  mobileLabel?: 'main' | 'tools';
}

export default function SiteHeader({
  maxWidth = 'max-w-7xl',
  showToolRail = false,
  mobileLabel = 'main',
}: SiteHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProjectOpen, setIsProjectOpen] = useState(false);
  const pathname = usePathname() || '';
  const { data: session, status } = useSession();
  const mobileMenuId = showToolRail ? 'tools-navigation-menu' : 'primary-navigation-menu';
  const menuName = mobileLabel === 'tools' ? 'tools navigation' : 'main menu';
  const callbackUrl = encodeURIComponent(pathname || '/tools/api');
  const isAuthenticated = status === 'authenticated';

  const isActivePath = (path: string) => {
    if (path === '/') return pathname === path;
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  const isPrimaryActive = (item: (typeof primaryNav)[number]) => {
    if (isActivePath(item.href)) return true;
    if (item.activeRoot && isActivePath(item.activeRoot)) {
      return !primaryNav.some((navItem) => navItem !== item && isActivePath(navItem.href));
    }
    return false;
  };

  const mobileItems = showToolRail ? toolNav : primaryNav;

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl supports-[backdrop-filter]:bg-white/75">
      <div className={`mx-auto ${maxWidth} px-4 sm:px-6`}>
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-6">
            <Link href="/" className="group flex shrink-0 items-center gap-3 text-slate-950 hover:text-slate-950">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl border border-slate-200 bg-slate-950 text-white shadow-[0_10px_25px_rgba(15,23,42,0.18)] transition-transform group-hover:-translate-y-0.5">
                <Terminal className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[15px] font-semibold leading-5 tracking-tight">DebugTools</span>
              </span>
            </Link>

            <div className="hidden items-center gap-1 rounded-full border border-slate-200 bg-slate-50/80 p-1 lg:flex">
              {primaryNav.map((item) => {
                const Icon = item.icon;
                const active = isPrimaryActive(item);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors ${
                      active
                        ? 'bg-white text-slate-950 shadow-sm ring-1 ring-slate-200'
                        : 'text-slate-500 hover:bg-white hover:text-slate-950'
                    }`}
                    aria-current={isActivePath(item.href) ? 'page' : undefined}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative hidden lg:block">
              <button
                type="button"
                onClick={() => setIsProjectOpen(!isProjectOpen)}
                className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-950"
                aria-expanded={isProjectOpen}
              >
                Project
                <ChevronDownIcon className="h-4 w-4" />
              </button>
              {isProjectOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-2xl border border-slate-200 bg-white py-1.5 shadow-[0_18px_45px_rgba(15,23,42,0.14)]">
                  {projectLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      target={link.href.startsWith('http') ? '_blank' : undefined}
                      rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      onClick={() => setIsProjectOpen(false)}
                      className="block px-3.5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <GitHubStars className="hidden items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 hover:text-white lg:inline-flex" />
            <div className="hidden items-center gap-2 lg:flex">
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="inline-flex max-w-[180px] items-center gap-1.5 rounded-full border border-slate-200 bg-white/80 px-3.5 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-950"
                  title={session?.user?.email || 'Signed in'}
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="truncate">Sign out</span>
                </button>
              ) : (
                <>
                  <Link
                    href={`/auth/signin?callbackUrl=${callbackUrl}`}
                    className="inline-flex whitespace-nowrap items-center gap-1.5 rounded-full border border-slate-200 bg-white/80 px-3.5 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-950"
                  >
                    <UserRound className="h-3.5 w-3.5" />
                    Sign in
                  </Link>
                  <Link
                    href={`/auth/signup?callbackUrl=${callbackUrl}`}
                    className="inline-flex whitespace-nowrap items-center gap-1.5 rounded-full bg-blue-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 hover:text-white"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
            <button
              type="button"
              className="rounded-full border border-slate-200 bg-white/80 p-2 text-slate-600 hover:bg-slate-50 lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? `Close ${menuName}` : `Open ${menuName}`}
              aria-expanded={isMenuOpen}
              aria-controls={mobileMenuId}
            >
              {isMenuOpen ? (
                <XMarkIcon className="block h-5 w-5" aria-hidden="true" />
              ) : (
                <Bars3Icon className="block h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {showToolRail && (
        <div className="hidden border-t border-[#d8dee4] bg-[#f6f8fa]/70 lg:block">
          <div className={`mx-auto flex ${maxWidth} items-center gap-1.5 overflow-x-auto px-4 py-1.5 sm:px-6`}>
            {toolNav.map((tool) => {
              const Icon = tool.icon;
              const active = isActivePath(tool.href);
              return (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                    active
                      ? 'bg-white text-[#24292f] shadow-[inset_0_0_0_1px_#d0d7de]'
                      : 'text-[#6e7781] hover:bg-white hover:text-[#24292f]'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tool.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {isMenuOpen && (
        <div id={mobileMenuId} className="border-t border-slate-200 bg-white lg:hidden">
          <div className="grid gap-1 px-4 py-3">
            {mobileItems.map((item) => {
              const Icon = item.icon;
              const active = isActivePath(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium ${
                    active
                      ? 'bg-slate-100 text-slate-950'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                  }`}
                  aria-current={active ? 'page' : undefined}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
            {projectLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                target={link.href.startsWith('http') ? '_blank' : undefined}
                rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <a
              href="https://github.com/jasimvkarim/mydebugtools"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-950"
              onClick={() => setIsMenuOpen(false)}
            >
              <Github className="h-4 w-4" />
              GitHub
            </a>
            {isAuthenticated ? (
              <button
                type="button"
                className="flex items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                onClick={() => {
                  setIsMenuOpen(false);
                  signOut({ callbackUrl: '/' });
                }}
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            ) : (
              <>
                <Link
                  href={`/auth/signin?callbackUrl=${callbackUrl}`}
                  className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <UserRound className="h-4 w-4" />
                  Sign in
                </Link>
                <Link
                  href={`/auth/signup?callbackUrl=${callbackUrl}`}
                  className="flex items-center gap-3 rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 hover:text-white"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
