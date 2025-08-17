import { TestBed } from '@angular/core/testing';

import { ParsingService } from './parsing.service';

describe('ParsingService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ParsingService = TestBed.inject(ParsingService);
    expect(service).toBeTruthy();
  });
});
