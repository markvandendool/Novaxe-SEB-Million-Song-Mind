
describe('MidiControlSelectorComponent', () => {
  let component: MidiControlSelectorComponent;
  let fixture: ComponentFixture<MidiControlSelectorComponent>;
  public beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MidiControlSelectorComponent ]
    })
    .compileComponents();
  }));
  public beforeEach(() => {
    fixture = TestBed.createComponent(MidiControlSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  public it('should create', () => {
    expect(component).toBeTruthy();
}));
