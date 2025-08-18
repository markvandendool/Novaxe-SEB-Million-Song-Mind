
describe('AbcCheckerFullScoreComponent', () => {
  let component: AbcCheckerFullScoreComponent;
  let fixture: ComponentFixture<AbcCheckerFullScoreComponent>;
  public beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AbcCheckerFullScoreComponent ]
    })
    .compileComponents();
  }));
  public beforeEach(() => {
    fixture = TestBed.createComponent(AbcCheckerFullScoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  public it('should create', () => {
    expect(component).toBeTruthy();
}));
