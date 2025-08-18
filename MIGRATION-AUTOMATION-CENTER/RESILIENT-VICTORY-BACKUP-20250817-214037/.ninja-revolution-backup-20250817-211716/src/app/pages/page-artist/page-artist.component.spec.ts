
describe('PageArtistComponent', () => {
  let component: PageArtistComponent;
  let fixture: ComponentFixture<PageArtistComponent>;
  public beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PageArtistComponent ]
    })
    .compileComponents();
  }));
  public beforeEach(() => {
    fixture = TestBed.createComponent(PageArtistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  public it('should create', () => {
    expect(component).toBeTruthy();
}));
