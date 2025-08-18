
describe('LearnFifthsComponent', () => {
  let component: LearnFifthsComponent;
  let fixture: ComponentFixture<LearnFifthsComponent>;
  public beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LearnFifthsComponent ]
    })
    .compileComponents();
  }));
  public beforeEach(() => {
    fixture = TestBed.createComponent(LearnFifthsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  public it('should create', () => {
    expect(component).toBeTruthy();
}));
