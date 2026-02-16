import { Routes } from '@angular/router';
import { RoutesHelper } from "./core/utils/routes.helper";
import { HomePageComponent } from "./home/pages/home-page/home-page.component";
import { AuthGuard } from "./core/guards/auth-guard";
import { SettingsPageComponent } from "./settings/pages/settings-page/settings-page.component";
import { CreateOrderPageComponent } from "./create-order/pages/create-order-page/create-order-page.component";

export const routes: Routes = [
  {
    path: 'auth/sso',
    loadComponent: () => import('./authentication/pages/sso-callback-page/sso-callback-page.component').then(mod => mod.SsoCallbackPageComponent)
  },
  {
    path: RoutesHelper.appRoutes.authentication.unlock,
    loadComponent: () => import('./authentication/pages/unlock-page/unlock-page.component').then(mod => mod.UnlockPageComponent)
  },
  {
    path: RoutesHelper.appRoutes.authentication.createPassword,
    loadComponent: () => import('./authentication/pages/create-password-page/create-password-page.component').then(mod => mod.CreatePasswordPageComponent)
  },
  {
    path: RoutesHelper.appRoutes.home,
    canActivate: [AuthGuard.canActivate],
    component: HomePageComponent,
  },
  {
    path: RoutesHelper.appRoutes.settings,
    component: SettingsPageComponent,
    canActivate: [AuthGuard.canActivate]
  },
  {
    path: RoutesHelper.appRoutes.createOrder,
    component: CreateOrderPageComponent,
    canActivate: [AuthGuard.canActivate]
  },
  {
    path: '',
    redirectTo: `/${RoutesHelper.appRoutes.home}`,
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: `/${RoutesHelper.appRoutes.home}`
  }
];
