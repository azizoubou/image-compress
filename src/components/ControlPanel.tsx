import React from 'react';
import { Settings, Shield as ShieldCheck } from 'lucide-react';
import type { CompressionSettings } from '../hooks/useCompression';
import './ControlPanel.css';

interface ControlPanelProps {
  settings: CompressionSettings;
  setSettings: (settings: CompressionSettings) => void;
  onCompress: () => void;
  isCompressing: boolean;
  disabled: boolean;
  translations: {
    title: string;
    maxSize: string;
    maxWidth: string;
    compress: string;
    compressing: string;
    forumMode: string;
    forumModeDesc: string;
  };
}

const ControlPanel: React.FC<ControlPanelProps> = ({ 
  settings, 
  setSettings, 
  onCompress,
  isCompressing,
  disabled,
  translations
}) => {
  return (
    <div className={`control-panel ${disabled ? 'disabled' : ''}`}>
      <div className="panel-header">
        <Settings size={20} />
        <span>{translations.title}</span>
      </div>

      <div className="forum-mode-toggle" onClick={() => !disabled && !isCompressing && setSettings({...settings, forumMode: !settings.forumMode})}>
        <div className={`toggle-box ${settings.forumMode ? 'active' : ''}`}>
          <ShieldCheck size={18} />
          <div className="toggle-text">
            <strong>{translations.forumMode}</strong>
            <p>{translations.forumModeDesc}</p>
          </div>
          <div className="switch">
            <div className="slider"></div>
          </div>
        </div>
      </div>
      
      {!settings.forumMode && (
        <>
          <div className="setting-item">
            <label>
              {translations.maxSize}: <span>{settings.maxSizeMB} MB</span>
            </label>
            <input 
              type="range" 
              min="0.1" 
              max="10" 
              step="0.1"
              value={settings.maxSizeMB}
              onChange={(e) => setSettings({...settings, maxSizeMB: parseFloat(e.target.value)})}
              disabled={disabled || isCompressing}
            />
          </div>

          <div className="setting-item">
            <label>
              {translations.maxWidth}: <span>{settings.maxWidthOrHeight} px</span>
            </label>
            <input 
              type="range" 
              min="500" 
              max="4000" 
              step="100"
              value={settings.maxWidthOrHeight}
              onChange={(e) => setSettings({...settings, maxWidthOrHeight: parseInt(e.target.value)})}
              disabled={disabled || isCompressing}
            />
          </div>
        </>
      )}

      <button 
        className="compress-btn" 
        onClick={onCompress}
        disabled={disabled || isCompressing}
      >
        {isCompressing ? translations.compressing : translations.compress}
      </button>
    </div>
  );
};

export default ControlPanel;
