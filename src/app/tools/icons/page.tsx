'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import dynamic from 'next/dynamic';
import { useVirtualizer } from '@tanstack/react-virtual';

// Lazy load icon libraries to improve initial load time
const IconLibraries = dynamic(() => import('./iconLibraries'), { 
  ssr: false,
  loading: () => <div className="text-center py-4">Loading icon libraries...</div>
});

// Types
type IconStyle = 'outline' | 'solid' | 'regular' | 'brands';
type IconProvider = 'heroicons' | 'material-ui' | 'fontawesome' | 'simple-icons';

interface IconProviderInfo {
  name: string;
  label: string;
  styles: IconStyle[];
}

const iconProviders: Record<IconProvider, IconProviderInfo> = {
  'heroicons': {
    name: 'Heroicons',
    label: 'Heroicons by Tailwind CSS',
    styles: ['outline', 'solid'],
  },
  'material-ui': {
    name: 'Material UI',
    label: 'Material UI Icons',
    styles: ['solid'],
  },
  'fontawesome': {
    name: 'Font Awesome',
    label: 'Font Awesome Icons',
    styles: ['solid', 'regular', 'brands'],
  },
  'simple-icons': {
    name: 'Simple Icons',
    label: 'Brand & Logo icons',
    styles: ['solid'],
  }
};

interface IconInfo {
  id: string;
  name: string;
  provider: IconProvider;
  style: IconStyle;
}

const presetSizes = [
  { label: 'XS', value: 16 },
  { label: 'SM', value: 20 },
  { label: 'MD', value: 24 },
  { label: 'LG', value: 32 },
  { label: 'XL', value: 40 }
];

export default function IconFinder() {
  const [search, setSearch] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<IconProvider>('heroicons');
  const [style, setStyle] = useState<IconStyle>('outline');
  const [copied, setCopied] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState(24);
  const [customSize, setCustomSize] = useState('24');
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [icons, setIcons] = useState<IconInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);

  // Load icons for the selected provider
  useEffect(() => {
    const loadIcons = async () => {
      setIsLoading(true);
      try {
        // This will be handled by the IconLibraries component
        // We'll just simulate the loading state here
        setTimeout(() => {
          setIsLoading(false);
        }, 100);
      } catch (error) {
        console.error('Failed to load icons:', error);
        setIsLoading(false);
      }
    };

    loadIcons();
  }, [selectedProvider]);

  // Memoize filtered icons for better performance
  const filteredIcons = useMemo(() => {
    if (!icons.length) return [];
    return icons.filter((icon) => {
      const matchesSearch = icon.name.toLowerCase().includes(search.toLowerCase());
      const matchesProvider = icon.provider === selectedProvider;
      const matchesStyle = icon.style === style;
      return matchesSearch && matchesProvider && matchesStyle;
    });
  }, [icons, search, selectedProvider, style]);

  // Set up virtualization for rendering only visible icons
  const rowVirtualizer = useVirtualizer({
    count: Math.ceil(filteredIcons.length / 5),
    getScrollElement: () => containerRef,
    estimateSize: () => 120,
    overscan: 5,
  });

  // Calculate columns based on container width
  const getColumnsForWidth = useCallback(() => {
    if (!containerRef) return 5;
    const width = containerRef.offsetWidth;
    if (width < 640) return 2; // xs
    if (width < 768) return 3; // sm
    if (width < 1024) return 4; // md
    if (width < 1280) return 5; // lg
    return 6; // xl and up
  }, [containerRef]);

  const columns = useMemo(() => getColumnsForWidth(), [getColumnsForWidth]);

  const copyToClipboard = async (icon: IconInfo) => {
    // The actual implementation will be in the IconLibraries component
    setCopied(icon.name);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Icon Finder</h1>
          <p className="text-sm sm:text-base text-gray-600">Find and copy icons from multiple providers</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="relative w-full">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search icons..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <select
            value={selectedProvider}
            onChange={(e) => {
              setSelectedProvider(e.target.value as IconProvider);
              setStyle(iconProviders[e.target.value as IconProvider].styles[0]);
            }}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(iconProviders).map(([key, provider]) => (
              <option key={key} value={key}>{provider.label}</option>
            ))}
          </select>

          <select
            value={style}
            onChange={(e) => setStyle(e.target.value as IconStyle)}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {iconProviders[selectedProvider].styles.map(styleOption => (
              <option key={styleOption} value={styleOption}>
                {styleOption.charAt(0).toUpperCase() + styleOption.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-sm text-gray-600 whitespace-nowrap">Size:</label>
          <div className="flex flex-wrap gap-2">
            {presetSizes.map(size => (
              <button
                key={size.label}
                onClick={() => {
                  setSelectedSize(size.value);
                  setCustomSize(size.value.toString());
                }}
                className={`px-2 py-1 text-sm rounded ${
                  selectedSize === size.value
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {size.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={customSize}
              onChange={(e) => {
                setCustomSize(e.target.value);
                setSelectedSize(parseInt(e.target.value) || 24);
              }}
              className="w-16 px-2 py-1 text-sm bg-gray-50 border border-gray-200 rounded"
              placeholder="Custom"
            />
            <span className="text-sm text-gray-600">px</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Color:</label>
          <input
            type="color"
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
            className="w-8 h-8 rounded cursor-pointer"
          />
        </div>
      </div>

      {/* Virtualized Icon Grid with Icon Libraries Component */}
      <div 
        ref={setContainerRef}
        className="h-[600px] overflow-auto border border-gray-200 rounded-lg"
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            <IconLibraries
              selectedProvider={selectedProvider}
              style={style}
              search={search}
              selectedSize={selectedSize}
              selectedColor={selectedColor}
              columns={columns}
              virtualizer={rowVirtualizer}
              copied={copied}
              onCopy={copyToClipboard}
              setIcons={setIcons}
            />
          </div>
        )}
      </div>

      {filteredIcons.length === 0 && !isLoading && (
        <div className="text-center py-6 text-gray-500">
          No icons found matching "{search}"
        </div>
      )}
    </div>
  );
} 