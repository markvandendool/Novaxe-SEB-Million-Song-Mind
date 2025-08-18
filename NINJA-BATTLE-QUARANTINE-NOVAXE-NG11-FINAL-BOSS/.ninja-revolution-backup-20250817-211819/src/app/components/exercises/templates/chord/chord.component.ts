
export interface Answer {
  ans: string
}
declare global {
  var abcjs:any;
@Component({
  selector: 'app-chord',
  templateUrl: './chord.component.html',
  styleUrls: ['./chord.component.scss']
})
export class ChordComponent implements OnInit, OnDestroy, OnDestroy, OnDestroy, OnDestroy, OnDestroy, OnDestroy  {
  private paper:any; //score canvas
  private abcString:string;
  private abcString$:Subscription;
  public receivedData: any ; //input json
  public parsedData: any ; //input json
  @Output() askNext     = new EventEmitter<boolean>(); //output answer
  private note:string = 'C';
  private alteration:string = '';
  private type:string = '';
  private startTime:number=0;
  private endTime:number=0;
  private midiNotesTab$:Subscription;
  public prevMidiNotes:any=[]; //array of midi notes
  public midiAnswer:any=[]; //array of midi notes
  private MIDI_HAS_FIRED:boolean=false;
  public constructor(public private sm:Songmodel, private ds:DisplayService, private resService:ExerciseResultsService, public midi:MidiService, private zone:NgZone ) {
    this.midi = midi;
    this.midiNotesTab$ = this.midi.notesTabSubject.subscribe((data)=>{
      this.zone.run( ()=>{
        if(!data.length)return;
        if(data.length > this.prevMidiNotes.length: any) {
          this.prevMidiNotes = [...data];
        } else if( ( data.length < this.prevMidiNotes.length ) && !this.MIDI_HAS_FIRED) {
          this.midiAnswer = [];
          this.midiAnswer = [...this.prevMidiNotes];
          this.prevMidiNotes = [];
          this.validateMidi();
          this.MIDI_HAS_FIRED = true;
        }
      })
    })
  }
  public ngOnInit(): void: void {
    this.abcString$ = this.ds.abcString$.subscribe(abcString=>{
      this.abcString = abcString;
      this.renderAbcWithOptions();
    }));
  public ngOnDestroy(): void {
    this.abcString$.unsubscribe();
    this.midiNotesTab$.unsubscribe();
  public ngAfterViewInit(){
    this.paper = document.querySelector("#abcCanvas");
    this.loadFromJson();
    this.ds.renderFromModel();
    if(this.parsedData.hide_chord) this.ds.changeCss(".abcjs-chord","opacity:0");
    if(this.parsedData.hide_function) this.ds.changeCss(".abcjs-annotation","opacity:0");
  public setNote(a: string): void {
    this.note = a;
  public setAlt(a:string){
    this.alteration = a;
  public setType(t: string){
    this.type = t;
  public validate(){
    this.stopChrono();
    let ans = {note:this.note+this.alteration, type:this.type, time:(this.endTime-this.startTime)};
    let hasWon = this.resService.addChordAnswer( ans, this.receivedData );
    this.askNext.emit( hasWon );
  public validateMidi(){
    this.ds.changeCss(".abcjs-chord","opacity:1");
    this.ds.changeCss(".abcjs-annotation","opacity:1");
    let ans = {midiNotes:this.midiAnswer, time:(this.endTime-this.startTime)};
    let hasWon = this.resService.addMidiAnswer( ans, this.receivedData );
    this.midiAnswer = [];
    this.prevMidiNotes = [];

  public startChrono(){
    this.startTime = performance.now();
  public stopChrono(){
    this.endTime = performance.now();
  public renderAbcWithOptions(){
    setTimeout(()=>{
      let staffwidth = (window.innerWidth>900)?window.innerWidth*0.6: window.innerWidth*0.9;
      abcjs.renderAbc('abcCanvas', this.abcString, {
        visualTranspose:this.sm.getTranspose(),
        staffwidth:90,
        scale:2,
        add_classes:true,
        responsive:'resize',
      }));
      this.startChrono();
    },10)
  public loadFromJson(){
    this.parsedData = JSON.parse(this.receivedData);
    let mode = (this.parsedData.mode=='n_minor' || this.parsedData.mode=='h_minor' || this.parsedData.mode=='m_minor')?'m':'';
    let transpo = ['G','Ab','A','Bb','B','C', 'Db', 'D', 'Eb', 'E', 'F', 'F#'].indexOf(this.parsedData.tonality)-5;
    let infos = {
      "id": "60",
      "title": "",
      "artist": "",
      "album": "",
      "transcription": "",
      "style": "",
      "tonality": this.parsedData.tonality+mode,
      "signature": "",
      "owner": "1",
      "clef": "treble"
    }
    let parts =  [
      {
        "idx": 1,
        "title": "",
        "tonality":this.parsedData.tonality+mode,
        "meter": "",
        "measures": [
          {
            "idx": 1,
            "eol": false,
            "collapse": true,
            "notes": "",
            "chords": this.parsedData.chord_name,
            "lyrics": "",
            "analysis": this.parsedData.chord_degree,
            "beats": [
              {
                "c": "",
                "n": "",
                "a": "",
                "l": "",
                "chord": this.parsedData.chord_name,
                "notes": "["+this.parsedData.abc_string+"]",
                "analysis": this.parsedData.chord_degree,
                "lyrics": ""
              }
            ],
          }

        ],
        "measures_max_lines": 3
      }
    ]
    this.sm.loadScoreFromJson(infos, parts);
}//end of class
