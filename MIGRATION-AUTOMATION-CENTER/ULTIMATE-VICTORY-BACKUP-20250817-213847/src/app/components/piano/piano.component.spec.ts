
describe('PianoComponent', () => {
  let component: PianoComponent;
  let fixture: ComponentFixture<PianoComponent>;
  public beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PianoComponent ]
    })
    .compileComponents();
  }));
  public beforeEach(() => {
    fixture = TestBed.createComponent(PianoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  public it('should create', () => {
    expect(component).toBeTruthy();
}));
