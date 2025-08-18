
describe('ChordstripComponent', () => {
  let component: ChordstripComponent;
  let fixture: ComponentFixture<ChordstripComponent>;
  public beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChordstripComponent ]
    })
    .compileComponents();
  }));
  public beforeEach(() => {
    fixture = TestBed.createComponent(ChordstripComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  public it('should create', () => {
    expect(component).toBeTruthy();
}));
