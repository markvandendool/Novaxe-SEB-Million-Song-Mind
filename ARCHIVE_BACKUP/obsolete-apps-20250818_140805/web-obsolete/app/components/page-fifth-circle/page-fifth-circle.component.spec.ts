import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageFifthCircleComponent } from './page-fifth-circle.component';

describe('PageFifthCircleComponent', () => {
  let component: PageFifthCircleComponent;
  let fixture: ComponentFixture<PageFifthCircleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PageFifthCircleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PageFifthCircleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
