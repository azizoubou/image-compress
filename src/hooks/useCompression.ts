import { useState } from 'react';
import imageCompression from 'browser-image-compression';

export interface CompressionSettings {
  maxSizeMB: number;
  maxWidthOrHeight: number;
  useWebWorker: boolean;
  forumMode?: boolean;
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
      let compressedBlob: Blob;

      if (settings.forumMode) {
        // Forum Mode Algorithm: Loop quality and scale until < 10KB
        const targetSize = 10 * 1024; // 10KB
        let quality = 0.8;
        let scale = 1.0;
        let currentBlob: Blob = file;

        // Use a canvas-based approach for fine-grained control in a loop
        const img = await imageCompression.drawFileInCanvas(file);
        const [canvas] = img;

        while (true) {
          const tempCanvas = document.createElement('canvas');
          const ctx = tempCanvas.getContext('2d')!;
          tempCanvas.width = canvas.width * scale;
          tempCanvas.height = canvas.height * scale;
          ctx.drawImage(canvas, 0, 0, tempCanvas.width, tempCanvas.height);

          currentBlob = await new Promise((resolve) => {
            tempCanvas.toBlob((b) => resolve(b!), 'image/jpeg', quality);
          });

          if (currentBlob.size < targetSize) {
            break;
          }

          if (quality > 0.2) {
            quality -= 0.1;
          } else {
            scale *= 0.9;
            quality = 0.8; // Reset quality for new scale
          }

          if (scale < 0.05) break; // Safety break
        }
        compressedBlob = currentBlob;
      } else {
        const options = {
          maxSizeMB: settings.maxSizeMB,
          maxWidthOrHeight: settings.maxWidthOrHeight,
          useWebWorker: settings.useWebWorker,
        };
        compressedBlob = await imageCompression(file, options);
      }

      const compressedFile = new File([compressedBlob], file.name, {
        type: 'image/jpeg',
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
      setError('errorCompression');
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
