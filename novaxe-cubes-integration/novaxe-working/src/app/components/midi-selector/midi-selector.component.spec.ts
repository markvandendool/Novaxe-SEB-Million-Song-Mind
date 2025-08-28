import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MidiSelectorComponent } from './midi-selector.component';

describe('MidiSelectorComponent', () => {
  let component: MidiSelectorComponent;
  let fixture: ComponentFixture<MidiSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MidiSelectorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MidiSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
