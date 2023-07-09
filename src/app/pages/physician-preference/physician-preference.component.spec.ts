import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhysicianPreferenceComponent } from './physician-preference.component';

describe('PhysicianPreferenceComponent', () => {
  let component: PhysicianPreferenceComponent;
  let fixture: ComponentFixture<PhysicianPreferenceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhysicianPreferenceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhysicianPreferenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
