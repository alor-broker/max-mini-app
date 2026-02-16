import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import { InstrumentInfoComponent } from './instrument-info.component';
import { MockProvider } from "ng-mocks";
import { QuotesService } from "@api-lib";
import { Subject } from "rxjs";
import { InstrumentIconSourceService } from "../../../core/services/instrument-icon-source.service";

describe('InstrumentInfoComponent', () => {
  let component: InstrumentInfoComponent;
  let fixture: ComponentFixture<InstrumentInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstrumentInfoComponent],
      providers: [
        MockProvider(InstrumentIconSourceService),
        MockProvider(
          QuotesService,
          {
            getLastQuoteInfo: () => new Subject()
          }
        )
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(InstrumentInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
