import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreauthComponent } from './preauth.component';

describe('PreauthComponent', () => {
  let component: PreauthComponent;
  let fixture: ComponentFixture<PreauthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PreauthComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreauthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
