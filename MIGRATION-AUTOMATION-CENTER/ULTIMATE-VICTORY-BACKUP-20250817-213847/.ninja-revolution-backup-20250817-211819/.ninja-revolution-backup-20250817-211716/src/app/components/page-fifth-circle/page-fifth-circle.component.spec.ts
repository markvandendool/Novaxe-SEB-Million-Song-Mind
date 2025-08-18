
describe('PageFifthCircleComponent', () => {
  let component: PageFifthCircleComponent;
  let fixture: ComponentFixture<PageFifthCircleComponent>;
  public beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PageFifthCircleComponent ]
    })
    .compileComponents();
  }));
  public beforeEach(() => {
    fixture = TestBed.createComponent(PageFifthCircleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  public it('should create', () => {
    expect(component).toBeTruthy();
}));
