'use client';

import { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import * as OutlineIcons from '@heroicons/react/24/outline';
import * as SolidIcons from '@heroicons/react/24/solid';
import * as MaterialIcons from '@mui/icons-material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';
import * as SimpleIcons from 'simple-icons';

// Initialize FontAwesome library
library.add(fas, far, fab);

type IconStyle = 'outline' | 'solid' | 'regular' | 'brands';
type IconProvider = 'heroicons' | 'material-ui' | 'fontawesome' | 'simple-icons';

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
      return Object.keys(MaterialIcons)
        .filter(key => {
          const component = (MaterialIcons as any)[key];
          return typeof component === 'function' && key.match(/^[A-Z]/);
        })
        .map(name => ({
          name: name.replace(/([A-Z])/g, ' $1').trim(),
          provider: 'material-ui' as const,
          Component: (MaterialIcons as any)[name],
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
    default:
      return [];
  }
};

// Combine all icons
const allIcons: IconInfo[] = [
  ...getIconsFromProvider('heroicons'),
  ...getIconsFromProvider('material-ui'),
  ...getIconsFromProvider('fontawesome'),
  ...getIconsFromProvider('simple-icons')
];

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

  const filteredIcons = allIcons.filter(icon => {
    const matchesSearch = icon.name.toLowerCase().includes(search.toLowerCase());
    const matchesProvider = icon.provider === selectedProvider;
    const matchesStyle = icon.styles.includes(style);
    return matchesSearch && matchesProvider && matchesStyle;
  });

  const getCodeSnippet = (icon: IconInfo) => {
    switch (icon.provider) {
      case 'heroicons':
        return `import { ${icon.name}Icon } from '@heroicons/react/${style === 'outline' ? '24/outline' : '24/solid'}';\n\n<${icon.name}Icon className="w-[${selectedSize}px] h-[${selectedSize}px]" style={{ color: '${selectedColor}' }} />`;
      case 'material-ui':
        return `import { ${icon.name} } from '@mui/icons-material';\n\n<${icon.name} sx={{ width: ${selectedSize}, height: ${selectedSize}, color: '${selectedColor}' }} />`;
      case 'fontawesome': {
        const faType = style === 'solid' ? 'fas' : style === 'regular' ? 'far' : 'fab';
        return `import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';\nimport { ${icon.name} } from '@fortawesome/free-${style}-svg-icons';\n\n<FontAwesomeIcon icon={${icon.name}} style={{ width: ${selectedSize}, height: ${selectedSize}, color: '${selectedColor}' }} />`;
      }
      case 'simple-icons':
        return `import { ${icon.name} } from 'simple-icons/icons';\n\n<${icon.name} size={${selectedSize}} color="${selectedColor}" />`;
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

      <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3 sm:gap-4">
        {filteredIcons.map((icon) => (
          <button
            key={`${icon.provider}-${icon.name}`}
            onClick={() => copyToClipboard(icon)}
            className="group p-2 sm:p-4 flex flex-col items-center justify-center gap-1 sm:gap-2 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-sm transition-all"
          >
            <div className="relative w-full aspect-square flex items-center justify-center">
              <icon.Component
                className="transition-all"
                style={{ 
                  width: `${selectedSize}px`,
                  height: `${selectedSize}px`,
                  color: selectedColor,
                  maxWidth: '100%',
                  maxHeight: '100%'
                }}
              />
            </div>
            <div className="text-[10px] sm:text-xs text-center w-full truncate">
              {copied === icon.name ? (
                <span className="text-green-600">Copied!</span>
              ) : (
                <span className="text-gray-600 group-hover:text-gray-900">{icon.name}</span>
              )}
            </div>
            <div className="text-[10px] sm:text-xs text-gray-400 w-full truncate text-center">
              {iconProviders[icon.provider].name}
            </div>
          </button>
        ))}
      </div>

      {filteredIcons.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No icons found matching "{search}"
        </div>
      )}
    </div>
  );
} 