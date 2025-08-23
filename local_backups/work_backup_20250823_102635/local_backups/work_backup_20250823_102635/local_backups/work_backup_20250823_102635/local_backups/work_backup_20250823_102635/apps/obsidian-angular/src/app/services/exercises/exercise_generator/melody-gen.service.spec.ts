import { TestBed } from '@angular/core/testing';

import { MelodyGenService } from './melody-gen.service';

describe('MelodyGenService', () => {
  let service: MelodyGenService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MelodyGenService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
