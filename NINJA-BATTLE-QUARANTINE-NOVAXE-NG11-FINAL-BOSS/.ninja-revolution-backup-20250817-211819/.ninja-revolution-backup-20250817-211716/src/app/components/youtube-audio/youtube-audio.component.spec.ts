
describe('YoutubeAudioComponent', () => {
  let component: YoutubeAudioComponent;
  let fixture: ComponentFixture<YoutubeAudioComponent>;
  public beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ YoutubeAudioComponent ]
    })
    .compileComponents();
  }));
  public beforeEach(() => {
    fixture = TestBed.createComponent(YoutubeAudioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  public it('should create', () => {
    expect(component).toBeTruthy();
}));
