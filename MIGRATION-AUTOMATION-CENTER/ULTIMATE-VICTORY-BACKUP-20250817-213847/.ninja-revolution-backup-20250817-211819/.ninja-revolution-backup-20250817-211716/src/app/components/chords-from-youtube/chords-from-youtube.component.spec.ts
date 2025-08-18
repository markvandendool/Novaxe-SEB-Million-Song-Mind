
describe('ChordsFromYoutubeComponent', () => {
  let component: ChordsFromYoutubeComponent;
  let fixture: ComponentFixture<ChordsFromYoutubeComponent>;
  public beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChordsFromYoutubeComponent ]
    })
    .compileComponents();
  }));
  public beforeEach(() => {
    fixture = TestBed.createComponent(ChordsFromYoutubeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  public it('should create', () => {
    expect(component).toBeTruthy();
}));
