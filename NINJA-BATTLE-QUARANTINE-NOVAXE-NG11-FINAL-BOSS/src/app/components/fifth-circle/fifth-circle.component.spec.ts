
describe('FifthCircleComponent', () => {
  let component: FifthCircleComponent;
  let fixture: ComponentFixture<FifthCircleComponent>;
  public beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FifthCircleComponent ]
    })
    .compileComponents();
  }));
  public beforeEach(() => {
    fixture = TestBed.createComponent(FifthCircleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  public it('should create', () => {
    expect(component).toBeTruthy();
}));
