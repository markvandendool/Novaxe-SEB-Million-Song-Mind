import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageExerciseSelectionComponent } from './page-exercise-selection.component';

describe('PageExerciseSelectionComponent', () => {
  let component: PageExerciseSelectionComponent;
  let fixture: ComponentFixture<PageExerciseSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PageExerciseSelectionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PageExerciseSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
