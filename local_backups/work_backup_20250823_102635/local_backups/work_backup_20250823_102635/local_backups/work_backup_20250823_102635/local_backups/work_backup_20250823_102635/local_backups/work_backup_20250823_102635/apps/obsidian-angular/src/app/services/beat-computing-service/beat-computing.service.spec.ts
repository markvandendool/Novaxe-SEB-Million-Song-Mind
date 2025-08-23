import { TestBed } from '@angular/core/testing';

import { BeatComputingService } from './beat-computing.service';

describe('BeatComputingService', () => {
  let service: BeatComputingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BeatComputingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
