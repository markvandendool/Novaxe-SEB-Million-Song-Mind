
describe('TemplateViewerComponent', () => {
  let component: TemplateViewerComponent;
  let fixture: ComponentFixture<TemplateViewerComponent>;
  public beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TemplateViewerComponent ]
    })
    .compileComponents();
  }));
  public beforeEach(() => {
    fixture = TestBed.createComponent(TemplateViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  public it('should create', () => {
    expect(component).toBeTruthy();
}));
