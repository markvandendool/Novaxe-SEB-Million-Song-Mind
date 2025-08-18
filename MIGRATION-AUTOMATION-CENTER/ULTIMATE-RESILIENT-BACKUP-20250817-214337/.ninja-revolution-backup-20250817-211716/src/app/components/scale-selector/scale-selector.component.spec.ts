
describe('ScaleSelectorComponent', () => {
  let component: ScaleSelectorComponent;
  let fixture: ComponentFixture<ScaleSelectorComponent>;
  public beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScaleSelectorComponent ]
    })
    .compileComponents();
  }));
  public beforeEach(() => {
    fixture = TestBed.createComponent(ScaleSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  public it('should create', () => {
    expect(component).toBeTruthy();
}));
