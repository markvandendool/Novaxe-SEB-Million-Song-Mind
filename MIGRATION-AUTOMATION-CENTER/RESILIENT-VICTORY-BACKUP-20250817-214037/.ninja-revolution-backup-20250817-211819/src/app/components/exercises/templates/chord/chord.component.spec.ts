
describe('ChordComponent', () => {
  let component: ChordComponent;
  let fixture: ComponentFixture<ChordComponent>;
  public beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChordComponent ]
    })
    .compileComponents();
  }));
  public beforeEach(() => {
    fixture = TestBed.createComponent(ChordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  public it('should create', () => {
    expect(component).toBeTruthy();
}));
