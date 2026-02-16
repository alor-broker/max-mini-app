import {
  Inject,
  Injectable
} from '@angular/core';
import { ThemingService } from "@environment-services-lib";
import { DOCUMENT } from "@angular/common";
import { TgColorScheme } from "../../../environment-services/tg/theming/tg-theming.models";

enum CssThemeVariables {
  // background
  BgColor = 'mini-app-bg-color',
  SecondaryBgColor = 'mini-app-secondary-bg-color',
  HeaderBgColor = 'mini-app-header-bg-color',
  SectionBgColor = 'mini-app-section-bg-color',
  SectionSeparatorColor = 'mini-app-section-separator-color',
  // text
  TextColor = 'mini-app-text-color',
  SubtitleTextColor = 'mini-app-subtitle-text-color',
  HintColor = 'mini-app-hint-color',
  LinkColor = 'mini-app-link-color',
  AccentTextColor = 'mini-app-accent-text-color',
  SectionHeaderTextColor = 'mini-app-section-header-text-color',
  DestructiveTextColor = 'mini-app-destructive-text-color',
  // button
  ButtonBgColor = 'mini-app-button-bg-color',
  ButtonTextColor = 'mini-app-button-text-color',
}

@Injectable({
  providedIn: 'root'
})
export class CssVarExportService {

  constructor(
    private readonly themingService: ThemingService,
    @Inject(DOCUMENT)
    private readonly document: Document
  ) {
  }

  export(): void {
    const config = this.themingService.getThemeConfig();

    const variables = new Map<CssThemeVariables, string>([
      // background
      [CssThemeVariables.BgColor, config.background.bgColor],
      [CssThemeVariables.SecondaryBgColor, config.background.secondaryBgColor],
      [CssThemeVariables.HeaderBgColor, config.background.headerBgColor],
      [CssThemeVariables.SectionBgColor, config.background.sectionBgColor],
      [CssThemeVariables.SectionSeparatorColor, config.background.sectionSeparatorColor],

      // text
      [CssThemeVariables.TextColor, config.text.textColor],
      [CssThemeVariables.SubtitleTextColor, config.text.subtitleTextColor],
      [CssThemeVariables.HintColor, config.text.hintColor],
      [CssThemeVariables.LinkColor, config.text.linkColor],
      [CssThemeVariables.AccentTextColor, config.text.accentTextColor],
      [CssThemeVariables.SectionHeaderTextColor, config.text.sectionHeaderTextColor],
      [CssThemeVariables.DestructiveTextColor, config.text.destructiveTextColor],

      // button
      [CssThemeVariables.ButtonBgColor, config.button.buttonBgColor],
      [CssThemeVariables.ButtonTextColor, config.button.buttonTextColor],
    ]);

    for (const entry of variables.entries()) {
      this.document.documentElement.style.setProperty(`--${entry[0]}`, entry[1]);
    }

    this.document.body.classList.add(
      config.theme.currentScheme === TgColorScheme.Light
        ? 'light'
        : 'dark'
    );
  }
}
