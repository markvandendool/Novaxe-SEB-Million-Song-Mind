
describe('FretboardComponent', () => {
  let component: FretboardComponent;
  let fixture: ComponentFixture<FretboardComponent>;
  public beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FretboardComponent ]
    })
    .compileComponents();
  }));
  public beforeEach(() => {
    fixture = TestBed.createComponent(FretboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  public it('should create', () => {
    expect(component).toBeTruthy();
}));
