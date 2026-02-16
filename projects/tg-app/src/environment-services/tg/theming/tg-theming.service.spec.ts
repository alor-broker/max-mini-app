import { TestBed } from '@angular/core/testing';

import { TgThemingService } from './tg-theming.service';
import { TelegramWebApp } from "@m1cron-labs/ng-telegram-mini-app";

describe('TgThemingService', () => {
  let service: TgThemingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TgThemingService,
        {
          provide: TelegramWebApp,
          useValue: {
            themeParams: null,
            colorScheme: null
          }
        }
      ]
    });
    service = TestBed.inject(TgThemingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
