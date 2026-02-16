import { Component } from '@angular/core';
import { LinksService } from "@environment-services-lib";
import { environment } from "../../../../environments/environment";
import { NzIconDirective } from "ng-zorro-antd/icon";
import { Router } from "@angular/router";
import { RoutesHelper } from "../../../core/utils/routes.helper";
import { TranslocoDirective } from "@jsverse/transloco";

@Component({
  selector: 'tga-links',
  standalone: true,
  imports: [
    NzIconDirective,
    TranslocoDirective
  ],
  templateUrl: './links.component.html',
  styleUrl: './links.component.less'
})
export class LinksComponent {

  readonly externalLinks = environment.externalLinks;

  constructor(
    private readonly linksService: LinksService,
    private readonly router: Router
  ) {
  }

  openInBrowser(url: string): void {
    this.linksService.openBrowserLink(url);
  }

  openInApplication(url: string): void {
    this.linksService.openApplicationLink(url);
  }

  openOrderCreate() {
    RoutesHelper.openFromRoot(this.router, RoutesHelper.appRoutes.createOrder);
  }
}
