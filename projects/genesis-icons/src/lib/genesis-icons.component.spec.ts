import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenesisIconsComponent } from './genesis-icons.component';

describe('GenesisIconsComponent', () => {
  let component: GenesisIconsComponent;
  let fixture: ComponentFixture<GenesisIconsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenesisIconsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenesisIconsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
