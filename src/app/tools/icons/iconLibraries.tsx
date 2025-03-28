'use client';

import { useEffect, useState, memo } from 'react';
import { Virtualizer } from '@tanstack/react-virtual';
import { useDebounce } from 'use-debounce';

// Dynamic imports for icon libraries
import * as OutlineIcons from '@heroicons/react/24/outline';
import * as SolidIcons from '@heroicons/react/24/solid';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';

// Initialize FontAwesome library
library.add(fas, far, fab);

// Lazy load MaterialUI icons
const MaterialIcons = {
  // We'll load only a subset to improve performance
  AccessAlarm: () => import('@mui/icons-material/AccessAlarm').then(mod => mod.default),
  AccountCircle: () => import('@mui/icons-material/AccountCircle').then(mod => mod.default),
  Add: () => import('@mui/icons-material/Add').then(mod => mod.default),
  // Add more as needed
};

// Types
type IconStyle = 'outline' | 'solid' | 'regular' | 'brands';
type IconProvider = 'heroicons' | 'material-ui' | 'fontawesome' | 'simple-icons';

interface IconInfo {
  id: string;
  name: string;
  provider: IconProvider;
  style: IconStyle;
}

interface IconDisplayProps {
  icon: IconInfo;
  size: number;
  color: string;
  isCopied: boolean;
  onCopy: (icon: IconInfo) => void;
}

// Memoized icon display component to prevent unnecessary re-renders
const IconDisplay = memo(({ icon, size, color, isCopied, onCopy }: IconDisplayProps) => {
  const [IconComponent, setIconComponent] = useState<React.ComponentType<any> | null>(null);
  
  // Lazy load the appropriate icon component
  useEffect(() => {
    const loadIcon = async () => {
      let component: React.ComponentType<any> | null = null;
      switch (icon.provider) {
        case 'heroicons':
          if (icon.style === 'outline') {
            component = (OutlineIcons as any)[`${icon.name}Icon`];
          } else {
            component = (SolidIcons as any)[`${icon.name}Icon`];
          }
          break;
        case 'material-ui':
          if (MaterialIcons[icon.name as keyof typeof MaterialIcons]) {
            component = await MaterialIcons[icon.name as keyof typeof MaterialIcons]();
          }
          break;
        case 'fontawesome':
          if (icon.style === 'solid') {
            component = (props: any) => <FontAwesomeIcon icon={fas[`fa${icon.name}` as keyof typeof fas]} {...props} />;
          } else if (icon.style === 'regular') {
            component = (props: any) => <FontAwesomeIcon icon={far[`fa${icon.name}` as keyof typeof far]} {...props} />;
          } else {
            component = (props: any) => <FontAwesomeIcon icon={fab[`fa${icon.name}` as keyof typeof fab]} {...props} />;
          }
          break;
        default:
          component = null;
      }
      setIconComponent(() => component);
    };
    
    loadIcon();
  }, [icon]);

  if (!IconComponent) {
    return (
      <div className="w-full aspect-square flex items-center justify-center bg-gray-50">
        <div className="w-6 h-6 rounded-full animate-pulse bg-gray-200"></div>
      </div>
    );
  }
  
  return (
    <button
      onClick={() => onCopy(icon)}
      className="group p-2 sm:p-4 flex flex-col items-center justify-center gap-1 sm:gap-2 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-sm transition-all"
    >
      <div className="relative w-full aspect-square flex items-center justify-center">
        <IconComponent
          className="transition-all"
          style={{ 
            width: `${size}px`,
            height: `${size}px`,
            color: color,
            maxWidth: '100%',
            maxHeight: '100%'
          }}
        />
      </div>
      <div className="text-[10px] sm:text-xs text-center w-full truncate">
        {isCopied ? (
          <span className="text-green-600">Copied!</span>
        ) : (
          <span className="text-gray-600 group-hover:text-gray-900">{icon.name}</span>
        )}
      </div>
      <div className="text-[10px] sm:text-xs text-gray-400 w-full truncate text-center">
        {icon.provider}
      </div>
    </button>
  );
});

IconDisplay.displayName = 'IconDisplay';

interface IconLibrariesProps {
  selectedProvider: IconProvider;
  style: IconStyle;
  search: string;
  selectedSize: number;
  selectedColor: string;
  columns: number;
  virtualizer: Virtualizer<HTMLDivElement, Element>;
  copied: string | null;
  onCopy: (icon: IconInfo) => Promise<void>;
  setIcons: React.Dispatch<React.SetStateAction<IconInfo[]>>;
}

// Generate code snippet for copying
const getCodeSnippet = (icon: IconInfo, style: IconStyle, size: number, color: string) => {
  switch (icon.provider) {
    case 'heroicons':
      return `import { ${icon.name}Icon } from '@heroicons/react/${style === 'outline' ? '24/outline' : '24/solid'}';\n\n<${icon.name}Icon className="w-[${size}px] h-[${size}px]" style={{ color: '${color}' }} />`;
    case 'material-ui':
      return `import { ${icon.name} } from '@mui/icons-material';\n\n<${icon.name} sx={{ width: ${size}, height: ${size}, color: '${color}' }} />`;
    case 'fontawesome': {
      const faType = style === 'solid' ? 'fas' : style === 'regular' ? 'far' : 'fab';
      return `import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';\nimport { fa${icon.name} } from '@fortawesome/free-${style}-svg-icons';\n\n<FontAwesomeIcon icon={fa${icon.name}} style={{ width: ${size}, height: ${size}, color: '${color}' }} />`;
    }
    default:
      return '';
  }
};

// Create a grid of icons by rows
interface IconRow {
  id: number;
  icons: IconInfo[];
}

export default function IconLibraries({ 
  selectedProvider, 
  style, 
  search, 
  selectedSize, 
  selectedColor,
  columns,
  virtualizer,
  copied,
  onCopy,
  setIcons
}: IconLibrariesProps) {
  const [debouncedSearch] = useDebounce(search, 300);
  const [filteredIcons, setFilteredIcons] = useState<IconInfo[]>([]);
  
  // Load icons based on selected provider
  useEffect(() => {
    const loadIcons = async () => {
      let icons: IconInfo[] = [];
      
      // Load icons based on provider
      switch (selectedProvider) {
        case 'heroicons':
          icons = Object.keys(OutlineIcons)
            .filter(name => name.endsWith('Icon'))
            .map(name => ({
              id: `heroicons-${name}`,
              name: name.replace(/Icon$/, ''),
              provider: 'heroicons' as const,
              style: 'outline' as const
            }));
          break;
        case 'fontawesome':
          const solidIcons = Object.keys(fas)
            .filter(key => key !== 'prefix' && key !== 'fas' && typeof key === 'string')
            .map(name => ({
              id: `fa-solid-${name}`,
              name: name.replace(/^fa/, ''),
              provider: 'fontawesome' as const,
              style: 'solid' as const
            }));
          // Add more for regular and brands if needed
          icons = solidIcons;
          break;
        case 'material-ui':
          // For simplicity, we'll use a smaller set
          icons = Object.keys(MaterialIcons).map(name => ({
            id: `mui-${name}`,
            name,
            provider: 'material-ui' as const,
            style: 'solid' as const
          }));
          break;
        default:
          icons = [];
      }
      
      setIcons(icons);
    };
    
    loadIcons();
  }, [selectedProvider, setIcons]);
  
  // Filter icons based on search query
  useEffect(() => {
    setFilteredIcons(prev => {
      return prev.filter(icon => {
        return icon.name.toLowerCase().includes(debouncedSearch.toLowerCase());
      });
    });
  }, [debouncedSearch]);
  
  // Function to handle icon copy with clipboard
  const handleCopy = async (icon: IconInfo) => {
    try {
      const code = getCodeSnippet(icon, style, selectedSize, selectedColor);
      await navigator.clipboard.writeText(code);
      onCopy(icon);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };
  
  // Create a grid of icons by rows
  const rows: IconRow[] = [];
  for (let i = 0; i < Math.ceil(filteredIcons.length / columns); i++) {
    const rowIcons = filteredIcons.slice(i * columns, (i + 1) * columns);
    rows.push({ id: i, icons: rowIcons });
  }
  
  // Virtualized rendering of icon rows
  return (
    <>
      {virtualizer.getVirtualItems().map(virtualRow => {
        const rowData = rows[virtualRow.index];
        if (!rowData) return null;
        
        return (
          <div
            key={virtualRow.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 p-2"
          >
            {rowData.icons.map((icon: IconInfo) => (
              <IconDisplay
                key={icon.id}
                icon={icon}
                size={selectedSize}
                color={selectedColor}
                isCopied={copied === icon.name}
                onCopy={handleCopy}
              />
            ))}
          </div>
        );
      })}
    </>
  );
} 