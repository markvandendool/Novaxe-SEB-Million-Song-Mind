
describe('InstrLvl1Component', () => {
  let component: InstrLvl1Component;
  let fixture: ComponentFixture<InstrLvl1Component>;
  public beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InstrLvl1Component ]
    })
    .compileComponents();
  }));
  public beforeEach(() => {
    fixture = TestBed.createComponent(InstrLvl1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  public it('should create', () => {
    expect(component).toBeTruthy();
}));
