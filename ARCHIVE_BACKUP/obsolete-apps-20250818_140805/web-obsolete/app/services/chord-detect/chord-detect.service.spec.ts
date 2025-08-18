import { TestBed } from '@angular/core/testing';

import { ChordDetectService } from './chord-detect.service';

describe('ChordDetectService', () => {
  let service: ChordDetectService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChordDetectService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
