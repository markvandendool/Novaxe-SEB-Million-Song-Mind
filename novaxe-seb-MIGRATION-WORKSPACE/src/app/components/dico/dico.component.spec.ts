import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DicoComponent } from './dico.component';

describe('DicoComponent', () => {
  let component: DicoComponent;
  let fixture: ComponentFixture<DicoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DicoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DicoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
