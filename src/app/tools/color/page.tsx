'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  SwatchIcon, 
  ArrowPathIcon, 
  DocumentDuplicateIcon,
  QuestionMarkCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  InformationCircleIcon,
  EyeDropperIcon
} from '@heroicons/react/24/outline';
import SuspenseBoundary from '@/components/SuspenseBoundary';

// Color formats
const colorFormats = [
  { value: 'hex', label: 'HEX' },
  { value: 'rgb', label: 'RGB' },
  { value: 'hsl', label: 'HSL' },
  { value: 'cmyk', label: 'CMYK' },
  { value: 'hsv', label: 'HSV' }
];

// Common color palettes
const colorPalettes = [
  { name: 'Material Design', colors: ['#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39', '#FFC107', '#FF9800', '#FF5722'] },
  { name: 'Flat UI', colors: ['#1ABC9C', '#2ECC71', '#3498DB', '#9B59B6', '#34495E', '#16A085', '#27AE60', '#2980B9', '#8E44AD', '#2C3E50', '#F1C40F', '#E67E22', '#E74C3C', '#95A5A6', '#F39C12'] },
  { name: 'Pastel', colors: ['#FFB3BA', '#BAFFC9', '#BAE1FF', '#FFFFBA', '#FFB3F7', '#E8BAFF', '#BAE8FF', '#BAFFE8', '#FFE8BA', '#F7BAFF'] },
  { name: 'Monochrome', colors: ['#000000', '#1A1A1A', '#333333', '#4D4D4D', '#666666', '#808080', '#999999', '#B3B3B3', '#CCCCCC', '#E6E6E6', '#FFFFFF'] }
];

// Keyboard shortcuts
const keyboardShortcuts = [
  { key: 'Ctrl+C / Cmd+C', description: 'Copy color' },
  { key: 'Ctrl+R / Cmd+R', description: 'Reset color' },
  { key: 'Ctrl+H / Cmd+H', description: 'Show/hide help' },
  { key: 'Ctrl+P / Cmd+P', description: 'Pick color from screen' }
];

// Color conversion utilities
const colorUtils = {
  hexToRgb: (hex: string): { r: number, g: number, b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  },
  
  rgbToHsl: (r: number, g: number, b: number): { h: number, s: number, l: number } => {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  },
  
  rgbToCmyk: (r: number, g: number, b: number): { c: number, m: number, y: number, k: number } => {
    r = r / 255;
    g = g / 255;
    b = b / 255;
    
    const k = 1 - Math.max(r, g, b);
    const c = k === 1 ? 0 : (1 - r - k) / (1 - k);
    const m = k === 1 ? 0 : (1 - g - k) / (1 - k);
    const y = k === 1 ? 0 : (1 - b - k) / (1 - k);
    
    return {
      c: Math.round(c * 100),
      m: Math.round(m * 100),
      y: Math.round(y * 100),
      k: Math.round(k * 100)
    };
  },
  
  rgbToHsv: (r: number, g: number, b: number): { h: number, s: number, v: number } => {
    r = r / 255;
    g = g / 255;
    b = b / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s, v = max;
    
    const d = max - min;
    s = max === 0 ? 0 : d / max;
    
    if (max === min) {
      h = 0; // achromatic
    } else {
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      v: Math.round(v * 100)
    };
  },

  // Format values for display
  formatRgb: (r: number, g: number, b: number): string => {
    return `rgb(${r}, ${g}, ${b})`;
  },
  
  formatHsl: (h: number, s: number, l: number): string => {
    return `hsl(${h}, ${s}%, ${l}%)`;
  },
  
  formatCmyk: (c: number, m: number, y: number, k: number): string => {
    return `cmyk(${c}%, ${m}%, ${y}%, ${k}%)`;
  },
  
  formatHsv: (h: number, s: number, v: number): string => {
    return `hsv(${h}, ${s}%, ${v}%)`;
  }
};

function ColorPickerContent() {
  const [color, setColor] = useState('#000000');
  const [format, setFormat] = useState('hex');
  const [showHelp, setShowHelp] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);
  const [recentColors, setRecentColors] = useState<string[]>([]);
  const [selectedPalette, setSelectedPalette] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Show notification
  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Convert color between formats
  const convertColor = (color: string, fromFormat: string, toFormat: string) => {
    try {
      // Basic implementation
      return color;
    } catch (error) {
      showNotification('Error converting color', 'error');
      return color;
    }
  };

  // Get color in all formats for the advanced view
  const getColorFormats = (hexColor: string) => {
    const rgb = colorUtils.hexToRgb(hexColor);
    if (!rgb) return null;
    
    const { r, g, b } = rgb;
    const hsl = colorUtils.rgbToHsl(r, g, b);
    const cmyk = colorUtils.rgbToCmyk(r, g, b);
    const hsv = colorUtils.rgbToHsv(r, g, b);
    
    return {
      hex: hexColor,
      rgb: colorUtils.formatRgb(r, g, b),
      hsl: colorUtils.formatHsl(hsl.h, hsl.s, hsl.l),
      cmyk: colorUtils.formatCmyk(cmyk.c, cmyk.m, cmyk.y, cmyk.k),
      hsv: colorUtils.formatHsv(hsv.h, hsv.s, hsv.v),
      values: {
        rgb, hsl, cmyk, hsv
      }
    };
  };

  // Copy color to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showNotification('Color copied to clipboard', 'success');
  };

  // Reset color
  const resetColor = () => {
    setColor('#000000');
    showNotification('Color reset', 'info');
  };

  // Add color to recent colors
  const addToRecentColors = (color: string) => {
    setRecentColors(prev => {
      const filtered = prev.filter(c => c !== color);
      return [color, ...filtered].slice(0, 10);
    });
  };

  // Handle color change
  const handleColorChange = (newColor: string) => {
    setColor(newColor);
    addToRecentColors(newColor);
  };

  // Handle format change
  const handleFormatChange = (newFormat: string) => {
    setFormat(newFormat);
    const convertedColor = convertColor(color, format, newFormat);
    setColor(convertedColor);
  };

  // Handle palette selection
  const handlePaletteSelect = (paletteName: string) => {
    setSelectedPalette(paletteName);
    const palette = colorPalettes.find(p => p.name === paletteName);
    if (palette) {
      setRecentColors(palette.colors);
    }
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault();
        copyToClipboard(color);
      }
      
      if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        resetColor();
      }
      
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault();
        setShowHelp(!showHelp);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [color, format]);

  // Get all color formats
  const colorFormatsData = getColorFormats(color);

  return (
    <div className="container mx-auto p-4">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
          notification.type === 'success' ? 'bg-green-500 text-white' :
          notification.type === 'error' ? 'bg-red-500 text-white' :
          'bg-blue-500 text-white'
        }`}>
          {notification.message}
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <SwatchIcon className="h-6 w-6 text-blue-500" />
              Color Picker
            </CardTitle>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowHelp(!showHelp)}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                title="Show help"
              >
                <QuestionMarkCircleIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
          <CardDescription>
            Pick, convert, and manage colors in various formats
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Help panel */}
          {showHelp && (
            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-1">
                <InformationCircleIcon className="h-5 w-5 text-blue-500" />
                How to Use
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-1">Basic Usage</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Use the color picker to select a color</li>
                    <li>Choose a color format (HEX, RGB, HSL, etc.)</li>
                    <li>Copy the color value to clipboard</li>
                    <li>Save colors to your recent colors</li>
                  </ol>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Keyboard Shortcuts</h4>
                  <ul className="space-y-1 text-sm">
                    {keyboardShortcuts.map((shortcut, index) => (
                      <li key={index} className="flex justify-between">
                        <span className="font-mono bg-gray-200 dark:bg-gray-700 px-1 rounded">{shortcut.key}</span>
                        <span>{shortcut.description}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Color picker */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Color Picker</label>
                <div className="flex gap-2">
                  <div className="w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 p-1 flex items-center">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => handleColorChange(e.target.value)}
                      className="w-full h-10"
                      style={{ backgroundColor: 'transparent' }}
                    />
                  </div>
                  <button 
                    onClick={() => copyToClipboard(color)}
                    className="p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                    title="Copy color"
                  >
                    <DocumentDuplicateIcon className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={resetColor}
                    className="p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                    title="Reset color"
                  >
                    <ArrowPathIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Format</label>
                <div className="flex gap-2">
                  <select
                    value={format}
                    onChange={(e) => handleFormatChange(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:border-gray-600 text-gray-900 dark:text-white"
                  >
                    {colorFormats.map((format) => (
                      <option key={format.value} value={format.value}>
                        {format.label}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className={`p-2 rounded border transition-colors ${showAdvanced ? 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-700' : 'hover:bg-gray-200 border-gray-300 dark:hover:bg-gray-700 dark:border-gray-600'}`}
                    title={showAdvanced ? "Show simple view" : "Show advanced view"}
                  >
                    {showAdvanced ? (
                      <ChevronUpIcon className="h-5 w-5" />
                    ) : (
                      <ChevronDownIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {!showAdvanced && (
                <div>
                  <label className="block text-sm font-medium mb-1">Color Value</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={color}
                      readOnly
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md font-mono bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                    <button 
                      onClick={() => copyToClipboard(color)}
                      className="p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                      title="Copy color value"
                    >
                      <DocumentDuplicateIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}

              {showAdvanced && colorFormatsData && (
                <div className="p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900">
                  <div className="flex flex-wrap justify-between items-center mb-2">
                    <h4 className="text-sm font-medium mb-1">Color Values</h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(colorFormatsData).map(([key, value]) => {
                        if (key === 'values') return null;
                        return (
                          <button
                            key={key}
                            onClick={() => copyToClipboard(value as string)}
                            className="text-xs px-2 py-1 bg-white border border-gray-300 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700 rounded flex items-center gap-1 text-gray-900 dark:text-white"
                            title={`Copy ${key.toUpperCase()} value: ${value}`}
                          >
                            <span className="uppercase font-semibold">{key}</span>
                            <DocumentDuplicateIcon className="h-3 w-3" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs">
                    <div>
                      <span className="font-medium">RGB</span>
                      <div className="grid grid-cols-3 gap-1 mt-1">
                        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded p-1 text-center">
                          <span className="block text-gray-500 dark:text-gray-400">R</span>
                          <span className="font-semibold text-gray-900 dark:text-white">{colorFormatsData.values.rgb.r}</span>
                        </div>
                        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded p-1 text-center">
                          <span className="block text-gray-500 dark:text-gray-400">G</span>
                          <span className="font-semibold text-gray-900 dark:text-white">{colorFormatsData.values.rgb.g}</span>
                        </div>
                        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded p-1 text-center">
                          <span className="block text-gray-500 dark:text-gray-400">B</span>
                          <span className="font-semibold text-gray-900 dark:text-white">{colorFormatsData.values.rgb.b}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">HSL</span>
                      <div className="grid grid-cols-3 gap-1 mt-1">
                        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded p-1 text-center">
                          <span className="block text-gray-500 dark:text-gray-400">H</span>
                          <span className="font-semibold text-gray-900 dark:text-white">{colorFormatsData.values.hsl.h}°</span>
                        </div>
                        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded p-1 text-center">
                          <span className="block text-gray-500 dark:text-gray-400">S</span>
                          <span className="font-semibold text-gray-900 dark:text-white">{colorFormatsData.values.hsl.s}%</span>
                        </div>
                        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded p-1 text-center">
                          <span className="block text-gray-500 dark:text-gray-400">L</span>
                          <span className="font-semibold text-gray-900 dark:text-white">{colorFormatsData.values.hsl.l}%</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">CMYK</span>
                      <div className="grid grid-cols-4 gap-1 mt-1">
                        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded p-1 text-center">
                          <span className="block text-gray-500 dark:text-gray-400">C</span>
                          <span className="font-semibold text-gray-900 dark:text-white">{colorFormatsData.values.cmyk.c}%</span>
                        </div>
                        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded p-1 text-center">
                          <span className="block text-gray-500 dark:text-gray-400">M</span>
                          <span className="font-semibold text-gray-900 dark:text-white">{colorFormatsData.values.cmyk.m}%</span>
                        </div>
                        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded p-1 text-center">
                          <span className="block text-gray-500 dark:text-gray-400">Y</span>
                          <span className="font-semibold text-gray-900 dark:text-white">{colorFormatsData.values.cmyk.y}%</span>
                        </div>
                        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded p-1 text-center">
                          <span className="block text-gray-500 dark:text-gray-400">K</span>
                          <span className="font-semibold text-gray-900 dark:text-white">{colorFormatsData.values.cmyk.k}%</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">HSV</span>
                      <div className="grid grid-cols-3 gap-1 mt-1">
                        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded p-1 text-center">
                          <span className="block text-gray-500 dark:text-gray-400">H</span>
                          <span className="font-semibold text-gray-900 dark:text-white">{colorFormatsData.values.hsv.h}°</span>
                        </div>
                        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded p-1 text-center">
                          <span className="block text-gray-500 dark:text-gray-400">S</span>
                          <span className="font-semibold text-gray-900 dark:text-white">{colorFormatsData.values.hsv.s}%</span>
                        </div>
                        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded p-1 text-center">
                          <span className="block text-gray-500 dark:text-gray-400">V</span>
                          <span className="font-semibold text-gray-900 dark:text-white">{colorFormatsData.values.hsv.v}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Color Preview</h3>
                <div 
                  className="w-full h-32 rounded-lg border border-gray-300 dark:border-gray-600"
                  style={{ backgroundColor: color }}
                />
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Recent Colors</h3>
                <div className="grid grid-cols-5 gap-2">
                  {recentColors.map((recentColor, index) => (
                    <button
                      key={index}
                      onClick={() => handleColorChange(recentColor)}
                      className="w-full aspect-square rounded-lg border border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
                      style={{ backgroundColor: recentColor }}
                      title={recentColor}
                    />
                  ))}
                  {recentColors.length === 0 && (
                    <div className="col-span-5 p-4 text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600">
                      No recent colors yet. Pick a color to add it here.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Color palettes */}
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-2">Color Palettes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {colorPalettes.map((palette) => (
                <div 
                  key={palette.name}
                  className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 cursor-pointer transition-colors"
                  onClick={() => handlePaletteSelect(palette.name)}
                >
                  <h4 className="text-sm font-medium mb-2">{palette.name}</h4>
                  <div className="grid grid-cols-5 gap-1">
                    {palette.colors.map((paletteColor, index) => (
                      <div
                        key={index}
                        className="w-full aspect-square rounded border border-gray-200 dark:border-gray-700"
                        style={{ backgroundColor: paletteColor }}
                        title={paletteColor}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Export a wrapper component that uses SuspenseBoundary
export default function ColorPickerPage() {
  return (
    <SuspenseBoundary>
      <ColorPickerContent />
    </SuspenseBoundary>
  );
} 