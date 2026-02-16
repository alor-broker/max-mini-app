import { TestBed } from '@angular/core/testing';

import { TgLinksService } from './tg-links.service';
import { TelegramWebApp } from "@m1cron-labs/ng-telegram-mini-app";

describe('TgLinksService', () => {
  let service: TgLinksService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers:[
        TgLinksService,
        {
          provide: TelegramWebApp,
          useValue: {
            openTelegramLink: jasmine.createSpy('openTelegramLink').and.callThrough(),
            openLink: jasmine.createSpy('openLink').and.callThrough()
          }
        }
      ]
    });
    service = TestBed.inject(TgLinksService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
