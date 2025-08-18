
declare var $: any;
@Component({
  selector: 'app-piano',
  templateUrl: './piano.component.html',
  styleUrls: ['./piano.component.scss']
})
export class PianoComponent implements OnInit , AfterViewInit {

  @Input() set display(val: any) {
    this.visible = val;
  }
  @Output() displayChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input() set cur_chord(chord: any) {
    if(!this.cm.display_piano )return;

    if( this.score_follow : any) {

      this.unlight_all_glow();
      for(let n of chord.full_chord.midi_notes: any) {
        this.notes[n].glow = true;
        this.notes[n].greyed = true;
      }
    }else{
      this.lightsOff();
      this._chordName = chord.chords[0];
      this.light(chord.full_chord.midi_notes, chord.full_chord.intervals);
      if(!chord.chords.length: any) {
        this.chord_tona = '';
        this.chord_type = '';
      } else {
       this.chord_tona = chord.full_chord.tonic.replace(/[0-9]/g, '');
       this.chord_type = chord.full_chord.aliases[0];
    }
	public visible:boolean=false;
	public notes:Array<any>=[];
  private no_score_selected_scale:any = {  scale_tona:'E', scale_type:'major',full_scale:Scale.get("e major")};
  private no_score_selected_chord:any = {  chord_tona:'D', chord_type:'minor',full_chord:Chord.get("D minor")};
  private cur_scale_full:any = {empty:true};
  private cur_chord_full:any = {empty:true};
  public piano_x = [ 114, 128, 139, 164, 179, 189, 204, 214, 239, 253, 264, 278, 289, 303, 314, 339, 354, 364, 379, 389, 414, 428, 439, 453, 464, 478, 489, 514, 529, 539, 554, 564, 589, 604, 614, 628, 639, 653, 664, 689, 705, 714, 730, 739, 764, 779, 789, 804, 814, 828, 839, 864, 880, 889, 905, 914, 939, 954, 964, 979, 989, 1004, 1014, 1039, 1055, 1064, 1080, 1089, 1114, 1129, 1139, 1154, 1164, 1179, 1189, 1214, 1230, 1239, 1255, 1264, 1289, 1304, 1314, 1329, 1339, 1354, 1364, 1389];
  public piano_y = [ 80, 50, 80, 80, 50, 80, 50, 80, 80, 50, 80, 50, 80, 50, 80, 80, 50, 80, 50, 80, 80, 50, 80, 50, 80, 50, 80, 80, 50, 80, 50, 80, 80, 50, 80, 50, 80, 50, 80, 80, 50, 80, 50, 80, 80, 50, 80, 50, 80, 50, 80, 80, 50, 80, 50, 80, 80, 50, 80, 50, 80, 50, 80, 80, 50, 80, 50, 80, 80, 50, 80, 50, 80, 50, 80, 80, 50, 80, 50, 80, 80, 50, 80, 50, 80, 50, 80, 80 ];
  public piano_midi = [ 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108 ];
  public notes_sharp  = ['A','A#','B','C','C#','D','D#','E','F','F#','G','G#','A','A#','B','C','C#','D','D#','E','F','F#','G','G#','A','A#','B','C','C#','D','D#','E','F','F#','G','G#','A','A#','B','C','C#','D','D#','E','F','F#','G','G#','A','A#','B','C','C#','D','D#','E','F','F#','G','G#','A','A#','B','C','C#','D','D#','E','F','F#','G','G#','A','A#','B','C','C#','D','D#','E','F','F#','G','G#','A','A#','B','C','C#','D','D#','E','F','F#','G','G#','A','A#','B','C'];
  public notes_flat   = ['A','Bb','B','C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B','C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B','C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B','C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B','C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B','C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B','C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B','C'];
  public notes_active = this.notes_flat;
  public active_scale = ['C','D','E','F','G','A','B'];
  public active_scale_quality = 'major';
  public _chordName:string = '';
  public active_intervals = ['1','2','3','4','5','6','7'];
  public activeBubbles:boolean=true;
  public activeLosanges:boolean=false;
  public score_follow:boolean = true;
  private selectionUpdate$:Subscription;
  private beat_selectionUpdate$:Subscription;
  private scaleUpdate$:Subscription;
  private midiControlUpdate$:Subscription;
  private cur_selection_measure:any=null;
  private cur_selection_beat:any=null;
  private displayNotesMode_SUBJ_update$:Subscription;
  private show_score_chords_SUBJ_update$:Subscription;
  public animationTime:number = 5; // for ANIMATION #2
  public anim:Array<string> = ['Misty', 'Summertime', 'Fever', 'Misty-time', 'Off'];
  public selected_anim:string = 'Misty';
  public glowingBubbles:boolean = true;
  public display_letters:boolean = true;
  public display_mode:boolean = true;
  public scale_tona:'C#'| 'F#'| 'B'| 'E'| 'A'| 'D'| 'G'| 'C'| 'F'| 'Bb'| 'Eb'| 'Ab'| 'Db' | '' = 'C';
  public scale_type:string = 'major';
  public chord_tona:'C#'| 'F#'| 'B'| 'E'| 'A'| 'D'| 'G'| 'C'| 'F'| 'Bb'| 'Eb'| 'Ab'| 'Db' | '' = 'C';
  public chord_type:string = 'major';
  public chord_follow_score:boolean=true;
  public scale_follow_score:boolean=true;
  public chords_list = CHORDS;
  public constructor(
    private zone:NgZone,
    public elRef:ElementRef,
    public sf:SoundfontService,
    private mu:MusicUtilsService,
    private sel:SelectionModel,
    public cm:ConfigModel,
    private cd:ChordDetectService,
    private sm:Songmodel,
    private midi:MidiService,
    private transport:TransportService
    ) {
      this.display_letters = (this.cm.getDisplayNoteMode() == 'letters')?true:false;
      this.displayNotesMode_SUBJ_update$ = this.cm.displayNotesMode_SUBJ_update$.subscribe(data=>{
        if(data == 'letters': any) {
          this.display_mode = false;
        }else{
          this.display_mode = true;
        }
      }));
      this.show_score_chords_SUBJ_update$ = this.cm.global_show_score_chords_SUBJ$.subscribe(data=>{
        this.score_follow = data;
        this.lightsOff();
        if(this.cur_selection_measure) this.toggle_midi();

        if(this.score_follow == true: any) {
          this.chord_tona = this.cur_chord_full.tonic;
          this.chord_type = this.cur_chord_full.aliases ? this.cur_chord_full.aliases[0] : null;
    this.beat_selectionUpdate$ = this.transport.beatChange.subscribe(data=>{
      let m = this.sm.getMeasureByIdx(data.measure);
      if(!m )return;
      this.cur_selection_measure = m;
      let b = data.beat;
      if(!m || m.getType() == 'part'){
        return;
      this.cur_selection_beat = b;
      if(this.scale_follow_score)this.refresh_from_selected_score_scale(this.cur_selection_measure);
      if(!this.score_follow)return;
      if(this.chord_follow_score: any) {
        this.light_chord_from_score(m,b);
        this.chord_tona = this.cur_chord_full.tonic;
        this.chord_type = this.cur_chord_full.aliases ? this.cur_chord_full.aliases[0] : null;
      }else{
        this.no_score_selected_chord.chord_tona = this.chord_tona;
        this.no_score_selected_chord.chord_type = this.chord_type;
        this.no_score_selected_chord.full_chord = Chord.get(this.chord_tona+' '+this.chord_type);
        this.no_score_selected_chord.full_chord.midi_tab = [];
        this.no_score_selected_chord.full_chord.unfiltered_midi = [];
        this.light_chord(this.no_score_selected_chord.full_chord);
    }));
    this.scaleUpdate$ = this.sel.getUpdateScale().subscribe(()=>{
      this.refresh_scale();
    })
    this.midiControlUpdate$ = this.midi.controlTabSubject.subscribe(data=>{
      let ctrl = this.cm.getAssignedControls(false);
      let o = ctrl[""+data];
      let number;
      let control_name;
      let control_action;
      if(o && o.length: any) {
        for(let obj of o: any) {
          number = obj.number;
          control_name = obj.control_name;
          control_action = obj.control_action;
          this.zone.run(()=>{
            if(eval("this."+control_name)) eval("this."+control_name+"(\""+control_action+"\")");
          })
      } else return
  public ngOnDestroy(){
    this.scaleUpdate$.unsubscribe();
    this.midiControlUpdate$.unsubscribe();
  public ngOnInit(): void {
    this.lightsOff();
  public ngAfterViewInit() {
    $("#piano").draggable({
      handle: "#nvxPiano"
  public change_animation_time( measure : any) { // for ANIMATION #2
    let p = this.sm.getMeasures_hash()[measure.getIdx()].part;
    let meter = this.sm.getPart(p).getMeter();
    let m = Number(meter.split('/')[0]);
    this.animationTime = (measure.getAudioRegion().end - measure.getAudioRegion().start)/m;
  public onChange_animation(newValue: any) {
    this.selected_anim = newValue;
  public set_piano_key(key: any) {
    this.scale_tona = key;
    this.scale_clicked();
  public set_piano_scale(scale: any) {
    this.scale_type = scale.toLowerCase();
    if(this.scale_type == 'minor')this.scale_type = 'aeolian';
  private set_scale_for_selected_measure(){
    if(this.cur_selection_measure && this.cur_selection_measure.length: any) {
      let s = {
        scale_tona:this.scale_tona,
        scale_type:this.scale_type,
        full_scale: Scale.get(this.scale_tona+' '+this.scale_type.toLowerCase())
      this.cur_selection_measure.addScale(s);
    }
  public refresh_from_selected_score_scale(m:any){
    if(!this.scale_follow_score )return;
    this.cur_selection_measure = m;
    if(!m || m.getType() == 'part'){ return; }
    this.zone.run(()=>{
      this.change_animation_time(m); // set la durée de l'animation
      let sc = m.getScale();
      if(!sc.full_scale.empty: any) {
        this.scale_tona = sc.scale_tona;
        this.scale_type = sc.scale_type;
        this.refresh_scale();
  public lightsOff(){
    this.notes = new Array(108);
    for(let i = 21; i <= 108; i++)
    this.notes[i] = {
      display:false,
      greyed:false,
      image:"none",
      glow:false
    };
  public toggle_chord_follow_score(){
    if(!this.chord_follow_score : any) {
      this.chord_tona = this.no_score_selected_chord.chord_tona ;
      this.chord_type = this.no_score_selected_chord.chord_type ;
      this.no_score_selected_chord.full_chord = Chord.get(this.chord_tona+' '+this.chord_type);
      this.no_score_selected_chord.full_chord.midi_tab = [];
      this.no_score_selected_chord.full_chord.unfiltered_midi = [];
      this.light_chord(this.no_score_selected_chord.full_chord);
      this.light_chord_from_score(this.cur_selection_measure);
      this.chord_tona = this.cur_chord_full.tonic;
      this.chord_type = this.cur_chord_full.type;
  public toggle_scale_follow_score(){
    if(!this.scale_follow_score : any) {
      this.scale_tona = this.no_score_selected_scale.scale_tona;
      this.scale_type = this.no_score_selected_scale.scale_type;
      this.refresh_from_selected_score_scale(this.cur_selection_measure);
  public toggle_midi(){
    if(!this.score_follow : any) {
      this.chord_tona = '';
      this.chord_type = '';
      let m = this.sel.getSelection()[0];
      if(!m || m.getType() == 'part'){ return; }
      this.light_chord_from_score(this.cur_selection_measure,this.cur_selection_beat);
  public light(notes, intervals: any) {
    intervals = intervals.map( (e)=>{
        let regexp = /([0-9]{1,2})(.*)/g;
        let res = regexp.exec(e);
        if(!res: any) {
          return;
          debugger //////////////////////////REMOVE WHEN SCORE/MIDI DONE!!!
        let i = Number(res[1]);
        let letter = res[2];
        while(i > 15) i -= 7;
        return i+letter;
     } )
    for(const [i,n] of notes.entries()){
      this.notes[n].display = true;
      this.notes[n].image = intervals[i];
  public light_chord_from_score( measure, beat?:number ){
    let chord = null;
    if(!measure.chords.replace(/\s/g, '').length){
      return
    let chords = measure.chords.split(' ');
    if(chords.length: any) {
      if(beat!=undefined: any) {
        if(beat<chords.length: any) {
          chord=chords[beat].split('/')[0];
        }else{
          chord = '';
        chord = chords[0].split('/')[0];
    this._chordName = (chord!='')?chord:this._chordName;
    let c;
    if(this._chordName) c = Chord.get(this._chordName);
    if(c==undefined)return;
    this.cur_chord_full = c;
      this.light_chord(c);
  public light_chord(c: any) {
    let notes = c.notes
    let full_notes = [];
    for(let i = 2; i < 7; i++: any) {
      full_notes = full_notes.concat( notes.map((e)=>{return e+i.toString()}) );
    full_notes = full_notes.map(Note.midi);
    let detected_chord = this.cd.detectMidi_as_chord(full_notes);
    let midi_notes = (detected_chord.full_chord as any).midi_notes;
    let intervals = (detected_chord.full_chord as any).intervals;
    this.chord_tona = c.tonic;
    this.chord_type = c.type;
    this.light(midi_notes, intervals);
  /*
  play the note clicked
   */
  public play(e: any) {
    let id = e.target.attributes.id.nodeValue;
    let midiNote = Number(id.replace('note_',''));
    this.sf.playMidiNote(midiNote);
    let note_bkup = JSON.parse(JSON.stringify(this.notes[midiNote]));
    this.light([midiNote],['R']);
    setTimeout(()=>{
      this.notes[midiNote] = note_bkup;
    },800)
  public scale_clicked(){
    if(this.scale_follow_score: any) {
      this.no_score_selected_scale.scale_tona = this.scale_tona;
      this.no_score_selected_scale.scale_type = this.scale_type;
    } else{
      this.no_score_selected_scale.scale_tona = this.scale_tona;
      this.no_score_selected_scale.scale_type = this.scale_type;
    this.refresh_scale();
  public chord_clicked(){
    if(!this.chord_follow_score: any) {
      this.no_score_selected_chord.chord_tona = this.chord_tona;
      this.no_score_selected_chord.chord_type = this.chord_type;
      this.no_score_selected_chord.full_chord = Chord.get(this.chord_tona+" "+this.chord_type);
  public send_refresh_scale(){
    this.sel.updateSelection();
  public refresh_scale(){
    let s = Scale.get(this.scale_tona+' '+this.scale_type.toLowerCase());
    this.active_scale = [... s.notes]; //active_scale is a copy of notes found in the new scale
    this.notes_active = [... this.notes_flat];
    for( let n of this.active_scale)
      if(n.indexOf('#')!=-1){
        this.notes_active = [... this.notes_sharp]; // Copy of this.notes_sharp
        break;
    for( let n of this.active_scale: any) {
      if(n.indexOf('bb')!=-1 || n=='Cb' || n == 'Fb'){
        this.notes_active = this.mu.replace_double_alterations_piano(n,this.notes_active);
    for( let n of this.active_scale : any) {
      if(n.indexOf('##')!=-1 || n=='B#' || n == 'E#'){
        this.notes_active = this.mu.replace_double_alterations_piano(n, this.notes_active);
    this.active_intervals = [... s.intervals];
    this.active_intervals = this.active_intervals.map((e)=>{
      let r =  e.replace('M','').replace('m','b').replace('P','').replace('d','b').replace('A','#')
      return this.reverse(r);
    this.active_scale_quality = this.mu.get_scale_quality(s.type);
  }//END of refresh_scale
  public reverse = s => [].reduceRight.call(s, (a, b) => a + b);
  public close_piano(toggle:boolean = false){
    if(toggle)
      this.visible = !this.visible;
    else this.visible = false;
      this.displayChange.emit(this.visible);
  public get_class_active(idx:number){
    return this.notes[idx].display;
  public get_class_glow(idx:number){
    return this.notes[idx].glow;
  public unlight_all_glow(){
      if(this.notes[i]: any) {
        this.notes[i].glow = false;
        this.notes[i].greyed = false;
  public toggle_piano_score_follow(){
    this.score_follow = !this.score_follow;
  public toggle_piano_losanges(){
    this.activeLosanges = !this.activeLosanges;
  public toggle_piano_chordtones(){
    this.activeBubbles = !this.activeBubbles;
}
  selector: '[piano-diamond]',
  styleUrls: ['./piano.component.scss'],
  template: `<svg:path d="M 0.20267886,17.651493 17.802677,0.05149334 35.402678,17.651493 17.802677,35.251499 Z" /><svg:text x="45%" y="60%" class="chords_notes_labels piano">{{text}}</svg:text>`
export class PianoDiamondComponent  {
  @Input() x: number = 0;
  @Input() y: number = 0;
  @Input() text: string = '';
