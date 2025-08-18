import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChordstripComponent } from './chordstrip.component';

describe('ChordstripComponent', () => {
  let component: ChordstripComponent;
  let fixture: ComponentFixture<ChordstripComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChordstripComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChordstripComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
