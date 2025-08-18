
describe('ExerciceRythmComponent', () => {
  let component: ExerciceRythmComponent;
  let fixture: ComponentFixture<ExerciceRythmComponent>;
  public beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExerciceRythmComponent ]
    })
    .compileComponents();
  }));
  public beforeEach(() => {
    fixture = TestBed.createComponent(ExerciceRythmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  public it('should create', () => {
    expect(component).toBeTruthy();
}));
