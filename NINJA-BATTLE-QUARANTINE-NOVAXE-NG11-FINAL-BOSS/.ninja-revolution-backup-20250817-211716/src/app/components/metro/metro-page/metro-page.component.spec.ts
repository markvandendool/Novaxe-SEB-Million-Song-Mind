
describe('MetroPageComponent', () => {
  let component: MetroPageComponent;
  let fixture: ComponentFixture<MetroPageComponent>;
  public beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MetroPageComponent ]
    })
    .compileComponents();
  }));
  public beforeEach(() => {
    fixture = TestBed.createComponent(MetroPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  public it('should create', () => {
    expect(component).toBeTruthy();
}));
