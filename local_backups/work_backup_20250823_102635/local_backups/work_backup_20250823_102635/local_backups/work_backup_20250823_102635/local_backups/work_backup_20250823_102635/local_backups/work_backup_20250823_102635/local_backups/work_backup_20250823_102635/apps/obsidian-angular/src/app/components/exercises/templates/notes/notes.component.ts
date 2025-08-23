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
    selector: 'app-notes',
    templateUrl: './notes.component.html',
    styleUrls: ['./notes.component.scss'],
    standalone: false
})
export class NotesComponent implements OnInit, OnDestroy {

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

        if(!data.length)return;


        console.log("midi data is=> ",data);
        // let abcnotation = AbcNotation;
        // let nt = Note;
        // console.log("nt => ",nt);
        // console.log("abcnotation => ",abcnotation);
        // console.log("data => ",data);
        // console.log("this.receivedData => ",this.parsedData);
        // let n = this.parsedData.notes_string[this.curNoteIndex];
        // abcnotation.scientificToAbcNotation(  )
        let sci_n = Note.fromMidi(data[0]);
        // let abc_n = AbcNotation.scientificToAbcNotation( sci_n );
        this.note = sci_n.match(/([ABCDEFG])/g)[0];
        this.alteration = (sci_n.match(/([#b])/g)||[''] )[0];
        console.log("this.note => ",this.note);
        console.log("this.alteration => ",this.alteration);
        // debugger
        this.validate();
        //if number of midinotes is inferior to previous => answer
        // if(data.length > this.prevMidiNotes.length) {
        //   this.prevMidiNotes = [...data];
        // } else if( ( data.length < this.prevMidiNotes.length ) && !this.MIDI_HAS_FIRED) {
        //   console.log("data => ",data);
        //   this.midiAnswer = [];
        //   this.midiAnswer = [...this.prevMidiNotes];
        //   // console.log("validateMidi !!!!!!!!!!");
        //   this.prevMidiNotes = [];
        //   this.validateMidi();
        //   this.MIDI_HAS_FIRED = true;
        // }
      })

      // debugger
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
    this.ds.renderFromModel();
    // debugger
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
    this.stopChrono();
    let ans = {note:this.note+this.alteration, time:(this.endTime-this.startTime), index:this.curNoteIndex};

    if(this.parsedData == undefined){

      debugger
      return;
    }
    let hasWon = this.resService.addNotesAnswer( ans, this.parsedData );
    this.midi.clear_notesTabArray();

    if(hasWon && this.curNoteIndex < this.parsedData.notes_string.length-1){
      this.showNote( 2*(this.curNoteIndex)+2 );

      this.fillNoteAndChord(2*this.curNoteIndex, "green");

      this.note = "C";
      this.alteration = '';
    }else if(!hasWon && this.curNoteIndex < this.parsedData.notes_string.length-1){
      this.showNote( 2*(this.curNoteIndex)+2 );
      this.fillNoteAndChord(2*this.curNoteIndex, "red");
      this.note = "C";
      this.alteration = '';
    }else {
      let color = (hasWon)?"green":"red";
      this.fillNoteAndChord(2*this.curNoteIndex, color);
      this.askNext.emit( hasWon );
    }

    this.curNoteIndex++;
  }

  startChrono(){
    this.startTime = performance.now();
    this.showNote( 0 );

  }

  stopChrono(){
    this.endTime = performance.now();
  }

  showNote(idx:number):void{
    $('.abcjs-note.abcjs-l0.abcjs-m0.abcjs-n'+(idx)).css('opacity',"1"); 
    // $('.abcjs-staff.abcjs-l0.abcjs-m0.abcjs-v0'+(idx)).css('opacity',"1"); 
  }

  fillNoteAndChord(i:number, color:string): void{

   $('.abcjs-note.abcjs-d0-25.abcjs-l0.abcjs-m0.abcjs-v0.abcjs-n'+ i ).css('fill',color);
   $('.abcjs-note.abcjs-d0-25.abcjs-l0.abcjs-m0.abcjs-v0.abcjs-n'+ i ).prev().prev().css('fill',color);

   if(!this.parsedData.hide_chord) $('.abcjs-note.abcjs-d0-25.abcjs-l0.abcjs-m0.abcjs-v0.abcjs-n'+ i ).prev().prev().css('opacity',1);
  }


  hideNotes():void{
    for(let i = 0; i < this.parsedData.notes_string.length; i++){
     $('.abcjs-note.abcjs-d0-25.abcjs-l0.abcjs-m0.abcjs-v0.abcjs-n'+(i*2)).css('opacity',"0"); 
    }
  }

  hideChords():void{
    for(let i = 0; i < this.parsedData.notes_string.length; i++){
     $('.abcjs-note.abcjs-d0-25.abcjs-l0.abcjs-m0.abcjs-v0.abcjs-n'+ i*2 ).prev().prev().css('opacity',0);
    }
  }

  //----------------------------------LOADING / RENDERING

  renderAbcWithOptions(){
    // console.log("this.abcString => ",this.abcString);
    // debugger
    setTimeout(()=>{
      let staffwidth = (window.innerWidth>900)?window.innerWidth*0.6: window.innerWidth*0.9;
      abcjs.renderAbc('abcCanvas', this.abcString, {
        visualTranspose:this.sm.getTranspose(),
        staffwidth:90, 
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

      this.startChrono();

    },10)    
    // clickListener:this.measureClicked.bind(this), 
  }


  loadFromJson(){

    this.parsedData = JSON.parse(this.receivedData);

    let mode = (this.parsedData.mode=='n_minor' || this.parsedData.mode=='h_minor' || this.parsedData.mode=='m_minor')?'m':'';

    let transpo = ['G','Ab','A','Bb','B','C', 'Db', 'D', 'Eb', 'E', 'F', 'F#'].indexOf(this.parsedData.tonality)-5;
    // console.log('transpo => ',transpo);
    // debugger

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


    console.log("this.parsedData.abc_string => ",this.parsedData.abc_string);
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
    for(let i = 0; i < this.parsedData.abc_array.length; i++){
      let b = new Beat();
      b.setNotes(this.parsedData.abc_array[i]);
      b.setChord(this.parsedData.notes_string[i]);
      beat_arr.push(b);
    }

    parts[0].measures[0].beats = beat_arr;
    this.sm.loadScoreFromJson(infos, parts);
    // this.sm.setTranspose(transpo);
  }


  bindKeyboard(): void{

  }

}//end of class
