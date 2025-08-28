import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LearnFifthsComponent } from './learn-fifths.component';

describe('LearnFifthsComponent', () => {
  let component: LearnFifthsComponent;
  let fixture: ComponentFixture<LearnFifthsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LearnFifthsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LearnFifthsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
