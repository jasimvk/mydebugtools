'use client';

import { useState, useEffect, Suspense } from 'react';
import { 
  CommandLineIcon, 
  ClipboardIcon, 
  ArrowDownTrayIcon,
  ArrowPathIcon,
  PhotoIcon,
  WrenchIcon,
  ExclamationCircleIcon,
  DocumentIcon,
  ArrowUpTrayIcon
} from '@heroicons/react/24/outline';

function Base64ConverterContent() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [isImage, setIsImage] = useState(false);
  const [isPdf, setIsPdf] = useState(false);
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formattingStatus, setFormattingStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [conversionMode, setConversionMode] = useState<'text' | 'file'>('text');
  const [fileType, setFileType] = useState<'image' | 'pdf'>('image');
  const [outputType, setOutputType] = useState<'image' | 'pdf'>('image');

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
      setInput(cleaned);
      setError('');
      setFormattingStatus('success');
      if (!autoUpdate && conversionMode === 'text') {
        convertBase64ToOutput();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to format Base64 string');
      setFormattingStatus('error');
    }
  };

  const convertBase64ToOutput = () => {
    try {
      setIsLoading(true);
      if (!input.trim()) {
        setOutput('');
        setError('Please enter a Base64 string');
        setIsImage(false);
        setIsPdf(false);
        setIsLoading(false);
        return;
      }
      const cleanedInput = cleanBase64(input);
      if (outputType === 'image') {
        const imageData = `data:image/png;base64,${cleanedInput}`;
        const img = new window.Image();
        img.onload = () => {
          setOutput(imageData);
          setIsImage(true);
          setIsPdf(false);
          setError('');
          setIsLoading(false);
        };
        img.onerror = () => {
          setError('Invalid image data');
          setOutput('');
          setIsImage(false);
          setIsPdf(false);
          setIsLoading(false);
        };
        img.src = imageData;
      } else {
        // PDF
        const pdfData = `data:application/pdf;base64,${cleanedInput}`;
        setOutput(pdfData);
        setIsPdf(true);
        setIsImage(false);
        setError('');
        setIsLoading(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to convert Base64');
      setOutput('');
      setIsImage(false);
      setIsPdf(false);
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      setError('');

      // Validate file type
      if (fileType === 'image' && !file.type.startsWith('image/')) {
        throw new Error('Please upload an image file');
      }
      if (fileType === 'pdf' && file.type !== 'application/pdf') {
        throw new Error('Please upload a PDF file');
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        // Remove the data URL prefix (e.g., "data:image/png;base64,")
        const base64String = result.split(',')[1];
        setInput(base64String);
        setOutput(base64String);
        setFormattingStatus('success');
        
        if (fileType === 'image') {
          setIsImage(true);
          setIsPdf(false);
        } else {
          setIsImage(false);
          setIsPdf(true);
        }
        setIsLoading(false);
      };

      reader.onerror = () => {
        setError('Failed to read file');
        setIsLoading(false);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (autoUpdate && input.trim() && conversionMode === 'text') {
      convertBase64ToOutput();
    }
  }, [input, autoUpdate, outputType, conversionMode]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(output);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const downloadFile = () => {
    if ((!isImage && !isPdf) || !output) return;
    
    const link = document.createElement('a');
    link.href = output;
    link.download = `converted-file.${isPdf ? 'pdf' : 'png'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Base64 Converter</h1>
          <p className="text-gray-600">Convert between Base64 and files (images/PDFs)</p>
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
                onClick={downloadFile}
                className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <ArrowDownTrayIcon className="h-5 w-5" />
                Download
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setConversionMode('text')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              conversionMode === 'text'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Text to Base64
          </button>
          <button
            onClick={() => setConversionMode('file')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              conversionMode === 'file'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            File to Base64
          </button>
        </div>
        {conversionMode === 'text' && (
          <select
            value={outputType}
            onChange={e => setOutputType(e.target.value as 'image' | 'pdf')}
            className="ml-4 px-3 py-2 border rounded-lg text-sm bg-white"
          >
            <option value="image">Image</option>
            <option value="pdf">PDF</option>
          </select>
        )}
        {conversionMode === 'file' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFileType('image')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                fileType === 'image'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <PhotoIcon className="h-5 w-5 inline-block mr-1" />
              Image
            </button>
            <button
              onClick={() => setFileType('pdf')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                fileType === 'pdf'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <DocumentIcon className="h-5 w-5 inline-block mr-1" />
              PDF
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">
              {conversionMode === 'text' ? 'Base64 String' : 'File Upload'}
            </label>
            {conversionMode === 'text' && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{isPdf ? 'PDF' : 'PNG'}</span>
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
            )}
          </div>
          <div className="relative">
            {conversionMode === 'text' ? (
              <textarea
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setFormattingStatus('idle');
                }}
                placeholder="Enter Base64 string or paste data URL..."
                className="w-full h-[300px] p-4 font-mono text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <div className="w-full h-[300px] p-4 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center">
                <label className="flex flex-col items-center gap-4 cursor-pointer">
                  <div className="p-4 rounded-full bg-gray-100">
                    <ArrowUpTrayIcon className="h-8 w-8 text-gray-600" />
                  </div>
                  <span className="text-sm text-gray-600">
                    Click to upload {fileType === 'image' ? 'an image' : 'a PDF'}
                  </span>
                  <input
                    type="file"
                    accept={fileType === 'image' ? 'image/*' : 'application/pdf'}
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}
            {conversionMode === 'text' && !autoUpdate && (
              <button
                onClick={convertBase64ToOutput}
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
            {conversionMode === 'text' ? (outputType === 'pdf' ? 'PDF Preview' : 'Image Preview') : (isPdf ? 'PDF Preview' : 'Image Preview')}
          </label>
          <div className="w-full h-[300px] p-4 bg-gray-50 border border-gray-200 rounded-lg overflow-auto flex items-center justify-center">
            {isLoading ? (
              <div className="flex items-center gap-2 text-gray-500">
                <ArrowPathIcon className="h-5 w-5 animate-spin" />
                Converting...
              </div>
            ) : error ? (
              <span className="text-red-500">{error}</span>
            ) : ((conversionMode === 'text' ? outputType === 'image' : isImage)) ? (
              <img 
                src={output}
                alt="Converted Image" 
                className="max-w-full max-h-full object-contain"
              />
            ) : ((conversionMode === 'text' ? outputType === 'pdf' : isPdf)) ? (
              <iframe
                src={output}
                title="PDF Preview"
                className="w-full h-full rounded"
              />
            ) : (
              <div className="text-gray-400 flex items-center gap-2">
                <PhotoIcon className="h-5 w-5" />
                Preview will appear here
              </div>
            )}
          </div>
          {/* Base64 Output */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Base64 Output</label>
            <div className="flex gap-2 items-start">
              <textarea
                value={output}
                readOnly
                className="w-full h-32 p-2 font-mono text-xs bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Base64 output will appear here..."
              />
              <button
                onClick={() => { navigator.clipboard.writeText(output); }}
                className="flex-shrink-0 flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs"
                title="Copy Base64"
              >
                <ClipboardIcon className="h-4 w-4" />
                Copy
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Base64Converter() {
  return (
    <div className="container mx-auto p-4">
      <Suspense fallback={
        <div className="flex items-center justify-center h-[600px] bg-gray-50 rounded-lg">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="text-gray-600 font-medium">Loading Base64 Converter...</p>
          </div>
        </div>
      }>
        <Base64ConverterContent />
      </Suspense>
    </div>
  );
} 