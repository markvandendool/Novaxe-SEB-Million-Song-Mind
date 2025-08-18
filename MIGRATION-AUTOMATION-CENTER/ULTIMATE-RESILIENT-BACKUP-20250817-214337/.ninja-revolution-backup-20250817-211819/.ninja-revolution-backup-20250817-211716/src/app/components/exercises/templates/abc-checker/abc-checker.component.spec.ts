
describe('AbcCheckerComponent', () => {
  let component: AbcCheckerComponent;
  let fixture: ComponentFixture<AbcCheckerComponent>;
  public beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AbcCheckerComponent ]
    })
    .compileComponents();
  }));
  public beforeEach(() => {
    fixture = TestBed.createComponent(AbcCheckerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  public it('should create', () => {
    expect(component).toBeTruthy();
}));
