import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FifthCircleComponent } from './fifth-circle.component';

describe('FifthCircleComponent', () => {
  let component: FifthCircleComponent;
  let fixture: ComponentFixture<FifthCircleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FifthCircleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FifthCircleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
