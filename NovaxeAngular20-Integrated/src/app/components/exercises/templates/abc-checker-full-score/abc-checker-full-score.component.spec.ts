import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbcCheckerFullScoreComponent } from './abc-checker-full-score.component';

describe('AbcCheckerFullScoreComponent', () => {
  let component: AbcCheckerFullScoreComponent;
  let fixture: ComponentFixture<AbcCheckerFullScoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AbcCheckerFullScoreComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AbcCheckerFullScoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
