import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'vi' ? 'en' : 'vi';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      title={i18n.language === 'vi' ? 'Switch to English' : 'Chuyển sang tiếng Việt'}
    >
      <Globe className="h-5 w-5" />
      <span className="text-sm font-medium">
        {i18n.language === 'vi' ? 'EN' : 'VI'}
      </span>
    </button>
  );
};

export default LanguageSwitcher;