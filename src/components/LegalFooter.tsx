import React from 'react';
import { Link } from 'react-router-dom';

const privacyPolicyUrl = 'https://storage.alorbroker.ru/upload/privacy-policy-mobile.pdf';

export const LegalFooter: React.FC = () => (
  <footer className="legal-footer">
    <nav className="legal-footer__nav" aria-label="Юридические документы">
      <span className="legal-footer__label"></span>
      <Link className="legal-footer__link" to="/legal/max-bot-license">
        Соглашение
      </Link>
      <a
        className="legal-footer__link"
        href={privacyPolicyUrl}
        target="_blank"
        rel="noreferrer"
      >
        Персональные данные
      </a>
    </nav>
  </footer>
);
