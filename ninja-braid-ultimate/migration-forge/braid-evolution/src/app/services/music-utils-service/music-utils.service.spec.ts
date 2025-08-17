import { TestBed } from '@angular/core/testing';

import { MusicUtilsService } from './music-utils.service';

describe('MusicUtilsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MusicUtilsService = TestBed.inject(MusicUtilsService);
    expect(service).toBeTruthy();
  });
});
