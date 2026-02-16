import { TestBed } from '@angular/core/testing';

import { CssVarExportService } from './css-var-export.service';
import { ThemingService } from "@environment-services-lib";
import { ThemeMock } from "../../../testing-utils/theme-mock";

describe('CssVarExportService', () => {
  let service: CssVarExportService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers:[
        {
          provide: ThemingService,
          useValue: {
            getThemeConfig: jasmine.createSpy('getThemeConfig').and.returnValue(ThemeMock)
          }
        }
      ]
    });
    service = TestBed.inject(CssVarExportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
