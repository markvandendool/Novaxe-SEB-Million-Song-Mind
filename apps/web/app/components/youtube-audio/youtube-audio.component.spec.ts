import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { YoutubeAudioComponent } from './youtube-audio.component';

describe('YoutubeAudioComponent', () => {
  let component: YoutubeAudioComponent;
  let fixture: ComponentFixture<YoutubeAudioComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ YoutubeAudioComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(YoutubeAudioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
