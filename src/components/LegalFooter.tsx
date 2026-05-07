import React from 'react';
import { Link } from 'react-router-dom';

const privacyPolicyUrl = 'https://storage.alorbroker.ru/upload/privacy-policy-mobile.pdf';

export const LegalFooter: React.FC = () => (
  <footer className="legal-footer">
    <div className="legal-footer__label">
      ООО «АЛОР+», ИНН: 7709221010, КПП: 772501001
    </div>
    <div className="legal-footer__label">
      Брокерские услуги предоставляются ООО «АЛОР +» на основании Лицензии № 077-04827-100000 от 13.03.2001 г., выдана ФСФР бессрочно. Депозитарные услуги предоставляются ООО «АЛОР +» на основании Лицензии № 077-10965-000100 от 22.01.2008 г., выдана ФСФР бессрочно.
    </div>
    <nav className="legal-footer__nav" aria-label="Юридические документы">
      <Link className="legal-footer__link" to="/legal/max-bot-license">
        Соглашение
      </Link>
      <Link className="legal-footer__link" to="/legal/company-details">
        Дисклеймер
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
