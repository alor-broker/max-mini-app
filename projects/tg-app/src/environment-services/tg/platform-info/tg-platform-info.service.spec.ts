import { TestBed } from '@angular/core/testing';

import { TgPlatformInfoService } from './tg-platform-info.service';
import { TgStorageService } from "../storage/tg-storage.service";
import { TelegramWebApp } from "@m1cron-labs/ng-telegram-mini-app";

describe('TgPlatformInfoService', () => {
  let service: TgPlatformInfoService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TgPlatformInfoService,
        TgStorageService,
        {
          provide: TelegramWebApp,
          useValue: {
            platform: 'windows'
          }
        }
      ]
    });
    service = TestBed.inject(TgPlatformInfoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
