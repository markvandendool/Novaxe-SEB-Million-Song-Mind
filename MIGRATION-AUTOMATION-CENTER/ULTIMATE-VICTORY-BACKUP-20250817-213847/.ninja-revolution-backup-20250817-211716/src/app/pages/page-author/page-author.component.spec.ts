
describe('PageAuthorComponent', () => {
  let component: PageAuthorComponent;
  let fixture: ComponentFixture<PageAuthorComponent>;
  public beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PageAuthorComponent ]
    })
    .compileComponents();
  }));
  public beforeEach(() => {
    fixture = TestBed.createComponent(PageAuthorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  public it('should create', () => {
    expect(component).toBeTruthy();
}));
