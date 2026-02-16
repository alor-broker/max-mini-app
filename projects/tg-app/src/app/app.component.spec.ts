import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { TelegramWebApp } from "@m1cron-labs/ng-telegram-mini-app";
import { LanguageService } from "@environment-services-lib";
import { TranslocoService } from "@jsverse/transloco";
import { CssVarExportService } from "./core/services/css-var-export.service";

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers:[
        {
          provide: TelegramWebApp,
          useValue: {
            ready: jasmine.createSpy('ready').and.callThrough()
          }
        },
        {
          provide: LanguageService,
          useValue: {
            getSystemLang: jasmine.createSpy('getSystemLang').and.returnValue('')
          }
        },
        {
          provide: TranslocoService,
          useValue: {
            setActiveLang: jasmine.createSpy('setActiveLang').and.callThrough()
          }
        },
        {
          provide: CssVarExportService,
          useValue: {
            export: jasmine.createSpy('export').and.callThrough()
          }
        }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
