'use client';

import { useState } from 'react';
import { MagnifyingGlassIcon, ClipboardIcon } from '@heroicons/react/24/outline';
import * as OutlineIcons from '@heroicons/react/24/outline';
import * as SolidIcons from '@heroicons/react/24/solid';

type IconStyle = 'outline' | 'solid';

interface IconInfo {
  name: string;
  OutlineComponent: React.ComponentType<any>;
  SolidComponent: React.ComponentType<any>;
}

const icons: IconInfo[] = Object.keys(OutlineIcons).map(name => ({
  name: name.replace(/Icon$/, ''),
  OutlineComponent: (OutlineIcons as any)[name],
  SolidComponent: (SolidIcons as any)[name],
}));

export default function IconFinder() {
  const [search, setSearch] = useState('');
  const [style, setStyle] = useState<IconStyle>('outline');
  const [copied, setCopied] = useState<string | null>(null);

  const filteredIcons = icons.filter(icon => 
    icon.name.toLowerCase().includes(search.toLowerCase())
  );

  const copyToClipboard = async (iconName: string) => {
    const importStatement = `import { ${iconName}Icon } from '@heroicons/react/${style === 'outline' ? '24/outline' : '24/solid'}';\n`;
    const usage = `<${iconName}Icon className="h-6 w-6" />`;
    
    try {
      await navigator.clipboard.writeText(importStatement + usage);
      setCopied(iconName);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Icon Finder</h1>
          <p className="text-gray-600">Find and copy Heroicons for your project</p>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search icons..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <select
          value={style}
          onChange={(e) => setStyle(e.target.value as IconStyle)}
          className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="outline">Outline</option>
          <option value="solid">Solid</option>
        </select>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredIcons.map((icon) => {
          const IconComponent = style === 'outline' ? icon.OutlineComponent : icon.SolidComponent;
          return (
            <button
              key={icon.name}
              onClick={() => copyToClipboard(icon.name)}
              className="p-4 flex flex-col items-center justify-center gap-2 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-sm transition-all"
            >
              <IconComponent className="h-8 w-8" />
              <div className="text-xs text-center">
                {copied === icon.name ? (
                  <span className="text-green-600">Copied!</span>
                ) : (
                  <span className="text-gray-600">{icon.name}</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {filteredIcons.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No icons found matching "{search}"
        </div>
      )}
    </div>
  );
} 