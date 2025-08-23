import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TonalityButtonComponent } from './tonality-button.component';

describe('TonalityButtonComponent', () => {
  let component: TonalityButtonComponent;
  let fixture: ComponentFixture<TonalityButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TonalityButtonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TonalityButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
