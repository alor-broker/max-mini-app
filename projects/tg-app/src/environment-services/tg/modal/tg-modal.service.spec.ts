import { TestBed } from '@angular/core/testing';

import { TgModalService } from './tg-modal.service';
import { TelegramWebApp } from "@m1cron-labs/ng-telegram-mini-app";

describe('TgModalService', () => {
  let service: TgModalService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TgModalService,
        {
          provide: TelegramWebApp,
          useValue: {
            showPopup: jasmine.createSpy('showPopup').and.callThrough()
          }
        }
      ]
    });
    service = TestBed.inject(TgModalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
