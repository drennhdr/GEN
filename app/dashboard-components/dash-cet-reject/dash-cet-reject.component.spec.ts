import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashCetRejectComponent } from './dash-cet-reject.component';

describe('DashCetRejectComponent', () => {
  let component: DashCetRejectComponent;
  let fixture: ComponentFixture<DashCetRejectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashCetRejectComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashCetRejectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
