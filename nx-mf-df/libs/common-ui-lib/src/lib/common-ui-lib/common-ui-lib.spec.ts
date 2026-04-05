import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonUiLib } from './common-ui-lib';

describe('CommonUiLib', () => {
  let component: CommonUiLib;
  let fixture: ComponentFixture<CommonUiLib>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonUiLib],
    }).compileComponents();

    fixture = TestBed.createComponent(CommonUiLib);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
