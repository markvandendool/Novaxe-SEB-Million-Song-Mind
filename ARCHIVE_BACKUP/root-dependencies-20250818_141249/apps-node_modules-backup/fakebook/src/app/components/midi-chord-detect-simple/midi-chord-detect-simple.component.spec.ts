import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MidiChordDetectComponent } from './midi-chord-detect.component';

describe('MidiChordDetectComponent', () => {
  let component: MidiChordDetectComponent;
  let fixture: ComponentFixture<MidiChordDetectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MidiChordDetectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MidiChordDetectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
