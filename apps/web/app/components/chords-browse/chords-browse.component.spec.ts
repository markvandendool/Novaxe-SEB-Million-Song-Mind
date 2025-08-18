import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChordsBrowseComponent } from './chords-browse.component';

describe('ChordsBrowseComponent', () => {
  let component: ChordsBrowseComponent;
  let fixture: ComponentFixture<ChordsBrowseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChordsBrowseComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChordsBrowseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
