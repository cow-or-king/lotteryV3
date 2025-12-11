'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MAX_LOGO_FILE_SIZE, ACCEPTED_LOGO_FORMATS } from '@/lib/types/qr-code.types';

/**
 * Props for the QRCodeLogoUpload component
 */
interface QRCodeLogoUploadProps {
  /** Current logo URL (file URL or external URL) */
  logoUrl: string | null;
  /** Logo size in pixels */
  logoSize: number;
  /** Callback when logo changes (file upload or URL input) */
  onLogoChange: (url: string | null, file: File | null) => void;
  /** Callback when logo size changes */
  onLogoSizeChange: (size: number) => void;
}

/**
 * Component for uploading and managing QR code logos
 * Supports file upload and URL input with validation and preview
 */
export default function QRCodeLogoUpload({
  logoUrl,
  logoSize,
  onLogoChange,
  onLogoSizeChange,
}: QRCodeLogoUploadProps) {
  const { toast } = useToast();
  const [inputMode, setInputMode] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Validates file format and size
   */
  const validateFile = (file: File): boolean => {
    // Check file format
    if (!ACCEPTED_LOGO_FORMATS.includes(file.type)) {
      toast({
        title: 'Invalid file format',
        description: 'Please upload a PNG, JPEG, SVG, or WebP image.',
        variant: 'error',
      });
      return false;
    }

    // Check file size
    if (file.size > MAX_LOGO_FILE_SIZE) {
      const maxSizeMB = MAX_LOGO_FILE_SIZE / (1024 * 1024);
      toast({
        title: 'File too large',
        description: `Maximum file size is ${maxSizeMB}MB.`,
        variant: 'error',
      });
      return false;
    }

    return true;
  };

  /**
   * Handles file selection from input
   */
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    if (validateFile(file)) {
      const url = URL.createObjectURL(file);
      onLogoChange(url, file);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * Handles drag and drop events
   */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) {
      return;
    }

    if (validateFile(file)) {
      const url = URL.createObjectURL(file);
      onLogoChange(url, file);
    }
  };

  /**
   * Handles URL input submission
   */
  const handleUrlSubmit = () => {
    if (!urlInput.trim()) {
      toast({
        title: 'Invalid URL',
        description: 'Please enter a valid image URL.',
        variant: 'error',
      });
      return;
    }

    onLogoChange(urlInput.trim(), null);
    setUrlInput('');
  };

  /**
   * Removes the current logo
   */
  const handleRemoveLogo = () => {
    onLogoChange(null, null);
    setUrlInput('');
  };

  return (
    <div className="space-y-3">
      {/* Title */}
      <label className="block text-sm font-semibold text-gray-800">Logo (Optionnel)</label>

      {/* Input Mode Toggle */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setInputMode('upload')}
          className={`flex-1 px-3 py-1.5 rounded-lg transition-all font-medium text-xs ${
            inputMode === 'upload'
              ? 'bg-purple-500/20 backdrop-blur-sm border border-purple-400/40 shadow-lg text-gray-900'
              : 'bg-white/10 backdrop-blur-sm border border-gray-300/30 hover:bg-white/20 text-gray-800'
          }`}
        >
          Upload File
        </button>
        <button
          type="button"
          onClick={() => setInputMode('url')}
          className={`flex-1 px-3 py-1.5 rounded-lg transition-all font-medium text-xs ${
            inputMode === 'url'
              ? 'bg-purple-500/20 backdrop-blur-sm border border-purple-400/40 shadow-lg text-gray-900'
              : 'bg-white/10 backdrop-blur-sm border border-gray-300/30 hover:bg-white/20 text-gray-800'
          }`}
        >
          From URL
        </button>
      </div>

      {/* File Upload Area */}
      {inputMode === 'upload' && !logoUrl && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-lg p-4 text-center transition-all cursor-pointer ${
            isDragging
              ? 'border-purple-400 bg-purple-500/10 backdrop-blur-sm'
              : 'border-gray-300 bg-white/10 backdrop-blur-sm hover:bg-white/20'
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_LOGO_FORMATS.join(',')}
            onChange={handleFileChange}
            className="hidden"
          />
          <div>
            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-600" />
            <p className="text-sm font-medium mb-1 text-gray-900">Drop logo or click</p>
            <p className="text-xs text-gray-700">PNG, JPEG, SVG, WebP • Max 2MB</p>
          </div>
        </div>
      )}

      {/* URL Input Area */}
      {inputMode === 'url' && !logoUrl && (
        <div className="space-y-3">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
            placeholder="Enter image URL..."
            className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder:text-gray-500"
          />
          <button
            type="button"
            onClick={handleUrlSubmit}
            className="w-full px-4 py-2 bg-purple-500/20 backdrop-blur-sm border border-purple-400/40 rounded-lg hover:bg-purple-500/30 transition-all font-medium text-gray-900"
          >
            Load from URL
          </button>
          <p className="text-sm text-gray-700 text-center">
            Formats: PNG, JPEG, SVG, WebP • Max 2MB
          </p>
        </div>
      )}

      {/* Logo Preview */}
      {logoUrl && (
        <div className="bg-white/10 backdrop-blur-sm border border-gray-300/30 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-900">Logo Preview</span>
            <button
              type="button"
              onClick={handleRemoveLogo}
              className="p-1 hover:bg-red-500/20 rounded-lg transition-all group"
              aria-label="Remove logo"
            >
              <X className="w-4 h-4 text-gray-600 group-hover:text-red-600" />
            </button>
          </div>
          <div className="flex justify-center p-2 bg-white/20 rounded-lg">
            <img
              src={logoUrl}
              alt="Logo preview"
              style={{ width: logoSize, height: logoSize }}
              className="object-contain"
            />
          </div>
        </div>
      )}

      {/* Logo Size Slider */}
      {logoUrl && (
        <div className="bg-white/10 backdrop-blur-sm border border-gray-300/30 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-gray-900">Logo Size</label>
            <span className="text-xs font-medium text-gray-700">{logoSize}px</span>
          </div>
          <input
            type="range"
            min="40"
            max="400"
            step="10"
            value={logoSize}
            onChange={(e) => onLogoSizeChange(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <style jsx>{`
            .slider::-webkit-slider-thumb {
              appearance: none;
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              cursor: pointer;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
            }
            .slider::-moz-range-thumb {
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              cursor: pointer;
              border: none;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
