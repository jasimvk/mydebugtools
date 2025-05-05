'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { MagnifyingGlassIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useDebounce } from 'use-debounce';

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

const presetSizes = [
  { label: 'XS', value: 16 },
  { label: 'SM', value: 20 },
  { label: 'MD', value: 24 },
  { label: 'LG', value: 32 },
  { label: 'XL', value: 40 }
];

export default function IconFinder() {
  const [loading, setLoading] = useState(true);
  const [loadingProvider, setLoadingProvider] = useState<IconProvider | null>(null);
  const [icons, setIcons] = useState<IconInfo[]>([]);
  const [search, setSearch] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<IconProvider>('heroicons'); // Default to heroicons
  const [style, setStyle] = useState<IconStyle>('outline');
  const [selectedSize, setSelectedSize] = useState(24);
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [copied, setCopied] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [activeProviders, setActiveProviders] = useState<IconProvider[]>([]);
  
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
    const matchesStyle = style === 'outline' || icon.styles.includes(style);
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

  // Function to dynamically import icon libraries and convert to IconInfo array
  const loadIconProvider = async (provider: IconProvider) => {
    if (activeProviders.includes(provider)) {
      return; // Already loaded
    }

    setLoading(true);
    setLoadingProvider(provider);
    
    try {
      let newIcons: IconInfo[] = [];
      
      switch (provider) {
        case 'heroicons': {
          const OutlineIcons = await import('@heroicons/react/24/outline');
          newIcons = Object.entries(OutlineIcons)
            .filter(([key]) => key !== 'default')
            .map(([name, Component]) => ({
              name: name.replace(/Icon$/, ''),
              provider: 'heroicons',
              Component: Component as React.ComponentType<any>,
              styles: ['outline', 'solid']
            }));
          break;
        }
        
        case 'material-ui': {
          const MaterialIcons = await import('@mui/icons-material');
          newIcons = Object.entries(MaterialIcons)
            .filter(([key, component]) => {
              return typeof component === 'object' && 
                     component !== null &&
                     'render' in component &&
                     key !== 'default' && 
                     !key.startsWith('Outlined') && 
                     !key.startsWith('Rounded') && 
                     !key.startsWith('Sharp') && 
                     !key.startsWith('TwoTone');
            })
            .map(([name, Component]) => ({
              name: name.replace(/([A-Z])/g, ' $1').trim(),
              provider: 'material-ui',
              Component: Component as React.ComponentType<any>,
              styles: ['solid']
            }));
          break;
        }
        
        case 'fontawesome': {
          // Import FontAwesome components and setup
          const { library } = await import('@fortawesome/fontawesome-svg-core');
          const { fas } = await import('@fortawesome/free-solid-svg-icons');
          const { far } = await import('@fortawesome/free-regular-svg-icons');
          const { fab } = await import('@fortawesome/free-brands-svg-icons');
          const { FontAwesomeIcon } = await import('@fortawesome/react-fontawesome');
          
          // Initialize FontAwesome library
          library.add(fas, far, fab);
          
          // Create components for solid icons
          const solidIcons = Object.keys(fas)
            .filter(key => key !== 'prefix' && key !== 'fas')
            .map(name => ({
              name: name.replace(/^fa/, ''),
              provider: 'fontawesome' as const,
              Component: (props: any) => <FontAwesomeIcon icon={fas[name as keyof typeof fas]} {...props} />,
              styles: ['solid'] as IconStyle[]
            }));
            
          // Create components for regular icons
          const regularIcons = Object.keys(far)
            .filter(key => key !== 'prefix' && key !== 'far')
            .map(name => ({
              name: name.replace(/^fa/, ''),
              provider: 'fontawesome' as const,
              Component: (props: any) => <FontAwesomeIcon icon={far[name as keyof typeof far]} {...props} />,
              styles: ['regular'] as IconStyle[]
            }));
            
          // Create components for brand icons
          const brandIcons = Object.keys(fab)
            .filter(key => key !== 'prefix' && key !== 'fab')
            .map(name => ({
              name: name.replace(/^fa/, ''),
              provider: 'fontawesome' as const,
              Component: (props: any) => <FontAwesomeIcon icon={fab[name as keyof typeof fab]} {...props} />,
              styles: ['brands'] as IconStyle[]
            }));
            
          newIcons = [...solidIcons, ...regularIcons, ...brandIcons];
          break;
        }
        
        case 'simple-icons': {
          const SimpleIcons = await import('simple-icons');
          newIcons = Object.entries(SimpleIcons)
            .filter(([key, component]) => key !== 'default' && typeof component === 'function')
            .map(([name, Component]) => ({
              name,
              provider: 'simple-icons',
              Component: Component as React.ComponentType<any>,
              styles: ['solid']
            }));
          break;
        }
        
        case 'phosphor': {
          const PhosphorIcons = await import('phosphor-react');
          newIcons = Object.entries(PhosphorIcons)
            .filter(([key, component]) => {
              return key !== 'default' && 
                     typeof component === 'function' && 
                     !key.includes('Weight');
            })
            .map(([name, Component]) => ({
              name: name.replace(/([A-Z])/g, ' $1').trim(),
              provider: 'phosphor',
              Component: Component as React.ComponentType<any>,
              styles: ['regular', 'fill']
            }));
          break;
        }
        
        case 'lucide': {
          const LucideIcons = await import('lucide-react');
          newIcons = Object.entries(LucideIcons)
            .filter(([key, component]) => {
              return key !== 'default' && 
                     typeof component === 'function' && 
                     !key.startsWith('create') && 
                     !key.startsWith('replace');
            })
            .map(([name, Component]) => ({
              name,
              provider: 'lucide',
              Component: Component as React.ComponentType<any>,
              styles: ['solid']
            }));
          break;
        }
        
        case 'all': {
          // For "all", load each provider one by one if not already loaded
          const allProviders: IconProvider[] = ['heroicons', 'material-ui', 'fontawesome', 'simple-icons', 'phosphor', 'lucide'];
          let completedCount = 0;
          
          for (const currProvider of allProviders) {
            if (!activeProviders.includes(currProvider)) {
              setLoadingProvider(currProvider);
              setLoadingProgress(Math.floor((completedCount / allProviders.length) * 100));
              
              await loadIconProvider(currProvider);
              completedCount++;
            } else {
              completedCount++;
            }
          }
          
          setLoadingProgress(100);
          break;
        }
      }
      
      if (provider !== 'all') {
        setIcons(prevIcons => [...prevIcons, ...newIcons]);
        setActiveProviders(prev => [...prev, provider]);
      }
    } catch (error) {
      console.error(`Error loading icons from ${provider}:`, error);
    } finally {
      setLoading(false);
      setLoadingProvider(null);
    }
  };

  // Load initial provider when component mounts
  useEffect(() => {
    loadIconProvider('heroicons');
  }, []);

  // When provider selection changes, load that provider if needed
  useEffect(() => {
    if (!activeProviders.includes(selectedProvider) && selectedProvider !== 'all') {
      loadIconProvider(selectedProvider);
    } else if (selectedProvider === 'all' && !activeProviders.includes('all')) {
      loadIconProvider('all');
    }
  }, [selectedProvider, activeProviders]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Icon Finder</h1>
          <p className="text-gray-600">Browse, search and copy icons from popular libraries</p>
        </div>
      </div>

      <div className="p-4 bg-blue-50 rounded-lg mb-4">
        <h2 className="text-lg font-semibold text-blue-700 mb-2">How to use:</h2>
        <ul className="list-disc pl-5 text-blue-700 space-y-1">
          <li>Select an icon library from the dropdown to browse its icons</li>
          <li>Use the &quot;All&quot; option to view icons from all libraries (may use more memory)</li>
          <li>Search by name to find specific icons</li>
          <li>Click any icon to copy its import code</li>
          <li>Customize size and color before copying</li>
          <li>Download icons as SVG or PNG files</li>
        </ul>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search icons by name..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <select
          value={selectedProvider}
          onChange={(e) => {
            const newProvider = e.target.value as IconProvider;
            setSelectedProvider(newProvider);
            setStyle(iconProviders[newProvider].styles[0]);
          }}
          className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
          aria-label="Select icon library"
        >
          {Object.entries(iconProviders).map(([key, provider]) => (
            <option key={key} value={key}>{provider.label}</option>
          ))}
        </select>

        <select
          value={style}
          onChange={(e) => setStyle(e.target.value as IconStyle)}
          className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
          aria-label="Select icon style"
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
        <div className="flex items-center justify-center h-[600px] bg-gray-50 rounded-lg">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="text-gray-600 font-medium">
              {selectedProvider === 'all' 
                ? `Loading all icon libraries (${loadingProgress}%)...`
                : `Loading ${iconProviders[selectedProvider].name} icons...`}
            </p>
            {loadingProvider && (
              <p className="text-gray-500 text-sm">Currently loading: {iconProviders[loadingProvider].name}</p>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              Showing {filteredIcons.length} {filteredIcons.length === 1 ? 'icon' : 'icons'}
              {selectedProvider !== 'all' && ` from ${iconProviders[selectedProvider].name}`}
              {search && ` matching "${search}"`}
            </p>
            {filteredIcons.length > 0 && (
              <p className="text-sm text-gray-500">Click any icon to copy its code</p>
            )}
          </div>
          
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
                          title={`Click to copy ${icon.name} code`}
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
                              <span className="text-green-600 font-medium">Copied!</span>
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
            <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-lg">
              <div className="text-center max-w-md">
                <MagnifyingGlassIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No icons found</h3>
                <p className="text-gray-500 mb-4">
                  {search ? (
                    <>No icons matching "<strong>{search}</strong>" found in {selectedProvider === 'all' ? 'any library' : iconProviders[selectedProvider].name}.</>
                  ) : (
                    <>Try selecting a different library or style from the dropdown menus above.</>
                  )}
                </p>
                {search && (
                  <button 
                    onClick={() => setSearch('')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Clear search
                  </button>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
} 