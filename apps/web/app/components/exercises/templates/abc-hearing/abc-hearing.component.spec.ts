import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbcHearingComponent } from './abc-hearing.component';

describe('AbcHearingComponent', () => {
  let component: AbcHearingComponent;
  let fixture: ComponentFixture<AbcHearingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AbcHearingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AbcHearingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
