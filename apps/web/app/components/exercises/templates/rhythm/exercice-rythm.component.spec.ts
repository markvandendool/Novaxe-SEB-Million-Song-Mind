import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExerciceRythmComponent } from './exercice-rythm.component';

describe('ExerciceRythmComponent', () => {
  let component: ExerciceRythmComponent;
  let fixture: ComponentFixture<ExerciceRythmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExerciceRythmComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExerciceRythmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
