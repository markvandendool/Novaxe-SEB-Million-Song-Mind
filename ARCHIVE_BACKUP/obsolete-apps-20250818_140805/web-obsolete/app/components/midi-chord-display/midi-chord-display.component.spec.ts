import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MidiChordDisplayComponent } from './midi-chord-display.component';

describe('MidiChordDisplayComponent', () => {
  let component: MidiChordDisplayComponent;
  let fixture: ComponentFixture<MidiChordDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MidiChordDisplayComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MidiChordDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
