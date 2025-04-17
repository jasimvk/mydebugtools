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

export default function ColorPickerPage() {
  const [color, setColor] = useState('#000000');
  const [format, setFormat] = useState('hex');
  const [showHelp, setShowHelp] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);
  const [recentColors, setRecentColors] = useState<string[]>([]);
  const [selectedPalette, setSelectedPalette] = useState<string | null>(null);

  // Show notification
  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Convert color between formats
  const convertColor = (color: string, fromFormat: string, toFormat: string) => {
    try {
      // Implementation will be added
      return color;
    } catch (error) {
      showNotification('Error converting color', 'error');
      return color;
    }
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
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="w-full h-10 p-1 border rounded-md"
                  />
                  <button 
                    onClick={() => copyToClipboard(color)}
                    className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                    title="Copy color"
                  >
                    <DocumentDuplicateIcon className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={resetColor}
                    className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                    title="Reset color"
                  >
                    <ArrowPathIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Color Format</label>
                <select 
                  value={format} 
                  onChange={(e) => handleFormatChange(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  {colorFormats.map(format => (
                    <option key={format.value} value={format.value}>{format.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Color Value</label>
                <input
                  type="text"
                  value={color}
                  readOnly
                  className="w-full p-2 border rounded-md font-mono bg-gray-50 dark:bg-gray-800"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Color Preview</h3>
                <div 
                  className="w-full h-32 rounded-lg border"
                  style={{ backgroundColor: color }}
                />
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Recent Colors</h3>
                <div className="grid grid-cols-5 gap-2">
                  {recentColors.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => handleColorChange(color)}
                      className="w-full aspect-square rounded-lg border"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
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
                  className="p-4 border rounded-lg hover:border-blue-500 cursor-pointer"
                  onClick={() => handlePaletteSelect(palette.name)}
                >
                  <h4 className="text-sm font-medium mb-2">{palette.name}</h4>
                  <div className="grid grid-cols-5 gap-1">
                    {palette.colors.map((color, index) => (
                      <div
                        key={index}
                        className="w-full aspect-square rounded"
                        style={{ backgroundColor: color }}
                        title={color}
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