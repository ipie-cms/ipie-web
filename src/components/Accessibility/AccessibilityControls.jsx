import { useState, useEffect } from 'react';

export default function AccessibilityControls({ isOpen, onClose }) {
  const [settings, setSettings] = useState({
    darkContrast: false,
    invert: false,
    saturation: 100,
    textSize: 100,
    highlightLinks: false,
    showImages: true,
    defaultCursor: true
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('accessibilitySettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('accessibilitySettings', JSON.stringify(settings));
    applyAccessibilitySettings();
  }, [settings]);

  // Apply accessibility settings to the document
  const applyAccessibilitySettings = () => {
    const root = document.documentElement;

    // Dark Contrast
    if (settings.darkContrast) {
      root.style.filter = (root.style.filter || '') + ' contrast(1.5)';
      document.body.style.backgroundColor = '#1a1a1a';
      document.body.style.color = '#ffffff';
    } else {
      root.style.filter = root.style.filter.replace('contrast(1.5)', '').trim();
      document.body.style.backgroundColor = '';
      document.body.style.color = '';
    }

    // Invert Colors
    if (settings.invert) {
      root.style.filter = (root.style.filter || '') + ' invert(1)';
    } else {
      root.style.filter = root.style.filter.replace('invert(1)', '').trim();
    }

    // Saturation
    root.style.filter = `${root.style.filter || ''} saturate(${settings.saturation}%)`;

    // Text Size
    root.style.fontSize = `${settings.textSize}%`;

    // Highlight Links
    const styleId = 'accessibility-links-style';
    let styleElement = document.getElementById(styleId);
    
    if (settings.highlightLinks) {
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = styleId;
        document.head.appendChild(styleElement);
      }
      styleElement.innerHTML = `
        a {
          outline: 3px solid #ff0000 !important;
          outline-offset: 2px !important;
        }
      `;
    } else {
      if (styleElement) {
        styleElement.remove();
      }
    }

    // Show/Hide Images
    const imageStyleId = 'accessibility-images-style';
    let imageStyleElement = document.getElementById(imageStyleId);
    
    if (!settings.showImages) {
      if (!imageStyleElement) {
        imageStyleElement = document.createElement('style');
        imageStyleElement.id = imageStyleId;
        document.head.appendChild(imageStyleElement);
      }
      imageStyleElement.innerHTML = `
        img {
          visibility: hidden !important;
        }
      `;
    } else {
      if (imageStyleElement) {
        imageStyleElement.remove();
      }
    }

    // Default Cursor
    if (settings.defaultCursor) {
      document.body.style.cursor = 'default';
    } else {
      document.body.style.cursor = '';
    }
  };

  const toggleSetting = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const increaseFontSize = () => {
    setSettings(prev => ({
      ...prev,
      textSize: Math.min(prev.textSize + 10, 200)
    }));
  };

  const decreaseFontSize = () => {
    setSettings(prev => ({
      ...prev,
      textSize: Math.max(prev.textSize - 10, 50)
    }));
  };

  const resetAll = () => {
    setSettings({
      darkContrast: false,
      invert: false,
      saturation: 100,
      textSize: 100,
      highlightLinks: false,
      showImages: true,
      defaultCursor: true
    });
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed bg-opacity-30 z-[9998] transition-opacity"
          onClick={onClose}
        ></div>
      )}

      {/* Right Side Drawer */}
      <div 
        className={`fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-2xl z-[9999] transition-transform duration-300 overflow-y-auto ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
            </svg>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Accessibility Controls</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {/* Controls Grid */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
            {/* Dark Contrast */}
            <button
              onClick={() => toggleSetting('darkContrast')}
              className={`p-4 sm:p-6 rounded-lg border-2 transition-all text-center ${
                settings.darkContrast
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-300 bg-white hover:border-blue-400'
              }`}
            >
              <div className="text-2xl sm:text-3xl mb-2">🔆</div>
              <div className="font-bold text-gray-900 text-xs sm:text-sm">DARK CONTRAST</div>
            </button>

            {/* Invert */}
            <button
              onClick={() => toggleSetting('invert')}
              className={`p-4 sm:p-6 rounded-lg border-2 transition-all text-center ${
                settings.invert
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-300 bg-white hover:border-blue-400'
              }`}
            >
              <div className="text-2xl sm:text-3xl mb-2">⭕</div>
              <div className="font-bold text-gray-900 text-xs sm:text-sm">INVERT</div>
            </button>

            {/* Saturation */}
            <button
              onClick={() => toggleSetting('saturation')}
              className={`p-4 sm:p-6 rounded-lg border-2 transition-all text-center ${
                settings.saturation !== 100
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-300 bg-white hover:border-blue-400'
              }`}
            >
              <div className="text-2xl sm:text-3xl mb-2">🎨</div>
              <div className="font-bold text-gray-900 text-xs sm:text-sm">SATURATION</div>
            </button>

            {/* Text Size Increase */}
            <button
              onClick={increaseFontSize}
              className={`p-4 sm:p-6 rounded-lg border-2 transition-all text-center ${
                settings.textSize > 100
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-300 bg-white hover:border-blue-400'
              }`}
            >
              <div className="text-2xl sm:text-3xl mb-2 font-bold">A+</div>
              <div className="font-bold text-gray-900 text-xs sm:text-sm">TEXT SIZE INCREASE</div>
            </button>

            {/* Text Size Decrease */}
            <button
              onClick={decreaseFontSize}
              className={`p-4 sm:p-6 rounded-lg border-2 transition-all text-center ${
                settings.textSize < 100
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-300 bg-white hover:border-blue-400'
              }`}
            >
              <div className="text-2xl sm:text-3xl mb-2 font-bold">A−</div>
              <div className="font-bold text-gray-900 text-xs sm:text-sm">TEXT SIZE DECREASE</div>
            </button>

            {/* Highlight Links */}
            <button
              onClick={() => toggleSetting('highlightLinks')}
              className={`p-4 sm:p-6 rounded-lg border-2 transition-all text-center ${
                settings.highlightLinks
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-300 bg-white hover:border-blue-400'
              }`}
            >
              <div className="text-2xl sm:text-3xl mb-2">🔗</div>
              <div className="font-bold text-gray-900 text-xs sm:text-sm">HIGHLIGHT LINKS</div>
            </button>

            {/* Show Images */}
            <button
              onClick={() => toggleSetting('showImages')}
              className={`p-4 sm:p-6 rounded-lg border-2 transition-all text-center ${
                !settings.showImages
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-300 bg-white hover:border-blue-400'
              }`}
            >
              <div className="text-2xl sm:text-3xl mb-2">🖼️</div>
              <div className="font-bold text-gray-900 text-xs sm:text-sm">SHOW IMAGES</div>
            </button>

            {/* Default Cursor */}
            <button
              onClick={() => toggleSetting('defaultCursor')}
              className={`p-4 sm:p-6 rounded-lg border-2 transition-all text-center ${
                settings.defaultCursor
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-300 bg-white hover:border-blue-400'
              }`}
            >
              <div className="text-2xl sm:text-3xl mb-2">👆</div>
              <div className="font-bold text-gray-900 text-xs sm:text-sm">DEFAULT CURSOR</div>
            </button>
          </div>

          {/* Reset Button */}
          <button
            onClick={resetAll}
            className="w-full px-4 py-2 sm:py-3 bg-gray-200 text-gray-900 font-medium rounded-lg hover:bg-gray-300 transition-colors text-sm sm:text-base"
          >
            Reset All
          </button>

          {/* Info */}
          <div className="mt-4 p-3 sm:p-4 bg-blue-50 rounded-lg text-xs sm:text-sm text-gray-700 border border-blue-200">
            <p className="font-medium mb-1">💡 Settings Auto-Saved</p>
            <p>Your preferences are saved automatically and will be remembered on your next visit.</p>
          </div>
        </div>
      </div>
    </>
  );
}