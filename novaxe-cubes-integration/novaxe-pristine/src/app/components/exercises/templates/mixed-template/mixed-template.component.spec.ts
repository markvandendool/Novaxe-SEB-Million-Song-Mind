import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MixedTemplateComponent } from './mixed-template.component';

describe('MixedTemplateComponent', () => {
  let component: MixedTemplateComponent;
  let fixture: ComponentFixture<MixedTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MixedTemplateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MixedTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
