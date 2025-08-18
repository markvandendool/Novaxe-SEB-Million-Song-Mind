import { Component, OnInit, OnDestroy, AfterViewInit, Output, EventEmitter, NgZone } from '@angular/core';
import { Subscription } from 'rxjs';

import { TransportService } from '@services/transport/transport.service';
import { ExerciseResultsService } from '@services/exercises/exercise_results/exercise-results.service';
import { SynthService } from '@services/synth/synth.service';
import { MidiService } from "@services/midi/midi.service"
import { Scale, AbcNotation } from "@tonaljs/tonal";

import abcjs from 'abcjs';
export const ABC: any = abcjs;


@Component({
  selector: 'app-abc-hearing',
  templateUrl: './abc-hearing.component.html',
  styleUrls: ['./abc-hearing.component.scss']
})
export class AbcHearingComponent implements OnInit {


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
  public right_hand_string=`[V: PianoRightHand] | c2d2e2f2 |`;
  public left_hand_string=``;

  public transpose:number = 0;

  private visualObj: any;

  private synthControl;

  private synth:any;

  private has_started:boolean=false;

  private midiNotesTab$:Subscription;

  // private scoreNotes_leftHand:Array<any>;
  // private scoreNotes_bothHands:Array<any>;
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

  constructor(public transport:TransportService, private midi:MidiService, private resService:ExerciseResultsService, private synthService:SynthService, private zone:NgZone) {

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

    this.update_score();

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
      onStart : ()=> {},
      onFinished : ()=> {
        console.log("The tune has stopped playing."); 
        setTimeout(()=>{
          this.quit(true);
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
      // drum: "dddd 76 77 77 77 60 30 30 30",
      // drumIntro:1,
      chordsOff:this.chordsOff,
      voicesOff:true,
      soundFontVolumeMultiplier:1,
    };

    // ============SYNTH===============

    let selector = "#synthControl";

    this.synthService.load(selector, cursorControl, visualOptions )


    let  callback; 

    if(this.debug_mode) 
      callback = ()=>{
        this.fill_notes_color('blue');
        this.synthService.play();
      }

    else
      callback = ()=>{
        this.synthService.play();
      }//end of callback




    this.synthService.init(this.visualObj,audioParams, callback);
  }


  private fill_note_color(color:string="black", event:any=null):void{

    if(event.measureStart){
      // let note = $(".abcjs-note.abcjs-v0.abcjs-m"+(event.measureNumber+1)+".abcjs-n0").css("fill",color);
      // note.prev().css("fill",color);
      // note = $(".abcjs-note.abcjs-v1.abcjs-m"+(event.measureNumber)+".abcjs-n0").css("fill",color);
      // note.prev().css("fill",color);
      for(let i = 0; i < event.elements.length; i++)
        $(event.elements[i]).css("fill",color);

    }
    else{

      for(let i = 0; i < event.elements.length; i++)
        $(event.elements[i]).css("fill",color);

    }
  }

  private fill_notes_color(color):void{

   for(let i =0; i < this.visualObj.lines.length; i++)
     for(let j = 0; j < this.visualObj.lines[i].staff.length; j++)
       for(let k = 0; k < this.visualObj.lines[i].staff[j].voices.length; k++)
         for(let l = 0; l < this.visualObj.lines[i].staff[j].voices[k].length; l++)
           if(this.visualObj.lines[i].staff[j].voices[k][l].el_type == 'note')
             $(this.visualObj.lines[i].staff[j].voices[k][l].abselem.elemset).css('fill',color)
  }


  private fill_chord_with_color(color:string="black", event:any=null){
    console.log("Measure 1rst beat coloration");
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


  public update_header():void{

    this.header= "V:PianoRightHand clef=treble down\n"+
    "V:PianoLeftHand clef=bass\n"+
    "M:4/4\n"+
    "Q:"+this.tempo+"\n"+
    "K:C";
  }

  public update_score(){
    console.log("update_score");

    if(this.debug_mode)this.update_header();

    this.renderStrings(this.header, this.left_hand_string, this.right_hand_string);
    setTimeout(()=>{
      let c = $('.abcjs-l0.abcjs-m1.abcjs-v0.abcjs-chord').text().replace('♭',"b").replace('♯',"#");
      c = c.replace('F#','Gb').replace('Gbm','F#m');
      c = c.replace('C#','Db').replace('Dbm','C#m');
      this.cur_chord = c;
      this.initSynthController();
    },10);
  }

  renderStrings(h,l,r){

    setTimeout(()=>{

      let abcString = h;
      if(l!="")abcString += "\n"+l;
      if(r!="")abcString += "\n"+r;

      console.log("abcString => \n",abcString);
      this.visualObj = ABC.renderAbc('abcjs-paper', abcString, {
        canvas_id: 'abcjs-paper', 
        add_classes:true, 
        clickListener:()=>{console.log("measure clicked")},
        visualTranspose:this.transpose,
        staffwidth:window.innerWidth*0.60, 
        scale:2,
        // responsive: "resize",
        responsive:'resize',
      })[0];
      this.fill_notes_color('transparent');
    },10)
  }

  public loadFromJson(){
    if(this.receivedData == undefined)return; 

    this.parsedData = this.receivedData;

    this.tempo = this.parsedData.tempo;
    this.sound = this.parsedData.sound;
    this.transpose = this.receivedData.tona.transpo;

    this.header =this.receivedData.header;
    this.right_hand_string =this.receivedData.right_hand;
    this.left_hand_string =this.receivedData.left_hand;
  }


  public check_midi_answer_no_time(midi_lh:Array<number>,midi_rh:Array<number>): void{
    console.log("check_midi_answer_no_time============");

    console.log("midi_lh => ",midi_lh);
    console.log("midi_rh => ",midi_rh);
    console.log('this.currentEventToCheck => ',this.currentEventToCheck);
    // if(!this.MIDI_OPEN)return;

    let ans_lh = {midiNotes:midi_lh, time:0};
    let ans_rh = {midiNotes:midi_rh, time:0};

    let hasWon_lh = true;
    let hasWon = this.resService.add_timed_midiAnswer( midi_lh.concat(midi_rh), this.currentEventToCheck );

    console.log('hasWon => ',hasWon);


    if(hasWon)
      this.fill_note_color("green", this.currentEventToCheck);
    else
      this.fill_note_color("red", this.currentEventToCheck);

    this.synthService.play(); 
  }

  private play_next_note():void{

    ABC.synth.playEvent(
    this.currentEventToCheck.midiPitches,
    [], this.synthService.synth.millisecondsPerMeasure // a measure takes one second.
    ).then((response)=> {
      console.log('played ! => ',response);

    }).catch(function (error) {
    console.log("error playing note", error);
    });
  }

  /*
    On each event played
  */
  private onEvent(event):void{

    this.synthService.stop(); 
    this.currentEventToCheck = event;
    this.subscribe_MIDI();

    // just play the note to check synth vol is set to mute
    this.play_next_note();
  }

  private subscribe_MIDI():void{
    this.midiNotesTab$ = this.midi.notesTabSubject.subscribe((data)=>{
      console.log('DATA RECEIEVED : '+data);

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
        this.midiNotesTab$.unsubscribe();
        this.synthService.play();
      }else{
        this.prevMidiNotes = [...this.prevMidiNotes,...data];
        this.prevMidiNotes = this.prevMidiNotes.filter((item, pos) => this.prevMidiNotes.indexOf(item) === pos).sort();
      }
    }); //end of subscribe to midi tab

  }

  private onBeat(beatNumber, totalBeats, totalTime):void{

    let n = Number( (1/this.transport.getNb_subbeat_per_beat()).toPrecision(4));

    if(beatNumber == 0 )return; //skip the first beat

    if(beatNumber%n < 0.1 ){
      this.transport.incSubBeat(1);
    }
  }

  private quit( hasWon ):void{
    console.log('quit');
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
