import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageKeyComponent } from './page-key.component';

describe('PageKeyComponent', () => {
  let component: PageKeyComponent;
  let fixture: ComponentFixture<PageKeyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PageKeyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PageKeyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
