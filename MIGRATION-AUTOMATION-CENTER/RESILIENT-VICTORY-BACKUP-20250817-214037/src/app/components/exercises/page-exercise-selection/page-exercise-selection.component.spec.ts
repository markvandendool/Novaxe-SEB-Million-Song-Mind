
describe('PageExerciseSelectionComponent', () => {
  let component: PageExerciseSelectionComponent;
  let fixture: ComponentFixture<PageExerciseSelectionComponent>;
  public beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PageExerciseSelectionComponent ]
    })
    .compileComponents();
  }));
  public beforeEach(() => {
    fixture = TestBed.createComponent(PageExerciseSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  public it('should create', () => {
    expect(component).toBeTruthy();
}));
