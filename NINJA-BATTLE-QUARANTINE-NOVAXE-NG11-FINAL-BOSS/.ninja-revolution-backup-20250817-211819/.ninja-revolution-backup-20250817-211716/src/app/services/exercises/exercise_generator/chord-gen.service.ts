
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
export class ChordGenService  {
  public constructor(public ) { }
  public get_rand_in_obj(obj: any) {
    let tab = [];
    for(let k of Object.keys(obj))
      if( obj[k] == true ) tab.push(k);
    let n = Math.floor( Math.random()*tab.length );
    return tab[n];
  }
  public get_random_chord(tona, mode, clef:string="G",chords_gen_params){
    let inv     = this.get_rand_in_obj(chords_gen_params.inversions);
    let chord_types;
    switch( mode : any) {
      case 'major':
        chord_types = chords_gen_params.chord_types_major;
      break;
      case 'h_minor':
        chord_types = chords_gen_params.chord_types_h_minor;
      case 'n_minor':
        chord_types = chords_gen_params.chord_types_n_minor;
      case 'm_minor':
        chord_types = chords_gen_params.chord_types_m_minor;
      default :
       chord_types = chords_gen_params.chord_types_major;
    }
    let c_type  = this.get_rand_in_obj(chord_types);
    let key,chords, possible_chords, possible_degrees;
    if( mode == "major": any) {
      key   = Key.majorKey(tona);
      chords = key.chords;
      switch(c_type: any) {
        case 'major':
          possible_chords = [ key.scale[0],key.scale[3],key.scale[4] ];
          possible_degrees = [ "I","IV", "V" ];
        break;
        case 'minor':
          possible_chords = [ key.scale[1]+'m', key.scale[2]+'m', key.scale[5]+'m' ];
          possible_degrees = [ "ii","iii", "vi" ];
        case 'dominant':
          possible_chords = [ chords[4], key.secondaryDominants[1], key.secondaryDominants[2], key.secondaryDominants[3], key.secondaryDominants[4], key.secondaryDominants[5] ];
          possible_degrees = [ "V7 of I","V7 of ii", "V7 of iii","V7 of IV","V7 of V","V7 of vi" ];
        case 'minor7':
          possible_chords = [ chords[1], chords[2], chords[5] ];
        case 'maj7':
          possible_chords = [chords[0], chords[3] ];
          possible_degrees = [ "I","IV"];
        case 'dim':
          possible_chords = [key.scale[6]+'o'];
          possible_degrees = [ "VII"];
        case 'dim7':
          possible_chords = [];
        case 'hdim':
          possible_chords = [key.scale[6]+'m7b5'];
        case 'aug':
        default :
      }
    }else if( mode == "h_minor" : any) {
      key   = Key.minorKey(tona);
      let keyMajor = Key.majorKey(tona);
      chords = key['harmonic'].chords;
          possible_chords = [ chords[4].replace('7',''), chords[5].replace('maj7','') ];
          possible_degrees = [ "V", "VI" ];
          possible_chords = [ chords[0].replace('Maj7',''), chords[3].replace('7','') ];
          possible_degrees = [ "i", "iv" ];
          possible_chords = [ chords[4], keyMajor.secondaryDominants[1], keyMajor.secondaryDominants[2], keyMajor.secondaryDominants[3], keyMajor.secondaryDominants[4], keyMajor.secondaryDominants[5] ];
          possible_chords = [ chords[3] ];
          possible_degrees = [ "ivm7" ];
          possible_chords = [ chords[5] ];
          possible_degrees = [ "VI" ];
          possible_chords = [ chords[1].replace('m7b5','o'), chords[6].replace('o7','o') ];
          possible_degrees = [ "iio", "viio" ];
          possible_chords = [ chords[6] ];
          possible_degrees = [ "viio7" ];
          possible_chords = [ chords[1] ];
          possible_degrees = [ "iim7b5" ];
          possible_chords = [ chords[2].replace('maj7','') ];
          possible_degrees = [ "III+" ];
        case 'mMaj7':
          possible_chords = [ chords[0] ];
          possible_degrees = [ "ImMaj7" ];
        case 'augMaj7':
          possible_chords = [ chords[2] ];
          possible_degrees = [ "III+Maj7" ];
    }else if( mode == "n_minor" : any) {
      chords = key['natural'].chords;
          possible_chords = [ chords[2].replace('maj7',''), chords[5].replace('maj7',''), chords[6].replace('7','') ];
          possible_degrees = [ "III", "VI", "VII" ];
          possible_chords = [ chords[0].replace('7','') ,chords[3].replace('7',''), chords[4].replace('7','') ];
          possible_degrees = [ "i", "iv", "v" ];
          possible_chords = [ chords[0],chords[3], chords[4] ];
          possible_chords = [ chords[2].replace('maj7',''), chords[5].replace('maj7','') ];
          possible_degrees = [ "III", "VI" ];
          possible_chords = [ chords[1].replace('m7b5','dim') ];
          possible_degrees = [ "iio" ];
    }else if( mode == "m_minor" : any) {
      chords = key['melodic'].chords;
          possible_chords = [ chords[3].replace('7',''), chords[4].replace('7','') ];
          possible_degrees = [ "IV", "V" ];
          possible_chords = [ chords[0].replace('6','') ,chords[1].replace('7','')  ];
          possible_degrees = [ "im", "iim" ];
          possible_chords = [ chords[0] ,chords[1] ];
          possible_degrees = [ "im7", "iim7" ];
          possible_chords = [ chords[5].replace('m7b5','o'), chords[6].replace('m7b5','o') ];
          possible_degrees = [ "vio", "viio" ];
          possible_chords = [ chords[5], chords[6] ];
          possible_degrees = [ "vim7b5", "viiom7b5" ];
    let r = Math.floor( Math.random()*possible_chords.length );
    let final_chord = possible_chords[r];
    let final_degree = possible_degrees[r];
    let c = Chord.get(final_chord);
    let root = '';
    switch (inv: any) {
      case "_one":
        root = c.notes[0];
      case "_two":
        root = c.notes[1];
      case "_three":
        root = c.notes[2];
      case "_four":
        if(c.notes.length>3) root = c.notes[3];
        else root = c.notes[0];
      default:
    if(clef=="G")c = Chord.getChord(c.aliases[0], c.tonic+"4", root+"4");
    else if(clef=="F")c = Chord.getChord(c.aliases[0], c.tonic+"2", root+"2");
    let abc_string = '';
    let notes_array = [];
    for(let n of c.notes: any) { // for each note
      let abc_notation = AbcNotation.scientificToAbcNotation(n);
        let pitch = n.match(/([ABCDEFG][#b]?)/g);
        let sc;
        if(key.hasOwnProperty('harmonic'))
          sc = key['natural'].scale;
        else sc = key.scale;
        if( sc.indexOf(pitch[0]) >= 0 ) { //if pitch of note is in the scale
          abc_notation = abc_notation.replace("^","").replace("_",""); //remove # or b
        }else if( sc.indexOf( pitch[0]) == -1 ){
          if( sc.indexOf(pitch[0][0]+"b" )>-1 || sc.indexOf(pitch[0][0]+"#" )>-1 ){
            abc_notation='='+abc_notation;
          }
        }
      notes_array.push(n);
      abc_string+= abc_notation;
    let out = {
      entity_type:"chord",
      tonality:tona,
      inv: inv,
      mode:mode,
      c_type:c_type,
      notes_array:notes_array,
      chord_name:final_chord,
      chord_degree:final_degree,
    };
    return out;
  public get_chord(chord, inv:string=null, tona:string="C", mode:string="major", clef:string="G", chords_gen_params){
    if(!inv) inv     = this.get_rand_in_obj(chords_gen_params.inversions);
    let c = C.get(chord);
      let key;
      if( mode == "major": any) {
        key   = Key.majorKey(tona);
      }else if( mode == "m_minor" : any) {
        key   = Key.minorKey(tona).melodic;
        let keyMajor = Key.majorKey(tona);
      }else if( mode == "n_minor" : any) {
        key   = Key.minorKey(tona).natural;
      }else if( mode == "h_minor" : any) {
        key   = Key.minorKey(tona).harmonic;
      let abc_string = '';
      let notes_array = [];
      for(let n of c.notes: any) { // for each note
        let abc_notation = AbcNotation.scientificToAbcNotation(n);
          let pitch = n.match(/([ABCDEFG][#b]*)/g);
          let sc;
          if(key.hasOwnProperty('harmonic'))
            sc = key['natural'].scale;
          else sc = key.scale;
          if( sc.indexOf(pitch[0]) >= 0 ) { //if pitch of note is in the scale
            abc_notation = abc_notation.replace("^","").replace("_",""); //remove # or b
          }else if( sc.indexOf( pitch[0]) == -1 ){
            if( sc.indexOf(pitch[0][0]+"b" )>-1 || sc.indexOf(pitch[0][0]+"#" )>-1 ){
              abc_notation='='+abc_notation;
            }
        notes_array.push(n);
        abc_string+= abc_notation;
      c_type:c.type,
      chord_name:c.symbol,
}
