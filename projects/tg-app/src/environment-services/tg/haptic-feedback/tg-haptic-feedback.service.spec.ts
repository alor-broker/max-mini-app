import { TestBed } from '@angular/core/testing';

import { TgHapticFeedbackService } from './tg-haptic-feedback.service';
import { TelegramWebApp } from "@m1cron-labs/ng-telegram-mini-app";

describe('TgHapticFeedbackService', () => {
  let service: TgHapticFeedbackService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TgHapticFeedbackService,
        {
          provide: TelegramWebApp,
          useValue: {
            isVersionAtLeast: jasmine.createSpy('isVersionAtLeast').and.returnValue(false),
          }
        }
      ]
    });
    service = TestBed.inject(TgHapticFeedbackService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
