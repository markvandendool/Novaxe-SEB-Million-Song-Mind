import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MetroPageComponent } from './metro-page.component';

describe('MetroPageComponent', () => {
  let component: MetroPageComponent;
  let fixture: ComponentFixture<MetroPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MetroPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MetroPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
