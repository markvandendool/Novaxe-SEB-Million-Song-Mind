
describe('TestpageComponent', () => {
  let component: TestpageComponent;
  let fixture: ComponentFixture<TestpageComponent>;
  public beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestpageComponent ]
    })
    .compileComponents();
  }));
  public beforeEach(() => {
    fixture = TestBed.createComponent(TestpageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  public it('should create', () => {
    expect(component).toBeTruthy();
}));
