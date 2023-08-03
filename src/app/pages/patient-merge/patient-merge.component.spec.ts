import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientMergeComponent } from './patient-merge.component';

describe('PatientMergeComponent', () => {
  let component: PatientMergeComponent;
  let fixture: ComponentFixture<PatientMergeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientMergeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientMergeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
