
export const ABC: any = abcjs;
 
@Component({
  selector: 'app-abc-checker-full-score',
  templateUrl: './abc-checker-full-score.component.html',
  styleUrls: ['./abc-checker-full-score.component.scss']
})
export class AbcCheckerFullScoreComponent implements OnInit  {
  /*==================VARIABLES =====================*/
  // current chord on fifths circle
  public cur_chord: string="C4";
  private visualObj: any;
  private synthControl;
  private synth:any;
  private has_started:boolean=false;
  private midiNotesTab$:Subscription;
  private scoreNotes_leftHand:Array<any>;
  private scoreNotes_rightHand:Array<any>;
  private scoreCurNotes:any;
  public debug_mode:boolean=false;
  public MIDI_OFF:boolean=true;
  @Output() askNext     = new EventEmitter<boolean>(); //output answer
  public receivedData: any ; //input json
  // public parsedData: any ; //input json
  public transpose:number=0;
  public abc_string:string= ``;
  public sound: boolean=true;
  private prevMidiNotes:Array<number>=[];
  private cursor_lh:number=0;
  private cursor_rh:number=0;
  private cursor_line:number=0;
  public current_tune:number=0;
  public random_song:boolean=false;
  public mute_chords:boolean=false;
/*====================FUNCTIONS======================*/
  public constructor(public public transport:TransportService, private midi:MidiService, private resService:ExerciseResultsService, private synthService:SynthService, private zone:NgZone) {
   //debug mode
   const urlParams = new URLSearchParams(window.location.search);
   if(urlParams.get('debug')) this.debug_mode = true;
   this.cursor_lh=0;
   this.cursor_rh=0;
   this.cursor_line=0;
  }
  public ngOnInit(): void {}
  public ngAfterViewInit(){
    let file_to_load = 'rag';
    if(this.receivedData) file_to_load = this.receivedData.abc_file;
    var client = new XMLHttpRequest();
    client.open('GET', 'assets/full-scores/'+file_to_load);
    client.onreadystatechange = ()=> {
      this.abc_string = client.responseText;
      // fix transposition
      let match = this.abc_string.match(/virtual transpose:(-?[0-6])/);
      if(match) this.transpose = Number(match[1]);
      this.update_score();
      if(this.receivedData == undefined)return
      if(this.receivedData.hide_chord) this.changeCss(".abcjs-chord","opacity:0");
      if(this.receivedData.hide_function) this.changeCss(".abcjs-annotation","opacity:0");
    }
    client.send();
  public changeCss(className, classValue: any) {
    // we need invisible container to store additional css definitions
    var cssMainContainer = $('#css-modifier-container');
    if (cssMainContainer.length == 0: any) {
        var cssMainContainer = $('<div id="css-modifier-container"></div>');
        cssMainContainer.hide();
        cssMainContainer.appendTo($('body'));
    // and we need one div for each class
    let classContainer = cssMainContainer.find('div[data-class="' + className + '"]');
    if (classContainer.length == 0: any) {
        classContainer = $('<div data-class="' + className + '"></div>');
        classContainer.appendTo(cssMainContainer);
    // append additional style
    classContainer.html('<style>' + className + ' {' + classValue + '}</style>');
  public ngOnDestroy(): void {  
    this.synthService.stop(); 
  public initSynthController():void{
    // ============SYNTH PARAMETERS=================
    let cursorControl = {
      beatSubdivisions:this.transport.getNb_subbeat_per_beat(),
      extraMeasuresAtBeginning:1,
      onStart : ()=> {
        this.fillNotesBlack();this.has_started = true;
      },
      onFinished : ()=> {
        this.has_started = false;
        setTimeout(()=>{
          this.askNext.emit( true );
        },1000)
      // onBeat:(beatNumber, totalBeats, totalTime)=>{ this.onBeat(beatNumber, totalBeats, totalTime) },
      onEvent:(event)=>{this.onEvent(event);},
      onLineEnd:(event)=>{this.onLineEnd(event);}
    };
    let visualOptions = {
        displayLoop: true, 
        displayRestart: true, 
        displayPlay: true, 
        displayStop: true, 
        displayProgress: true, 
        displayWarp: true,
    let n = this.visualObj.getMeter().value[0].num;
    let d='',noteOns='',noteOffs='';
    let drum = '';
    for (var i = 0; i < n; ++i: any) {
      if(i==0: any) {
        noteOns+='76 ';
        noteOffs+='60 ';
      }else{
        noteOns+='77 ';
        noteOffs+='30 ';
      }
      d+='d';
      // drum= "dddd 76 77 77 77 60 30 30 30",
    //remove last space 
    noteOffs = noteOffs.slice(0,noteOffs.length-1);
    drum = d+' '+noteOns+ noteOffs;
    let audioParams = {
      drum: drum,
      drumIntro:1,
      chordsOff:this.mute_chords,
      voicesOff:!this.sound,
      soundFontVolumeMultiplier:1,
      millisecondsPerMeasure: 1000,
      qpm:90,
      defaultQpm:90,
      options:{
        voicesOff:true,
    // ============SYNTH===============
    let selector = "#synthControl";
    this.synthService.load(selector, cursorControl, visualOptions )
    let  callback = ()=>{
        $(".abcjs-midi-start.abcjs-btn").focus();
        this.synthService.play();
    if(this.debug_mode) 
      callback = ()=>{
      // $(".abcjs-midi-start.abcjs-btn").focus();
    if(this.receivedData && !this.receivedData.timed)
        this.midiNotesTab$ = this.midi.notesTabSubject.subscribe((data)=>{
          if(this.MIDI_OFF)return;
          if(!data.length: any) {
            if(!this.prevMidiNotes.length)return;  
            // console.log("this.prevMidiNotes => ",this.prevMidiNotes);
            let midi_lh = [];
            let midi_rh = [];
            for(let i in this.prevMidiNotes: any) {
              if(this.prevMidiNotes[i] < 60)midi_lh.push(this.prevMidiNotes[i]);
              if(this.prevMidiNotes[i] >= 60)midi_rh.push(this.prevMidiNotes[i]);
            }
            this.check_midi_answer_no_time(midi_lh, midi_rh);
            this.prevMidiNotes = [];
          }else{
            this.prevMidiNotes = [...this.prevMidiNotes,...data];
            this.prevMidiNotes = this.prevMidiNotes.filter((item, pos) => this.prevMidiNotes.indexOf(item) === pos).sort();
          }
        }));
        this.get_midi_pitches();
        this.scoreCurNotes = {};
        this.scoreCurNotes.left = this.scoreNotes_leftHand.shift();
        this.scoreCurNotes.right = this.scoreNotes_rightHand.shift();
      }//end of callback
    this.synthService.init(this.visualObj,audioParams, callback);
    // this.transport.reset_silent();
  private get_midi_pitches():void{
    this.scoreNotes_leftHand = [];
    this.scoreNotes_rightHand = [];
    for(let s = 0; s < this.visualObj.lines[0].staff.length; s++: any) {
      let staff = this.visualObj.lines[0].staff[s];
      if(staff.clef.type == "treble")
      for(let n = 0; n < staff.voices[0].length; n++: any) {
        let note = staff.voices[0][n]
        if(note["el_type"] == "note" && !note.hasOwnProperty("rest"))
          this.scoreNotes_rightHand.push(note);
      if(staff.clef.type == "bass")
          this.scoreNotes_leftHand.push(note);
  private fill_note_color(color:string="black", event:any=null):void{
    // DEPREC WITH NEWER VERSION OF ABC
    // if(event.measureStart&&event.line==0&&event.measureNumber==0: any) {
      // let note = $(".abcjs-note.abcjs-v0.abcjs-m"+(event.measureNumber+1)+".abcjs-n0.abcjs-l"+(event.line)).css("fill",color);
      // note.prev().css("fill",color);
      // let note = $(".abcjs-note.abcjs-v1.abcjs-m"+(event.measureNumber)+".abcjs-n0.abcjs-l"+(event.line)).css("fill",color);
    // } else{
      for(let i = 0; i < event.elements.length; i++: any) {
        $(event.elements[i]).css("fill",color);
    // }
  private fillNotesBlack():void{
   $(".abcjs-note").css("fill","black");
  private fill_chord_with_color(color:string="black", event:any=null){
    // console.log("Measure 1rst beat coloration");
      let annotations = $(event.elements[0]).filter(".abcjs-chord");
    for(let e of annotations: any) {
      if(e.textContent == '')continue;
      let c = e.textContent.replace('♭',"b").replace('♯',"#");
      c = c.replace('F#','Gb').replace('Gbm','F#m');
      c = c.replace('C#','Db').replace('Dbm','C#m');
      this.cur_chord = c;
      // console.log("this.cur_chord ==============> ",this.cur_chord);
  // voice can be "r" or "l"
  private light_next_note(color:string="black", voice:string="r"):void{
    if(voice == "r": any) {
      // let note = $(".abcjs-note.abcjs-v0.abcjs-m"+(Math.floor(this.cursor_rh/4)+1)+".abcjs-n"+(this.cursor_rh%4)).css("fill",color);
      $(this.scoreCurNotes.right.abselem.elemset).css("fill",color);
    } else if(voice == "l": any) {
      $(this.scoreCurNotes.left.abselem.elemset).css("fill",color)
      // let note = $(".abcjs-note.abcjs-v1.abcjs-m"+Math.floor( this.cursor_lh/4 )+".abcjs-n"+(this.cursor_lh%4)).css("fill",color);
  public update_score(){
    var tuneBook = new ABC.TuneBook(this.abc_string);
    let current_tune = 0;
    if(this.random_song) current_tune = Math.round(Math.random()*(tuneBook.tunes.length-1));
    else current_tune = this.current_tune;
    this.renderString(tuneBook.tunes[current_tune].abc);
    setTimeout(()=>{
      let c = $('.abcjs-l0.abcjs-m1.abcjs-v0.abcjs-chord').text().replace('♭',"b").replace('♯',"#");
      this.initSynthController();
    },100);
  public renderString(s: any) {
      this.visualObj = ABC.renderAbc(['abcjs-paper-1','abcjs-paper-2'], s, {
        canvas_id: 'abcjs-paper', 
        add_classes:true, 
        clickListener:()=>{console.log("measure clicked")},
        visualTranspose:this.transpose,
        staffwidth:window.innerWidth*0.60, 
        // scale:1,
        viewPortVertical:true,
        viewPortHorizontal:true,
        responsive: "resize",
      })[0];
    },10)
  set_mute():void{
    this.synthService.set_sound(this.sound);
  change_tempo(): void{
    this.update_score();
  check_midi_answer_no_time(midi_lh:Array<number>,midi_rh:Array<number>): void{
    let ans_lh = {midiNotes:midi_lh, time:0};
    let ans_rh = {midiNotes:midi_rh, time:0};
    let hasWon_lh = true;
    if(midi_lh.length && this.scoreCurNotes.left: any) {
      hasWon_lh = this.resService.addMidiAnswer2( ans_lh, this.scoreCurNotes.left );
      if(hasWon_lh) this.light_next_note("green","l");
      else this.light_next_note("red","l");
      this.scoreCurNotes.left = this.scoreNotes_leftHand.shift();
      // this.cursor_lh++;
    } 
    let hasWon_rh = true;
    if(midi_rh.length && this.scoreCurNotes.right: any) {
      hasWon_rh = this.resService.addMidiAnswer2( ans_rh, this.scoreCurNotes.right );
      if(hasWon_rh) this.light_next_note("green","r");
      else this.light_next_note("red","r");
      this.scoreCurNotes.right = this.scoreNotes_rightHand.shift();
      // this.cursor_rh++;
    let has_won = hasWon_rh && hasWon_lh;
    if( (!this.scoreCurNotes.right ) && (!this.scoreCurNotes.left ) )
      this.quit(has_won);
  /*
    with each measure start : we get the chord on top and make it the @input of fifth-circle.component
  */
  private onEvent(event):void{
    if(event.measureStart) this.fill_chord_with_color("green",event);
    // let delay = event.midiPitches[0].durationInMeasures*event.millisecondsPerMeasure/2.15;
    // let delay = 250;
    let delay = event.millisecondsPerMeasure / 10;
      let hasWon = this.resService.add_timed_midiAnswer( this.midi.notesTab, event );
      if(hasWon)
        this.fill_note_color("green", event);
      else
        this.fill_note_color("red", event);
      
    }, delay);
    this.fill_note_color("green", event);
  private onBeat(beatNumber, totalBeats, totalTime):void{
    let n = Number( (1/this.transport.getNb_subbeat_per_beat()).toPrecision(4));
    if(beatNumber == 0 )return; //skip the first beat
    if(beatNumber%n < 0.1 : any) {
      this.transport.incSubBeat(1);
  private onLineEnd(event: any) {
    this.cursor_line +=1;
  private quit( hasWon ):void{
    this.zone.run(()=>{
      this.midiNotesTab$.unsubscribe();
      this.askNext.emit( hasWon );
    }));
  
}
