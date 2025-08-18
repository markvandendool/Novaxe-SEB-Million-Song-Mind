
describe('MidiSelectorComponent', () => {
  let component: MidiSelectorComponent;
  let fixture: ComponentFixture<MidiSelectorComponent>;
  public beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MidiSelectorComponent ]
    })
    .compileComponents();
  }));
  public beforeEach(() => {
    fixture = TestBed.createComponent(MidiSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  public it('should create', () => {
    expect(component).toBeTruthy();
}));
