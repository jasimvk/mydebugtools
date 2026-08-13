'use client';

import { useMemo, useState, Suspense } from 'react';
import {
  ArrowDownTrayIcon,
  BeakerIcon,
  BugAntIcon,
  CodeBracketIcon,
  CommandLineIcon,
  CpuChipIcon,
  DocumentDuplicateIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  PaintBrushIcon,
  ServerStackIcon,
  ShieldCheckIcon,
  SparklesIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';
import {
  Braces,
  Code2,
  Database,
  FileJson,
  GitCompare,
  Globe,
  KeyRound,
  Layers,
  Lock,
  Network,
  Palette,
  Regex,
  SearchCode,
  Terminal,
} from 'lucide-react';
import StructuredData from '@/components/StructuredData';

type IconProvider = 'heroicons' | 'lucide';

interface IconInfo {
  name: string;
  provider: IconProvider;
  Component: React.ElementType<any>;
  importName: string;
}

const icons: IconInfo[] = [
  { name: 'API Console', provider: 'heroicons', Component: CommandLineIcon, importName: 'CommandLineIcon' },
  { name: 'Bug Report', provider: 'heroicons', Component: BugAntIcon, importName: 'BugAntIcon' },
  { name: 'Code Block', provider: 'heroicons', Component: CodeBracketIcon, importName: 'CodeBracketIcon' },
  { name: 'Copy', provider: 'heroicons', Component: DocumentDuplicateIcon, importName: 'DocumentDuplicateIcon' },
  { name: 'Download', provider: 'heroicons', Component: ArrowDownTrayIcon, importName: 'ArrowDownTrayIcon' },
  { name: 'Inspector', provider: 'heroicons', Component: EyeIcon, importName: 'EyeIcon' },
  { name: 'Lab', provider: 'heroicons', Component: BeakerIcon, importName: 'BeakerIcon' },
  { name: 'Paint', provider: 'heroicons', Component: PaintBrushIcon, importName: 'PaintBrushIcon' },
  { name: 'Search', provider: 'heroicons', Component: MagnifyingGlassIcon, importName: 'MagnifyingGlassIcon' },
  { name: 'Server', provider: 'heroicons', Component: ServerStackIcon, importName: 'ServerStackIcon' },
  { name: 'Shield', provider: 'heroicons', Component: ShieldCheckIcon, importName: 'ShieldCheckIcon' },
  { name: 'Tools', provider: 'heroicons', Component: WrenchScrewdriverIcon, importName: 'WrenchScrewdriverIcon' },
  { name: 'Braces', provider: 'lucide', Component: Braces, importName: 'Braces' },
  { name: 'Code', provider: 'lucide', Component: Code2, importName: 'Code2' },
  { name: 'Database', provider: 'lucide', Component: Database, importName: 'Database' },
  { name: 'Diff', provider: 'lucide', Component: GitCompare, importName: 'GitCompare' },
  { name: 'Globe', provider: 'lucide', Component: Globe, importName: 'Globe' },
  { name: 'JSON', provider: 'lucide', Component: FileJson, importName: 'FileJson' },
  { name: 'Key', provider: 'lucide', Component: KeyRound, importName: 'KeyRound' },
  { name: 'Layers', provider: 'lucide', Component: Layers, importName: 'Layers' },
  { name: 'Lock', provider: 'lucide', Component: Lock, importName: 'Lock' },
  { name: 'Network', provider: 'lucide', Component: Network, importName: 'Network' },
  { name: 'Palette', provider: 'lucide', Component: Palette, importName: 'Palette' },
  { name: 'Regex', provider: 'lucide', Component: Regex, importName: 'Regex' },
  { name: 'Search Code', provider: 'lucide', Component: SearchCode, importName: 'SearchCode' },
  { name: 'Terminal', provider: 'lucide', Component: Terminal, importName: 'Terminal' },
  { name: 'Processor', provider: 'heroicons', Component: CpuChipIcon, importName: 'CpuChipIcon' },
  { name: 'Spark', provider: 'heroicons', Component: SparklesIcon, importName: 'SparklesIcon' },
];

const sizes = [16, 20, 24, 32, 40];

function getSnippet(icon: IconInfo, size: number, color: string) {
  if (icon.provider === 'heroicons') {
    return `import { ${icon.importName} } from '@heroicons/react/24/outline';\n\n<${icon.importName} className="h-[${size}px] w-[${size}px]" style={{ color: '${color}' }} />`;
  }

  return `import { ${icon.importName} } from 'lucide-react';\n\n<${icon.importName} size={${size}} color="${color}" />`;
}

function IconFinderContent() {
  const [query, setQuery] = useState('');
  const [provider, setProvider] = useState<IconProvider | 'all'>('all');
  const [size, setSize] = useState(24);
  const [color, setColor] = useState('#111827');
  const [copied, setCopied] = useState<string | null>(null);
  const [copyError, setCopyError] = useState('');

  const filteredIcons = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();

    // Search the component name and provider too, and require every whitespace-
    // separated token to match somewhere. Matching only `name` as one raw
    // substring meant the identifiers developers actually type — "magnifying",
    // "cpu", "filejson" — and any reordered phrase returned no results.
    const tokens = cleanQuery.split(/\s+/).filter(Boolean);

    return icons.filter((icon) => {
      const matchesProvider = provider === 'all' || icon.provider === provider;
      const haystack = `${icon.name} ${icon.importName} ${icon.provider}`.toLowerCase();
      const matchesQuery = tokens.every((token) => haystack.includes(token));
      return matchesProvider && matchesQuery;
    });
  }, [provider, query]);

  const copyIcon = async (icon: IconInfo) => {
    try {
      await navigator.clipboard.writeText(getSnippet(icon, size, color));
      setCopied(icon.name);
      setCopyError('');
      window.setTimeout(() => setCopied(null), 1600);
    } catch {
      setCopyError('Could not copy to the clipboard. Select the snippet and copy it manually.');
    }
  };

  return (
    <div className="space-y-6">
      <StructuredData
        title="Icon Finder | debugtools"
        description="Search, preview, and copy production-ready icon snippets for debugging tools."
        toolType="WebApplication"
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Icon Finder</h1>
          <p className="text-sm text-gray-600">Curated developer icons that keep builds fast.</p>
        </div>
        <p aria-live="polite" className="text-sm text-gray-500">{filteredIcons.length} icons</p>
      </div>

      {copyError && <p role="alert" className="text-sm text-red-600">{copyError}</p>}

      <div className="grid gap-3 rounded-lg border border-gray-200 bg-white p-4 md:grid-cols-[1fr_auto_auto]">
        <div className="relative">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Search icons"
            placeholder="Search icons"
            className="w-full rounded-md border border-gray-200 bg-gray-50 py-2 pl-10 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <select
          value={provider}
          onChange={(event) => setProvider(event.target.value as IconProvider | 'all')}
          className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          aria-label="Icon provider"
        >
          <option value="all">All providers</option>
          <option value="heroicons">Heroicons</option>
          <option value="lucide">Lucide</option>
        </select>

        <div className="flex items-center gap-2">
          <input
            type="color"
            value={color}
            onChange={(event) => setColor(event.target.value)}
            className="h-10 w-10 cursor-pointer rounded-md border border-gray-200 bg-gray-50 p-1"
            aria-label="Icon color"
          />
          <select
            value={size}
            onChange={(event) => setSize(Number(event.target.value))}
            className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            aria-label="Icon size"
          >
            {sizes.map((value) => (
              <option key={value} value={value}>
                {value}px
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {filteredIcons.map((icon) => (
          <button
            key={`${icon.provider}-${icon.name}`}
            onClick={() => copyIcon(icon)}
            className="flex min-h-[138px] flex-col items-center justify-center gap-3 rounded-lg border border-gray-200 bg-white p-4 text-center transition hover:border-blue-500 hover:shadow-sm"
            title={`Copy ${icon.name} snippet`}
          >
            <icon.Component
              aria-hidden="true"
              size={size}
              className="shrink-0"
              style={{ width: size, height: size, color }}
            />
            <span className="text-sm font-medium text-gray-900">{copied === icon.name ? 'Copied' : icon.name}</span>
            <span className="text-xs capitalize text-gray-500">{icon.provider}</span>
          </button>
        ))}
      </div>

      {filteredIcons.length === 0 && (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-10 text-center">
          <p className="text-sm font-medium text-gray-700">No matching icons</p>
        </div>
      )}
    </div>
  );
}

export default function IconFinder() {
  return (
    <Suspense fallback={<div className="h-[400px] rounded-lg bg-gray-50" />}>
      <IconFinderContent />
    </Suspense>
  );
}
