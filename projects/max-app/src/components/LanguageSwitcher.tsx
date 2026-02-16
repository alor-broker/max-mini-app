import React from 'react';
import { Button } from '@maxhub/max-ui';
import { useTranslation } from 'react-i18next';

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'ru' ? 'en' : 'ru';
    i18n.changeLanguage(nextLang);
  };

  return (
    <Button
      onClick={toggleLanguage}
      style={{
        background: 'transparent',
        color: 'white',
        border: '1px solid rgba(255,255,255,0.3)',
        marginLeft: '8px'
      }}
    >
      {i18n.language === 'ru' ? 'EN' : 'RU'}
    </Button>
  );
};
