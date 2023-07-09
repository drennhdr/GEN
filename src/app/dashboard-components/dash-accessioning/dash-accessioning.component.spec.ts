import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashAccessioningComponent } from './dash-accessioning.component';

describe('DashAccessioningComponent', () => {
  let component: DashAccessioningComponent;
  let fixture: ComponentFixture<DashAccessioningComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashAccessioningComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashAccessioningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
