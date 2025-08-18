import { TestBed } from '@angular/core/testing';

import { MeasureSplitService } from './measure-split.service';

describe('MeasureSplitService', () => {
  let service: MeasureSplitService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MeasureSplitService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
