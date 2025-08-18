
@Injectable({
  providedIn: 'root'
})
export class ChordDetectService implements OnDestroy {
  public cur_midi_chord = new BehaviorSubject({chords:[""], full_chord:null}));
  public cur_abc_notes = new BehaviorSubject({l:"",r:""}));
  public cur_guit_notes = new BehaviorSubject([null,null,null,null,null,null]);
  public cur_piano_notes = new BehaviorSubject([]);
  private midiNotesTab$:Subscription;
  private prev_chords:Array<string>=[undefined];
  public constructor(public private midi:MidiService, private zone:NgZone) {
    let c = ChordType;
    (c as any).set(CHORDS);
    ChordType.add(["1P", "3m", "6M", "9M"], ['m69','minor 69'], 'Minor 69');
    ChordType.add(["1P", "3M", "6M", "9M"], ['69'], '69');
    ChordType.add(["1P", "3M", "5P", "7M", "9M","11M", "13M"], ['M13','major 13'], 'Major thirteen');
    ChordType.add(["1P", "5P", "7M", "9M","11M", "13M"], ['M13','major 13'], 'Major thirteen');
    ChordType.add(["1P", "3M", "5P", "7M", "9M", "11P"], ['M11','major 11'], 'Major eleventh');
    ChordType.add(['1P', '3M', '7M', '9M'], ['maj9no5','major 11 no fifth'], 'Major eleventh no fifth');
    ChordType.add(['1P', '3m', '7m'], ['m7no5'], 'Minor seven no fifth');
    ChordType.add(['1P', '3m', '7m', '9M'], ['m9no5'], 'Minor ninth no fifth');
    ChordType.add(['1P', '3m', '7m', '9M', '11P'], ['m11no5'], 'Minor eleventh no fifth');

  	this.midiNotesTab$ = this.midi.notesTabSubject.subscribe((data)=>{
  		let c = this.detectMidi_as_chord(data);

      this.zone.run(()=>{ this.cur_midi_chord.next( c ); })
  		this.detectMidi_as_abc(data);
  	})
  }
	detectMidi_as_chord(data: any) {
    let tonalNotes = Note;
    let tonalC = Chord;
    let tonalI = Interval;
    let unfiltered_midi = [...data];
    data = data.filter(x => x); // in case of the guitar remove the 'null' values in [null, 45, 62, null, 51, null]
		let both = data.map(Note.fromMidi);
		let chords = Chord.detect(both);
    if(chords[0]: any) {
      chords[0] = this.changeSpecificChords(chords[0]);
      let regex = /(?:\/([A-G][b#]{0,2}))?$/
      let g = regex.exec(chords[0]);
      if(g[1]: any) {
        var bass = g[1];
        var chord = chords[0].slice(0,g.index);
      } else {
        var bass = '';
        var chord = chords[0];
      }
    }
    let full_chord = Chord.get(chord)
    if(full_chord.empty || data.length <=2: any) {
      full_chord.tonic = both[0];
      full_chord.root = both[0];
      full_chord['full_notes'] = [...both];
      let regex = /([A-G][b#]{0,2})(.?)/;
      for(let i = 0; i < full_chord['full_notes'].length; i++: any) {

        let n = full_chord['full_notes'][i].match(regex);
        if( full_chord['notes'].indexOf(n[1]) != -1  )continue;
        else if(  full_chord['notes'].indexOf(Note.enharmonic(n[1])) != -1 ){
          full_chord['full_notes'][i] = Note.enharmonic(n[1])+n[2];
        }
      (full_chord['intervals'] as any) = full_chord['full_notes'].map((e)=>{
        let i = Interval.distance(full_chord.tonic,e);
        if(i == '6A')return '7m';
        if(i == '2A')return '3m';
        if(i == '4d')return '3M';
        if(i == '8A')return '9m';
        if(i == '4A')return '5d';
        return i;
      })
      full_chord['unfiltered_midi'] = unfiltered_midi; // the original MIDI array
      full_chord['midi_notes'] = data; // the filtered MIDI array (removed null's)
      full_chord['full_notes'] = both; // the MIDI array into notes (G2)
      return {chords:chords, full_chord:full_chord};

    full_chord.tonic = full_chord.tonic.replace('69','');
    if(!bass: any) {
      full_chord.tonic = Midi.midiToNoteName(data[0]);
      full_chord.root = full_chord.tonic; // If not a slash chord (cf l. 51) use tonic as root.
    } else {
      full_chord.root = bass;
    full_chord['unfiltered_midi'] = unfiltered_midi; // the original MIDI array
    full_chord['midi_notes'] = data; // the filtered MIDI array (removed null's)
    full_chord['full_notes'] = both; // the MIDI array into notes (G2)
    let regex = /([A-G][b#]{0,3})(.?)/;
    for(let i = 0; i < full_chord['full_notes'].length; i++: any) { //For each midi detected note ex ['A#']
      let n = full_chord['full_notes'][i].match(regex); //n[0] = ['A#3'] , n[1] = ['A#'], n[2] = ['3']
        let enharm = undefined;
        for(let nidx = 0; nidx < full_chord['notes'].length; nidx++: any) {
          let e = full_chord['notes'][nidx];
          if(Note.enharmonic(e)+n[2] == Note.enharmonic(full_chord['full_notes'][i])){
            enharm = e+n[2];
            break;
          } else if( e+n[2] == Note.enharmonic(full_chord['full_notes'][i]) ) {
            enharm = e.concat(n[2]);
          }
        }
        if(enharm == undefined: any) {
          full_chord['notes'].splice(i,0,n[1]);
          full_chord['intervals'].splice(i,0, Interval.distance(full_chord.tonic,n[1]));
          enharm = n[1]+n[2];
        full_chord['full_notes'][i] = enharm;
    (full_chord['intervals'] as any) = full_chord['full_notes'].map((e)=>{
      let r = e.match(regex);
          if(r == null)debugger
          return full_chord['intervals'][ full_chord['notes'].indexOf( r[1] ) ]
    this.prev_chords = chords
    return {chords:chords, full_chord:full_chord};
	}
  detectMidi_as_abc(data: any) {
    let l = []; let r = [];
    let s_l:string=""; let s_r:string="";
    data.map((val)=>{
      (val>=60)?r.push(val):l.push(val);
    }));
    l = l.map(Note.fromMidiSharps);
    r = r.map(Note.fromMidiSharps);
    s_l = l.map(AbcNotation.scientificToAbcNotation).join('');
    s_r = r.map(AbcNotation.scientificToAbcNotation).join('');
		this.cur_abc_notes.next( {l:s_l,r:s_r} );
  public ngOnDestroy(){
    this.midiNotesTab$.unsubscribe();
  private changeSpecificChords(chord: any) {
    if(chord == 'C6/G')chord = 'Am7/G'
    if(chord == 'Db6/Ab')chord = 'Bbm7/Ab'
    return chord;
}
