import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Flex, Typography } from '@maxhub/max-ui';

const privacyPolicyUrl = 'https://storage.alorbroker.ru/upload/privacy-policy-mobile.pdf';

export const LegalFooter: React.FC = () => (
  <Container className="legal-footer">
    <Flex direction="column" gap={10}>
      <Typography.Label className="legal-footer__title">
        Юридические документы
      </Typography.Label>

      <Flex direction="column" gap={8}>
        <Link className="legal-footer__link" to="/legal/max-bot-license">
          Соглашение о предоставлении права использования программы для ЭВМ «АЛОР МАХ бот»
        </Link>

        <a
          className="legal-footer__link"
          href={privacyPolicyUrl}
          target="_blank"
          rel="noreferrer"
        >
          Политика обработки персональных данных
        </a>
      </Flex>
    </Flex>
  </Container>
);
