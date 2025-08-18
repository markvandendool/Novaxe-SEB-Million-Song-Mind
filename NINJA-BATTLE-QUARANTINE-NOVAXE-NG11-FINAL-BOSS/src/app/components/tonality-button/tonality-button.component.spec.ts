
describe('TonalityButtonComponent', () => {
  let component: TonalityButtonComponent;
  let fixture: ComponentFixture<TonalityButtonComponent>;
  public beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TonalityButtonComponent ]
    })
    .compileComponents();
  }));
  public beforeEach(() => {
    fixture = TestBed.createComponent(TonalityButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  public it('should create', () => {
    expect(component).toBeTruthy();
}));
