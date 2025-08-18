
describe('MidiService', () => {
  public beforeEach(() => TestBed.configureTestingModule({}));
  public it('should be created', () => {
    const service: MidiService= TestBed.get(MidiService);
    expect(service).toBeTruthy();
  }));
}));
