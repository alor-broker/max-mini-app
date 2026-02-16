import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import { HomePageComponent } from './home-page.component';
import { TranslocoTestModuleProvider } from "../../../../testing-utils/transloco-test-module-provider";
import { MockProvider } from "ng-mocks";
import { BackButtonService } from "@environment-services-lib";

describe('HomePageComponent', () => {
  let component: HomePageComponent;
  let fixture: ComponentFixture<HomePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HomePageComponent,
        TranslocoTestModuleProvider.getModule()
      ],
      providers: [
        MockProvider(BackButtonService)
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(HomePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
