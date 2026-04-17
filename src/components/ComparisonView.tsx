import React from 'react';
import { Download, CheckCircle } from 'lucide-react';
import type { CompressionResult } from '../hooks/useCompression';
import './ComparisonView.css';

interface ComparisonViewProps {
  result: CompressionResult;
  translations: {
    complete: string;
    original: string;
    compressed: string;
    download: string;
  };
}

const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const ComparisonView: React.FC<ComparisonViewProps> = ({ result, translations }) => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = result.compressedUrl;
    link.download = `compressed_${result.originalFile.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="comparison-view">
      <div className="success-banner">
        <CheckCircle size={20} />
        <span>{translations.complete} {result.savings.toFixed(1)}%</span>
      </div>

      <div className="preview-grid">
        <div className="preview-item">
          <div className="preview-label">{translations.original}</div>
          <div className="image-container">
            <img src={result.originalUrl} alt="Original" />
          </div>
          <div className="image-info">
            <span>{formatSize(result.originalSize)}</span>
          </div>
        </div>

        <div className="preview-item">
          <div className="preview-label">{translations.compressed}</div>
          <div className="image-container">
            <img src={result.compressedUrl} alt="Compressed" />
          </div>
          <div className="image-info">
            <span className="saved">{formatSize(result.compressedSize)}</span>
          </div>
        </div>
      </div>

      <button className="download-btn" onClick={handleDownload}>
        <Download size={20} />
        {translations.download}
      </button>
    </div>
  );
};

export default ComparisonView;
