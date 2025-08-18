import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MidiChordDetectAbcComponent } from './midi-chord-detect-abc.component';

describe('MidiChordDetectAbcComponent', () => {
  let component: MidiChordDetectAbcComponent;
  let fixture: ComponentFixture<MidiChordDetectAbcComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MidiChordDetectAbcComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MidiChordDetectAbcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
