
describe('MidiChordDisplayComponent', () => {
  let component: MidiChordDisplayComponent;
  let fixture: ComponentFixture<MidiChordDisplayComponent>;
  public beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MidiChordDisplayComponent ]
    })
    .compileComponents();
  }));
  public beforeEach(() => {
    fixture = TestBed.createComponent(MidiChordDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  public it('should create', () => {
    expect(component).toBeTruthy();
}));
