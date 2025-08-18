
describe('DicoComponent', () => {
  let component: DicoComponent;
  let fixture: ComponentFixture<DicoComponent>;
  public beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DicoComponent ]
    })
    .compileComponents();
  }));
  public beforeEach(() => {
    fixture = TestBed.createComponent(DicoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  public it('should create', () => {
    expect(component).toBeTruthy();
}));
