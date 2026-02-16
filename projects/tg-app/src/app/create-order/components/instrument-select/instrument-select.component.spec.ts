import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import { InstrumentSelectComponent } from './instrument-select.component';
import { MarketService } from "../../../core/services/market.service";
import { of } from "rxjs";
import { InstrumentsService } from "@api-lib";
import { TranslocoTestModuleProvider } from "../../../../testing-utils/transloco-test-module-provider";

describe('InstrumentSelectComponent', () => {
  let component: InstrumentSelectComponent;
  let fixture: ComponentFixture<InstrumentSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslocoTestModuleProvider.getModule(),
        InstrumentSelectComponent
      ],
      providers: [
        {
          provide: MarketService,
          useValue: {
            getDefaultExchange: jasmine.createSpy('getDefaultExchange').and.returnValue(of(undefined))
          }
        },
        {
          provide: InstrumentsService,
          useValue: {
            searchInstruments: jasmine.createSpy('searchInstruments').and.returnValue(of([]))
          }
        }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(InstrumentSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
