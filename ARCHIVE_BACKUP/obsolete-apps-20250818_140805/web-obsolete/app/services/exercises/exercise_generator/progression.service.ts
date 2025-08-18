import { Injectable } from '@angular/core';

import { Note, Chord, Scale, Key, AbcNotation, Interval, Progression, RomanNumeral } from "@tonaljs/tonal";
export const N = Note;
export const C = Chord;
export const S = Scale;
export const K = Key;
export const A = AbcNotation;
export const I = Interval;
export const P = Progression;
export const R = RomanNumeral;

import { ChordGenService } from "@services/exercises/exercise_generator/chord-gen.service";


@Injectable({
  providedIn: 'root'
})
export class ProgressionService {

  constructor(private chord:ChordGenService) { }













  

    public generate_progression( tona:string="C", mode:string="major", possible_chords:Array<any>, duration:number=1, chords_gen_params):any{


    if(!possible_chords || possible_chords.length == 0)throw "generate_progression() : no possible chord given !";

    let p = this.generate_progression2( tona, mode, possible_chords, duration, chords_gen_params);


    let prog = [];
    for (var i = 0; i < p.prog.length; ++i) {

      let chord = this.chord.get_chord(p.prog[i],null,tona,mode,'F',chords_gen_params);
      chord['duration']     = 3840;
      chord['chord_name']   = chord.chord_name.replace(/M$/,'');
      chord['chord_degree'] = p.degrees[i];
      if(chord['chord_degree'] == undefined)debugger

      prog.push(chord);
    }

    return prog;
  }












  

  public generate_progression2( tona:string="C", mode:string="major", possible_chords:Array<any>, duration:number=1, chords_gen_params):any{

    let prog = [];
    let proba_dom = 0.5;
    let proba_triad = 0.5;
    var prog_circle = ['I','IV','VII','III','VI','II','V'];

    // GETTING KEY =============================================================
    let key;
    if(mode == 'major'){
      key = K.majorKey(tona);

    } else{
      key = K.minorKey(tona).harmonic;
    }
    // =========================================================================


    if( duration == 1) prog.push('C');
    else if( duration == 2 ){
      prog.push('G');
      prog.push('C')

    }else if(duration == 3){

      prog.push('C')
      prog.push('G');

      let idx = Math.floor(Math.random()*6);
      prog.push(key.scale[idx]);

      prog.reverse();

 
    }else{

      prog.push('C')
      prog.push('G');
      let idx = Math.floor(Math.random()*6);
      prog.push(key.scale[idx]);

      for(let i = 0; i < duration-3; i++){

        let deg = key.grades[ key.scale.indexOf(prog[prog.length-1]) ];
        let pos_in_circle = prog_circle.indexOf(deg);
        let next_degree = (pos_in_circle-1)%7;
        if(next_degree == -1)next_degree = 6;
        let next_chord = key.scale[ key.grades.indexOf(prog_circle[next_degree]) ];
        prog.push(next_chord);
      }
      prog.reverse();
    }

    let deg = [];
    for (var idx = 0; idx < prog.length; ++idx) {

      let chord_deg;
      if(idx == prog.length-1)
        chord_deg = key.grades[key.scale.indexOf(prog[idx])];
      else{

        let reso = N.transpose(prog[idx],'-5P');
        chord_deg = 'V of '+key.grades[key.scale.indexOf(reso)];
      }

      deg.push( chord_deg );

      if( Math.random() > proba_triad && idx != prog.length-1 ){

        deg[deg.length-1] = key.grades[key.scale.indexOf(prog[idx])];
        prog[idx] = key.chords[key.scale.indexOf(prog[idx]) ];

         if(deg[deg.length-1] == "V"){
          deg[deg.length-1] = "V7 of I";
        }


      }else if(Math.random() > proba_dom && idx != prog.length-1 ){


        if(idx == prog.length-3) {
          deg[deg.length-1] = 'V7 of V';
          prog[idx]='D7';
        }else{
          deg[deg.length-1] = 'V7 of '+key.grades[key.scale.indexOf(prog[idx+1])];
          prog[idx] +='7';
        }
      }
      if(prog[idx] == undefined)debugger
    }

    return { prog:prog, degrees:deg };
  }
}
