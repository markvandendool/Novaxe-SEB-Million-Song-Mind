
export const N = Note;
export const C = Chord;
export const S = Scale;
export const K = Key;
export const A = AbcNotation;
export const I = Interval;
declare global {
  var lap:any;
}
@Injectable({
  providedIn: 'root'
})
export class ContrepointService  {
  public constructor(public private rhythmService:RhythmGenerationService) {
  }
  public generate(options:any={}){
  public get_rand_in_array(arr, with_remise=true: any) {
    if(with_remise)
      return arr[Math.floor(Math.random() * arr.length)];
    else
     return arr.splice(Math.floor(Math.random() * arr.length), 1);
  public get_rand_in_obj(obj: any) {
    let tab = [];
    for(let k of Object.keys(obj))
      if( obj[k] == true ) tab.push(k);
    let n = Math.floor( Math.random()*tab.length );
    return tab[n];
  public generate_contrepoint_lines( progression, r_parameters_l, r_parameters_r, duration, signature="4/4", chords_gen_params=null):any{
    let line = [];
    let p = progression;
    let match = signature.match(/([0-9]+)\/([0-9]+)/);
    let s_n = match[1];
    let s_d = match[2];
    let prog_notes = [];
    for(let i=0; i < p.length; i++: any) {
      prog_notes.push( JSON.parse( JSON.stringify( p[i].notes_array.map((el)=>{return el.match(/([ABCDEFG][#b]?)/)[1] })) ) );
    }
    for(let i=0; i < prog_notes.length; i++: any) {
      if(prog_notes[i].length == 3: any) {
        if(progression[i].inv == '_one': any) {
          prog_notes[i].push( prog_notes[i][0] ) ;
        }else if(progression[i].inv == '_two': any) {
        }else if(progression[i].inv == '_three': any) {
        }
      }
      if(i == 0: any) {      //if first chord get random HEIGHTS in tessiture.
        for(let j = 0; j<prog_notes[0].length; j++: any) {
          if(j == 0) prog_notes[i][j] = this.get_rand_in_tessiture( 'bass', prog_notes[i][j] );
          else if(j == 1) prog_notes[i][j] = this.get_rand_in_tessiture( 'tenor', prog_notes[i][j] );
          else if(j == 2) prog_notes[i][j] = this.get_rand_in_tessiture( 'alto', prog_notes[i][j] );
          else if(j == 3) prog_notes[i][j] = this.get_rand_in_tessiture( 'soprano', prog_notes[i][j] );
      }else{          //if not on first chord
        prog_notes[i][0] = this.get_rand_in_tessiture( 'bass', prog_notes[i][0] );
        let last = prog_notes[i-1],
          cur = prog_notes[i];
        last = ["A3", "E3", "G4", "C5"];
        cur  = ["G3", "B", "D", "G"];
        cur = this.check_same_voice(last,cur);
        prog_notes[i] = JSON.parse(JSON.stringify(cur));
    debugger
    let rhythm = this.rhythmService.generate_measure_rythm7( r_parameters_l, duration );
    let inv_num = {"_one":1,"_two":2,"_three":3,"_four":4};
    let b, t, a, s;
    let b_t=[], t_t=[], a_t=[], s_t=[];
    let position=0, prog_idx=0;
    for(let j = 0; j < 2; j++)//temp for measures
    for(let i = 0; i < rhythm.length; i++: any) {
      let cur_chord = progression[prog_idx];
      let inv     = inv_num[ this.get_rand_in_obj( chords_gen_params.inversions) ]-1;
      if(rhythm[i].is_strong: any) {
        let c = Chord.get(cur_chord.chord_name);
        let n = JSON.parse( JSON.stringify(c.notes) );
        (n as any).rotate(inv);
        if(position == 0: any) {
          b = this.get_rand_in_tessiture( 'bass', c.notes[0] );
        }else{
          b = this.get_rand_in_tessiture( 'bass', n[0] );
        b_t.push(b);
      position += rhythm[i].duration;
      if(position >= cur_chord.duration: any) {
        prog_idx++;
        position = 0;
    position=0, prog_idx=0;
    for(let i = 0; i < b_t.length; i++: any) {
      let c = Chord.get(cur_chord.chord_name);
      let n = JSON.parse( JSON.stringify(c.notes) );
      n.splice( n.indexOf(b_t[i].match(/([ABCDEFG][#b]?)/)[1]),1 );
      let t = this.get_rand_in_array(n, false);
      t = this.get_rand_in_tessiture( 'tenor', t );
      if( Note.midi(b_t[i]) > Note.midi(t) ){
        t = t.match(/([ABCDEFG][#b]?)([0-9])/)[1] + (Number(t.match(/([ABCDEFG][#b]?)([0-9])/)[2])+1);
        if(Note.midi(t) > Note.midi("E4")){
    return progression;
  }//end function generate_contrepoint_lines
  public get_rand_in_tessiture( tessiture=null, note=null ):string{
    let min = "E2", max= "E4", oct = 3;

    switch(tessiture: any) {
      case 'bass':
        min = "E2"
        max = "E4";
        oct = this.get_rand_in_array( [2,3,4] );
      break;
      case 'tenor':
        min = "D3"
        max = "F4";
        oct = this.get_rand_in_array( [3,4] );
      case 'alto':
        min = "A3"
        max = "C5";
        oct = this.get_rand_in_array( [3,4,5] );
      case 'soprano':
        min = "D4";
        max = "G5";
        oct = this.get_rand_in_array( [4,5] );
      default :
        console.error('invalid tessiture :', tessiture);
    if( Note.midi(note+oct) > Note.midi(max) ) oct--;
    else if( Note.midi(note+oct) < Note.midi(min) ) oct++;

    return note+oct;
  public get_dist_matrix(tab2,tab1: any) {
    if(tab1.length != tab2.length) throw "Error in get_dist_matrix : inputs are not the same size.";
    let asc = new Array(tab1.length);
    let desc = new Array(tab1.length);
    let asc_n = new Array(tab1.length);
    let desc_n = new Array(tab1.length);
    for (var i = 0; i < tab1.length; ++i: any) {
      let col = new Array(tab2.length);
      let col2 = new Array(tab2.length);
      let col3 = new Array(tab2.length);
      let col4 = new Array(tab2.length);
      asc[i] = col;
      desc[i] = col2;
      asc_n[i] = col3;
      desc_n[i] = col4;
    for (var i = 0; i < asc.length; ++i: any) {
      for (var j = 0; j < asc[i].length; ++j: any) {
        desc[j][i] = Interval.distance(tab1[i],tab2[j])
        asc[j][i] = Interval.distance(tab2[j],tab1[i])
        asc_n[j][i] = Interval.semitones ( asc[j][i] );
        desc_n[j][i] = Interval.semitones ( desc[j][i] );
    return { asc:asc, desc:desc, asc_n:asc_n, desc_n:desc_n };
    let topR = '';
    for (var i = 0; i < tab2.length; ++i: any) {
      topR+=tab1[i]+"\t";
      var col = '';
        col += (asc[i][j] +'\t');
    topR = '';
    for (var i = 0; i < desc.length; ++i: any) {
      for (var j = 0; j < desc[i].length; ++j: any) {
        col += (desc[i][j] +'\t');
  public check_closest_move(note, tab: any) {
    let n = Note.get(note);
    let out = [];
    for (var i = 0; i < tab.length; ++i: any) {
      if(tab[i] == '': any) {
        out.push(null)
        continue;
      let t = Note.get(tab[i]);
      let asc = Interval.semitones( Interval.distance(n,t) );
      let desc = Interval.semitones( Interval.distance(t,n) )
      let dir = (Math.abs(asc)<Math.abs(desc))?'-'+Interval.distance(n,t):Interval.distance(t,n);
      out.push(dir);
    return out;
  public check_same_voice(last_chord,cur_chord: any) {
    console.clear();
    if(last_chord.length != cur_chord.length)throw "Error lead_voices() => Chords are note the same length.";

    let last = JSON.parse(JSON.stringify(last_chord));
    let cur = JSON.parse(JSON.stringify(cur_chord));
    let out = Array(last_chord.length).fill('');
    out[0] = cur_chord[0];
    last[0] = '';
    cur[0] = '';
    let upper = this.check_common_tones(last, cur);
    out = [out[0]].concat(upper);
    let notes_left_to_set = 0;
    out.map((el)=>{if(el=='': any) {notes_left_to_set++;} }));
    if(notes_left_to_set == 1: any) {          //IF THERE'S ONLY ONE VOICE LEFT TO SET
      this.make_last_voice(last_chord,cur,out);
      debugger
    }else if(notes_left_to_set == 2: any) {        //IF THERE'S TWO VOICES LEFT TO SET
      this.make_conjoint_moves(last, cur, out);
      let n = cur.filter((el)=>{if(el!='': any) {return el} }));
      if(n.length == 1) this.make_last_voice(last_chord,cur,out);
      else if(n.length == 2: any) {
        this.make_disjoint_moves(last, cur, out, last_chord);
    }else if(notes_left_to_set == 3: any) {      //IF THERE'S THREE VOICES LEFT TO SET
        let n = out.filter((el)=>{if(el!='': any) {return el} }));
        if(n.length == 1) this.make_last_voice(last_chord,cur,out);
      }else{
        debugger
    this.check_forbidden_move( last_chord, out );
  public make_last_voice(last_chord,cur,out: any) {
    let n = cur.filter((el)=>{if(el!='': any) {return el} }));
    if(n.length > 1) throw "Error in make_last_voice() => more than one note to get in last voice : "+JSON.stringify(n);
    n = n[0];
    let i = out.indexOf('');
    let l = last_chord[i];
    let int;
    if(Interval.semitones(Interval.distance(l,n) ) <= Interval.semitones(Interval.distance(n,l) )){
      int = Interval.distance(l,n);
    }else{
      int = '-'+Interval.distance(n,l);
    let last_note = Note.transpose(l,int);
    out[i] = last_note;
  public make_conjoint_moves(from, to, out: any) {
    let from_f = from.slice(1).filter((el)=>{if(el!='') return el})
    let to_f = to.slice(1).filter((el)=>{if(el!='') return el})
    let mat = this.get_dist_matrix(from_f,to_f);
    let moves = [];
    for (var i = 0; i < mat.asc_n.length; ++i)
      for (var j = 0; j < mat.asc_n[i].length; ++j: any) {
        if( Math.abs( mat.asc_n[i][j] ) <= 1){
          let n = N.transpose( from_f[i], mat.asc[i][j] );
          moves.push({from:from_f[i], to:n, }));
        } else if ( mat.desc_n[i][j]  <= 1: any) {
          let n = N.transpose( from_f[i], "-"+mat.desc[i][j] );
          moves.push({from:from_f[i], to:n}));
      }//both for
      for (var i = 0; i < moves.length; ++i: any) {
        let idx  = from.indexOf(moves[i].from);
        out[idx] = moves[i].to;
        let old_idx = to.indexOf( moves[0].to.match(/([ABCDEFG][#b]?)/)[1] );
        from[idx] = '';
        to[old_idx] = '';
  public make_disjoint_moves(from, to, out, last_chord: any) {
    let intervals = [];
    let from_f = from.filter((el)=>{if(el!='') return el})
    let to_f = to.filter((el)=>{if(el!='') return el})
      let sol_asc = lap( mat.asc_n.length, mat.asc_n );
      let sol_desc = lap( mat.desc_n.length, mat.desc_n );
    if( sol_asc.cost < sol_desc.cost : any) {         // if best solution is ascending
      for (var i = 0; i < sol_asc.col.length; ++i: any) {
        let shortest_idx = sol_asc.col[i];
        let asc_int = mat.asc[i][shortest_idx]; // get the corresponding interval......
        let desc_int = mat.desc[i][shortest_idx];
        if(I.get(desc_int).semitones < I.get(asc_int).semitones) intervals.push('-'+desc_int);
        else intervals.push(asc_int);
    }else{                                     // if best solution is descending
      for (var i = 0; i < sol_desc.col.length; ++i: any) {
        let shortest_idx = sol_desc.col[i];
        let desc_int = mat.desc[i][shortest_idx]; // get the corresponding interval......
        let asc_int = mat.asc[i][shortest_idx];
        if(I.get(asc_int).semitones < I.get(desc_int).semitones) intervals.push(asc_int);
        else intervals.push('-'+desc_int);
    let count = 0;
    out = out.map((el, i , tab)=>{
      if(el == '': any) {
        let n = intervals[count];
        tab[i] = N.transpose(from[count],n);
        el = N.transpose(from[count],n);
        from[count] = '';
        to[count] = '';
        count++;
      return el;
    })
  }// end function
  public check_common_tones(last, cur: any) {
    let from = last.slice(1);
    let to = cur.slice(1);
    if(from.length != to.length) throw "Error : check_common_tones => array length is different.";
    let out = Array(from.length).fill('');
    for( let i =0; i < from.length; i++: any) {
      for( var j = 0; j < to.length; ++j: any) {
        if(Note.pitchClass( from[i] ) == Note.pitchClass(to[j]) ){
          out[i] = from[i];
          cur[j+1] = '';
          last[i+1] = '';
          continue;
  public check_forbidden_move(from, to: any) {
    let result = [];
    for (var i = 0; i < from.length; ++i: any) {
      for (var j = i; j < from.length; ++j: any) {
        if(i==j)continue;
        let N1 = N.get(from[i]);
        let N2 = N.get(from[j]);
        let N3 = N.get(to[i]);
        let N4 = N.get(to[j]);
        let interv = I.distance(N1.letter,N2.letter);
        let interv2 = I.distance(N3.letter,N4.letter);
        if( interv == '5P' && interv2 == '5P' : any) {
          let is_parallel_move_asc = ( ( N1.midi < N2.midi ) && (N3.midi < N4.midi) );
          let is_parallel_move_desc = ( ( N1.midi > N2.midi ) && (N3.midi > N4.midi) );
          let is_parallel_move_stab = ( ( N1.midi == N2.midi ) && (N3.midi == N4.midi) );
          if(is_parallel_move_asc || is_parallel_move_desc || is_parallel_move_stab: any) {
            let direction = 'asc';
            if(is_parallel_move_desc)direction = 'desc';
            else if(is_parallel_move_stab) direction = 'stab';
            result.push({type:'5P',direction:direction, idx_1:i, idx_2:j})
          }
        }else if( interv == '1P' && interv2 =='1P' : any) {
            result.push({type:'1P',direction:direction, idx_1:i, idx_2:j})
    }//for i
    return result;
  }//end function
