'use client';

import { useState, useEffect } from 'react';
import { 
  CommandLineIcon, 
  ClipboardIcon, 
  ArrowDownTrayIcon,
  ArrowPathIcon,
  PhotoIcon,
  WrenchIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

export default function Base64Tools() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [isImage, setIsImage] = useState(false);
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formattingStatus, setFormattingStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const cleanBase64 = (input: string): string => {
    try {
      // Remove malformed prefix
      const malformedPrefix = /^dataimage\/[a-zA-Z]+base64/;
      if (input.match(malformedPrefix)) {
        input = input.replace(malformedPrefix, '');
      }

      // Remove all whitespace, line breaks, and special characters
      input = input.replace(/[\s\r\n\t]/g, '');

      // Remove any non-Base64 characters
      input = input.replace(/[^A-Za-z0-9+/=]/g, '');

      // Ensure proper padding
      const padding = input.length % 4;
      if (padding) {
        input += '='.repeat(4 - padding);
      }

      // Validate the cleaned string
      if (!/^[A-Za-z0-9+/]+={0,2}$/.test(input)) {
        throw new Error('Invalid Base64 characters');
      }

      // Check if the string is too short to be a valid image
      if (input.length < 20) {
        throw new Error('Base64 string is too short to be a valid image');
      }

      return input;
    } catch (err) {
      throw new Error('Failed to clean Base64 string');
    }
  };

  const formatBase64 = () => {
    try {
      setFormattingStatus('idle');
      const cleaned = cleanBase64(input);
      
      // Just set the cleaned Base64 string without any prefix
      setInput(cleaned);
      setError('');
      setFormattingStatus('success');
      
      // If auto-update is enabled, the conversion will happen automatically
      if (!autoUpdate) {
        convertBase64ToImage();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to format Base64 string');
      setFormattingStatus('error');
    }
  };

  const convertBase64ToImage = () => {
    try {
      setIsLoading(true);
      if (!input.trim()) {
        setOutput('');
        setError('Please enter a Base64 string');
        setIsImage(false);
        return;
      }

      const cleanedInput = cleanBase64(input);
      const imageData = `data:image/png;base64,${cleanedInput}`;
      
      // Test if the image data is valid by creating an image element
      const img = new Image();
      img.onload = () => {
        setOutput(imageData);
        setIsImage(true);
        setError('');
        setIsLoading(false);
      };
      img.onerror = () => {
        throw new Error('Invalid image data');
      };
      img.src = imageData;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to convert Base64 to image');
      setOutput('');
      setIsImage(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (autoUpdate && input.trim()) {
      convertBase64ToImage();
    }
  }, [input, autoUpdate]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(output);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const downloadImage = () => {
    if (!isImage || !output) return;
    
    const link = document.createElement('a');
    link.href = output;
    link.download = 'converted-image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Base64 to PNG Converter</h1>
          <p className="text-gray-600">Convert Base64 strings to PNG images instantly</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={autoUpdate}
              onChange={(e) => setAutoUpdate(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Auto Update
          </label>
          {output && (
            <>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <ClipboardIcon className="h-5 w-5" />
                Copy
              </button>
              <button
                onClick={downloadImage}
                className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <ArrowDownTrayIcon className="h-5 w-5" />
                Download
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">
              Base64 String
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">PNG</span>
              <button
                onClick={formatBase64}
                className={`flex items-center gap-2 text-sm px-3 py-1 rounded-lg transition-colors ${
                  formattingStatus === 'success' 
                    ? 'bg-green-100 text-green-700' 
                    : formattingStatus === 'error'
                    ? 'bg-red-100 text-red-700'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
                title="Format Base64 string"
              >
                <WrenchIcon className="h-4 w-4" />
                Format
              </button>
            </div>
          </div>
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setFormattingStatus('idle');
              }}
              placeholder="Enter Base64 string or paste PNG data URL..."
              className="w-full h-[300px] p-4 font-mono text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {!autoUpdate && (
              <button
                onClick={convertBase64ToImage}
                className="absolute bottom-4 right-4 flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <CommandLineIcon className="h-5 w-5" />
                Convert
              </button>
            )}
          </div>
          {(error || formattingStatus === 'success') && (
            <div className={`flex items-center gap-2 text-sm mt-2 ${
              error ? 'text-red-500' : 'text-green-500'
            }`}>
              {error ? (
                <>
                  <ExclamationCircleIcon className="h-4 w-4" />
                  <span>{error}</span>
                </>
              ) : (
                <span>Base64 string formatted successfully</span>
              )}
            </div>
          )}
        </div>

        {/* Output */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            PNG Preview
          </label>
          <div className="w-full h-[300px] p-4 bg-gray-50 border border-gray-200 rounded-lg overflow-auto flex items-center justify-center">
            {isLoading ? (
              <div className="flex items-center gap-2 text-gray-500">
                <ArrowPathIcon className="h-5 w-5 animate-spin" />
                Converting...
              </div>
            ) : error ? (
              <span className="text-red-500">{error}</span>
            ) : isImage ? (
              <img 
                src={output} 
                alt="Converted PNG" 
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <div className="text-gray-400 flex items-center gap-2">
                <PhotoIcon className="h-5 w-5" />
                PNG will appear here
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 