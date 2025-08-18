
describe('BrowseComponent', () => {
  let component: BrowseComponent;
  let fixture: ComponentFixture<BrowseComponent>;
  public beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BrowseComponent ]
    })
    .compileComponents();
  }));
  public beforeEach(() => {
    fixture = TestBed.createComponent(BrowseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  public it('should create', () => {
    expect(component).toBeTruthy();
}));
