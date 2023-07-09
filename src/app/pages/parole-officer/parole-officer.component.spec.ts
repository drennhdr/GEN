import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParoleOfficerComponent } from './parolee-officer.component';

describe('ParoleOfficerComponent', () => {
  let component: ParoleOfficerComponent;
  let fixture: ComponentFixture<ParoleOfficerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ParoleOfficerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParoleOfficerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
