/**
 * Logo Upload Field Component
 * Composant d'upload de logo pour les commerces
 * IMPORTANT: ZERO any types
 */

'use client';

import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { useRef, useState } from 'react';
import { ACCEPTED_LOGO_FORMATS, MAX_LOGO_FILE_SIZE } from '@/lib/types/qr-code.types';

interface LogoUploadFieldProps {
  logoFile: File | null;
  logoPreviewUrl: string | null;
  onChange: (file: File | null, previewUrl: string | null) => void;
  error?: string;
  disabled?: boolean;
}

export function LogoUploadField({
  logoFile,
  logoPreviewUrl,
  onChange,
  error,
  disabled = false,
}: LogoUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (file: File) => {
    // Validation taille
    if (file.size > MAX_LOGO_FILE_SIZE) {
      onChange(null, null);
      return;
    }

    // Validation format
    if (!ACCEPTED_LOGO_FORMATS.includes(file.type)) {
      onChange(null, null);
      return;
    }

    // Créer preview URL
    const previewUrl = URL.createObjectURL(file);
    onChange(file, previewUrl);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) {
      return;
    }

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemove = () => {
    if (logoPreviewUrl) {
      URL.revokeObjectURL(logoPreviewUrl);
    }
    onChange(null, null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Logo de l'enseigne</label>

      {/* Upload zone */}
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-2 border-dashed rounded-xl transition-all cursor-pointer
          ${isDragging ? 'border-purple-600 bg-purple-50' : 'border-gray-300 hover:border-purple-400'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${error ? 'border-red-500' : ''}
        `}
      >
        {logoPreviewUrl ? (
          // Preview
          <div className="relative p-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                <img src={logoPreviewUrl} alt="Logo preview" className="max-w-full max-h-full" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{logoFile?.name}</p>
                <p className="text-xs text-gray-500">
                  {logoFile && (logoFile.size / 1024).toFixed(0)} KB
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                disabled={disabled}
                className="p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5 text-red-600" />
              </button>
            </div>
          </div>
        ) : (
          // Upload zone
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {isDragging ? (
                <Upload className="w-8 h-8 text-purple-600" />
              ) : (
                <ImageIcon className="w-8 h-8 text-purple-600" />
              )}
            </div>
            <p className="text-sm font-medium text-gray-800 mb-1">
              {isDragging ? 'Déposez le fichier ici' : 'Cliquez ou glissez-déposez'}
            </p>
            <p className="text-xs text-gray-500">PNG, JPG, SVG ou WebP (max 2MB)</p>
          </div>
        )}

        {/* Hidden input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_LOGO_FORMATS.join(',')}
          onChange={handleFileChange}
          disabled={disabled}
          className="hidden"
        />
      </div>

      {/* Error message */}
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}

      {/* Info */}
      <p className="text-xs text-gray-500 mt-2">
        Le logo sera stocké dans Supabase Storage et affiché sur le QR Code et dans la roue
      </p>
    </div>
  );
}
