
describe('AbcHearingComponent', () => {
  let component: AbcHearingComponent;
  let fixture: ComponentFixture<AbcHearingComponent>;
  public beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AbcHearingComponent ]
    })
    .compileComponents();
  }));
  public beforeEach(() => {
    fixture = TestBed.createComponent(AbcHearingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  public it('should create', () => {
    expect(component).toBeTruthy();
}));
