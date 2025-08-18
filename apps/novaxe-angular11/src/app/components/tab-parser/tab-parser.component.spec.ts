import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TabParserComponent } from './tab-parser.component';

describe('TabParserComponent', () => {
  let component: TabParserComponent;
  let fixture: ComponentFixture<TabParserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TabParserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TabParserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
