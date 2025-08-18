import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChordsFromYoutubeComponent } from './chords-from-youtube.component';

describe('ChordsFromYoutubeComponent', () => {
  let component: ChordsFromYoutubeComponent;
  let fixture: ComponentFixture<ChordsFromYoutubeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChordsFromYoutubeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChordsFromYoutubeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
