import { Injectable } from '@angular/core';

import { Note, Chord, Scale, Key, AbcNotation } from "@tonaljs/tonal";

@Injectable({
  providedIn: 'root'
})
export class ExerciseResultsService {

  public exo:any;
  private results_chords:Array<any>;
  private results_notes:Array<any>;
  private results_rhythm:Array<any>;

  public computed_chords:any;
  public computed_notes:any;
  public computed_rhythm:any;

  constructor() { 
      this.reset();
  }

  public reset(){
      this.results_chords = [];
      this.results_notes = [];
      this.results_rhythm = [];
      this.computed_chords = {};
      this.computed_notes = {};
      this.computed_rhythm = {};
      this.exo = {};
  }

  public getResults_chords(){
    return this.results_chords;
  }

  public getResults_notes(){
    return this.results_notes;
  }

  public getResults_rhythm(){
    return this.results_rhythm;
  }


  public compute(){
    this.compute_chords();
    this.compute_notes();
    this.compute_rhythm();

    if(this.exo.TEMPLATE == "LEVEL_1"){
      // this.computeProgression("LEVEL_1"); //TODO
    }
  }


  public compute_chords():void{

    let mean_time:number=0;
    let type_accuracy:number=0;
    let note_accuracy:number=0;
    let total_accuracy:number=0;

    for(var i = 0; i < this.results_chords.length; i++){
        mean_time+=this.results_chords[i]['ans']['time'];
        note_accuracy += (this.results_chords[i]['note_is_good'])?1:0;
        type_accuracy += (this.results_chords[i]['type_is_good'])?1:0;
        total_accuracy += (this.results_chords[i]['note_is_good']&&this.results_chords[i]['type_is_good'])?1:0;
    }
    mean_time/=i;
    total_accuracy/=i;
    note_accuracy/=i;
    type_accuracy/=i;
    
    mean_time = Math.trunc(mean_time);


    this.computed_chords['mean_time'] = mean_time;
    this.computed_chords['note_accuracy'] = note_accuracy;
    this.computed_chords['type_accuracy'] = type_accuracy;
    // this.computed_chords['total_accuracy'] = total_accuracy;
    this.computed_chords['total_accuracy'] = note_accuracy;
  }

  public compute_notes():void{

    let mean_time:number=0;
    let type_accuracy:number=0;
    let note_accuracy:number=0;
    let total_accuracy:number=0;

    for(var i = 0; i < this.results_notes.length; i++){
        mean_time+=this.results_notes[i]['ans']['time'];
        total_accuracy += (this.results_notes[i]['hasWon'])?1:0;
    }
    mean_time/=i;
    total_accuracy/=i;
    note_accuracy/=i;
    type_accuracy/=i;
    
    mean_time = Math.trunc(mean_time);


    this.computed_notes['mean_time'] = mean_time;
    this.computed_notes['total_accuracy'] = total_accuracy;
  }

  public compute_rhythm():void{
    console.log("compute_rhythm");

    let total_win = 0;
    for(let i = 0; i < this.results_rhythm.length; i++){

      total_win += (this.results_rhythm[i].note_is_good)?1:0;
    }
    total_win = total_win /this.results_rhythm.length
    // debugger

    this.computed_rhythm['mean_time'] = 2;
    this.computed_rhythm['total_accuracy'] = total_win;
  }


  // =======================================================================
  public addNotesAnswer( answer:any, data:any ):boolean{

    let hasWon = false;
    let ans_abc, data_abc;

    try{

      ans_abc  = Note.get(Note.enharmonic(answer.note));
      data_abc = Note.get(Note.enharmonic(data.notes_string[0].replace("^","")) );
      hasWon = ( ans_abc.chroma === data_abc.chroma )?true:false;
      if( !( hasWon ) && data.debug )debugger

      console.log("hasWon => ",hasWon);
      // if(!hasWon)debugger

      this.results_notes.push({ans:answer,data:data,hasWon:hasWon});

      return hasWon;
    }catch(e){
      let n = Note;
      console.log("n => ",n);
      console.log("hasWon => ",hasWon);
     debugger 
    }
  }



  public add_timed_midiAnswer(answer, event):boolean{

    let notes_ok = true;
    for(let i = 0; i < event.midiPitches.length; i++)
      if( answer.indexOf(event.midiPitches[i].pitch) == -1) notes_ok = false;


    let res = {
        "ans":answer,
        "data":event,
        // "ans_type":ans_type,
        // "data_type":data_type,
        "note_is_good":notes_ok,
        // "type_is_good":type_is_good
    };

    this.results_rhythm.push(res);


    return notes_ok;
  }

  public addChordAnswer( answer:any, data:any){
    console.log('\n---------------\n\tRESULTS\n');
    data = JSON.parse(data);
    console.log('data => ',data);
    console.log('answer => ',answer);


    let regexp = /([ABCDEFG])([#b]*)(.*)/g;
    let ans_ = [...answer.note.matchAll(regexp)][0];
    let data_ = [...data.chord_name.matchAll(regexp)][0];

    let note_is_good = false;
    let type_is_good = false;


    if(ans_[1]==data_[1] && ans_[2]==data_[2])note_is_good = true;
    console.log("note_is_good => ",note_is_good);

    let ans_type = answer.type;
    let data_type = data_[3];
    type_is_good = (ans_type == data_type);
    
    console.log("data_type => ",data_type);
    console.log("ans_type => ",ans_type);

    console.log("type_is_good => ",type_is_good);

    if( !( note_is_good && type_is_good ) && data.debug )debugger
    // debugger

    let res = {
        "ans":answer,
        "data":data,
        "ans_type":ans_type,
        "data_type":data_type,
        "note_is_good":note_is_good,
        "type_is_good":type_is_good
    };

    this.results_chords.push(res);

    return note_is_good && type_is_good;


  }

  public addMidiAnswer( answer:any, data:any, left_hand_data:any=null):boolean{
    console.log('\n---------------\n\tRESULTS\n');
    // data = JSON.parse(data);
    console.log('data => ',data);
    console.log('answer => ',answer);
    let ans_midi = [];
    ans_midi = answer.midiNotes;
    // for(let i = 0; i < answer.length; i++){
    //   ans_midi_.push( Note.get(answer[i]) )
    // }



    // let regexp = /([ABCDEFG])([#b]*)(.*)/g;
    // let ans_ = [...answer.note.matchAll(regexp)][0];
    // let data_ = [...data.chord_name.matchAll(regexp)][0];

    try{
      let N = Note;

      let ans = JSON.stringify(ans_midi);
      let corr_ans;
      // if its a chord
      if( data.hasOwnProperty('notes_array') )      corr_ans = JSON.stringify(data.notes_array.map(Note.midi));
      // if its a note
      else if( data.hasOwnProperty('notes_string')) corr_ans = JSON.stringify([data.notes_names].map(Note.midi));

      let note_is_good = ans == corr_ans;
      let n = Note;
      let c = Chord;
      
      let chord = c.detect(ans_midi.map(n.fromMidi));
      let detected_chord = c.get(chord[0]);
      console.log("detected_chord => ",detected_chord);
      let type_is_good =( detected_chord.type == data.c_type )?true:false;

      if(!note_is_good && data.debug )debugger
      let res = {
          "ans":answer,
          "data":data,
          "ans_type":null,
          "data_type":null,
          "note_is_good":note_is_good,
          "type_is_good":type_is_good,
      };

      console.log("note_is_good => ",note_is_good);
      this.results_chords.push(res);
      return note_is_good;

    }catch(e){

      console.log("erreur => ",e);
      debugger

    }
  }

  public addMidiAnswer2( answer:any, data:any, left_hand_data:any=null):boolean{

    let note_is_good = true;
    let type_is_good = true;

    if(data.midiPitches.length == answer.midiNotes.length){

      for(let i = 0; i < data.midiPitches.length; i++){
        if(data.midiPitches[i].pitch != answer.midiNotes[i]) note_is_good = false;
      }
    }else{
      note_is_good = false;

    }
    console.log("note_is_good => ",note_is_good);


    let res = {
    "ans":answer,
    "data":data,
    "ans_type":null,
    "data_type":null,
    "note_is_good":note_is_good,
    "type_is_good":type_is_good,
    };
    this.results_chords.push(res);

    return note_is_good;
  }


}
