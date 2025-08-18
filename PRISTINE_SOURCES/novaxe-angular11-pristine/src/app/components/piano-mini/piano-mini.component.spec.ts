import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PianoMiniComponent } from './piano-mini.component';

describe('PianoMiniComponent', () => {
  let component: PianoMiniComponent;
  let fixture: ComponentFixture<PianoMiniComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PianoMiniComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PianoMiniComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
