import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountIncidentModalComponent } from './account-incident-modal.component';

describe('AccountIncidentModalComponent', () => {
  let component: AccountIncidentModalComponent;
  let fixture: ComponentFixture<AccountIncidentModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccountIncidentModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountIncidentModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
