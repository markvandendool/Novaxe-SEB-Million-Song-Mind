
describe('EditorComponent', () => {
  let component: EditorComponent;
  let fixture: ComponentFixture<EditorComponent>;
  public beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditorComponent ]
    })
    .compileComponents();
  }));
  public beforeEach(() => {
    fixture = TestBed.createComponent(EditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  public it('should create', () => {
    expect(component).toBeTruthy();
}));
