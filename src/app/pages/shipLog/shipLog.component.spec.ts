import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShipLogComponent } from './shipLog.component';

describe('ShipLogComponent', () => {
  let component: ShipLogComponent;
  let fixture: ComponentFixture<ShipLogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShipLogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShipLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
