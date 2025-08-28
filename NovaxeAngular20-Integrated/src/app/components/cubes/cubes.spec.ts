import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Cubes } from './cubes';

describe('Cubes', () => {
  let component: Cubes;
  let fixture: ComponentFixture<Cubes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cubes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Cubes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
