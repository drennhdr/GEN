import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashDailysalesComponent } from './dash-dailysales.component';

describe('DashDailysalesComponent', () => {
  let component: DashDailysalesComponent;
  let fixture: ComponentFixture<DashDailysalesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashDailysalesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashDailysalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
