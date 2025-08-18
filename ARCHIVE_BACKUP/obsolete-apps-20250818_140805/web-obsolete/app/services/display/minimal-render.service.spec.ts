import { TestBed } from '@angular/core/testing';

import { MinimalRenderService } from './minimal-render.service';

describe('MinimalRenderService', () => {
  let service: MinimalRenderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MinimalRenderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
