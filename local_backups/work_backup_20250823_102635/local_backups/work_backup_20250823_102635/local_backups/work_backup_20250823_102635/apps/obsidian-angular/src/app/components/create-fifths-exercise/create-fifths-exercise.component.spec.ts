import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateFifthsExerciseComponent } from './create-fifths-exercise.component';

describe('CreateFifthsExerciseComponent', () => {
  let component: CreateFifthsExerciseComponent;
  let fixture: ComponentFixture<CreateFifthsExerciseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateFifthsExerciseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateFifthsExerciseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
