
describe('MetroComponent', () => {
  let component: MetroComponent;
  let fixture: ComponentFixture<MetroComponent>;
  public beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MetroComponent ]
    })
    .compileComponents();
  }));
  public beforeEach(() => {
    fixture = TestBed.createComponent(MetroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  public it('should create', () => {
    expect(component).toBeTruthy();
}));
