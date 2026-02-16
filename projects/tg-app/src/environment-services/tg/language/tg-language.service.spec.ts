import { TestBed } from '@angular/core/testing';

import { TgLanguageService } from './tg-language.service';
import { TelegramWebApp } from "@m1cron-labs/ng-telegram-mini-app";

describe('TgLanguageService', () => {
  let service: TgLanguageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TgLanguageService,
        {
          provide: TelegramWebApp,
          useValue: {
            initDataUnsafe: {

            }
          }
        }
      ]
    });
    service = TestBed.inject(TgLanguageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
