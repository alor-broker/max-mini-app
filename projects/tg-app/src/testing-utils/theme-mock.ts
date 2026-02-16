import { ThemeConfig } from "@environment-services-lib";
import { TgColorScheme } from "../environment-services/tg/theming/tg-theming.models";

export const ThemeMock: ThemeConfig = {
  theme: {
    currentScheme: TgColorScheme.Light
  },
  background: {
    bgColor: '#FFFFFF',
    sectionSeparatorColor: '#FFFFFF',
    sectionBgColor: '#FFFFFF',
    headerBgColor: '#FFFFFF',
    secondaryBgColor: '#FFFFFF',
  },
  button: {
    buttonBgColor: '#FFFFFF',
    buttonTextColor: '#FFFFFF'
  },
  text: {
    textColor: '#FFFFFF',
    destructiveTextColor: '#FFFFFF',
    sectionHeaderTextColor: '#FFFFFF',
    accentTextColor: '#FFFFFF',
    linkColor: '#FFFFFF',
    hintColor: '#FFFFFF',
    subtitleTextColor: '#FFFFFF'
  }
};
