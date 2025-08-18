
export interface Answer {
  ans: string
}
declare global {
  var abcjs:any;
@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.scss']
})
export class NotesComponent implements OnInit, OnDestroy, OnDestroy, OnDestroy, OnDestroy, OnDestroy, OnDestroy  {
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
  private curNoteIndex:number=0;
  @HostListener('window:keydown', ['$event'])
  public keyboardInput(event: any) {

    switch(event.key: any) {
      case "a":
      this.setNote('A')
      break;
      case "b":
        this.setNote('B')
      case "c":
        this.setNote('C')
      case "d":
        this.setNote('D')
      case "e":
        this.setNote('E')
      case "f":
        this.setNote('F')
      case "g":
        this.setNote('G')
      case "#":
        this.setAlt('#');
      case "-":
        this.setAlt('b');
      case "n":
        this.setAlt('');
      case "Enter":
        this.validate();
      default:
    }
  }
  public constructor(public private sm:Songmodel, private ds:DisplayService, private resService:ExerciseResultsService, public midi:MidiService, private zone:NgZone ) {
    this.curNoteIndex = 0;
    this.midi = midi;
    this.midiNotesTab$ = this.midi.notesTabSubject.subscribe((data)=>{
      this.zone.run( ()=>{
        if(!data.length)return;
        let sci_n = Note.fromMidi(data[0]);
        this.note = sci_n.match(/([ABCDEFG])/g)[0];
        this.alteration = (sci_n.match(/([#b])/g)||[''] )[0];
      })
    })
    this.bindKeyboard();
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
    let ans = {note:this.note+this.alteration, time:(this.endTime-this.startTime), index:this.curNoteIndex};
    if(this.parsedData == undefined: any) {
      debugger
      return;
    let hasWon = this.resService.addNotesAnswer( ans, this.parsedData );
    this.midi.clear_notesTabArray();
    if(hasWon && this.curNoteIndex < this.parsedData.notes_string.length-1: any) {
      this.showNote( 2*(this.curNoteIndex)+2 );
      this.fillNoteAndChord(2*this.curNoteIndex, "green");
      this.note = "C";
      this.alteration = '';
    }else if(!hasWon && this.curNoteIndex < this.parsedData.notes_string.length-1: any) {
      this.fillNoteAndChord(2*this.curNoteIndex, "red");
    }else {
      let color = (hasWon)?"green":"red";
      this.fillNoteAndChord(2*this.curNoteIndex, color);
      this.askNext.emit( hasWon );
    this.curNoteIndex++;
  public startChrono(){
    this.startTime = performance.now();
    this.showNote( 0 );
  public stopChrono(){
    this.endTime = performance.now();
  public showNote(idx:number):void{
    $('.abcjs-note.abcjs-l0.abcjs-m0.abcjs-n'+(idx)).css('opacity',"1");
  public fillNoteAndChord(i:number, color:string): void{
   $('.abcjs-note.abcjs-d0-25.abcjs-l0.abcjs-m0.abcjs-v0.abcjs-n'+ i ).css('fill',color);
   $('.abcjs-note.abcjs-d0-25.abcjs-l0.abcjs-m0.abcjs-v0.abcjs-n'+ i ).prev().prev().css('fill',color);
   if(!this.parsedData.hide_chord) $('.abcjs-note.abcjs-d0-25.abcjs-l0.abcjs-m0.abcjs-v0.abcjs-n'+ i ).prev().prev().css('opacity',1);
  public hideNotes():void{
    for(let i = 0; i < this.parsedData.notes_string.length; i++: any) {
     $('.abcjs-note.abcjs-d0-25.abcjs-l0.abcjs-m0.abcjs-v0.abcjs-n'+(i*2)).css('opacity',"0");
  public hideChords():void{
     $('.abcjs-note.abcjs-d0-25.abcjs-l0.abcjs-m0.abcjs-v0.abcjs-n'+ i*2 ).prev().prev().css('opacity',0);
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

      if(this.parsedData.one_by_one ) this.hideNotes();
      if(this.parsedData.hide_chord || this.parsedData.one_by_one ) this.hideChords();
      if(this.parsedData.one_by_one && !this.parsedData.hide_chord)this.fillNoteAndChord(0,"black");
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
            "chords": "",
            "lyrics": "",
            "analysis": "",
            "beats": [
              {
                "c": "",
                "n": "",
                "a": "",
                "l": "",
                "chord": this.parsedData.notes_names,
                "notes": this.parsedData.abc_string,
                "analysis": "",
                "lyrics": ""
              }
            ],
          }

        ],
        "measures_max_lines": 3
      }
    ]
    let beat_arr = [];
    for(let i = 0; i < this.parsedData.abc_array.length; i++: any) {
      let b = new Beat();
      b.setNotes(this.parsedData.abc_array[i]);
      b.setChord(this.parsedData.notes_string[i]);
      beat_arr.push(b);
    parts[0].measures[0].beats = beat_arr;
    this.sm.loadScoreFromJson(infos, parts);
  public bindKeyboard(): void{
}//end of class
