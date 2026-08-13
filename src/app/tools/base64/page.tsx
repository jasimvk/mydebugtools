'use client';

import { useState, useRef } from 'react';
import { 
  ArrowsRightLeftIcon,
  ClipboardIcon, 
  ArrowDownTrayIcon,
  PhotoIcon,
  DocumentIcon,
  ArrowUpTrayIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

export default function Base64Tools() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [isImage, setIsImage] = useState(false);
  const [isPdf, setIsPdf] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [conversionMode, setConversionMode] = useState<'encode' | 'decode'>('encode');
  const [fileType, setFileType] = useState<'image' | 'pdf' | 'text'>('text');
  const [copySuccess, setCopySuccess] = useState(false);
  const [decodedText, setDecodedText] = useState('');
  const [decodedMime, setDecodedMime] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const INVALID_BASE64 = 'Invalid Base64 string';

  const cleanBase64 = (value: string): string => {
    let cleaned = value.trim();
    // Only a data: URI carries a payload after a comma; a bare comma is just
    // ordinary text and must not be treated as a prefix separator.
    if (cleaned.startsWith('data:') && cleaned.includes(',')) {
      cleaned = cleaned.slice(cleaned.indexOf(',') + 1);
    }
    // Line breaks are stripped (wrapped Base64 is common) but spaces are not:
    // stripping them would silently turn arbitrary prose into "valid" Base64.
    cleaned = cleaned.replace(/[\r\n\t]/g, '').replace(/-/g, '+').replace(/_/g, '/');

    const remainder = cleaned.length % 4;
    if (remainder === 1) throw new Error(INVALID_BASE64);
    if (remainder) cleaned += '='.repeat(4 - remainder);

    if (!cleaned || !/^[A-Za-z0-9+/]+={0,2}$/.test(cleaned)) {
      throw new Error(INVALID_BASE64);
    }
    return cleaned;
  };

  const base64ToBytes = (value: string) => {
    let binary: string;
    try {
      binary = atob(value);
    } catch {
      throw new Error(INVALID_BASE64);
    }
    return Uint8Array.from(binary, (char) => char.charCodeAt(0));
  };

  const bytesToBase64 = (bytes: Uint8Array) => {
    let binary = '';
    const chunkSize = 0x8000;
    for (let index = 0; index < bytes.length; index += chunkSize) {
      binary += String.fromCharCode(...bytes.slice(index, index + chunkSize));
    }
    return btoa(binary);
  };

  const textToBase64 = (value: string) => bytesToBase64(new TextEncoder().encode(value));

  const base64ToText = (value: string) => {
    // fatal so that non-UTF-8 payloads surface as an error instead of mojibake
    return new TextDecoder('utf-8', { fatal: true }).decode(base64ToBytes(value));
  };

  // Any change to the source invalidates the previous result; leaving it on
  // screen makes a stale conversion indistinguishable from a fresh one.
  const handleInputChange = (value: string) => {
    setInput(value);
    setOutput('');
    setError('');
    setDecodedText('');
    setDecodedMime('');
    setIsImage(false);
    setIsPdf(false);
  };

  const encodeText = () => {
    setError('');
    setIsImage(false);
    setIsPdf(false);
    setDecodedText('');
    setOutput(textToBase64(input));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileField = event.target;
    const file = fileField.files?.[0];
    // Reset so re-picking the same file still fires a change event
    fileField.value = '';
    if (!file) return;

    try {
      setIsLoading(true);
      setError('');

      if (fileType === 'text') {
        throw new Error('Switch to Image or PDF before uploading a file');
      }
      if (fileType === 'image' && !file.type.startsWith('image/')) {
        throw new Error('Please upload an image file');
      }
      if (fileType === 'pdf' && file.type !== 'application/pdf') {
        throw new Error('Please upload a PDF file');
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        const base64String = result.split(',')[1];
        setOutput(base64String);
        setInput(result);
        
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

  const decodeBase64 = () => {
    try {
      setIsLoading(true);
      setError('');
      
      if (!input.trim()) {
        setError('Please enter a Base64 string');
        setIsLoading(false);
        return;
      }

      const cleanedInput = cleanBase64(input);
      
      if (fileType === 'text') {
        // Decode to plain text
        try {
          const decodedString = base64ToText(cleanedInput);
          setDecodedText(decodedString);
          setOutput(decodedString);
          setDecodedMime('text/plain');
          setIsImage(false);
          setIsPdf(false);
          setError('');
          setIsLoading(false);
        } catch (err) {
          setError('Invalid Base64 string. Make sure it represents valid text data.');
          setOutput('');
          setDecodedText('');
          setIsImage(false);
          setIsPdf(false);
          setIsLoading(false);
        }
      } else if (fileType === 'image') {
        // Try to detect image type from the decoded data
        const detectImageType = (base64: string): string => {
          // Decode first few bytes to check magic numbers
          try {
            const decoded = atob(base64.substring(0, 20));
            const bytes = new Uint8Array([...decoded].map(c => c.charCodeAt(0)));
            
            // PNG: 89 50 4E 47
            if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
              return 'image/png';
            }
            // JPEG: FF D8 FF
            if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
              return 'image/jpeg';
            }
            // GIF: 47 49 46
            if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
              return 'image/gif';
            }
            // WebP: 52 49 46 46 (RIFF)
            if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) {
              return 'image/webp';
            }
            // SVG: <svg or <?xml
            if (decoded.includes('<svg') || decoded.includes('<?xml')) {
              return 'image/svg+xml';
            }
            // Default to PNG
            return 'image/png';
          } catch {
            return 'image/png';
          }
        };

        const mimeType = detectImageType(cleanedInput);
        const imageData = `data:${mimeType};base64,${cleanedInput}`;
        const img = new window.Image();
        
        img.onload = () => {
          setOutput(imageData);
          setDecodedMime(mimeType);
          setIsImage(true);
          setIsPdf(false);
          setError('');
          setIsLoading(false);
        };
        
        img.onerror = () => {
          setError('Invalid image Base64 data. Make sure the Base64 string represents a valid image.');
          setOutput('');
          setIsImage(false);
          setIsPdf(false);
          setIsLoading(false);
        };
        
        img.src = imageData;
      } else {
        // A non-PDF payload would render as a silently blank iframe, so check
        // the %PDF signature before handing it to the viewer.
        const header = base64ToBytes(cleanedInput.slice(0, 8));
        const isPdfSignature =
          header[0] === 0x25 && header[1] === 0x50 && header[2] === 0x44 && header[3] === 0x46;
        if (!isPdfSignature) {
          setError('Invalid PDF Base64 data. The decoded content is not a PDF file.');
          setOutput('');
          setIsPdf(false);
          setIsImage(false);
          setIsLoading(false);
          return;
        }

        const pdfData = `data:application/pdf;base64,${cleanedInput}`;
        setOutput(pdfData);
        setDecodedMime('application/pdf');
        setIsPdf(true);
        setIsImage(false);
        setError('');
        setIsLoading(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to decode Base64');
      setOutput('');
      setIsImage(false);
      setIsPdf(false);
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      const textToCopy = output;
      await navigator.clipboard.writeText(textToCopy);
      setCopySuccess(true);
      setError('');
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? `Failed to copy: ${err.message}` : 'Failed to copy to clipboard');
    }
  };

  const extensionForMime = (mime: string) => {
    const map: Record<string, string> = {
      'image/png': 'png',
      'image/jpeg': 'jpg',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'image/svg+xml': 'svg',
      'application/pdf': 'pdf'
    };
    return map[mime] ?? 'bin';
  };

  const downloadFile = () => {
    if (!output) return;
    
    const link = document.createElement('a');
    
    if (conversionMode === 'encode') {
      const blob = new Blob([output], { type: 'text/plain' });
      link.href = URL.createObjectURL(blob);
      link.download = 'base64-output.txt';
    } else {
      if (fileType === 'text') {
        const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
        link.href = URL.createObjectURL(blob);
        link.download = 'decoded-text.txt';
      } else {
        link.href = output;
        link.download = `converted-file.${extensionForMime(decodedMime || (isPdf ? 'application/pdf' : 'image/png'))}`;
      }
    }
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
    setError('');
    setIsImage(false);
    setIsPdf(false);
    setDecodedText('');
    setDecodedMime('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const switchMode = () => {
    setConversionMode(prev => {
      const nextMode = prev === 'encode' ? 'decode' : 'encode';
      setFileType('text');
      return nextMode;
    });
    clearAll();
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Base64 Converter</h1>
            <p className="text-sm text-gray-500 mt-1">
              {conversionMode === 'encode' ? 'Encode text, images, and PDFs to Base64' : 'Decode Base64 as text, image, or PDF'}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={switchMode}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              title="Switch conversion mode"
            >
              <ArrowsRightLeftIcon className="h-4 w-4" />
              {conversionMode === 'encode' ? 'Switch to Decode' : 'Switch to Encode'}
            </button>
            
            {output && (
              <>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  title="Copy to clipboard"
                >
                  {copySuccess ? (
                    <>
                      <CheckCircleIcon className="h-4 w-4 text-green-600" />
                      <span className="text-green-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <ClipboardIcon className="h-4 w-4" />
                      Copy
                    </>
                  )}
                </button>
                
                <button
                  onClick={downloadFile}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  title="Download"
                >
                  <ArrowDownTrayIcon className="h-4 w-4" />
                  Download
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <div className="flex-1 flex flex-col border-b border-gray-200 md:border-b-0 md:border-r">
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-gray-700">
                {conversionMode === 'encode' ? 'Upload File' : 'Base64 Input'}
              </h2>
              
              {conversionMode === 'encode' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFileType('text')}
                    className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                      fileType === 'text'
                        ? 'bg-[#2563eb] text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <DocumentIcon className="h-3.5 w-3.5" />
                    Text
                  </button>
                  <button
                    onClick={() => setFileType('image')}
                    className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                      fileType === 'image'
                        ? 'bg-[#2563eb] text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <PhotoIcon className="h-3.5 w-3.5" />
                    Image
                  </button>
                  <button
                    onClick={() => setFileType('pdf')}
                    className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                      fileType === 'pdf'
                        ? 'bg-[#2563eb] text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <DocumentIcon className="h-3.5 w-3.5" />
                    PDF
                  </button>
                  {fileType === 'text' && (
                    <button
                      onClick={encodeText}
                      className="px-3 py-1.5 text-xs font-medium bg-[#2563eb] text-white rounded hover:bg-[#0550ae] transition-colors"
                    >
                      Encode
                    </button>
                  )}
                </div>
              )}
              
              {conversionMode === 'decode' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFileType('text')}
                    className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                      fileType === 'text'
                        ? 'bg-[#2563eb] text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <DocumentIcon className="h-3.5 w-3.5" />
                    Text
                  </button>
                  <button
                    onClick={() => setFileType('image')}
                    className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                      fileType === 'image'
                        ? 'bg-[#2563eb] text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <PhotoIcon className="h-3.5 w-3.5" />
                    Image
                  </button>
                  <button
                    onClick={() => setFileType('pdf')}
                    className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                      fileType === 'pdf'
                        ? 'bg-[#2563eb] text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <DocumentIcon className="h-3.5 w-3.5" />
                    PDF
                  </button>
                  <button
                    onClick={decodeBase64}
                    className="px-3 py-1.5 text-xs font-medium bg-[#2563eb] text-white rounded hover:bg-[#0550ae] transition-colors"
                  >
                    Decode
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex-1 overflow-auto p-6">
            {conversionMode === 'encode' ? (
              <div className="h-full flex items-center justify-center">
                {fileType === 'text' ? (
                  <textarea
                    value={input}
                    onChange={(e) => handleInputChange(e.target.value)}
                    aria-label="Text to encode"
                    placeholder="Type or paste text to encode as Base64..."
                    className="w-full h-full p-4 font-mono text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb] resize-none"
                  />
                ) : input ? (
                  <div className="w-full h-full flex flex-col">
                    <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      {isImage ? (
                        <img 
                          src={input}
                          alt="Uploaded" 
                          className="max-w-full max-h-full object-contain"
                        />
                      ) : isPdf ? (
                        <iframe
                          src={input}
                          title="PDF Preview"
                          className="w-full h-full rounded"
                        />
                      ) : null}
                    </div>
                    <div className="mt-4 flex justify-center gap-2">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                      >
                        Change File
                      </button>
                      <button
                        onClick={clearAll}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 hover:border-[#2563eb] transition-colors">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 rounded-full bg-white border border-gray-200">
                        <ArrowUpTrayIcon className="h-8 w-8 text-gray-400" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-900">
                          Click to upload {fileType === 'image' ? 'an image' : 'a PDF'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {fileType === 'image' ? 'PNG, JPG, GIF, SVG' : 'PDF files only'}
                        </p>
                      </div>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={fileType === 'image' ? 'image/*' : 'application/pdf'}
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            ) : (
              <textarea
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                aria-label="Base64 string to decode"
                placeholder="Paste your Base64 encoded string here..."
                className="w-full h-full p-4 font-mono text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb] resize-none"
              />
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-gray-700">
                {conversionMode === 'encode' ? 'Base64 Output' : 'Decoded Preview'}
              </h2>
              
              {error && (
                <div role="alert" className="flex items-center gap-1 text-xs text-red-600">
                  <XCircleIcon className="h-4 w-4" />
                  {error}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex-1 overflow-auto p-6">
            {isLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-[#2563eb]"></div>
                  Processing...
                </div>
              </div>
            ) : output ? (
              conversionMode === 'encode' ? (
                <div className="h-full">
                  <textarea
                    value={output}
                    readOnly
                    aria-label="Base64 output"
                    className="w-full h-full p-4 font-mono text-xs bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb] resize-none"
                  />
                </div>
              ) : (
                <div className="h-full">
                  {fileType === 'text' ? (
                    <textarea
                      value={output}
                      readOnly
                      aria-label="Decoded text output"
                      className="w-full h-full p-4 font-mono text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb] resize-none"
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      {isImage ? (
                        <img 
                          src={output}
                          alt="Decoded" 
                          className="max-w-full max-h-full object-contain"
                        />
                      ) : isPdf ? (
                        <iframe
                          src={output}
                          title="PDF Preview"
                          className="w-full h-full rounded"
                        />
                      ) : null}
                    </div>
                  )}
                </div>
              )
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <PhotoIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">
                    {conversionMode === 'encode' ? 'Base64 output will appear here' : 'Preview will appear here'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
