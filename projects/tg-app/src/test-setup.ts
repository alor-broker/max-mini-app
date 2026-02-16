import { ngMocks } from "ng-mocks";
import {
  ApiConfig,
  ApiConfigProvider,
} from "@api-lib";
import {
  EMPTY,
  Observable,
  of
} from "rxjs";
import { getTestBed } from "@angular/core/testing";
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from "@angular/platform-browser-dynamic/testing";
import {
  BackButtonService,
  BiometryService,
  PlatformInfoService,
  StorageService
} from "@environment-services-lib";
import { InstrumentIconSourceService } from "./app/core/services/instrument-icon-source.service";

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

ngMocks.defaultMock(
  BiometryService,
  () => ({
    isBiometryAvailable: () => EMPTY,
    authenticate: () => EMPTY,
    requestAccess: () => EMPTY,
  })
)

ngMocks.defaultMock(
  PlatformInfoService,
  () => ({
    isDesktopPlatform: () => true
  })
)

ngMocks.defaultMock(
  StorageService,
  () => ({
    getItem: () => EMPTY,
    setItem: () => EMPTY,
    removeItem: () => EMPTY,
  })
)

ngMocks.defaultMock(
  InstrumentIconSourceService,
  () => ({
    getIconUrl: () => '',
  })
)

ngMocks.defaultMock(
  BackButtonService,
  () => ({
    get isAvailable(): boolean {
      return true;
    },
    get isVisible(): boolean {
      return true;
    },
    hide() {
    },
    offClick(cb: () => void) {
    },
    onClick(cb: () => void) {
    },
    show() {
    }
  })
)
