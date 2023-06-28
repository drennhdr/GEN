import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashCetIssueComponent } from './dash-cet-issue.component';

describe('DashCetIssueComponent', () => {
  let component: DashCetIssueComponent;
  let fixture: ComponentFixture<DashCetIssueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashCetIssueComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashCetIssueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
