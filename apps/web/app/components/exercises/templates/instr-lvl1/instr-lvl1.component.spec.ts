import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstrLvl1Component } from './instr-lvl1.component';

describe('InstrLvl1Component', () => {
  let component: InstrLvl1Component;
  let fixture: ComponentFixture<InstrLvl1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InstrLvl1Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InstrLvl1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
