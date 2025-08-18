import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MidiControlSelectorComponent } from './midi-control-selector.component';

describe('MidiControlSelectorComponent', () => {
  let component: MidiControlSelectorComponent;
  let fixture: ComponentFixture<MidiControlSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MidiControlSelectorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MidiControlSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
