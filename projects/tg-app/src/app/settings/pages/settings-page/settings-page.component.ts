import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { NzButtonComponent } from "ng-zorro-antd/button";
import { NzIconDirective } from "ng-zorro-antd/icon";
import { BackButtonService, LinksService } from "@environment-services-lib";
import { NzTypographyComponent } from "ng-zorro-antd/typography";
import { ActivatedRoute, Router } from "@angular/router";
import { ApiTokenProviderService } from "../../../core/services/api-token-provider.service";
import { RoutesHelper } from "../../../core/utils/routes.helper";
import { take } from "rxjs";
import { AsyncPipe } from "@angular/common";
import { InvestmentIdeasComponent } from "../../../home/components/investment-ideas/investment-ideas.component";
import { SectionsComponent } from "../../../core/components/sections/sections/sections/sections.component";
import { SectionPanelComponent } from "../../../core/components/sections/section-panel/section-panel.component";
import { NzSwitchComponent } from "ng-zorro-antd/switch";
import { PasswordSettingsComponent } from "../../components/password-settings/password-settings.component";
import { NzDrawerComponent, NzDrawerContentDirective } from "ng-zorro-antd/drawer";
import { environment } from "../../../../environments/environment";
import { TranslocoDirective } from "@jsverse/transloco";

interface SettingsButton {
  icon: string;
  className: string;
  titleId: string;
  type?: 'secondary' | 'warning' | 'danger' | 'success';
  action: () => void;
}

@Component({
  selector: 'tga-settings-page',
  standalone: true,
  imports: [
    NzButtonComponent,
    NzIconDirective,
    NzTypographyComponent,
    AsyncPipe,
    SectionsComponent,
    SectionPanelComponent,
    NzSwitchComponent,
    PasswordSettingsComponent,
    NzDrawerComponent,
    NzDrawerContentDirective,
    TranslocoDirective
  ],
  templateUrl: './settings-page.component.html',
  styleUrl: './settings-page.component.less'
})
export class SettingsPageComponent implements OnInit, OnDestroy {
  isBackButtonAvailable = false;
  isPasswordSettingsOpened = false;

  settingsButtons: SettingsButton[][] = [
    [
      {
        icon: 'key',
        titleId: 'password',
        className: 'reset-password-icon',
        action: () => {
          this.backButtonService.offClick(this.onBackHome);
          this.router.navigate(
            [RoutesHelper.urlForRoot(RoutesHelper.appRoutes.authentication.unlock)],
            {
              queryParams: {
                redirectUrl: `${RoutesHelper.urlForRoot(RoutesHelper.appRoutes.settings)}`,
                redirectUrlParams: [],
                isCancellable: true
              }
            })
        }
      },
    ],
    [
      {
        icon: 'notification',
        titleId: 'alorTg',
        className: 'alor-tg-icon',
        action: () => {
          this.linksService.openApplicationLink(environment.externalLinks.tgAlor)
        }
      },
      {
        icon: 'message',
        titleId: 'supportTg',
        className: 'support-icon',
        action: () => {
          this.linksService.openApplicationLink(environment.externalLinks.tgAlorSupport)
        },
      }
    ],
    [
      {
        icon: 'logout',
        titleId: 'exit',
        className: 'logout-icon',
        type: 'danger',
        action: () => {
          this.apiTokenProviderService.logout();
        },
      }
    ]
  ];

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly apiTokenProviderService: ApiTokenProviderService,
    private readonly linksService: LinksService,
    private readonly backButtonService: BackButtonService,
    private readonly cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit() {
    this.route.queryParams
      .pipe(
        take(1)
      )
      .subscribe(params => {
        this.isPasswordSettingsOpened = params['checked'] ?? false;

        if (this.isPasswordSettingsOpened) {
          this.setBackSettingsBtn();
        } else {
          this.setBackHomeBtn();
        }

        this.cdr.detectChanges();
      })
  }

  ngOnDestroy() {
    this.backButtonService.offClick(this.onBackHome);
  }

  onBackHome = () => {
    this.backButtonService.hide();
    RoutesHelper.openFromRoot(this.router, RoutesHelper.appRoutes.home)
  }

  onBackSettings = () => {
    this.backButtonService.hide();
    this.backButtonService.offClick(this.onBackSettings);
    this.isPasswordSettingsOpened = false;
    this.setBackHomeBtn();
    this.cdr.detectChanges();
  }

  private setBackHomeBtn() {
    this.isBackButtonAvailable = this.backButtonService.isAvailable;

    if (this.isBackButtonAvailable) {
      this.backButtonService.onClick(this.onBackHome);
      this.backButtonService.show();
    }
  }

  private setBackSettingsBtn() {
    this.isBackButtonAvailable = this.backButtonService.isAvailable;

    if (this.isBackButtonAvailable) {
      this.backButtonService.onClick(this.onBackSettings);
      this.backButtonService.show();
    }
  }
}
