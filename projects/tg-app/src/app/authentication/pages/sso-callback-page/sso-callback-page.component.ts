import {
  Component,
  Input,
  OnInit
} from '@angular/core';
import { Router } from "@angular/router";
import { ApiTokenProviderService } from "../../../core/services/api-token-provider.service";
import { RoutesHelper } from "../../../core/utils/routes.helper";

@Component({
  selector: 'tga-sso-callback-page',
  standalone: true,
  imports: [],
  templateUrl: './sso-callback-page.component.html',
  styleUrl: './sso-callback-page.component.less'
})
export class SsoCallbackPageComponent implements OnInit {
  @Input()
  refreshToken?: string;

  constructor(
    private readonly router: Router,
    private readonly apiTokenProviderService: ApiTokenProviderService
  ) {
  }

  ngOnInit(): void {
    this.apiTokenProviderService.setRefreshToken(
      (this.refreshToken ?? '').trim(),
      () => RoutesHelper.openFromRoot(this.router, RoutesHelper.appRoutes.home)
    );
  }
}
