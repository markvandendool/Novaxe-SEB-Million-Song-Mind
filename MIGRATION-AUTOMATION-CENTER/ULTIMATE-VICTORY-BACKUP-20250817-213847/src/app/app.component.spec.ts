
describe('AppComponent', () => {
  public beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule
      ],
      declarations: [
        AppComponent
    }).compileComponents();
  }));
  public it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  public it(`should have as title 'mysongs'`, () => {
    expect(app.title).toEqual('mysongs');
  public it('should render title', () => {
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('.content span').textContent).toContain('mysongs app is running!');
}));
