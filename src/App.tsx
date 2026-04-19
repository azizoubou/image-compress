import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Image as ImageIcon, Zap, Shield, Repeat, Globe, Share2, Copy, Mail, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import DropZone from './components/DropZone';
import ControlPanel from './components/ControlPanel';
import ComparisonView from './components/ComparisonView';
import { useCompression } from './hooks/useCompression';
import type { CompressionSettings } from './hooks/useCompression';
import { translations } from './translations';
import type { Language } from './translations';
import './App.css';

// SEO Component for dynamic Helmet meta tags
const SEO = ({ lang }: { lang: Language }) => {
  const t = translations[lang];
  const location = useLocation();
  const canonicalUrl = `https://optipress.io${location.pathname}`;

  return (
    <Helmet>
      <html lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'} />
      <title>{t.metaTitle}</title>
      <meta name="description" content={t.metaDescription} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={t.metaTitle} />
      <meta property="og:description" content={t.metaDescription} />
      <meta property="og:image" content="https://optipress.io/og-image.png" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonicalUrl} />
      <meta property="twitter:title" content={t.metaTitle} />
      <meta property="twitter:description" content={t.metaDescription} />
      <meta property="twitter:image" content="https://optipress.io/og-image.png" />

      <link rel="canonical" href={canonicalUrl} />
      
      {/* Language Alternates for SEO */}
      <link rel="alternate" hrefLang="en" href="https://optipress.io/en" />
      <link rel="alternate" hrefLang="ar" href="https://optipress.io/ar" />
      <link rel="alternate" hrefLang="fr" href="https://optipress.io/fr" />
      <link rel="alternate" hrefLang="x-default" href="https://optipress.io/en" />
    </Helmet>
  );
};

// Main Application Content
const AppContent = () => {
  const { lang = 'en' } = useParams<{ lang: string }>();
  const currentLang = (['en', 'ar', 'fr'].includes(lang) ? lang : 'en') as Language;
  const t = translations[currentLang];
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [settings, setSettings] = useState<CompressionSettings>({
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  });

  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { compressImage, isCompressing, result, error, reset } = useCompression();

  useEffect(() => {
    // JSON-LD Structured Data
    const schemaData = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "OptiPress",
      "operatingSystem": "Any",
      "applicationCategory": "MultimediaApplication",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "description": t.metaDescription
    };

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": t.faqQ1,
          "acceptedAnswer": { "@type": "Answer", "text": t.faqA1 }
        },
        {
          "@type": "Question",
          "name": t.faqQ2,
          "acceptedAnswer": { "@type": "Answer", "text": t.faqA2 }
        },
        {
          "@type": "Question",
          "name": t.faqQ3,
          "acceptedAnswer": { "@type": "Answer", "text": t.faqA3 }
        }
      ]
    };

    const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
    existingScripts.forEach(script => script.remove());

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify([schemaData, faqSchema]);
    document.head.appendChild(script);
  }, [currentLang, t]);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    reset();
  };

  const handleCompress = () => {
    if (selectedFile) {
      compressImage(selectedFile, settings);
    }
  };

  const handleStartOver = () => {
    setSelectedFile(null);
    reset();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: t.brand,
          text: t.slogan,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleCopyLink = () => {
    if (result) {
      navigator.clipboard.writeText(result.compressedUrl);
      alert('Download link copied!');
    }
  };

  const changeLanguage = (newLang: string) => {
    const newPath = location.pathname.replace(`/${currentLang}`, `/${newLang}`);
    navigate(newPath);
  };

  return (
    <div className={`app-container ${currentLang === 'ar' ? 'rtl' : ''}`}>
      <SEO lang={currentLang} />
      
      <nav className="top-nav">
        <Link to={`/${currentLang}`} className="brand-nav">
          <ImageIcon size={24} />
          <span>{t.brand}</span>
        </Link>
        <div className="nav-controls">
          <div className="lang-nav">
            <Globe size={18} />
            <button className={currentLang === 'en' ? 'active' : ''} onClick={() => changeLanguage('en')}>EN</button>
            <button className={currentLang === 'fr' ? 'active' : ''} onClick={() => changeLanguage('fr')}>FR</button>
            <button className={currentLang === 'ar' ? 'active' : ''} onClick={() => changeLanguage('ar')}>AR</button>
          </div>
          <button className="share-btn-nav" onClick={handleShare}>
            <Share2 size={18} />
          </button>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={
          <>
            <header className="app-header">
              <div className="logo-container">
                <ImageIcon className="logo-icon" size={48} />
                <h1>{t.brand}</h1>
              </div>
              <p>{t.slogan}</p>
            </header>

            <main className="app-main">
              {!result ? (
                <div className="compression-workflow">
                  <DropZone 
                    onFileSelect={handleFileSelect} 
                    translations={{
                      title: t.dropZoneTitle,
                      sub: t.dropZoneSub,
                      hint: t.dropZoneHint
                    }}
                  />
                  
                  {selectedFile && (
                    <div className="selected-file-info">
                      <span>{t.selected}: <strong>{selectedFile.name}</strong></span>
                      <button onClick={() => setSelectedFile(null)}>{t.change}</button>
                    </div>
                  )}

                  <ControlPanel 
                    settings={settings}
                    setSettings={setSettings}
                    onCompress={handleCompress}
                    isCompressing={isCompressing}
                    disabled={!selectedFile}
                    translations={{
                      title: t.settingsTitle,
                      maxSize: t.maxFileSize,
                      maxWidth: t.maxWidthHeight,
                      compress: t.compressBtn,
                      compressing: t.compressingBtn
                    }}
                  />
                </div>
              ) : (
                <div className="result-workflow">
                  <ComparisonView 
                    result={result} 
                    translations={{
                      complete: t.complete,
                      original: t.original,
                      compressed: t.compressed,
                      download: t.downloadBtn
                    }}
                  />
                  <div className="result-actions">
                    <button className="secondary-btn" onClick={handleCopyLink}>
                      <Copy size={18} />
                      {t.copyResult}
                    </button>
                    <button className="start-over-btn" onClick={handleStartOver}>
                      <Repeat size={18} />
                      {t.compressAnother}
                    </button>
                  </div>
                </div>
              )}

              {error && <div className="error-message">{error}</div>}

              <section className="features-grid">
                <div className="feature-card">
                  <span title={t.altLightning}><Zap className="feature-icon" /></span>
                  <h3>{t.lightningFast}</h3>
                  <p>{t.lightningFastDesc}</p>
                </div>
                <div className="feature-card">
                  <span title={t.altPrivate}><Shield className="feature-icon" /></span>
                  <h3>{t.oneHundredPrivate}</h3>
                  <p>{t.privacyStatement}</p>
                </div>
                <div className="feature-card">
                  <span title={t.altQuality}><ImageIcon className="feature-icon" /></span>
                  <h3>{t.highQuality}</h3>
                  <p>{t.highQualityDesc}</p>
                </div>
              </section>

              <section className="guide-section">
                <h2>{t.guideTitle}</h2>
                <p className="guide-intro">{t.guideIntro}</p>
                <div className="guide-grid">
                  <div className="guide-card">
                    <h3>{t.guideStep1Title}</h3>
                    <p>{t.guideStep1Content}</p>
                  </div>
                  <div className="guide-card">
                    <h3>{t.guideStep2Title}</h3>
                    <p>{t.guideStep2Content}</p>
                  </div>
                  <div className="guide-card">
                    <h3>{t.guideStep3Title}</h3>
                    <p>{t.guideStep3Content}</p>
                  </div>
                </div>
              </section>

              <section className="faq-section">
                <h2>{t.faqTitle}</h2>
                <div className="faq-list">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <div key={num} className={`faq-item ${openFaq === num ? 'open' : ''}`}>
                      <button className="faq-question" onClick={() => setOpenFaq(openFaq === num ? null : num)}>
                        <span>{t[`faqQ${num}` as keyof typeof t]}</span>
                        {openFaq === num ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                      {openFaq === num && (
                        <div className="faq-answer">
                          <p>{t[`faqA${num}` as keyof typeof t]}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </main>
          </>
        } />
        
        <Route path="/privacy" element={
          <div className="content-page">
            <Link to={`/${currentLang}`} className="back-btn">← Back</Link>
            <section className="legal-section">
              <h1>{t.privacyPolicy}</h1>
              <p>{t.privacyPolicyContent}</p>
              <p>{t.privacyStatement}</p>
            </section>
          </div>
        } />
        
        <Route path="/terms" element={
          <div className="content-page">
            <Link to={`/${currentLang}`} className="back-btn">← Back</Link>
            <section className="legal-section">
              <h1>{t.termsOfService}</h1>
              <p>{t.termsContent}</p>
            </section>
          </div>
        } />
        
        <Route path="/contact" element={
          <div className="content-page">
            <Link to={`/${currentLang}`} className="back-btn">← Back</Link>
            <section className="contact-section">
              <h1>{t.contactUs}</h1>
              <div className="contact-grid">
                <div className="contact-info">
                  <div className="contact-method">
                    <Mail className="contact-icon" />
                    <div>
                      <h3>Email</h3>
                      <p>support@optipress.io</p>
                    </div>
                  </div>
                  <div className="contact-method">
                    <MessageSquare className="contact-icon" />
                    <div>
                      <h3>{t.contactTitle}</h3>
                      <p>{t.contactEmail}</p>
                    </div>
                  </div>
                </div>
                <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
                  <div className="form-group">
                    <label>{t.contactFormName}</label>
                    <input type="text" placeholder="John Doe" />
                  </div>
                  <div className="form-group">
                    <label>{t.contactFormEmail}</label>
                    <input type="email" placeholder="john@example.com" />
                  </div>
                  <div className="form-group">
                    <label>{t.contactFormMessage}</label>
                    <textarea rows={4} placeholder="How can we help?"></textarea>
                  </div>
                  <button type="submit" className="submit-btn">{t.contactFormSend}</button>
                </form>
              </div>
            </section>
          </div>
        } />
      </Routes>

      <footer className="app-footer">
        <div className="footer-links">
          <Link to={`/${currentLang}/privacy`}>{t.privacyPolicy}</Link>
          <Link to={`/${currentLang}/terms`}>{t.termsOfService}</Link>
          <Link to={`/${currentLang}/contact`}>{t.contactUs}</Link>
        </div>
        <p>&copy; 2026 {t.brand}. {t.privacyStatement}</p>
        <div className="footer-badges">
          <span className="badge">100% Client-Side</span>
          <span className="badge">No Server Uploads</span>
          <span className="badge">GDPR Compliant</span>
        </div>
      </footer>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect from root to /en or detected browser language */}
        <Route path="/" element={<Navigate to="/en" replace />} />
        
        {/* Language-based Routing */}
        <Route path="/:lang/*" element={<AppContent />} />
        
        {/* Fallback for unknown routes */}
        <Route path="*" element={<Navigate to="/en" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
