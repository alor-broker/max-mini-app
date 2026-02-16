import {
  Component,
  Inject,
  OnInit
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {
  TelegramWebApp,
  WebApp
} from "@m1cron-labs/ng-telegram-mini-app";
import { CssVarExportService } from "./core/services/css-var-export.service";
import { registerLocaleData } from "@angular/common";
import ru from '@angular/common/locales/ru';
import { LanguageService } from "@environment-services-lib";
import { TranslocoService } from "@jsverse/transloco";

registerLocaleData(ru);

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.less'
})
export class AppComponent implements OnInit {

  constructor(
    @Inject(TelegramWebApp)
    private readonly tgWebApp: WebApp,
    private readonly languageService: LanguageService,
    private readonly translocoService: TranslocoService,
    private readonly cssVarExportService: CssVarExportService
  ) {
    this.tgWebApp.ready();
  }

  ngOnInit(): void {
    this.cssVarExportService.export();
    this.setLang();
    this.tgWebApp.expand();
    this.tgWebApp.disableVerticalSwipes();
  }

  setLang() {
    this.translocoService.setActiveLang(this.languageService.getSystemLang());
  }
}
