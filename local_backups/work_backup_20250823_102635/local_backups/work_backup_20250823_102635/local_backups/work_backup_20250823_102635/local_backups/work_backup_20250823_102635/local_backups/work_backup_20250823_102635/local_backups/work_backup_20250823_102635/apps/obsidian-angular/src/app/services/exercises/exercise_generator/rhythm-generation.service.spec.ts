import { TestBed } from '@angular/core/testing';

import { RhythmGenerationService } from './rhythm-generation.service';

describe('RhythmGenerationService', () => {
  let service: RhythmGenerationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RhythmGenerationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
