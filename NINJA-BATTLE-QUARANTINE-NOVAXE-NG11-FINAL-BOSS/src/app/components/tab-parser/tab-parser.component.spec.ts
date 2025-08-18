
describe('TabParserComponent', () => {
  let component: TabParserComponent;
  let fixture: ComponentFixture<TabParserComponent>;
  public beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TabParserComponent ]
    })
    .compileComponents();
  }));
  public beforeEach(() => {
    fixture = TestBed.createComponent(TabParserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  public it('should create', () => {
    expect(component).toBeTruthy();
}));
