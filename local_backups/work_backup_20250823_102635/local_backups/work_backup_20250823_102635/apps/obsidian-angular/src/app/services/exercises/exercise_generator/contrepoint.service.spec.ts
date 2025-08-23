import { TestBed } from '@angular/core/testing';

import { ContrepointService } from './contrepoint.service';

describe('ContrepointService', () => {
  let service: ContrepointService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ContrepointService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
