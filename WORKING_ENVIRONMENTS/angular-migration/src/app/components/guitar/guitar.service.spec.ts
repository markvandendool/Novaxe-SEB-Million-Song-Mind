import { TestBed } from '@angular/core/testing';

import { GuitarService } from './guitar.service';

describe('GuitarService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GuitarService = TestBed.get(GuitarService);
    expect(service).toBeTruthy();
  });
});
