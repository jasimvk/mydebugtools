'use client';

import { useState, useRef } from 'react';
import { 
  DocumentTextIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  ClipboardIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  ChartBarIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

interface OptimizationOptions {
  removeComments: boolean;
  removeMetadata: boolean;
  removeHiddenElements: boolean;
  removeEmptyAttributes: boolean;
  removeWhitespace: boolean;
  convertStyleToAttrs: boolean;
  removeUselessDefs: boolean;
  cleanupIDs: boolean;
  minifyColors: boolean;
  convertPathData: boolean;
  mergePaths: boolean;
  removeTitle: boolean;
  removeDesc: boolean;
}

interface Stats {
  originalSize: number;
  optimizedSize: number;
  reduction: number;
  reductionPercentage: number;
}

export default function SVGOptimizer() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [options, setOptions] = useState<OptimizationOptions>({
    removeComments: true,
    removeMetadata: true,
    removeHiddenElements: true,
    removeEmptyAttributes: true,
    removeWhitespace: true,
    convertStyleToAttrs: false,
    removeUselessDefs: true,
    cleanupIDs: true,
    minifyColors: true,
    convertPathData: true,
    mergePaths: false,
    removeTitle: false,
    removeDesc: false,
  });

  const calculateStats = (original: string, optimized: string): Stats => {
    const originalSize = new Blob([original]).size;
    const optimizedSize = new Blob([optimized]).size;
    const reduction = originalSize - optimizedSize;
    const reductionPercentage = originalSize > 0 ? (reduction / originalSize) * 100 : 0;

    return {
      originalSize,
      optimizedSize,
      reduction,
      reductionPercentage,
    };
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const optimizeSVG = (svg: string, opts: OptimizationOptions): string => {
    let optimized = svg;

    // Remove XML comments
    if (opts.removeComments) {
      optimized = optimized.replace(/<!--[\s\S]*?-->/g, '');
    }

    // Remove metadata tags
    if (opts.removeMetadata) {
      optimized = optimized.replace(/<metadata[\s\S]*?<\/metadata>/gi, '');
    }

    // Remove title tags
    if (opts.removeTitle) {
      optimized = optimized.replace(/<title[\s\S]*?<\/title>/gi, '');
    }

    // Remove desc tags
    if (opts.removeDesc) {
      optimized = optimized.replace(/<desc[\s\S]*?<\/desc>/gi, '');
    }

    // Remove hidden elements (display:none, visibility:hidden, opacity:0)
    if (opts.removeHiddenElements) {
      optimized = optimized.replace(/<[^>]*(?:display\s*:\s*none|visibility\s*:\s*hidden)[^>]*>[\s\S]*?<\/[^>]+>/gi, '');
    }

    // Remove empty attributes
    if (opts.removeEmptyAttributes) {
      optimized = optimized.replace(/\s+[a-zA-Z-]+=""\s*/g, ' ');
      
      // Also remove default attribute values that don't need to be specified
      const defaultValues: Record<string, string> = {
        'fill-opacity': '1',
        'stroke-opacity': '1',
        'opacity': '1',
        'stroke-width': '1',
        'fill-rule': 'nonzero',
      };
      
      Object.entries(defaultValues).forEach(([attr, defaultVal]) => {
        const regex = new RegExp(`\\s+${attr}="${defaultVal}"`, 'g');
        optimized = optimized.replace(regex, '');
      });
    }

    // Remove unnecessary whitespace
    if (opts.removeWhitespace) {
      // Remove whitespace between tags
      optimized = optimized.replace(/>\s+</g, '><');
      // Remove leading/trailing whitespace
      optimized = optimized.trim();
      // Collapse multiple spaces to single space in attributes
      optimized = optimized.replace(/\s{2,}/g, ' ');
    }

    // Remove useless defs (empty defs or defs with unused IDs)
    if (opts.removeUselessDefs) {
      optimized = optimized.replace(/<defs\s*>\s*<\/defs>/gi, '');
    }

    // Cleanup IDs (remove unused IDs)
    if (opts.cleanupIDs) {
      // Find all IDs
      const idMatches = optimized.matchAll(/\s+id="([^"]*)"/g);
      const ids = Array.from(idMatches).map(match => match[1]);
      
      // Check which IDs are actually used
      ids.forEach(id => {
        const isUsed = optimized.includes(`url(#${id})`) || 
                      optimized.includes(`href="#${id}`) ||
                      optimized.includes(`xlink:href="#${id}`) ||
                      optimized.includes(`fill="url(#${id}`)  ||
                      optimized.includes(`stroke="url(#${id}`);
        
        // Remove unused IDs
        if (!isUsed) {
          const regex = new RegExp(`\\s+id="${id}"`, 'g');
          optimized = optimized.replace(regex, '');
        }
      });
    }

    // Minify colors (convert rgb to hex, shorten hex codes, replace named colors)
    if (opts.minifyColors) {
      // Convert rgb(r,g,b) to hex
      optimized = optimized.replace(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/gi, (match, r, g, b) => {
        const toHex = (n: string) => {
          const hex = parseInt(n).toString(16);
          return hex.length === 1 ? '0' + hex : hex;
        };
        const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
        // Try to shorten hex if possible
        if (hex[1] === hex[2] && hex[3] === hex[4] && hex[5] === hex[6]) {
          return `#${hex[1]}${hex[3]}${hex[5]}`;
        }
        return hex;
      });

      // Shorten hex colors (#aabbcc to #abc)
      optimized = optimized.replace(/#([0-9a-f])\1([0-9a-f])\2([0-9a-f])\3/gi, '#$1$2$3');
      
      // Replace common named colors with shorter hex equivalents
      const colorMap: Record<string, string> = {
        'white': '#fff',
        'black': '#000',
        'red': '#f00',
        'lime': '#0f0',
        'blue': '#00f',
        'yellow': '#ff0',
        'cyan': '#0ff',
        'magenta': '#f0f',
      };
      
      Object.entries(colorMap).forEach(([name, hex]) => {
        const regex = new RegExp(`(['"])${name}\\1`, 'gi');
        optimized = optimized.replace(regex, `$1${hex}$1`);
      });
    }

    // Convert path data (remove unnecessary precision and optimize numbers)
    if (opts.convertPathData) {
      optimized = optimized.replace(/d="([^"]*)"/g, (match, pathData) => {
        // Round numbers to 2 decimal places
        let optimizedPath = pathData.replace(/(\d+\.\d{3,})/g, (num: string) => {
          return parseFloat(num).toFixed(2);
        });
        
        // Remove unnecessary leading zeros (0.5 stays, but 0.0 becomes 0)
        optimizedPath = optimizedPath.replace(/\b0\.0+\b/g, '0');
        
        // Remove trailing zeros after decimal point (1.50 -> 1.5)
        optimizedPath = optimizedPath.replace(/(\.\d*?)0+\b/g, '$1');
        
        // Remove decimal point if no decimals left (1. -> 1)
        optimizedPath = optimizedPath.replace(/\.(\s|[A-Za-z])/g, '$1');
        
        // Remove spaces around command letters and numbers
        optimizedPath = optimizedPath.replace(/\s+/g, ' ').trim();
        
        return `d="${optimizedPath}"`;
      });
    }

    // Convert style attributes to presentation attributes (simplified)
    if (opts.convertStyleToAttrs) {
      optimized = optimized.replace(/style="([^"]*)"/g, (match, styleContent) => {
        let attrs = '';
        const styles = styleContent.split(';').filter((s: string) => s.trim());
        styles.forEach((style: string) => {
          const [prop, value] = style.split(':').map((s: string) => s.trim());
          if (prop && value) {
            // Convert CSS property names to SVG attribute names
            const attrName = prop.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
            attrs += ` ${attrName}="${value}"`;
          }
        });
        return attrs.trim();
      });
    }

    return optimized;
  };

  const handleOptimize = () => {
    try {
      setIsLoading(true);
      setError('');
      setCopySuccess(false);

      if (!input.trim()) {
        setError('Please enter SVG code');
        setIsLoading(false);
        return;
      }

      // Check if input contains <svg tag
      if (!input.includes('<svg')) {
        setError('Invalid SVG: Missing <svg> tag');
        setIsLoading(false);
        return;
      }

      // Check for basic SVG structure validity
      const svgTagCount = (input.match(/<svg/gi) || []).length;
      const svgCloseTagCount = (input.match(/<\/svg>/gi) || []).length;
      
      if (svgTagCount > svgCloseTagCount) {
        setError('Invalid SVG: Unclosed <svg> tag');
        setIsLoading(false);
        return;
      }

      const optimized = optimizeSVG(input, options);
      
      // Verify the optimized SVG is still valid
      if (!optimized.includes('<svg')) {
        setError('Optimization failed: Result is not a valid SVG');
        setIsLoading(false);
        return;
      }
      
      setOutput(optimized);
      
      const calculatedStats = calculateStats(input, optimized);
      setStats(calculatedStats);

      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to optimize SVG');
      setOutput('');
      setStats(null);
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      setError('');
      setCopySuccess(false);

      if (!file.name.endsWith('.svg')) {
        throw new Error('Please upload an SVG file (.svg extension required)');
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        throw new Error('File is too large. Maximum size is 5MB');
      }

      const text = await file.text();
      
      // Validate SVG content
      if (!text.includes('<svg')) {
        throw new Error('Invalid SVG file: Missing <svg> tag');
      }
      
      setInput(text);
      
      // Auto-optimize after upload
      setTimeout(() => {
        const optimized = optimizeSVG(text, options);
        setOutput(optimized);
        const calculatedStats = calculateStats(text, optimized);
        setStats(calculatedStats);
        setIsLoading(false);
      }, 100);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to read file');
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      setError('Failed to copy to clipboard');
    }
  };

  const handleDownload = () => {
    try {
      const blob = new Blob([output], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'optimized.svg';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download file');
    }
  };

  const handleReset = () => {
    setInput('');
    setOutput('');
    setError('');
    setStats(null);
    setCopySuccess(false);
  };

  const toggleOption = (option: keyof OptimizationOptions) => {
    setOptions(prev => ({ ...prev, [option]: !prev[option] }));
  };

  const presetConfigs = {
    maximum: () => setOptions({
      removeComments: true,
      removeMetadata: true,
      removeHiddenElements: true,
      removeEmptyAttributes: true,
      removeWhitespace: true,
      convertStyleToAttrs: true,
      removeUselessDefs: true,
      cleanupIDs: true,
      minifyColors: true,
      convertPathData: true,
      mergePaths: true,
      removeTitle: true,
      removeDesc: true,
    }),
    safe: () => setOptions({
      removeComments: true,
      removeMetadata: true,
      removeHiddenElements: true,
      removeEmptyAttributes: true,
      removeWhitespace: true,
      convertStyleToAttrs: false,
      removeUselessDefs: true,
      cleanupIDs: false,
      minifyColors: true,
      convertPathData: true,
      mergePaths: false,
      removeTitle: false,
      removeDesc: false,
    }),
    minimal: () => setOptions({
      removeComments: true,
      removeMetadata: false,
      removeHiddenElements: false,
      removeEmptyAttributes: true,
      removeWhitespace: true,
      convertStyleToAttrs: false,
      removeUselessDefs: false,
      cleanupIDs: false,
      minifyColors: false,
      convertPathData: false,
      mergePaths: false,
      removeTitle: false,
      removeDesc: false,
    }),
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <DocumentTextIcon className="h-8 w-8 text-[#FF6C37]" />
            <h1 className="text-3xl font-bold text-gray-900">SVG Optimizer</h1>
          </div>
          <p className="text-gray-600">
            Optimize and minify your SVG files. Remove unnecessary code, reduce file size, and improve performance.
          </p>
        </div>

        {/* Optimization Presets */}
        <div className="mb-6 flex flex-wrap gap-3">
          <button
            onClick={presetConfigs.safe}
            className="px-4 py-2 bg-[#FF6C37] text-white rounded-lg hover:bg-[#ff5722] transition-colors text-sm font-medium"
          >
            Safe (Recommended)
          </button>
          <button
            onClick={presetConfigs.maximum}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
          >
            Maximum Optimization
          </button>
          <button
            onClick={presetConfigs.minimal}
            className="px-4 py-2 bg-gray-50 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
          >
            Minimal
          </button>
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="px-4 py-2 bg-gray-50 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium flex items-center gap-2"
          >
            <Cog6ToothIcon className="h-4 w-4" />
            {showOptions ? 'Hide' : 'Show'} Options
          </button>
        </div>

        {/* Options Panel */}
        {showOptions && (
          <div className="mb-6 bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Optimization Options</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(options).map(([key, value]) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={() => toggleOption(key as keyof OptimizationOptions)}
                    className="w-4 h-4 text-[#FF6C37] rounded focus:ring-[#FF6C37] border-gray-300"
                  />
                  <span className="text-sm text-gray-700">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        {stats && (
          <div className="mb-6 bg-[#FFF5F2] rounded-lg p-4 border border-[#FFD4C8]">
            <div className="flex items-center gap-2 mb-3">
              <ChartBarIcon className="h-5 w-5 text-[#FF6C37]" />
              <h3 className="text-lg font-semibold text-gray-900">Optimization Results</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-600 mb-1">Original Size</p>
                <p className="text-lg font-bold text-gray-900">{formatBytes(stats.originalSize)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Optimized Size</p>
                <p className="text-lg font-bold text-gray-900">{formatBytes(stats.optimizedSize)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Reduced By</p>
                <p className="text-lg font-bold text-gray-900">{formatBytes(stats.reduction)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Percentage</p>
                <p className="text-lg font-bold text-[#FF6C37]">{stats.reductionPercentage.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <XCircleIcon className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">Input SVG</h2>
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".svg"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 text-xs bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors flex items-center gap-1.5"
                >
                  <ArrowUpTrayIcon className="h-4 w-4" />
                  Upload
                </button>
                <button
                  onClick={handleReset}
                  className="px-3 py-1.5 text-xs bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors flex items-center gap-1.5"
                >
                  <ArrowPathIcon className="h-4 w-4" />
                  Clear
                </button>
              </div>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your SVG code here or upload an SVG file..."
              className="w-full h-96 p-4 font-mono text-sm text-gray-900 focus:outline-none resize-none"
              spellCheck={false}
            />
            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
              <button
                onClick={handleOptimize}
                disabled={isLoading || !input.trim()}
                className="w-full px-4 py-2 bg-[#FF6C37] text-white rounded-lg hover:bg-[#ff5722] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isLoading ? 'Optimizing...' : 'Optimize SVG'}
              </button>
            </div>
          </div>

          {/* Output Section */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">Optimized SVG</h2>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  disabled={!output}
                  className="px-3 py-1.5 text-xs bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
                >
                  {copySuccess ? (
                    <>
                      <CheckCircleIcon className="h-4 w-4 text-green-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <ClipboardIcon className="h-4 w-4" />
                      Copy
                    </>
                  )}
                </button>
                <button
                  onClick={handleDownload}
                  disabled={!output}
                  className="px-3 py-1.5 text-xs bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
                >
                  <ArrowDownTrayIcon className="h-4 w-4" />
                  Download
                </button>
              </div>
            </div>
            <textarea
              value={output}
              readOnly
              placeholder="Optimized SVG will appear here..."
              className="w-full h-96 p-4 font-mono text-sm text-gray-900 bg-gray-50 focus:outline-none resize-none"
              spellCheck={false}
            />
          </div>
        </div>

        {/* Preview Section */}
        {output && input && (
          <div className="mt-6 bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-gray-900">Visual Comparison</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-8">
              <div>
                <p className="text-xs text-gray-500 mb-3 font-medium">Original</p>
                <div className="bg-gray-50 rounded-lg p-6 flex items-center justify-center min-h-[200px] border-2 border-dashed border-gray-300">
                  <div 
                    dangerouslySetInnerHTML={{ __html: input }}
                    className="max-w-full max-h-[300px]"
                  />
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-3 font-medium">Optimized</p>
                <div className="bg-gray-50 rounded-lg p-6 flex items-center justify-center min-h-[200px] border-2 border-dashed border-green-300">
                  <div 
                    dangerouslySetInnerHTML={{ __html: output }}
                    className="max-w-full max-h-[300px]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Features & Tips */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Features</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <CheckCircleIcon className="h-5 w-5 text-[#FF6C37] flex-shrink-0 mt-0.5" />
                <span>Remove comments, metadata, and unnecessary code</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircleIcon className="h-5 w-5 text-[#FF6C37] flex-shrink-0 mt-0.5" />
                <span>Minify colors and optimize path data</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircleIcon className="h-5 w-5 text-[#FF6C37] flex-shrink-0 mt-0.5" />
                <span>Remove hidden and empty elements</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircleIcon className="h-5 w-5 text-[#FF6C37] flex-shrink-0 mt-0.5" />
                <span>Live preview of optimized SVG</span>
              </li>
            </ul>
          </div>

          <div className="bg-[#FFF5F2] rounded-lg p-6 border border-[#FFD4C8]">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Tips</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="font-semibold text-[#FF6C37]">•</span>
                <span>Use "Safe" preset for production-ready optimization</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-[#FF6C37]">•</span>
                <span>Test the output SVG to ensure it renders correctly</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-[#FF6C37]">•</span>
                <span>Keep title and desc tags for accessibility</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-[#FF6C37]">•</span>
                <span>Maximum optimization may break some complex SVGs</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
