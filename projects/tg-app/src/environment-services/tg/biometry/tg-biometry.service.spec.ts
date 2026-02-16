import { TestBed } from '@angular/core/testing';

import { TgBiometryService } from './tg-biometry.service';
import { TelegramWebApp } from "@m1cron-labs/ng-telegram-mini-app";

describe('TgBiometryService', () => {
  let service: TgBiometryService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TgBiometryService,
        {
          provide: TelegramWebApp,
          useValue: {
            isVersionAtLeast: jasmine.createSpy('isVersionAtLeast').and.returnValue(false),
          }
        }
      ]
    });
    service = TestBed.inject(TgBiometryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
