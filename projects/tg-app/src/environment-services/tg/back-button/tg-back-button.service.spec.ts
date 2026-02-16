import { TestBed } from '@angular/core/testing';

import { TgBackButtonService } from './tg-back-button.service';
import { TelegramWebApp } from "@m1cron-labs/ng-telegram-mini-app";

describe('TgBackButtonService', () => {
  let service: TgBackButtonService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TgBackButtonService,
        {
          provide: TelegramWebApp,
          useValue: {
            isVersionAtLeast: jasmine.createSpy('isVersionAtLeast').and.returnValue(false),
          }
        }
      ]
    });
    service = TestBed.inject(TgBackButtonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
