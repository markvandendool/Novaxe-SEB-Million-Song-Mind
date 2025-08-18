import { Injectable } from '@angular/core';

import { RhythmGenerationService } from "@services/exercises/exercise_generator/rhythm-generation.service";

import { Note, Chord, Scale, Key, AbcNotation, Interval, Progression, RomanNumeral } from "@tonaljs/tonal";
export const N = Note;
export const C = Chord;
export const S = Scale;
export const K = Key;
export const A = AbcNotation;
export const I = Interval;
export const P = Progression;
export const R = RomanNumeral;

@Injectable({
  providedIn: 'root'
})
export class MelodyGenService {

  constructor(private rhythmService:RhythmGenerationService) { }













  
  // In FACT IT SHOULD BE RECEIVING RHYTHM AND GENERATE FOR EACH RHYTHM OBJ.
  // each rhythm should contain infos on what chord are we on etc...

  //Generates data (json formatted) that is consumed in notes template. 
  public get_random_note( tona, mode, clef:string="G", chord:any=null, tessiture:string=null ):any{



    let chord_types, key;
    switch( mode ){
      case 'major':
        key   = Key.majorKey('C');
      break;
      case 'h_minor':
        key   = Key.minorKey('C').harmonic;
      break;
      case 'n_minor':
      key   = Key.minorKey('C').natural;

      break;
      case 'm_minor':
      key   = Key.minorKey('C').melodic;

      break;
    }


    let notes_names = "";

    // for(let i = 0; i < this.loaded_exo_params.notes_gen_params.nb_notes; i++){

    // IF A CHORD IS GIVEN WE GET A PITCH FROM A CHORD TONE
    let s; 
    if( chord ) s = chord.notes_array.get_rand_in_array(); 
    else s = key.scale.get_rand_in_array();

    if(s == null)debugger
    s = /([ABCDEFG][#b]?)[0-9]?/.exec(s)[1];


    // =======================================================================
    // MAKING OCTAVE
    let min = "E2", max= "E4", oct = 3;
    if( tessiture ){
      switch(tessiture){
        case 'bass':
          // between [E2, E4] and [E,, E]
          min = "E2"
          max = "E4";
          oct = [2,3,4].get_rand_in_array();
        break;

        case 'tenor':
          // between [D3 F4] and [D, F]
          min = "D3"
          max = "F4";
          oct = [3,4].get_rand_in_array();
        break;

        case 'alto':
          // between [A3 C5] and [A, c]
          min = "A3"
          max = "C5";
          oct = [3,4,5].get_rand_in_array();
        break;

        case 'soprano':
          min = "D4";
          max = "G5";
          oct = [4,5].get_rand_in_array();
        break;

        default :
          console.error('invalid tessiture :', tessiture);
        break;
      }
      if( Note.midi(s+oct) > Note.midi(max) ) oct--;
      else if( Note.midi(s+oct) < Note.midi(min) ) oct++;

    } else if(clef == "G"){

      // between [A3 C6] and [A, c']
      oct = [3,4,5].get_rand_in_array();

      if( Note.midi(s+oct) > Note.midi('E6') ) oct--;
      else if( Note.midi(s+oct) < Note.midi('A3') ) oct++;


    } else if(clef=="F") {

      // between [E2 F4] and [E,, F]
      oct = [2,3].get_rand_in_array();

      if( Note.midi(s+oct) > Note.midi('E4') ) oct--;
      else if( Note.midi(s+oct) < Note.midi('E2') ) oct++;
    }

    s += oct; //note octave
    // =========================================================================

    let abc = AbcNotation.scientificToAbcNotation(s);

    // if(abc.indexOf('_') !=-1) debugger
      // console.log('abc => ',abc);

    // ======================================================================
    //if the note has a # or a b and it is in the armor : we remove # or b 

      switch( mode ){
        case 'major':
          key   = Key.majorKey(tona);
        break;
        case 'h_minor':
          key   = Key.minorKey(tona).harmonic;
        break;
        case 'n_minor':
        key   = Key.minorKey(tona).natural;

        break;
        case 'm_minor':
        key   = Key.minorKey(tona).melodic;

        break;
      }

      // if(mode == "h_minor" || mode == "m_minor" || mode == "n_minor" )
      //   sc = Key.minorKey(tona).natural.scale;
      let sc;
      sc = key.scale;

        // console.log('pitch[0] => ',pitch[0]);

      let pitch = s.match(/([ABCDEFG][#b]?)/)[0];
      if( sc.indexOf(pitch) >= 0 ) { //if pitch of note is in the scale


        // debugger
        // s = s.replace('#','').replace('b','');
        // abc = abc.replace("^","").replace("_",""); //remove # or b

      }else if( sc.indexOf( pitch) == -1 ){

        if( sc.indexOf(pitch[0]+"b" )>-1 || sc.indexOf(pitch[0]+"#" )>-1 ){
        // debugger
          // s = s.replace('#','').replace('b','');
          abc='='+abc;
        }
      }
    // ======================================================================

    notes_names += s;

    let out = { 
      entity_type:'note', 
      tonality:tona,
      mode:mode, 
      notes_names:notes_names, 
    };
    return out;
  }














  
  public generate_voice_from_rhythm(rhythm_PARAMS, nb_measures:number=1, progression:any=null, voices_PARAMS:any=null):any{

      let MAX_INTERV_ALLOWED = 6;

    // ===============================================
    // 
    //                  LEFT HAND
    // 
    // ===============================================

    for (var idx = 0; idx < rhythm_PARAMS.left.length; ++idx) {

      let beat = rhythm_PARAMS.left[idx];


      let note = this.get_random_note_2( beat, "F");

      beat['note'] = note.copy();




      if(idx==0){
                                // SHOULD MAYBE SET FIRST BEAT OF THE MEASURE TO ROOT ??
        // JUST SKIP FOR NOW
        continue;
      }


      // ===============================================
      // 
      //      RESOLVE FORCED MELODIC MOVES
      // 
      // ===============================================
      let previous_note = rhythm_PARAMS.left[idx-1].note;
      let cur_note = beat.note;
      let m;

      if(previous_note['entity_type'] == 'chord'){
        previous_note = previous_note['notes_array'][0];
        m = previous_note.match(/([A-G][#b]?)([0-9]+)/);

      }else{

        m = previous_note.notes_names.match(/([A-G][#b]?)([0-9]+)/);
      }

      let previous_tone = m[1];
      let previous_octave = m[2];

      let distance = I.semitones(I.distance(previous_tone+previous_octave, cur_note.notes_names) );

      if(  distance > MAX_INTERV_ALLOWED ){
        console.warn('correcting in voice F: ',cur_note.notes_names,'to : ',N.transpose(cur_note.notes_names, '-8P'));
        cur_note.notes_names = N.transpose(cur_note.notes_names, '-8P');
      }else if( distance  < -MAX_INTERV_ALLOWED ){
        console.warn('correcting in voice F: ',cur_note.notes_names,'to : ',N.transpose(cur_note.notes_names, '8P'));
        cur_note.notes_names = N.transpose(cur_note.notes_names, '8P');
      }

    }








    // ===============================================
    // 
    //                  RIGHT HAND
    // 
    // ===============================================


    for (var idx = 0; idx < rhythm_PARAMS.right.length; ++idx) {
      let beat = rhythm_PARAMS.right[idx];


      let note = this.get_random_note_2( beat, "G"); 

      beat['note'] = note.copy();



      if(idx==0){
                                // SHOULD MAYBE SET FIRST BEAT OF THE MEASURE TO ROOT ??
        // JUST SKIP FOR NOW
        continue;
      }


      // ===============================================
      // 
      //      RESOLVE FORCED MELODIC MOVES RIGHT
      // 
      // ===============================================
        let previous_note = rhythm_PARAMS.right[idx-1].note;
        let cur_note = beat.note;

        let m = previous_note.notes_names.match(/([A-G][#b]?)([0-9]+)/);
        if(m == null)debugger
        let previous_tone = m[1];
        let previous_octave = m[2];

        let dist = I.semitones(I.distance(previous_note.notes_names, cur_note.notes_names));

        if(  dist > MAX_INTERV_ALLOWED ){
          let move = I.fromSemitones( Number(-12) );
          console.warn('correcting dist > ',MAX_INTERV_ALLOWED,' in voice G: ',previous_note.notes_names,' & ',cur_note.notes_names,' of ',move,'to : ',N.transpose(cur_note.notes_names, move));
          cur_note.notes_names = N.transpose(cur_note.notes_names, move);
        }else if( dist  < -MAX_INTERV_ALLOWED ){
          let move = I.fromSemitones( Number(12) );
          console.warn('correcting dist < ',MAX_INTERV_ALLOWED,' in voice G: ',previous_note.notes_names,' & ',cur_note.notes_names,' of ',move,'to : ',N.transpose(cur_note.notes_names, move));
          cur_note.notes_names = N.transpose(cur_note.notes_names, move);
        }

        dist = I.semitones(I.distance(previous_note.notes_names, cur_note.notes_names));
        if(dist == 0){
          let interv = 1;
          if(Math.random() > 0.5) interv = -1;

          // let scale = S.get(chord.chord_name.replace(/\d$/,'')+" "+C.chordScales(chord.chord_name)[0]).notes;
          // let idx_scale =  scale.indexOf(cur_note.notes_names)+interv; 
          let scale = beat.harmony.notes_array;

          let semi;
          if(interv == -1) semi = scale.map((el)=>{ return I.semitones(I.distance(previous_tone, el)) });
          else semi = scale.map((el)=>{ return I.semitones(I.distance(el, previous_tone)) });

          let idx_scale = 1000;
          semi.map((el)=>{if(el<idx_scale && el !=0)idx_scale = el});
          idx_scale = semi.indexOf(idx_scale);

          if(scale[idx_scale] == undefined)debugger
          cur_note.notes_names = scale[idx_scale].match(/[A-G][#b]?/)[0] + previous_note.notes_names.match(/\d$/)[0];
          console.warn('correcting dist 0 in voice G: ',previous_note.notes_names,'to : ',cur_note.notes_names);
          console.log('scale => ',scale);


        }

        // if(previous_octave >= 3)
        if( previous_tone == 'F' ){
          console.warn('Resolving => F to: ',N.transpose(previous_tone+previous_octave,"-2m"));
          cur_note.notes_names = N.transpose(previous_tone+previous_octave,"-2m");
          // debugger
        }else if( previous_tone == 'B'){
          console.warn('Resolving => B to: ',N.transpose(previous_tone+previous_octave,"2m"));
          cur_note.notes_names = N.transpose(previous_tone+previous_octave,"2m");

        }



    }

    return rhythm_PARAMS;
  }












  
public get_random_note_2(beat:any, voice:string="G"):any{

  let note;
    if(beat.is_strong) note = this.get_random_note(beat.harmony.tonality, beat.harmony.mode, voice, beat.harmony);
    else note  = this.get_random_note(beat.harmony.tonality, beat.harmony.mode, voice );

  return note;

}











  


}
