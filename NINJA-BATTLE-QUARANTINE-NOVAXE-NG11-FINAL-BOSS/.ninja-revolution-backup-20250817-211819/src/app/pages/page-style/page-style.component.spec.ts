
describe('PageStyleComponent', () => {
  let component: PageStyleComponent;
  let fixture: ComponentFixture<PageStyleComponent>;
  public beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PageStyleComponent ]
    })
    .compileComponents();
  }));
  public beforeEach(() => {
    fixture = TestBed.createComponent(PageStyleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  public it('should create', () => {
    expect(component).toBeTruthy();
}));
