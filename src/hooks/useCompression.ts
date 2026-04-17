import { useState } from 'react';
import imageCompression from 'browser-image-compression';

export interface CompressionSettings {
  maxSizeMB: number;
  maxWidthOrHeight: number;
  useWebWorker: boolean;
}

export interface CompressionResult {
  originalFile: File;
  compressedFile: File;
  originalSize: number;
  compressedSize: number;
  savings: number;
  originalUrl: string;
  compressedUrl: string;
}

export const useCompression = () => {
  const [isCompressing, setIsCompressing] = useState(false);
  const [result, setResult] = useState<CompressionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const compressImage = async (file: File, settings: CompressionSettings) => {
    setIsCompressing(true);
    setError(null);
    
    try {
      const options = {
        maxSizeMB: settings.maxSizeMB,
        maxWidthOrHeight: settings.maxWidthOrHeight,
        useWebWorker: settings.useWebWorker,
      };

      const compressedBlob = await imageCompression(file, options);
      const compressedFile = new File([compressedBlob], file.name, {
        type: file.type,
        lastModified: Date.now(),
      });

      const originalUrl = URL.createObjectURL(file);
      const compressedUrl = URL.createObjectURL(compressedFile);

      const res: CompressionResult = {
        originalFile: file,
        compressedFile: compressedFile,
        originalSize: file.size,
        compressedSize: compressedFile.size,
        savings: ((file.size - compressedFile.size) / file.size) * 100,
        originalUrl,
        compressedUrl,
      };

      setResult(res);
    } catch (err) {
      setError('Failed to compress image. Please try again.');
      console.error(err);
    } finally {
      setIsCompressing(false);
    }
  };

  const reset = () => {
    if (result) {
      URL.revokeObjectURL(result.originalUrl);
      URL.revokeObjectURL(result.compressedUrl);
    }
    setResult(null);
    setError(null);
  };

  return { compressImage, isCompressing, result, error, reset };
};
