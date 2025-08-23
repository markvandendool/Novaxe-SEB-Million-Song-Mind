import { Component, OnInit, OnDestroy, AfterViewInit, Output, EventEmitter, NgZone } from '@angular/core';
import { Subscription } from 'rxjs';

import { TransportService } from '@services/transport/transport.service';
import { ExerciseResultsService } from '@services/exercises/exercise_results/exercise-results.service';
import { SynthService } from '@services/synth/synth.service';
import { MidiService } from "@services/midi/midi.service"
import { Scale, AbcNotation } from "@tonaljs/tonal";


import abcjs from 'abcjs';
declare global {
  var abcjs:any;
}

 
@Component({
    selector: 'app-abc-checker',
    templateUrl: './abc-checker.component.html',
    styleUrls: ['./abc-checker.component.scss'],
    standalone: false
})
export class AbcCheckerComponent implements OnInit {

  /*==================VARIABLES =====================*/

  private tonality: string="C";
  public tempo: string="90";

  // current chord on fifths circle
  public cur_chord: string="C4";

  public header:string=`%%staves {(PianoRightHand) (PianoLeftHand)}
V:PianoRightHand clef=treble down
V:PianoLeftHand clef=bass
M:4/4
Q:120
K:C `;
  public right_hand_string=`[V: PianoRightHand] | "C" c_BG_GF_E C2 | "F" C_EF_G=G_Bc2| "C" c_BG_GF_E C2 | "F" C_EF_G=G_Bc2|`;
  public left_hand_string=`[V: PianoLeftHand] |C,4_B,,4|F,,4_B,,4|C,4_B,,4|F,,4_B,,4|`;

  public transpose:number = 0;

  private visualObj: any;

  private synthControl;

  private synth:any;

  private has_started:boolean=false;

  private midiNotesTab$:Subscription;

  private scoreNotes_leftHand:Array<any>;
  private scoreNotes_rightHand:Array<any>;
  private scoreCurNotes:any;

  public debug_mode:boolean=false;

  @Output() askNext     = new EventEmitter<boolean>(); //output answer
  public receivedData: any ; //input json

  public parsedData: any ; //input json

  public sound: boolean=true;
  public chordsOff: boolean=true;
  private prevMidiNotes:Array<number>=[];
  private cursor_lh:number=0;
  private cursor_rh:number=0;



/*====================FUNCTIONS======================*/

  constructor(public transport:TransportService, private midi:MidiService, private resService:ExerciseResultsService, private synthService:SynthService, private zone:NgZone) {

   //debug mode
   const urlParams = new URLSearchParams(window.location.search);
   if(urlParams.get('debug') ) this.debug_mode = true;

   this.cursor_lh=0;
   this.cursor_rh=0;
  }


  ngOnInit(): void {
    this.loadFromJson();
  }

  ngAfterViewInit(){
    this.midi.notesTab = [];

    this.update_score();
    if(this.parsedData == undefined)return
    if(this.parsedData.HIDE_CHORD) this.changeCss(".abcjs-chord","opacity:0");
    if(this.parsedData.HIDE_FUNCTION) this.changeCss(".abcjs-annotation","opacity:0");

  }

  changeCss(className, classValue) {
    // we need invisible container to store additional css definitions
    var cssMainContainer = $('#css-modifier-container');
    if (cssMainContainer.length == 0) {
        var cssMainContainer = $('<div id="css-modifier-container"></div>');
        cssMainContainer.hide();
        cssMainContainer.appendTo($('body'));
    }

    // and we need one div for each class
    let classContainer = cssMainContainer.find('div[data-class="' + className + '"]');
    if (classContainer.length == 0) {
        classContainer = $('<div data-class="' + className + '"></div>');
        classContainer.appendTo(cssMainContainer);
    }

    // append additional style
    classContainer.html('<style>' + className + ' {' + classValue + '}</style>');
  }


  ngOnDestroy(): void {  
    this.synthService.stop(); 
  }

  private initSynthController():void{

    // console.log("initSynthController");
    // ============SYNTH PARAMETERS=================


    let cursorControl = {
      beatSubdivisions:this.transport.getNb_subbeat_per_beat(),
      extraMeasuresAtBeginning:1,
      onStart : ()=> {
        this.fillNotesBlack();this.has_started = true;
      },
      onFinished : ()=> {
        console.log("The tune has stopped playing."); 
        this.has_started = false;
        setTimeout(()=>{
          this.askNext.emit( true );
        },1000)

      },
      // onBeat:(beatNumber, totalBeats, totalTime)=>{ this.onBeat(beatNumber, totalBeats, totalTime) },
      onEvent:(event)=>{this.onEvent(event);},
    };

    let visualOptions = {
        displayLoop: false, 
        displayRestart: true, 
        displayPlay: true, 
        displayStop: true, 
        displayProgress: false, 
        displayWarp: false
    };

    let audioParams = {
      drum: "dddd 76 77 77 77 60 30 30 30",
      drumIntro:1,
      chordsOff:this.chordsOff,
      voicesOff:!this.sound,
      soundFontVolumeMultiplier:1,
      options:{
        // voicesOff:true,
      }
    };

    // ============SYNTH===============

    let selector = "#synthControl";

    this.synthService.load(selector, cursorControl, visualOptions )


    let  callback = ()=>{
        $(".abcjs-midi-start.abcjs-btn").focus();
        this.synthService.play();
      }

    if(this.debug_mode) 
      callback = ()=>{
      // $(".abcjs-midi-start.abcjs-btn").focus();
      }


    if(this.parsedData && this.parsedData.template_type == 'reading_untimed')
      callback = ()=>{
        this.midiNotesTab$ = this.midi.notesTabSubject.subscribe((data)=>{

          if(!data.length){

            if(!this.prevMidiNotes.length)return;  

            // console.log("this.prevMidiNotes => ",this.prevMidiNotes);
            let midi_lh = [];
            let midi_rh = [];
            for(let i in this.prevMidiNotes){
              if(this.prevMidiNotes[i] < 60)midi_lh.push(this.prevMidiNotes[i]);
              if(this.prevMidiNotes[i] >= 60)midi_rh.push(this.prevMidiNotes[i]);
            }

            this.check_midi_answer_no_time(midi_lh, midi_rh);
            this.prevMidiNotes = [];
          }else{
            this.prevMidiNotes = [...this.prevMidiNotes,...data];
            this.prevMidiNotes = this.prevMidiNotes.filter((item, pos) => this.prevMidiNotes.indexOf(item) === pos).sort();
          }
        });

        this.get_midi_pitches();
        this.scoreCurNotes = {};
        this.scoreCurNotes.left = this.scoreNotes_leftHand.shift();
        this.scoreCurNotes.right = this.scoreNotes_rightHand.shift();
      }//end of callback

    this.synthService.init(this.visualObj,audioParams, callback);

    // this.transport.reset_silent();
  }



  private get_midi_pitches():void{
    this.scoreNotes_leftHand = [];
    this.scoreNotes_rightHand = [];

    for(let s = 0; s < this.visualObj.lines[0].staff.length; s++){

      let staff = this.visualObj.lines[0].staff[s];

      if(staff.clef.type == "treble")
      for(let n = 0; n < staff.voices[0].length; n++){
        let note = staff.voices[0][n]
        if(note["el_type"] == "note" && !note.hasOwnProperty("rest"))
          this.scoreNotes_rightHand.push(note);
      }

      if(staff.clef.type == "bass")
      for(let n = 0; n < staff.voices[0].length; n++){
        let note = staff.voices[0][n]
        if(note["el_type"] == "note" && !note.hasOwnProperty("rest"))
          this.scoreNotes_leftHand.push(note);
      }
    }
  }



  private fill_note_color(color:string="black", event:any=null):void{

    // if(event.measureStart){

      // DEPREC WITH NEWER VERSIONS OF ABC
      // let note = $(".abcjs-note.abcjs-v0.abcjs-m"+(event.measureNumber+1)+".abcjs-n0").css("fill",color);
      // note.prev().css("fill",color);

      // let note = $(".abcjs-note.abcjs-v1.abcjs-m"+(event.measureNumber)+".abcjs-n0").css("fill",color);
      // note.prev().css("fill",color);
    // } else{

      for(let i = 0; i < event.elements.length; i++){
        $(event.elements[i]).css("fill",color);

      }

      // debugger
    // }
  }

  private fillNotesBlack():void{
   $(".abcjs-note").css("fill","black");
  }

  private fill_chord_with_color(color:string="black", event:any=null){
    // console.log("Measure 1rst beat coloration");
      // debugger
      let annotations = $(event.elements[0]).filter(".abcjs-chord");
    for(let e of annotations){
      if(e.textContent == '')continue;
      let c = e.textContent.replace('♭',"b").replace('♯',"#");
      c = c.replace('F#','Gb').replace('Gbm','F#m');
      c = c.replace('C#','Db').replace('Dbm','C#m');
      this.cur_chord = c;
      // console.log("this.cur_chord ==============> ",this.cur_chord);
    }

  }

  // voice can be "r" or "l"
  private light_next_note(color:string="black", voice:string="r"):void{
    if(voice == "r"){
      // let note = $(".abcjs-note.abcjs-v0.abcjs-m"+(Math.floor(this.cursor_rh/4)+1)+".abcjs-n"+(this.cursor_rh%4)).css("fill",color);
      $(this.scoreCurNotes.right.abselem.elemset).css("fill",color);
      // debugger
      // note.prev().css("fill",color);
      // debugger
    } else if(voice == "l"){
      $(this.scoreCurNotes.left.abselem.elemset).css("fill",color)
      // let note = $(".abcjs-note.abcjs-v1.abcjs-m"+Math.floor( this.cursor_lh/4 )+".abcjs-n"+(this.cursor_lh%4)).css("fill",color);
      // note.prev().css("fill",color);
    }
  }

  public update_header():void{

    if(!this.parsedData.header ) 
      this.header="%%staves {(PianoRightHand) (PianoLeftHand)}\n"+
      "V:PianoRightHand clef=treble down\n"+
      "V:PianoLeftHand clef=bass\n"+
      "M:4/4\n"+
      "Q:"+this.tempo+"\n"+
      "K:C";
    else
      this.header = this.parsedData.header;
  }

  public update_score(){
    // console.log("update_score");
    if(this.debug_mode)this.update_header();
    this.renderStrings(this.header, this.left_hand_string, this.right_hand_string);
    setTimeout(()=>{
      let c = $('.abcjs-l0.abcjs-m1.abcjs-v0.abcjs-chord').text().replace('♭',"b").replace('♯',"#");
      c = c.replace('F#','Gb').replace('Gbm','F#m');
      c = c.replace('C#','Db').replace('Dbm','C#m');
      // console.log('c => ',c);
      this.cur_chord = c;
      this.initSynthController();
    },100);
  }

  renderStrings(h,l,r){

    setTimeout(()=>{

      let abcString = h;
      if(l!="")abcString += "\n"+l;
      if(r!="")abcString += "\n"+r;

      console.log("abcString => \n",abcString);
      console.log('window.innerWidth*0.90 => ',window.innerWidth*0.90);

      let width = window.innerWidth*0.90;
      if(width < 1440 )width = 1440;

      this.visualObj = abcjs.renderAbc('abcjs-paper', abcString, {
        add_classes:true, 
        clickListener:()=>{console.log("measure clicked")},
        visualTranspose:this.transpose,
        staffwidth:width, 
        scale:2,
        // responsive: "resize",
      })[0];
    },10)
  }

  loadFromJson(){
    if(this.receivedData == undefined)return; 

    this.parsedData = this.receivedData;

    this.tempo = this.parsedData.tempo;
    this.sound = this.parsedData.sound;
    this.transpose = this.receivedData.tona.transpo;

    this.header =this.receivedData.header;
    this.right_hand_string =this.receivedData.right_hand;
    this.left_hand_string =this.receivedData.left_hand;
    this.debug_mode = this.receivedData.debug;
  }

  set_mute():void{
    this.synthService.set_sound(this.sound);
  }

  change_tempo(): void{
    this.update_score();
  }

  check_midi_answer_no_time(midi_lh:Array<number>,midi_rh:Array<number>): void{
    // console.log("check_midi_answer_no_time============");

    // console.log("midi_lh => ",midi_lh);
    // console.log("midi_rh => ",midi_rh);

    let ans_lh = {midiNotes:midi_lh, time:0};
    let ans_rh = {midiNotes:midi_rh, time:0};

    let hasWon_lh = true;
    if(midi_lh.length && this.scoreCurNotes.left){

      hasWon_lh = this.resService.addMidiAnswer2( ans_lh, this.scoreCurNotes.left );
      // console.log("hasWon_lh => ",hasWon_lh);


      if(hasWon_lh) this.light_next_note("green","l");
      else this.light_next_note("red","l");

      this.scoreCurNotes.left = this.scoreNotes_leftHand.shift();

      // this.cursor_lh++;
    } 

    let hasWon_rh = true;
    if(midi_rh.length && this.scoreCurNotes.right){
      hasWon_rh = this.resService.addMidiAnswer2( ans_rh, this.scoreCurNotes.right );
      // console.log("hasWon_rh => ",hasWon_rh);


      if(hasWon_rh) this.light_next_note("green","r");
      else this.light_next_note("red","r");

      this.scoreCurNotes.right = this.scoreNotes_rightHand.shift();

      // this.cursor_rh++;
    } 


    let has_won = hasWon_rh && hasWon_lh;
    if( (!this.scoreCurNotes.right || !this.parsedData.voice_G) && (!this.scoreCurNotes.left || !this.parsedData.voice_F) )
      this.quit(has_won);
    // console.log("has_won => ",has_won);
  }

  /*
    with each measure start : we get the chord on top and make it the @input of fifth-circle.component
  */
  private onEvent(event):void{

    if(event.measureStart) this.fill_chord_with_color("green",event);


    // let delay = event.midiPitches[0].durationInMeasures*event.millisecondsPerMeasure/2.15;
    // let delay = 250;
    let delay = event.millisecondsPerMeasure / 10;

    setTimeout(()=>{

      let hasWon = this.resService.add_timed_midiAnswer( this.midi.notesTab, event );


      if(hasWon)
        this.fill_note_color("green", event);
      else
        this.fill_note_color("red", event);
      
    }, delay);

    this.fill_note_color("green", event);
  }

  private onBeat(beatNumber, totalBeats, totalTime):void{

    let n = Number( (1/this.transport.getNb_subbeat_per_beat()).toPrecision(4));

    if(beatNumber == 0 )return; //skip the first beat

    if(beatNumber%n < 0.1 ){
      this.transport.incSubBeat(1);
    }
  }

  private quit( hasWon ):void{
    this.zone.run(()=>{
      this.midiNotesTab$.unsubscribe();
      this.askNext.emit( hasWon );
    });
  
  }

  public debug_fct(left,right):void{
    let tab = left.concat(right);
    this.midi.notesTabSubject.next(tab);
    this.midi.notesTabSubject.next([]);
  }
}
