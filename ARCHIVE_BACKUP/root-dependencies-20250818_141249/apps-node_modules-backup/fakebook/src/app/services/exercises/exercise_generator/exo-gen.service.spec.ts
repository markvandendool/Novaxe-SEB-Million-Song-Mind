import { TestBed } from '@angular/core/testing';

import { ExoGenService } from './exo-gen.service';

describe('ExoGenService', () => {
  let service: ExoGenService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExoGenService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
