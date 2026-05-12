import React from 'react';
import { useLanguage, Language } from '../contexts/LanguageContext';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'vi' ? 'en' : 'vi');
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white font-medium text-sm"
      title={language === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
    >
      <Globe className="w-4 h-4" />
      <span className="uppercase font-bold">{language}</span>
    </button>
  );
}
