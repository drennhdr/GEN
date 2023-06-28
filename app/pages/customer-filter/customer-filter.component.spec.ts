import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CutomerFilterComponent } from './customer-filter.component';

describe('CutomerFilterComponent', () => {
  let component: CutomerFilterComponent;
  let fixture: ComponentFixture<CutomerFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CutomerFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CutomerFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
