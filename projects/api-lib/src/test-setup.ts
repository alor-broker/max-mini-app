import { ngMocks } from "ng-mocks";
import {
  ApiConfig,
  ApiConfigProvider,
  ApiErrorsTracker
} from "@api-lib";
import {
  Observable,
  of
} from "rxjs";
import { getTestBed } from "@angular/core/testing";
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from "@angular/platform-browser-dynamic/testing";

getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
  errorOnUnknownElements: true,
  errorOnUnknownProperties: true
});

ngMocks.defaultMock(
  ApiConfigProvider,
  () => ({
    getConfig(): Observable<ApiConfig> {
      return of({
        apiUrl: '',
        userDataUrl: '',
        superAppUrl: ''
      })
    }
  })
)
