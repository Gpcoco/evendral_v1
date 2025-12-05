'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { uploadItemImage } from '@/lib/actions/upload-actions';
import Image from 'next/image';

interface ItemImageUploadProps {
  onImageUploaded: (url: string) => void;
  currentImageUrl?: string;
}

export function ItemImageUpload({ onImageUploaded, currentImageUrl }: ItemImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate client-side
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setError('Formato non supportato. Usa PNG, JPG, JPEG, WebP o GIF');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File troppo grande. Max 5MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    const result = await uploadItemImage(formData);

    if (result.error) {
      setError(result.error);
      setPreview(null);
    } else if (result.url) {
      onImageUploaded(result.url);
    }

    setUploading(false);
  };

  const handleRemove = () => {
    setPreview(null);
    onImageUploaded('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <Label className="text-slate-300">Immagine Item</Label>
      
      {preview ? (
        <div className="relative">
          <div className="w-full h-48 rounded-lg overflow-hidden bg-slate-900/50 border-2 border-slate-700">
            <Image 
              src={preview} 
              alt="Preview" 
              fill
              className="object-contain"
              unoptimized
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="absolute top-2 right-2 bg-slate-900/80 hover:bg-slate-800 text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div className="w-full h-48 rounded-lg border-2 border-dashed border-slate-600 hover:border-slate-500 transition-colors bg-slate-900/30 flex flex-col items-center justify-center cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <ImageIcon className="w-12 h-12 text-slate-500 mb-2" />
          <p className="text-slate-400 text-sm mb-1">Clicca per caricare</p>
          <p className="text-slate-500 text-xs">PNG, JPG, WebP, GIF (max 5MB)</p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
        onChange={handleFileSelect}
        className="hidden"
      />

      {uploading && (
        <div className="text-sm text-amber-400 flex items-center gap-2">
          <Upload className="w-4 h-4 animate-pulse" />
          Upload in corso...
        </div>
      )}

      {error && (
        <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
          {error}
        </div>
      )}
    </div>
  );
}