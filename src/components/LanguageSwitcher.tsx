import React from 'react';
import { Flex } from '@maxhub/max-ui';
import { useTranslation } from 'react-i18next';
import { IconGlobe } from './Icons';

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const currentLang = i18n.resolvedLanguage ?? i18n.language ?? 'en';
    const nextLang = currentLang.toLowerCase().startsWith('ru') ? 'en' : 'ru';
    i18n.changeLanguage(nextLang);
  };

  const currentLang = i18n.resolvedLanguage ?? i18n.language ?? 'en';

  return (
    <div
      onClick={toggleLanguage}
      data-no-pull-refresh="true"
      style={{
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        flexShrink: 0,
        gap: '6px',
        color: 'white',
        border: '1px solid rgba(255,255,255,0.3)',
        padding: '6px 10px',
        borderRadius: '20px',
        background: 'rgba(0,0,0,0.1)',
        minWidth: '58px',
        justifyContent: 'center',
        boxSizing: 'border-box'
      }}
    >
      <IconGlobe width={18} height={18} />
      <span style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', lineHeight: 1 }}>
        {currentLang.substring(0, 2)}
      </span>
    </div>
  );
};
