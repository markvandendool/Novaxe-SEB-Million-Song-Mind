
describe('MidiChordDetectComponent', () => {
  let component: MidiChordDetectComponent;
  let fixture: ComponentFixture<MidiChordDetectComponent>;
  public beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MidiChordDetectComponent ]
    })
    .compileComponents();
  }));
  public beforeEach(() => {
    fixture = TestBed.createComponent(MidiChordDetectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  public it('should create', () => {
    expect(component).toBeTruthy();
}));
