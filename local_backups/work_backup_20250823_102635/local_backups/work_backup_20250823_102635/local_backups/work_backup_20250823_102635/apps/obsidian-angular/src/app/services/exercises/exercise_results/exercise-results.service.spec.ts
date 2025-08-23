import { TestBed } from '@angular/core/testing';

import { ExerciseResultsService } from './exercise-results.service';

describe('ExerciseResultsService', () => {
  let service: ExerciseResultsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExerciseResultsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
