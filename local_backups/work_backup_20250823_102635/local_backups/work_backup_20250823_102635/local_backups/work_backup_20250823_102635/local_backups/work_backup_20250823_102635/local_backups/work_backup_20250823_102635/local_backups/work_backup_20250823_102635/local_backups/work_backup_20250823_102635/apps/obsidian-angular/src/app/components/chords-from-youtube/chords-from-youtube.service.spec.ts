import { TestBed } from '@angular/core/testing';

import { ChordsFromYoutubeService } from './chords-from-youtube.service';

describe('ChordsFromYoutubeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ChordsFromYoutubeService = TestBed.get(ChordsFromYoutubeService);
    expect(service).toBeTruthy();
  });
});
