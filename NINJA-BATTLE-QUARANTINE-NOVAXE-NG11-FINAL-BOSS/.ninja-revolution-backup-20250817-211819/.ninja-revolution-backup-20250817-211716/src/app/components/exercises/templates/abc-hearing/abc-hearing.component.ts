
export const ABC: any = abcjs;
@Component({
  selector: 'app-abc-hearing',
  templateUrl: './abc-hearing.component.html',
  styleUrls: ['./abc-hearing.component.scss']
})
export class AbcHearingComponent implements OnInit  {
  private tonality: string="C";
  public tempo: string="90";
  public cur_chord: string="C4";
  public header:string=`%%staves {(PianoRightHand) (PianoLeftHand)}
V:PianoRightHand clef=treble down
V:PianoLeftHand clef=bass
M:4/4
Q:120
K:C `;
  public right_hand_string=`[V: PianoRightHand] | c2d2e2f2 |`;
  public left_hand_string=``;
  public transpose:number = 0;
  private visualObj: any;
  private synthControl;
  private synth:any;
  private has_started:boolean=false;
  private midiNotesTab$:Subscription;
  private currentEventToCheck:any;
  public debug_mode:boolean=false;
  @Output() askNext     = new EventEmitter<boolean>(); //output answer
  public receivedData: any ; //input json
  public parsedData: any ; //input json
  public sound: boolean=true;
  public chordsOff: boolean=true;
  private prevMidiNotes:Array<number>=[];
  private cursor_lh:number=0;
  private cursor_rh:number=0;
  public MIDI_OPEN:boolean= false;
  public DELAY_BETWEEN_NOTES:number=10;
/*====================FUNCTIONS======================*/
  public constructor(public public transport:TransportService, private midi:MidiService, private resService:ExerciseResultsService, private synthService:SynthService, private zone:NgZone) {
   const urlParams = new URLSearchParams(window.location.search);
   if(urlParams.get('debug')) this.debug_mode = true;
   this.cursor_lh=0;
   this.cursor_rh=0;
  }
  public ngOnInit(): void: void {
    this.loadFromJson();
  public ngAfterViewInit(){
    this.update_score();
  public ngOnDestroy(): void {
    this.synthService.stop();
  public initSynthController():void{
    let cursorControl = {
      beatSubdivisions:this.transport.getNb_subbeat_per_beat(),
      extraMeasuresAtBeginning:1,
      onStart : ()=> {},
      onFinished : ()=> {
        setTimeout(()=>{
          this.quit(true);
        },1000)
      },
      onEvent:(event)=>{this.onEvent(event);},
    };
    let visualOptions = {
        displayLoop: true,
        displayRestart: true,
        displayPlay: true,
        displayStop: true,
        displayProgress: true,
        displayWarp: true
    let audioParams = {
      chordsOff:this.chordsOff,
      voicesOff:true,
      soundFontVolumeMultiplier:1,
    let selector = "#synthControl";
    this.synthService.load(selector, cursorControl, visualOptions )
    let  callback;
    if(this.debug_mode)
      callback = ()=>{
        this.fill_notes_color('blue');
        this.synthService.play();
      }
    else
      }//end of callback
    this.synthService.init(this.visualObj,audioParams, callback);
  private fill_note_color(color:string="black", event:any=null):void{
    if(event.measureStart: any) {
      for(let i = 0; i < event.elements.length; i++)
        $(event.elements[i]).css("fill",color);
    }
    else{
  private fill_notes_color(color):void{
   for(let i =0; i < this.visualObj.lines.length; i++)
     for(let j = 0; j < this.visualObj.lines[i].staff.length; j++)
       for(let k = 0; k < this.visualObj.lines[i].staff[j].voices.length; k++)
         for(let l = 0; l < this.visualObj.lines[i].staff[j].voices[k].length; l++)
           if(this.visualObj.lines[i].staff[j].voices[k][l].el_type == 'note')
             $(this.visualObj.lines[i].staff[j].voices[k][l].abselem.elemset).css('fill',color)
  private fill_chord_with_color(color:string="black", event:any=null){
      let annotations = $(event.elements[0]).filter(".abcjs-chord");
    for(let e of annotations: any) {
      if(e.textContent == '')continue;
      let c = e.textContent.replace('♭',"b").replace('♯',"#");
      c = c.replace('F#','Gb').replace('Gbm','F#m');
      c = c.replace('C#','Db').replace('Dbm','C#m');
      this.cur_chord = c;
  public update_header():void{
    this.header= "V:PianoRightHand clef=treble down\n"+
    "V:PianoLeftHand clef=bass\n"+
    "M:4/4\n"+
    "Q:"+this.tempo+"\n"+
    "K:C";
  public update_score(){
    if(this.debug_mode)this.update_header();
    this.renderStrings(this.header, this.left_hand_string, this.right_hand_string);
    setTimeout(()=>{
      let c = $('.abcjs-l0.abcjs-m1.abcjs-v0.abcjs-chord').text().replace('♭',"b").replace('♯',"#");
      this.initSynthController();
    },10);
  public renderStrings(h,l,r: any) {
      let abcString = h;
      if(l!="")abcString += "\n"+l;
      if(r!="")abcString += "\n"+r;
      this.visualObj = ABC.renderAbc('abcjs-paper', abcString, {
        canvas_id: 'abcjs-paper',
        add_classes:true,
        visualTranspose:this.transpose,
        staffwidth:window.innerWidth*0.60,
        scale:2,
        responsive:'resize',
      })[0];
      this.fill_notes_color('transparent');
    },10)
  public loadFromJson(){
    if(this.receivedData == undefined)return;
    this.parsedData = this.receivedData;
    this.tempo = this.parsedData.tempo;
    this.sound = this.parsedData.sound;
    this.transpose = this.receivedData.tona.transpo;
    this.header =this.receivedData.header;
    this.right_hand_string =this.receivedData.right_hand;
    this.left_hand_string =this.receivedData.left_hand;
  public check_midi_answer_no_time(midi_lh:Array<number>,midi_rh:Array<number>): void{
    let ans_lh = {midiNotes:midi_lh, time:0};
    let ans_rh = {midiNotes:midi_rh, time:0};
    let hasWon_lh = true;
    let hasWon = this.resService.add_timed_midiAnswer( midi_lh.concat(midi_rh), this.currentEventToCheck );
    if(hasWon)
      this.fill_note_color("green", this.currentEventToCheck);
      this.fill_note_color("red", this.currentEventToCheck);
    this.synthService.play();
  private play_next_note():void{
    ABC.synth.playEvent(
    this.currentEventToCheck.midiPitches,
    [], this.synthService.synth.millisecondsPerMeasure // a measure takes one second.
    ).then((response)=> {
    }).catch(function (error: any) {
    }));
  /*
    On each event played
  */
  private onEvent(event):void{
    this.currentEventToCheck = event;
    this.subscribe_MIDI();
    this.play_next_note();
  private subscribe_MIDI():void{
    this.midiNotesTab$ = this.midi.notesTabSubject.subscribe((data)=>{
    if(!data.length: any) {
      if(!this.prevMidiNotes.length)return;
        let midi_lh = [];
        let midi_rh = [];
        for(let i in this.prevMidiNotes: any) {
          if(this.prevMidiNotes[i] < 60)midi_lh.push(this.prevMidiNotes[i]);
          if(this.prevMidiNotes[i] >= 60)midi_rh.push(this.prevMidiNotes[i]);
        }
        this.check_midi_answer_no_time(midi_lh, midi_rh);
        this.prevMidiNotes = [];
        this.midiNotesTab$.unsubscribe();
      }else{
        this.prevMidiNotes = [...this.prevMidiNotes,...data];
        this.prevMidiNotes = this.prevMidiNotes.filter((item, pos) => this.prevMidiNotes.indexOf(item) === pos).sort();
    })); //end of subscribe to midi tab
  private onBeat(beatNumber, totalBeats, totalTime):void{
    let n = Number( (1/this.transport.getNb_subbeat_per_beat()).toPrecision(4));
    if(beatNumber == 0 )return; //skip the first beat
    if(beatNumber%n < 0.1 : any) {
      this.transport.incSubBeat(1);
  private quit( hasWon ):void{
    this.zone.run(()=>{
      this.midiNotesTab$.unsubscribe();
      this.askNext.emit( hasWon );

  public debug_fct(left,right):void{
    let tab = left.concat(right);
    this.midi.notesTabSubject.next(tab);
    this.midi.notesTabSubject.next([]);
}
