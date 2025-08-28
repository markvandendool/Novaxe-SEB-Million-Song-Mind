import { Component, OnInit, OnDestroy, AfterViewInit, Output, EventEmitter, NgZone } from '@angular/core';

import { Songmodel } from '@models/songmodel/songmodel';
import { Beat } from '@models/songmodel/beat';
import { DisplayService } from '@services/display/displayService';
import { TransportService } from '@services/transport/transport.service';
import { ExerciseResultsService } from '@services/exercises/exercise_results/exercise-results.service';
import { SynthService } from '@services/synth/synth.service';


import { Subscription } from 'rxjs';

import patterns from '@assets/rythm-patterns.json';
import { MidiService } from "@services/midi/midi.service"
import { Note, Chord, Scale, AbcNotation } from "@tonaljs/tonal";


import abcjs from 'abcjs';
declare global {
  var abcjs:any;
}

@Component({
    selector: 'app-exercice-rythm',
    templateUrl: './exercice-rythm.component.html',
    styleUrls: ['./exercice-rythm.component.scss'],
    standalone: false
})
export class ExerciceRythmComponent implements OnInit, AfterViewInit, OnDestroy {

  /*==================VARIABLES =====================*/
  private nb_measures: number=4;

  private nb_beat: number=4;

  private tonality: string="C";
  public tempo: string="90";
  public cur_chord: string="C4";
  private scale: string="dominant";
  // private progression: Array<any>=[{chord:"D4",scale:"dorian"},{chord:"G4",scale:"dominant"},{chord:"C4",scale:"major"},{chord:"C4",scale:"major"}];

  // public right_hand_string='|"C"CD EF GA Bc | BA GF ED C2|';
  // public right_hand_string='|"^C" "_" C2 "^A" "_" A2 "^E" "_" E2 "^F" "_" F2 |"^C" "_" C2 "^A" "_" A2 "^E" "_" E2 "^C" "_" C2 |"^A" "_" A2 "^G" "_" G6 |';
  // public right_hand_string='|BG BG BG BG|';
  
  // public left_hand_string='|"_ii" D,4A,,4|"_V7" G,4D,4|"_IMaj" C,8|"_IMaj" [C,8B,8]|';
  // public left_hand_string='|x8|';
  // public left_hand_string='|x8|x8|';
  public right_hand_string='|: "C" c_BG_GF_E C2 | "F" C_EF_G=G_Bc2| "C" c_BG_GF_E C2 | "F" C_EF_G=G_Bc2:|';
  public left_hand_string='|:C,4_B,,4|F,,4_B,,4|C,4_B,,4|F,,4_B,,4:|';
  public transpose:number = 0;

  private visualObj: any;

  private synthControl;

  private synth:any;

  private has_started:boolean=false;
  public  notes_ok:boolean=false;

  private midiNotesTab$:Subscription;
  private scoreNotesTab:Array<any>=[];

  public debug_mode:boolean=false;
  @Output() askNext     = new EventEmitter<boolean>(); //output answer
  public receivedData: any ; //input json
  public parsedData: any ; //input json
  public sound: boolean=false;
  public chordsOff: boolean=true;
  private prevMidiNotes:Array<number>=[];
  private cursor_lh:number=0;
  private cursor_rh:number=0;



/*====================FUNCTIONS======================*/

  constructor(public transport:TransportService, private midi:MidiService, private ds:DisplayService, private sm:Songmodel, private resService:ExerciseResultsService, private synthService:SynthService, private zone:NgZone) {

   //debug mode
   const urlParams = new URLSearchParams(window.location.search);
   if(urlParams.get('debug')) this.debug_mode = true;

   this.cursor_lh=0;
   this.cursor_rh=0;
  }


  ngOnInit(): void {
    this.loadFromJson();
  }

  ngAfterViewInit(){
    console.log("ngAfterViewInit");
    // console.log("SONG COMPONENT INIT ngAfterViewInit");
    // this.change_score();
    // this.loadFromJson();

    this.change_score();
    if(this.parsedData == undefined)return
    if(this.parsedData.hide_chord) this.ds.changeCss(".abcjs-chord","opacity:0");
    if(this.parsedData.hide_function) this.ds.changeCss(".abcjs-annotation","opacity:0");

  }

  ngOnDestroy(): void {  
    this.synthService.stop(); 
  }

  initSynthController():void{
    console.log("initSynthController");

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
        displayLoop: true, 
        displayRestart: true, 
        displayPlay: true, 
        displayStop: true, 
        displayProgress: true, 
        displayWarp: true
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


    if(this.parsedData)
    if(!this.parsedData.timed)
      callback = ()=>{
        this.midiNotesTab$ = this.midi.notesTabSubject.subscribe((data)=>{

          if(!data.length){

            if(!this.prevMidiNotes.length)return;  

            console.log("this.prevMidiNotes => ",this.prevMidiNotes);
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
        })
      }
    // debugger

    this.synthService.init(this.visualObj,audioParams, callback);

    // this.transport.reset_silent();
  }







  private onBeat(beatNumber, totalBeats, totalTime):void{

    let n = Number( (1/this.transport.getNb_subbeat_per_beat()).toPrecision(4));

    if(beatNumber == 0 )return; //skip the first beat

    if(beatNumber%n < 0.1 ){
      this.transport.incSubBeat(1);
      // this.transport.incBeatDiv(1);
    }
    // else{
      // console.log('beatnumber not accepted : ' + beatNumber)
    // }
  }

  /*
    with each measure start : we get the chord on top and make it the @input of fifth-circle.component
  */
  private onEvent(event):void{

    if(event.measureStart) this.fill_chord_with_color("green",event);


    // let delay = event.midiPitches[0].durationInMeasures*event.millisecondsPerMeasure/2.15;
    // let delay = 250;
    let delay = event.millisecondsPerMeasure / 11;

    setTimeout(()=>{

      let hasWon = this.resService.add_timed_midiAnswer( this.midi.notesTab, event );


      if(hasWon)
        this.fill_note_color("green", event);
      else
        this.fill_note_color("red", event);
      
    }, delay);

    this.fill_note_color("green", event);
  }

  private fill_note_color(color:string="black", event:any=null):void{

    if(event.measureStart){
      let note = $(".abcjs-note.abcjs-v0.abcjs-m"+(event.measureNumber+1)+".abcjs-n0").css("fill",color);
      note.prev().css("fill",color);
      note = $(".abcjs-note.abcjs-v1.abcjs-m"+(event.measureNumber)+".abcjs-n0").css("fill",color);
      note.prev().css("fill",color);
    }
    else{

      for(let i = 0; i < event.elements.length; i++){
        $(event.elements[i]).css("fill",color);

      }

      // debugger
    }
  }

  private fillNotesBlack():void{
   $(".abcjs-note").css("fill","black");
  }

  private fill_chord_with_color(color:string="black", event:any=null){
    console.log("fill_chord_with_color");
      // debugger
      let annotations = $(event.elements[0]).filter(".abcjs-chord");
    for(let e of annotations){
      if(e.textContent == '')continue;
      let c = e.textContent.replace('♭',"b").replace('♯',"#");
      c = c.replace('F#','Gb').replace('Gbm','F#m');
      c = c.replace('C#','Db').replace('Dbm','C#m');
      this.cur_chord = c;
      console.log("this.cur_chord ==============> ",this.cur_chord);
    }

  }

  // voice can be "r" or "l"
  private light_next_note(color:string="black", voice:string="r"):void{
    if(voice == "r"){
      let note = $(".abcjs-note.abcjs-v0.abcjs-m"+(Math.floor(this.cursor_rh/4)+1)+".abcjs-n"+(this.cursor_rh%4)).css("fill",color);
      note.prev().css("fill",color);
      // debugger
    } else if(voice == "l"){
      let note = $(".abcjs-note.abcjs-v1.abcjs-m"+Math.floor( this.cursor_lh/4 )+".abcjs-n"+(this.cursor_lh%4)).css("fill",color);
      note.prev().css("fill",color);
    }
  }

  private get_rand(min,max): number{
    return Math.floor(Math.random() * max)+min;
  }

  public generate_measure(): string{
    let str = "";
    //pick nb_beat patterns
    for(let i=0; i < this.nb_beat; i++){
      let rnd = this.get_rand( 0,  patterns.simple.beat.length);  
      str+= " "+patterns.simple.beat[rnd];
    }
    return str;
  }

  private replace_with_notes(str,scale): string{

    let sc = Scale.get(scale);
    let n;
    let str2 = ''; 

    for(let i =0; i < str.length; i++){
      if(str[i] == '$'){
        n = this.get_rand(0,sc.notes.length);
        str2 += AbcNotation.scientificToAbcNotation( sc.notes[n] );
      }else{
        str2 += str[i];
      }
    }

    return str2;
  }


  public change_score(){
    this.renderStrings(this.left_hand_string, this.right_hand_string);
    setTimeout(()=>{
      let c = $('.abcjs-l0.abcjs-m1.abcjs-v0.abcjs-chord').text().replace('♭',"b").replace('♯',"#");
      c = c.replace('F#','Gb').replace('Gbm','F#m');
      c = c.replace('C#','Db').replace('Dbm','C#m');
      console.log('c => ',c);
      this.cur_chord = c;
      this.initSynthController();
    },100);
  }


  renderStrings(l,r){
    // let tab = [6,1,8,3,-2,5,0,-5,2,9,4,-1,6]
    let header = '';
    header += "%%staves {(PianoRightHand) (PianoLeftHand)}"+"\n";
    header += "V:PianoRightHand clef=treble down"+"\n";
    header += "V:PianoLeftHand clef=bass"+"\n";
    header += "M:"+"4/4"+"\n";

    header += "Q:"+this.tempo+"\n";
    header += "K:"+this.tonality+"\n";

    l = "[V: PianoLeftHand]  "+l+"\n";
    r = "[V: PianoRightHand] "+r+"\n";
    console.log('header+l+r => ',header+l+r);

    // responsive: "resize",
    setTimeout(()=>{

      this.visualObj = abcjs.renderAbc('abcjs-paper', header+l+r, {
        add_classes:true, 
        clickListener:()=>{console.log("measure clicked")},
        visualTranspose:this.transpose,
        staffwidth:window.innerWidth*0.60, 
        // staffwidth:90, 
        scale:2,
        responsive:'resize',

      })[0];
      debugger
    },10)
  }


  loadFromJson(){
    if(this.receivedData == undefined)return; 

    this.parsedData = JSON.parse(this.receivedData);

    this.tempo = this.parsedData.tempo;
    this.sound = this.parsedData.sound;

    let mode = (this.parsedData.entities[0].mode=='n_minor' || this.parsedData.entities[0].mode=='h_minor' || this.parsedData.entities[0].mode=='m_minor')?'m':'';

    let transpo = ['G','Ab','A','Bb','B','C', 'Db', 'D', 'Eb', 'E', 'F', 'F#'].indexOf(this.parsedData.entities[0].tonality)-5;
    this.transpose = transpo;

    let ttl_abc_string = "";
    for(let i = 0; i < this.parsedData.entities.length; i++){

      if(!this.parsedData.hide_chord) 
      if(this.parsedData.entities[i].template_type == "chord" )
        ttl_abc_string +="\""+this.parsedData.entities[i].chord_name+"\" ";
      else if(this.parsedData.entities[i].template_type == "notes" && this.parsedData.voice_G)
        ttl_abc_string +="\""+this.parsedData.entities[i].notes_string+"\" ";


      if(!this.parsedData.voice_G)
        ttl_abc_string+= " x2 "
      else {
        ttl_abc_string += this.parsedData.entities[i].abc_string + " ";
      }

    // debugger

      if((i+1)%4==0)ttl_abc_string+="|";
    }

    let ttl_abc_string_lh = "";
    let ttl_abc_array_lh = [];
    let ttl_string_top_lh = [];
    for(let i = 0; i < this.parsedData.entities_lh.length; i++){


      if(!this.parsedData.hide_function) 
      if(this.parsedData.entities[i].template_type == "chord" )
        ttl_abc_string_lh +="\""+this.parsedData.entities[i].chord_name+"\" ";
      else if(this.parsedData.entities[i].template_type == "notes" && this.parsedData.voice_F)
        ttl_abc_string_lh +="\""+this.parsedData.entities_lh[i].notes_string+"\" ";

      if(!this.parsedData.voice_F)ttl_abc_string_lh += " x2"
      else ttl_abc_string_lh += this.parsedData.entities_lh[i].abc_string + " ";

      if((i+1)%4==0)ttl_abc_string_lh+="|";
    }
    this.right_hand_string ="|"+ ttl_abc_string+"|";
    this.left_hand_string ="|"+ ttl_abc_string_lh+"|";


    console.log("ttl_abc_string => ",ttl_abc_string);
  }


  set_mute():void{
    this.synthService.set_sound(this.sound);
  }

  change_tempo(): void{
    this.change_score();
  }

  check_midi_answer_no_time(midi_lh:Array<number>,midi_rh:Array<number>): void{
    console.log("check_midi_answer_no_time============");

    console.log("midi_lh => ",midi_lh);
    console.log("midi_rh => ",midi_rh);

    let ans_lh = {midiNotes:midi_lh, time:0};
    let ans_rh = {midiNotes:midi_rh, time:0};

    let hasWon_lh = true;
    if(midi_lh.length && this.cursor_lh < this.parsedData.entities_lh.length){
      hasWon_lh = this.resService.addMidiAnswer( ans_lh, this.parsedData.entities_lh[this.cursor_lh] );
      console.log("hasWon_lh => ",hasWon_lh);
      if(hasWon_lh) this.light_next_note("green","l");
      else this.light_next_note("red","l");

      this.cursor_lh++;
    } 

    let hasWon_rh = true;
    if(midi_rh.length && this.cursor_rh < this.parsedData.entities.length){
      hasWon_rh = this.resService.addMidiAnswer( ans_rh, this.parsedData.entities[this.cursor_rh] );
      console.log("hasWon_rh => ",hasWon_rh);
      if(hasWon_rh) this.light_next_note("green","r");
      else this.light_next_note("red","r");
      this.cursor_rh++;
    } 


    let has_won = hasWon_rh && hasWon_lh;
    if( (this.cursor_rh == this.parsedData.entities.length || !this.parsedData.voice_G) && (this.cursor_lh == this.parsedData.entities_lh.length || !this.parsedData.voice_F) )
      this.quit(has_won);
    console.log("has_won => ",has_won);
  }


  private quit( hasWon ):void{
    // this.abcString$.unsubscribe(); 
    this.zone.run(()=>{
      this.midiNotesTab$.unsubscribe();
      this.askNext.emit( hasWon );
    });
  }
}
