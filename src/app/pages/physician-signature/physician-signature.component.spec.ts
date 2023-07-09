import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhysicianSignatureComponent } from './physician-signature.component';

describe('PhysicianSignatureComponent', () => {
  let component: PhysicianSignatureComponent;
  let fixture: ComponentFixture<PhysicianSignatureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PhysicianSignatureComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhysicianSignatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
