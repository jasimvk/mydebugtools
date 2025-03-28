'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { MagnifyingGlassIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import * as OutlineIcons from '@heroicons/react/24/outline';
import * as SolidIcons from '@heroicons/react/24/solid';
import * as MaterialIcons from '@mui/icons-material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';
import * as SimpleIcons from 'simple-icons';
import * as PhosphorIcons from 'phosphor-react';
import * as LucideIcons from 'lucide-react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useDebounce } from 'use-debounce';

// Initialize FontAwesome library
library.add(fas, far, fab);

type IconStyle = 'outline' | 'solid' | 'regular' | 'brands' | 'fill' | 'line';
type IconProvider = 'heroicons' | 'material-ui' | 'fontawesome' | 'simple-icons' | 'phosphor' | 'lucide' | 'all';

interface IconProviderInfo {
  name: string;
  label: string;
  styles: IconStyle[];
  importPath: string;
}

const iconProviders: Record<IconProvider, IconProviderInfo> = {
  'heroicons': {
    name: 'Heroicons',
    label: 'Heroicons by Tailwind CSS',
    styles: ['outline', 'solid'],
    importPath: '@heroicons/react'
  },
  'material-ui': {
    name: 'Material UI',
    label: 'Material UI Icons',
    styles: ['solid'],
    importPath: '@mui/icons-material'
  },
  'fontawesome': {
    name: 'Font Awesome',
    label: 'Font Awesome Icons',
    styles: ['solid', 'regular', 'brands'],
    importPath: '@fortawesome/react-fontawesome'
  },
  'simple-icons': {
    name: 'Simple Icons',
    label: 'Simple Icons (Brand & Logo icons)',
    styles: ['solid'],
    importPath: 'simple-icons/icons'
  },
  'phosphor': {
    name: 'Phosphor',
    label: 'Phosphor Icons',
    styles: ['regular', 'fill'],
    importPath: 'phosphor-react'
  },
  'lucide': {
    name: 'Lucide',
    label: 'Lucide Icons',
    styles: ['solid'],
    importPath: 'lucide-react'
  },
  'all': {
    name: 'All',
    label: 'All Icons',
    styles: ['outline', 'solid', 'regular', 'brands', 'fill', 'line'],
    importPath: ''
  }
};

interface IconInfo {
  name: string;
  provider: IconProvider;
  Component: React.ComponentType<any>;
  styles: IconStyle[];
}

// Helper function to get icons from different providers
const getIconsFromProvider = (provider: IconProvider): IconInfo[] => {
  switch (provider) {
    case 'heroicons':
      return Object.keys(OutlineIcons).map(name => ({
        name: name.replace(/Icon$/, ''),
        provider: 'heroicons' as const,
        Component: (OutlineIcons as any)[name],
        styles: ['outline', 'solid'] as IconStyle[]
      }));
    case 'material-ui':
      return Object.entries(MaterialIcons)
        .filter(([key, component]) => {
          // Filter out non-icon components and special exports
          return typeof component === 'object' && 
                 component !== null &&
                 'render' in component &&
                 key !== 'default' && 
                 !key.startsWith('Outlined') && 
                 !key.startsWith('Rounded') && 
                 !key.startsWith('Sharp') && 
                 !key.startsWith('TwoTone');
        })
        .map(([name, component]) => ({
          name: name.replace(/([A-Z])/g, ' $1').trim(),
          provider: 'material-ui' as const,
          Component: component as React.ComponentType<any>,
          styles: ['solid'] as IconStyle[]
        }));
    case 'fontawesome':
      return [
        ...Object.keys(fas)
          .filter(key => key !== 'prefix' && key !== 'fas')
          .map(name => ({
            name: name.replace(/^fa/, ''),
            provider: 'fontawesome' as const,
            Component: (props: any) => <FontAwesomeIcon icon={fas[name as keyof typeof fas]} {...props} />,
            styles: ['solid'] as IconStyle[]
          })),
        ...Object.keys(far)
          .filter(key => key !== 'prefix' && key !== 'far')
          .map(name => ({
            name: name.replace(/^fa/, ''),
            provider: 'fontawesome' as const,
            Component: (props: any) => <FontAwesomeIcon icon={far[name as keyof typeof far]} {...props} />,
            styles: ['regular'] as IconStyle[]
          })),
        ...Object.keys(fab)
          .filter(key => key !== 'prefix' && key !== 'fab')
          .map(name => ({
            name: name.replace(/^fa/, ''),
            provider: 'fontawesome' as const,
            Component: (props: any) => <FontAwesomeIcon icon={fab[name as keyof typeof fab]} {...props} />,
            styles: ['brands'] as IconStyle[]
          }))
      ];
    case 'simple-icons':
      return Object.keys(SimpleIcons)
        .filter(key => typeof (SimpleIcons as any)[key] === 'function')
        .map(name => ({
          name,
          provider: 'simple-icons' as const,
          Component: (SimpleIcons as any)[name],
          styles: ['solid'] as IconStyle[]
        }));
    case 'phosphor':
      return Object.keys(PhosphorIcons)
        .filter(key => typeof (PhosphorIcons as any)[key] === 'function' && !key.includes('Weight'))
        .map(name => ({
          name: name.replace(/([A-Z])/g, ' $1').trim(),
          provider: 'phosphor' as const,
          Component: (PhosphorIcons as any)[name],
          styles: ['regular', 'fill'] as IconStyle[]
        }));
    case 'lucide':
      return Object.entries(LucideIcons)
        .filter(([key, component]) => {
          // Only include actual icon components
          return typeof component === 'function' && 
                 key !== 'default' &&
                 !key.startsWith('create') &&
                 !key.startsWith('replace');
        })
        .map(([name, Component]) => ({
          name, // Keep the original name without transformation
          provider: 'lucide' as const,
          Component: Component as React.ComponentType<any>,
          styles: ['solid'] as IconStyle[]
        }));
    default:
      return [];
  }
};

// Combine all icons
const allIcons: IconInfo[] = [
  ...getIconsFromProvider('heroicons'),
  ...getIconsFromProvider('material-ui'),
  ...getIconsFromProvider('fontawesome'),
  ...getIconsFromProvider('simple-icons'),
  ...getIconsFromProvider('phosphor'),
  ...getIconsFromProvider('lucide')
];

const presetSizes = [
  { label: 'XS', value: 16 },
  { label: 'SM', value: 20 },
  { label: 'MD', value: 24 },
  { label: 'LG', value: 32 },
  { label: 'XL', value: 40 }
];

export default function IconFinder() {
  const [loading, setLoading] = useState(true);
  const [icons, setIcons] = useState<IconInfo[]>([]);
  const [search, setSearch] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<IconProvider>('heroicons');
  const [style, setStyle] = useState<IconStyle>('outline');
  const [selectedSize, setSelectedSize] = useState(24);
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [copied, setCopied] = useState<string | null>(null);
  
  const [parentElement, setParentElement] = useState<HTMLDivElement | null>(null);
  const parentRef = useCallback((node: HTMLDivElement) => {
    if (node !== null) {
      setParentElement(node);
    }
  }, []);

  const [debouncedSearch] = useDebounce(search, 300);

  const filteredIcons = icons.filter(icon => {
    const matchesSearch = icon.name.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchesProvider = selectedProvider === 'all' || icon.provider === selectedProvider;
    const matchesStyle = icon.styles.includes(style);
    return matchesSearch && matchesProvider && matchesStyle;
  });

  const rowVirtualizer = useVirtualizer({
    count: Math.ceil(filteredIcons.length / 6),
    getScrollElement: () => parentElement,
    estimateSize: () => 160,
    overscan: 5,
  });

  const getCodeSnippet = (icon: IconInfo) => {
    const importPath = iconProviders[icon.provider].importPath;
    
    switch (icon.provider) {
      case 'heroicons':
        return `import { ${icon.name}Icon } from '${importPath}/${style === 'outline' ? '24/outline' : '24/solid'}';\n\n<${icon.name}Icon className="w-[${selectedSize}px] h-[${selectedSize}px]" style={{ color: '${selectedColor}' }} />`;
      case 'material-ui':
        return `import { ${icon.name} } from '${importPath}';\n\n<${icon.name} sx={{ width: ${selectedSize}, height: ${selectedSize}, color: '${selectedColor}' }} />`;
      case 'fontawesome': {
        const faType = style === 'solid' ? 'fas' : style === 'regular' ? 'far' : 'fab';
        return `import { FontAwesomeIcon } from '${importPath}';\nimport { ${icon.name} } from '@fortawesome/free-${style}-svg-icons';\n\n<FontAwesomeIcon icon={${icon.name}} style={{ width: ${selectedSize}, height: ${selectedSize}, color: '${selectedColor}' }} />`;
      }
      case 'simple-icons':
        return `import { ${icon.name} } from '${importPath}';\n\n<${icon.name} size={${selectedSize}} color="${selectedColor}" />`;
      case 'phosphor':
        return `import { ${icon.name} } from '${importPath}';\n\n<${icon.name} size={${selectedSize}} color="${selectedColor}" />`;
      case 'lucide':
        return `import { ${icon.name} } from '${importPath}';\n\n<${icon.name} size={${selectedSize}} color="${selectedColor}" />`;
      default:
        return '';
    }
  };

  const copyToClipboard = async (icon: IconInfo) => {
    try {
      const code = getCodeSnippet(icon);
      await navigator.clipboard.writeText(code);
      setCopied(icon.name);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const downloadIcon = async (icon: IconInfo, format: 'png' | 'svg') => {
    const svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${selectedSize}" height="${selectedSize}" viewBox="0 0 24 24">
        <g fill="${selectedColor}">
          ${document.querySelector(`[data-icon-id="${icon.provider}-${icon.name}"] svg`)?.innerHTML || ''}
        </g>
      </svg>
    `;

    if (format === 'svg') {
      // Download as SVG
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${icon.name}.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      // Download as PNG
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      canvas.width = selectedSize;
      canvas.height = selectedSize;

      return new Promise((resolve) => {
        img.onload = () => {
          if (ctx) {
            ctx.drawImage(img, 0, 0, selectedSize, selectedSize);
            canvas.toBlob((blob) => {
              if (blob) {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${icon.name}.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }
            }, 'image/png');
          }
          resolve(null);
        };
        img.src = 'data:image/svg+xml;base64,' + btoa(svgString);
      });
    }
  };

  useEffect(() => {
    const loadIcons = async () => {
      setLoading(true);
      try {
        const allIcons = [
          ...getIconsFromProvider('heroicons'),
          ...getIconsFromProvider('material-ui'),
          ...getIconsFromProvider('fontawesome'),
          ...getIconsFromProvider('simple-icons'),
          ...getIconsFromProvider('phosphor'),
          ...getIconsFromProvider('lucide')
        ];
        setIcons(allIcons);
      } catch (error) {
        console.error('Error loading icons:', error);
      } finally {
        setLoading(false);
      }
    };

    loadIcons();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Icon Finder</h1>
          <p className="text-gray-600">Find and copy icons from multiple providers</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
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
          value={selectedProvider}
          onChange={(e) => {
            setSelectedProvider(e.target.value as IconProvider);
            setStyle(iconProviders[e.target.value as IconProvider].styles[0]);
          }}
          className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          {Object.entries(iconProviders).map(([key, provider]) => (
            <option key={key} value={key}>{provider.label}</option>
          ))}
        </select>

        <select
          value={style}
          onChange={(e) => setStyle(e.target.value as IconStyle)}
          className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          {iconProviders[selectedProvider].styles.map(styleOption => (
            <option key={styleOption} value={styleOption}>
              {styleOption.charAt(0).toUpperCase() + styleOption.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Size:</label>
          <div className="flex gap-2">
            {presetSizes.map(size => (
              <button
                key={size.label}
                onClick={() => {
                  setSelectedSize(size.value);
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

      {loading ? (
        <div className="flex items-center justify-center h-[600px]">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="text-gray-600">Loading icons...</p>
          </div>
        </div>
      ) : (
        <>
          <div 
            ref={parentRef}
            className="h-[600px] overflow-auto"
            style={{
              contain: 'strict',
            }}
          >
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const startIndex = virtualRow.index * 6;
                const rowIcons = filteredIcons.slice(startIndex, startIndex + 6);

                return (
                  <div
                    key={virtualRow.index}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
                  >
                    {rowIcons.map((icon) => (
                      <div
                        key={`${icon.provider}-${icon.name}`}
                        className="relative group"
                      >
                        <button
                          onClick={() => copyToClipboard(icon)}
                          className="w-full p-4 flex flex-col items-center justify-center gap-2 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-sm transition-all"
                          data-icon-id={`${icon.provider}-${icon.name}`}
                        >
                          <icon.Component
                            className="transition-all"
                            style={{ 
                              width: `${selectedSize}px`,
                              height: `${selectedSize}px`,
                              color: selectedColor
                            }}
                          />
                          <div className="text-xs text-center">
                            {copied === icon.name ? (
                              <span className="text-green-600">Copied!</span>
                            ) : (
                              <span className="text-gray-600">{icon.name}</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-400">
                            {iconProviders[icon.provider].name}
                          </div>
                        </button>
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex gap-1">
                            <button
                              onClick={() => downloadIcon(icon, 'svg')}
                              className="p-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-600 text-xs"
                              title="Download SVG"
                            >
                              SVG
                            </button>
                            <button
                              onClick={() => downloadIcon(icon, 'png')}
                              className="p-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-600 text-xs"
                              title="Download PNG"
                            >
                              PNG
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>

          {filteredIcons.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No icons found matching "{search}"
            </div>
          )}
        </>
      )}
    </div>
  );
} 