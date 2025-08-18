import { Component, OnInit, OnDestroy, Output, EventEmitter, NgZone, HostListener } from '@angular/core';
import { Songmodel } from '@models/songmodel/songmodel';
import { Beat } from '@models/songmodel/beat';
import { DisplayService } from '@services/display/displayService';
import { Subscription } from 'rxjs';

import { MidiService } from '@services/midi/midi.service';

import { ExerciseResultsService } from '@services/exercises/exercise_results/exercise-results.service';

import { Note, Chord, Scale, Key, AbcNotation } from "@tonaljs/tonal";

export interface Answer{
  ans: string
}

import abcjs from 'abcjs';
declare global {
  var abcjs:any;
}

@Component({
  selector: 'app-mixed-template',
  templateUrl: './mixed-template.component.html',
  styleUrls: ['./mixed-template.component.scss']
})
export class MixedTemplateComponent implements OnInit, OnDestroy {

  private paper:any; //score canvas
  private abcString:string; 
  private abcString$:Subscription;

  public receivedData: any ; //input json
  public parsedData: any ; //input json

  // @Output() answerJson  = new EventEmitter<Answer>(); //output answer
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

  //KEYBOARD BINDING ===========================================
  @HostListener('window:keydown', ['$event'])
  keyboardInput(event: any) {
    // event.preventDefault();
    // event.stopPropagation();
    
    console.log('event.key => ',event.key);
    switch(event.key){
      case "a":
      this.setNote('A')
      break;
      case "b":
        this.setNote('B')
      break;
      case "c":
        this.setNote('C')
      break;
      case "d":
        this.setNote('D')
      break;
      case "e":
        this.setNote('E')
      break;
      case "f":
        this.setNote('F')
      break;
      case "g":
        this.setNote('G')
      break;
      case "#":
        this.setAlt('#');
      break;
      case "-":
        this.setAlt('b');
      break;
      case "n":
        this.setAlt('');
      break;
      case "Enter":
        this.validate();
      break;
      default:
      break;
    }
  }
  //END OF KEYBOARD BINDING ===========================================



  constructor(private sm:Songmodel, private ds:DisplayService, private resService:ExerciseResultsService, public midi:MidiService, private zone:NgZone ) { 

    this.curNoteIndex = 0;

    this.midi = midi;

    this.midiNotesTab$ = this.midi.notesTabSubject.subscribe((data)=>{
    	this.zone.run( ()=>{

    	  // if(!data.length)return;

    	  console.log("data => ",data);
    	  //if number of midinotes is inferior to previous => answer
    	  if(data.length > this.prevMidiNotes.length) {
    	    this.prevMidiNotes = [...data];
    	  } else if( ( data.length < this.prevMidiNotes.length ) && !this.MIDI_HAS_FIRED) { //when every notes has been noteoff
    	    console.log("data => ",data);
    	    this.midiAnswer = [];
    	    this.midiAnswer = [...this.prevMidiNotes];
    	    // console.log("validateMidi !!!!!!!!!!");
    	    this.prevMidiNotes = [];
    	    //   this.note = sci_n.match(/([ABCDEFG])/g)[0];
    	    //   this.alteration = (sci_n.match(/([#b])/g)||[''] )[0];

    	    this.MIDI_HAS_FIRED = true;
    	    if(this.parsedData.entities[this.curNoteIndex].template_type == "chord"){

	    	    this.validateMidiChord();

    	    } else if(this.parsedData.entities[this.curNoteIndex].template_type == "notes" && this.midiAnswer.length == 1 ){

		        let sci_n = Note.fromMidi(this.midiAnswer[0]);
		        this.note = sci_n.match(/([ABCDEFG])/g)[0];
		        this.alteration = (sci_n.match(/([#b])/g)||[''] )[0];
	    	    this.validate();
    	    }else if(this.parsedData.entities[this.curNoteIndex].template_type == "notes"&& this.midiAnswer.length > 1 ){
		        let sci_n = Note.fromMidi(this.midiAnswer[0]);
		        this.note = sci_n.match(/([ABCDEFG])/g)[0];
		        this.alteration = (sci_n.match(/([#b])/g)||[''] )[0];
	    	    this.validate();
    	    }
    	    this.midi.clear_notesTabArray();
    	    this.midiAnswer = [];
    	    this.prevMidiNotes = [];
    	    this.startChrono();
    	  }
    	  // ===================================
    	  // VALIDATE MIDI SINGLE NOTE
        // if(!data.length)return;


        // console.log("midi data is=> ",data);
        // console.log("this.note => ",this.note);
        // console.log("this.alteration => ",this.alteration);
        // this.validate();
    	})


    })

    this.bindKeyboard();
  }

  ngOnInit(): void {

    //subscribe to the display service and render when new abc string
    this.abcString$ = this.ds.abcString$.subscribe(abcString=>{
      // console.log('abcString received in song part: '+abcString);
      this.abcString = abcString;
      this.renderAbcWithOptions();

    });
  }

  ngOnDestroy(): void {
    this.abcString$.unsubscribe(); 
    this.midiNotesTab$.unsubscribe();
  }

  ngAfterViewInit(){
    // console.log("SONG COMPONENT INIT ngAfterViewInit");
    this.paper = document.querySelector("#abcCanvas");
    this.loadFromJson();
    this.ds.renderFromModelWithLeftHand();
    if(this.parsedData.hide_chord) this.ds.changeCss(".abcjs-chord","opacity:0");
    if(this.parsedData.hide_function) this.ds.changeCss(".abcjs-annotation","opacity:0");

  }

  setNote(a: string): void {
    console.log('setNote');
    this.note = a;
  }
  setAlt(a:string){
    this.alteration = a;
  }
  setType(t: string){
    this.type = t;
  }

  validate(){
  	console.log("validate simple note");
    this.stopChrono();
    let ans = {note:this.note+this.alteration, time:(this.endTime-this.startTime), index:this.curNoteIndex};

    if(this.parsedData == undefined){

      debugger
      return;
    }
    let hasWon_lh = true;
    let hasWon_rh = true;
    if(this.parsedData.voice_F)hasWon_lh = this.resService.addNotesAnswer( ans, this.parsedData.entities_lh[this.curNoteIndex] );
    if(this.parsedData.voice_G)hasWon_rh = this.resService.addNotesAnswer( ans, this.parsedData.entities[this.curNoteIndex] );

    let hasWon = hasWon_lh && hasWon_rh;

    this.midi.clear_notesTabArray();

    if(hasWon && this.curNoteIndex < this.parsedData.entities.length-1){
      this.showNote( 2*(this.curNoteIndex)+2 );

      this.fillNoteAndChord(2*this.curNoteIndex, "green");

      this.note = "C";
      this.alteration = '';
    }else if(!hasWon && this.curNoteIndex < this.parsedData.entities.length-1){
      this.showNote( 2*(this.curNoteIndex)+2 );
      this.fillNoteAndChord(2*this.curNoteIndex, "red");
      this.note = "C";
      this.alteration = '';
    }else {
      let color = (hasWon)?"green":"red";
      this.fillNoteAndChord(2*this.curNoteIndex, color);
      this.abcString$.unsubscribe(); 
      this.midiNotesTab$.unsubscribe();

      this.askNext.emit( hasWon );

	    console.log("hasWon => ",hasWon);
      console.log("=========ASKnEXT ==========\n");
    }

    this.curNoteIndex++;
	  this.MIDI_HAS_FIRED = false;
  }

  validateMidiChord(){

    this.stopChrono();
  	console.log("validateMidiChord");
    this.ds.changeCss(".abcjs-chord","opacity:1");
    this.ds.changeCss(".abcjs-annotation","opacity:1");

    let ans = {midiNotes:this.midiAnswer, time:(this.endTime-this.startTime)};

    // let hasWon = true; //debug
    let hasWon = this.resService.addMidiAnswer( ans, this.parsedData.entities[this.curNoteIndex] );
    console.log("hasWon => ",hasWon);
    this.midi.clear_notesTabArray();

    this.midiAnswer = [];
    this.prevMidiNotes = [];
    
    if(hasWon && this.curNoteIndex < this.parsedData.entities.length-1){
      this.showNote( 2*(this.curNoteIndex)+2 );

      this.fillNoteAndChord(2*this.curNoteIndex, "green");

      this.note = "C";
      this.alteration = '';
    }else if(!hasWon && this.curNoteIndex < this.parsedData.entities.length-1){
      this.showNote( 2*(this.curNoteIndex)+2 );
      this.fillNoteAndChord(2*this.curNoteIndex, "red");
      this.note = "C";
      this.alteration = '';
    }else {
      let color = (hasWon)?"green":"red";
      this.fillNoteAndChord(2*this.curNoteIndex, color);
      this.abcString$.unsubscribe(); 
      this.midiNotesTab$.unsubscribe();
      this.askNext.emit( true );
    }

    this.curNoteIndex++;
	  this.MIDI_HAS_FIRED = false;

  }


  startChrono(){
    this.startTime = performance.now();
  }

  stopChrono(){
    this.endTime = performance.now();
  }

  showNote(idx:number):void{
    $('.abcjs-note.abcjs-l0.abcjs-m0.abcjs-n'+(idx)).css('opacity',"1"); 
    // $('.abcjs-staff.abcjs-l0.abcjs-m0.abcjs-v0'+(idx)).css('opacity',"1"); 
  }

  fillNoteAndChord(i:number, color:string): void{

   $('.abcjs-note.abcjs-d0-25.abcjs-l0.abcjs-m0.abcjs-n'+ i ).css('fill',color);
   $('.abcjs-note.abcjs-d0-25.abcjs-l0.abcjs-m0.abcjs-n'+ i ).prev().prev().css('fill',color);

   if(!this.parsedData.hide_chord) $('.abcjs-note.abcjs-d0-25.abcjs-l0.abcjs-m0.abcjs-v0.abcjs-n'+ i ).prev().prev().css('opacity',1);
  }


  hideNotes():void{
    for(let i = 0; i < this.parsedData.entities.length; i++){
     $('.abcjs-note.abcjs-d0-25.abcjs-l0.abcjs-m0.abcjs-v0.abcjs-n'+(i*2)).css('opacity',"0"); 
    }
  }

  hideChords():void{
    for(let i = 0; i < this.parsedData.entities.length; i++){
     $('.abcjs-note.abcjs-d0-25.abcjs-l0.abcjs-m0.abcjs-v0.abcjs-n'+ i*2 ).prev().prev().css('opacity',0);
    }
  }

  //----------------------------------LOADING / RENDERING

  renderAbcWithOptions(){
    // console.log("this.abcString => ",this.abcString);
    setTimeout(()=>{
      let staffwidth = (window.innerWidth>900)?window.innerWidth*0.6: window.innerWidth*0.9;
      abcjs.renderAbc('abcCanvas', this.abcString, {
        visualTranspose:this.sm.getTranspose(),
        staffwidth:staffwidth, 
        scale:2,
        add_classes:true, 
        responsive:'resize',
      });
      //fix a display bug of abcjs lib : first letter is shifted down.
      // $(".abcjs-annotation.abcjs-l0.abcjs-m0.abcjs-v0").children().first().remove();
      // $(".abcjs-annotation.abcjs-l0.abcjs-m0.abcjs-v0").children().attr("dy","0.5em")
      
      if(this.parsedData.one_by_one ) this.hideNotes();
      if(this.parsedData.hide_chord || this.parsedData.one_by_one ) this.hideChords();
      if(this.parsedData.one_by_one && !this.parsedData.hide_chord)this.fillNoteAndChord(0,"black");

      this.hideChords();
	    this.showNote( 0 );
      this.startChrono();


    },10)    
    // clickListener:this.measureClicked.bind(this), 
  }


  loadFromJson(){

    this.parsedData = JSON.parse(this.receivedData);

    let mode = (this.parsedData.entities[0].mode=='n_minor' || this.parsedData.entities[0].mode=='h_minor' || this.parsedData.entities[0].mode=='m_minor')?'m':'';

    let transpo = ['G','Ab','A','Bb','B','C', 'Db', 'D', 'Eb', 'E', 'F', 'F#'].indexOf(this.parsedData.entities[0].tonality)-5;
    // console.log('transpo => ',transpo);
		console.log("this.parsedData => ",this.parsedData);

    let ttl_abc_string = "";
    let ttl_abc_array = [];
    let ttl_string_top = [];
    for(let i = 0; i < this.parsedData.entities.length; i++){

    	ttl_abc_string += this.parsedData.entities[i].abc_string + " ";

    	if( this.parsedData.entities[i].hasOwnProperty('abc_array') ){ //entity of type "note"
	    	ttl_abc_array.push(this.parsedData.entities[i].abc_array[0])
	    	ttl_string_top.push(this.parsedData.entities[i].notes_string[0])
    	}else{ //entity of type "chord"
    		ttl_abc_array.push(this.parsedData.entities[i].abc_string)
	    	ttl_string_top.push(this.parsedData.entities[i].chord_name)
    	}
    }

    let ttl_abc_string_lh = "";
    let ttl_abc_array_lh = [];
    let ttl_string_top_lh = [];
    for(let i = 0; i < this.parsedData.entities_lh.length; i++){

      ttl_abc_string_lh += this.parsedData.entities_lh[i].abc_string + " ";

      if( this.parsedData.entities_lh[i].hasOwnProperty('abc_array') ){ //entity of type "note"
        ttl_abc_array_lh.push(this.parsedData.entities_lh[i].abc_array[0])
        ttl_string_top_lh.push(this.parsedData.entities_lh[i].notes_string[0])
      }else{ //entity of type "chord"
        ttl_abc_array_lh.push(this.parsedData.entities_lh[i].abc_string)
        ttl_string_top_lh.push(this.parsedData.entities_lh[i].chord_name)
      }
    }


    console.log("ttl_abc_string => ",ttl_abc_string);

    let infos = {
      "id": "60",
      "title": "",
      "artist": "",
      "album": "",
      "transcription": "",
      "style": "",
      "tonality": this.parsedData.entities[0].tonality+mode,
      "signature": "",
      "owner": "1",
      "clef": "treble"
    }

    let parts =  [
      {
        "idx": 1,
        "title": "",
        "tonality":this.parsedData.entities[0].tonality+mode, 
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
                "chord": this.parsedData.entities[0].notes_names,
                "notes": ttl_abc_string,
                "notes_lh": ttl_abc_string_lh,
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
    for(let i = 0; i < ttl_abc_array.length; i++){
      let b = new Beat();
      if(this.parsedData.voice_G) b.setNotes(ttl_abc_array[i]);
      else b.setNotes("x2 ");

      if(this.parsedData.voice_F) b.setNotes_lh(ttl_abc_array_lh[i]);
      else b.setNotes_lh("x2 ");
      b.setChord(ttl_string_top[i]);
      beat_arr.push(b);
    }

    parts[0].measures[0].beats = beat_arr;
    this.sm.loadScoreFromJson(infos, parts);
    // this.sm.setTranspose(transpo);
  }


  bindKeyboard(): void{

  }

}//end of class
