
describe('GuitarComponent', () => {
  let component: GuitarComponent;
  let fixture: ComponentFixture<GuitarComponent>;
  public beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GuitarComponent ]
    })
    .compileComponents();
  }));
  public beforeEach(() => {
    fixture = TestBed.createComponent(GuitarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  public it('should create', () => {
    expect(component).toBeTruthy();
}));
