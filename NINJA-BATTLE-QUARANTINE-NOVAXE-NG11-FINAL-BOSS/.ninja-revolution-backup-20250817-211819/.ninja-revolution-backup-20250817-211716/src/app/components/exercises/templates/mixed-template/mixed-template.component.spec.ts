
describe('MixedTemplateComponent', () => {
  let component: MixedTemplateComponent;
  let fixture: ComponentFixture<MixedTemplateComponent>;
  public beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MixedTemplateComponent ]
    })
    .compileComponents();
  }));
  public beforeEach(() => {
    fixture = TestBed.createComponent(MixedTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  public it('should create', () => {
    expect(component).toBeTruthy();
}));
