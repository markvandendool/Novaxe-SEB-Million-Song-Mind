
describe('PageGeneratorComponent', () => {
  let component: PageGeneratorComponent;
  let fixture: ComponentFixture<PageGeneratorComponent>;
  public beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PageGeneratorComponent ]
    })
    .compileComponents();
  }));
  public beforeEach(() => {
    fixture = TestBed.createComponent(PageGeneratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  public it('should create', () => {
    expect(component).toBeTruthy();
}));
