import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageStyleComponent } from './page-style.component';

describe('PageStyleComponent', () => {
  let component: PageStyleComponent;
  let fixture: ComponentFixture<PageStyleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PageStyleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PageStyleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
