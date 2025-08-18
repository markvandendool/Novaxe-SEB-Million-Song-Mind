
describe('PianoMiniComponent', () => {
  let component: PianoMiniComponent;
  let fixture: ComponentFixture<PianoMiniComponent>;
  public beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PianoMiniComponent ]
    })
    .compileComponents();
  }));
  public beforeEach(() => {
    fixture = TestBed.createComponent(PianoMiniComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  public it('should create', () => {
    expect(component).toBeTruthy();
}));
