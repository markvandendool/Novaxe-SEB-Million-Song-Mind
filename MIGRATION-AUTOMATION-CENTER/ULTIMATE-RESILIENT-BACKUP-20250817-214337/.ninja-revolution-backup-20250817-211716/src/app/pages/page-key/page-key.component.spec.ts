
describe('PageKeyComponent', () => {
  let component: PageKeyComponent;
  let fixture: ComponentFixture<PageKeyComponent>;
  public beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PageKeyComponent ]
    })
    .compileComponents();
  }));
  public beforeEach(() => {
    fixture = TestBed.createComponent(PageKeyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  public it('should create', () => {
    expect(component).toBeTruthy();
}));
