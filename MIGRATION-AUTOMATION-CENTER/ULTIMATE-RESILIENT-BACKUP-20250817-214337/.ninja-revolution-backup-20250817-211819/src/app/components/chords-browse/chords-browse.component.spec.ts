
describe('ChordsBrowseComponent', () => {
  let component: ChordsBrowseComponent;
  let fixture: ComponentFixture<ChordsBrowseComponent>;
  public beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChordsBrowseComponent ]
    })
    .compileComponents();
  }));
  public beforeEach(() => {
    fixture = TestBed.createComponent(ChordsBrowseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  public it('should create', () => {
    expect(component).toBeTruthy();
}));
