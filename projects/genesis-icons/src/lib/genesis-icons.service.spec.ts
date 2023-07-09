import { TestBed } from '@angular/core/testing';

import { GenesisIconsService } from './genesis-icons.service';

describe('GenesisIconsService', () => {
  let service: GenesisIconsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GenesisIconsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
