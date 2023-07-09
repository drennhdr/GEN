import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashSalesIssuesComponent } from './dash-sales-issues.component';

describe('DashSalesIssuesComponent', () => {
  let component: DashSalesIssuesComponent;
  let fixture: ComponentFixture<DashSalesIssuesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashSalesIssuesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashSalesIssuesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
