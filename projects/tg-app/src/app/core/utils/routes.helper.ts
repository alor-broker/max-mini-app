import { Router } from "@angular/router";

export class RoutesHelper {
  static appRoutes = {
    home: 'home',
    settings: 'settings',
    createOrder: 'create-order',
    authentication: {
      createPassword: 'password-create',
      unlock: 'unlock'
    }
  }

  static openFromRoot(router: Router, route: string, queryParams?: { [param: string]: string }): void {
    router.navigate([this.urlForRoot(route)], { queryParams })
  }

  static urlForRoot(route: string): string {
    return `/${route}`
  }
}
