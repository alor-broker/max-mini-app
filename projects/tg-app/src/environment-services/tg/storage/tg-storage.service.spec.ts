import { TestBed } from '@angular/core/testing';

import { TgStorageService } from './tg-storage.service';
import { TelegramWebApp } from "@m1cron-labs/ng-telegram-mini-app";

describe('TgStorageService', () => {
  let service: TgStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TgStorageService,
        {
          provide: TelegramWebApp,
          useValue: {
            isVersionAtLeast: jasmine.createSpy('isVersionAtLeast').and.returnValue(false),
          }
        }
      ]
    });
    service = TestBed.inject(TgStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
