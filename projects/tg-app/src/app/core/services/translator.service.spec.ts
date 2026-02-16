import { TestBed } from '@angular/core/testing';

import { TranslatorService } from './translator.service';
import { TranslocoService } from "@jsverse/transloco";

describe('TranslatorService', () => {
  let service: TranslatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: TranslocoService,
          useValue: {
            selectTranslate: jasmine.createSpy('selectTranslate').and.callThrough(),
            translate: jasmine.createSpy('translate').and.returnValue(''),
          }
        }
      ]
    });
    service = TestBed.inject(TranslatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
