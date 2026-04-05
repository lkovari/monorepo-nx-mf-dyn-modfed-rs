import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AngularVersion } from './angular-version';

describe('AngularVersion', () => {
  let component: AngularVersion;
  let fixture: ComponentFixture<AngularVersion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AngularVersion],
    }).compileComponents();

    fixture = TestBed.createComponent(AngularVersion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
