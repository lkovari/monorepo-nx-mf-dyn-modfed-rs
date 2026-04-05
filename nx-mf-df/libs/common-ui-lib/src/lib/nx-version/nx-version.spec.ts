import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NxVersion } from './nx-version';

describe('NxVersion', () => {
  let component: NxVersion;
  let fixture: ComponentFixture<NxVersion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NxVersion],
    }).compileComponents();

    fixture = TestBed.createComponent(NxVersion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
