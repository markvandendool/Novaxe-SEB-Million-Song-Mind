
describe('PageAlbumComponent', () => {
  let component: PageAlbumComponent;
  let fixture: ComponentFixture<PageAlbumComponent>;
  public beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PageAlbumComponent ]
    })
    .compileComponents();
  }));
  public beforeEach(() => {
    fixture = TestBed.createComponent(PageAlbumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  public it('should create', () => {
    expect(component).toBeTruthy();
}));
