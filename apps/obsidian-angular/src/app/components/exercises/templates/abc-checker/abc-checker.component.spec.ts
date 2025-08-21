import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbcCheckerComponent } from './abc-checker.component';

describe('AbcCheckerComponent', () => {
  let component: AbcCheckerComponent;
  let fixture: ComponentFixture<AbcCheckerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AbcCheckerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AbcCheckerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
