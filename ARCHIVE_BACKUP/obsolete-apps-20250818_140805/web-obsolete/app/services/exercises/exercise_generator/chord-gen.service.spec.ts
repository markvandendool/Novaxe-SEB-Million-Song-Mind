import { TestBed } from '@angular/core/testing';

import { ChordGenService } from './chord-gen.service';

describe('ChordGenService', () => {
  let service: ChordGenService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChordGenService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
