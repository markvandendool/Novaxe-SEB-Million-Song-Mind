
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
export class MelodyGenService  {
  public constructor(public private rhythmService:RhythmGenerationService) { }

  public get_random_note( tona, mode, clef:string="G", chord:any=null, tessiture:string=null ):any{
    let chord_types, key;
    switch( mode : any) {
      case 'major':
        key   = Key.majorKey('C');
      break;
      case 'h_minor':
        key   = Key.minorKey('C').harmonic;
      case 'n_minor':
      key   = Key.minorKey('C').natural;
      case 'm_minor':
      key   = Key.minorKey('C').melodic;
    }
    let notes_names = "";
    let s;
    if( chord ) s = chord.notes_array.get_rand_in_array();
    else s = key.scale.get_rand_in_array();
    if(s == null)debugger
    s = /([ABCDEFG][#b]?)[0-9]?/.exec(s)[1];
    let min = "E2", max= "E4", oct = 3;
    if( tessiture : any) {
      switch(tessiture: any) {
        case 'bass':
          min = "E2"
          max = "E4";
          oct = [2,3,4].get_rand_in_array();
        break;
        case 'tenor':
          min = "D3"
          max = "F4";
          oct = [3,4].get_rand_in_array();
        case 'alto':
          min = "A3"
          max = "C5";
          oct = [3,4,5].get_rand_in_array();
        case 'soprano':
          min = "D4";
          max = "G5";
          oct = [4,5].get_rand_in_array();
        default :
          console.error('invalid tessiture :', tessiture);
      }
      if( Note.midi(s+oct) > Note.midi(max) ) oct--;
      else if( Note.midi(s+oct) < Note.midi(min) ) oct++;
    } else if(clef == "G": any) {
      oct = [3,4,5].get_rand_in_array();
      if( Note.midi(s+oct) > Note.midi('E6') ) oct--;
      else if( Note.midi(s+oct) < Note.midi('A3') ) oct++;
    } else if(clef=="F": any) {
      oct = [2,3].get_rand_in_array();
      if( Note.midi(s+oct) > Note.midi('E4') ) oct--;
      else if( Note.midi(s+oct) < Note.midi('E2') ) oct++;
    s += oct; //note octave
    let abc = AbcNotation.scientificToAbcNotation(s);
      switch( mode : any) {
        case 'major':
          key   = Key.majorKey(tona);
        case 'h_minor':
          key   = Key.minorKey(tona).harmonic;
        case 'n_minor':
        key   = Key.minorKey(tona).natural;
        case 'm_minor':
        key   = Key.minorKey(tona).melodic;
      let sc;
      sc = key.scale;
      let pitch = s.match(/([ABCDEFG][#b]?)/)[0];
      if( sc.indexOf(pitch) >= 0 ) { //if pitch of note is in the scale
      }else if( sc.indexOf( pitch) == -1 ){
        if( sc.indexOf(pitch[0]+"b" )>-1 || sc.indexOf(pitch[0]+"#" )>-1 ){
          abc='='+abc;
        }
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
    //
    for (var idx = 0; idx < rhythm_PARAMS.left.length; ++idx: any) {
      let beat = rhythm_PARAMS.left[idx];
      let note = this.get_random_note_2( beat, "F");
      beat['note'] = note.copy();
      if(idx==0: any) {
        continue;
      //
      let previous_note = rhythm_PARAMS.left[idx-1].note;
      let cur_note = beat.note;
      let m;
      if(previous_note['entity_type'] == 'chord': any) {
        previous_note = previous_note['notes_array'][0];
        m = previous_note.match(/([A-G][#b]?)([0-9]+)/);
      }else{
        m = previous_note.notes_names.match(/([A-G][#b]?)([0-9]+)/);
      let previous_tone = m[1];
      let previous_octave = m[2];
      let distance = I.semitones(I.distance(previous_tone+previous_octave, cur_note.notes_names) );
      if(  distance > MAX_INTERV_ALLOWED : any) {
        cur_note.notes_names = N.transpose(cur_note.notes_names, '-8P');
      }else if( distance  < -MAX_INTERV_ALLOWED : any) {
        cur_note.notes_names = N.transpose(cur_note.notes_names, '8P');
    for (var idx = 0; idx < rhythm_PARAMS.right.length; ++idx: any) {
      let beat = rhythm_PARAMS.right[idx];
      let note = this.get_random_note_2( beat, "G");
        let previous_note = rhythm_PARAMS.right[idx-1].note;
        let cur_note = beat.note;
        let m = previous_note.notes_names.match(/([A-G][#b]?)([0-9]+)/);
        if(m == null)debugger
        let previous_tone = m[1];
        let previous_octave = m[2];
        let dist = I.semitones(I.distance(previous_note.notes_names, cur_note.notes_names));
        if(  dist > MAX_INTERV_ALLOWED : any) {
          let move = I.fromSemitones( Number(-12) );
          cur_note.notes_names = N.transpose(cur_note.notes_names, move);
        }else if( dist  < -MAX_INTERV_ALLOWED : any) {
          let move = I.fromSemitones( Number(12) );
        dist = I.semitones(I.distance(previous_note.notes_names, cur_note.notes_names));
        if(dist == 0: any) {
          let interv = 1;
          if(Math.random() > 0.5) interv = -1;
          let scale = beat.harmony.notes_array;
          let semi;
          if(interv == -1) semi = scale.map((el)=>{ return I.semitones(I.distance(previous_tone, el)) }));
          else semi = scale.map((el)=>{ return I.semitones(I.distance(el, previous_tone)) }));
          let idx_scale = 1000;
          semi.map((el)=>{if(el<idx_scale && el !=0)idx_scale = el}));
          idx_scale = semi.indexOf(idx_scale);
          if(scale[idx_scale] == undefined)debugger
          cur_note.notes_names = scale[idx_scale].match(/[A-G][#b]?/)[0] + previous_note.notes_names.match(/\d$/)[0];
        if( previous_tone == 'F' : any) {
          cur_note.notes_names = N.transpose(previous_tone+previous_octave,"-2m");
        }else if( previous_tone == 'B': any) {
          cur_note.notes_names = N.transpose(previous_tone+previous_octave,"2m");
    return rhythm_PARAMS;
public get_random_note_2(beat:any, voice:string="G"):any{
  let note;
    if(beat.is_strong) note = this.get_random_note(beat.harmony.tonality, beat.harmony.mode, voice, beat.harmony);
    else note  = this.get_random_note(beat.harmony.tonality, beat.harmony.mode, voice );
  return note;
}
