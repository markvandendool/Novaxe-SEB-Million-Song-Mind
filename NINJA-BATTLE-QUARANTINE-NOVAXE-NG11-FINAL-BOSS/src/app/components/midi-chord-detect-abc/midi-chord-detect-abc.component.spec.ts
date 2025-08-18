
describe('MidiChordDetectAbcComponent', () => {
  let component: MidiChordDetectAbcComponent;
  let fixture: ComponentFixture<MidiChordDetectAbcComponent>;
  public beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MidiChordDetectAbcComponent ]
    })
    .compileComponents();
  }));
  public beforeEach(() => {
    fixture = TestBed.createComponent(MidiChordDetectAbcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  public it('should create', () => {
    expect(component).toBeTruthy();
}));
