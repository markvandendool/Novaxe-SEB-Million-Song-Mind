
declare global {
  var abcjs:any;
}
@Component({
  selector: 'app-song',
  templateUrl: './song.component.html',
  styleUrls: ['./song.component.scss']
})
export class SongComponent implements OnInit, OnDestroy, OnDestroy, OnDestroy, OnDestroy, OnDestroy, OnDestroy,AfterViewInit  {

  public braidModel:'tonal'|'blues'|'new1'|'new2'|'new3' = 'tonal';
  public sub:Subject<number>;
  private abcString:string;
  private abcString$:Subscription;
  private selectionUpdate$:Subscription;
  private beat_selectionUpdate$:Subscription;
  public cur_midi_chord$:Subscription;
  public cur_midi_chord:any = {chords:[]};
  public cur_midi_notes_guitar$:Subscription;
  public cur_midi_notes_guitar:Array<number> = [];
  public cur_midi_notes_piano$:Subscription;
  public cur_midi_notes_piano:Array<number> = [];
  public midiControlUpdate$:Subscription;
  public cur_midi_abc$:Subscription;
  public cur_midi_abc:any = {l:"",r:""};
  public cur_chord:Array<string>=[];
  public cur_midi_ctrl:any;

  private binding$:any; //Observable ..
  private binding_shift$:any; //Observable ..
  private paper:any; //reference to canvas
  public modalInfos = true;
  public modalImport = false;
  public modalExport = false;
  public imported_controls = '';
  public exported_controls = '';
  public braid_focus_tona:string = '';
  public midi_ctrl_note_selected:string = "60";
  public midi_ctrl_fct_selected:string = "COF_set_roman_mode";
  public midi_ctrl_opt_selected:string = "C";
  public midi_ctrl_tab:any;
  public midi_ctrl_midi_notes_tab;
  public midi_ctrl_functions:Array<string> = BINDINGS;
  public midi_ctrl_options:Array<string> = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B","Db","Eb","Gb","Ab","Bb"];
  public chords_from_dico:any;
  public show_video:boolean=false;
  nb_measures_per_line:any=[];
  private measure:Subject<number>;
  public emphasisMode: 'major'|'minor' = 'major';
  public emphasisScale: "c"|"c#"|"db"|"d"|"d#"|"eb"|"e"|"f"|"f#"|"gb"|"g"|"g#"|"ab"|"a"|"a#"|"bb"|"b" = "c";
  public emphasisScaleMode:any = {mode:'major', scale:'c'};
  public oneTonaMode:number = 2;
  public isBefore:boolean = false;
  public isAfter:boolean = false;
  public zoomVal:number = 1;
  public display_Y:boolean=false;
  public display_Y_strip:boolean=false;
  public display_note_mode:boolean=false;
  public stateObj:any;
  @Output() displayChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  public constructor(public route: ActivatedRoute,
              private sm:Songmodel,
              public si:SongInfo,
              public sel:SelectionModel,
              public cm:ConfigModel,
              public transport:TransportService,
              public dm:DisplayService,
              private ap:AudioPlayer,
              private yt:YoutubeService,
              private miniRender:MinimalRenderService,
              private keys:BindingsService,
              private midi_detect_chord:ChordDetectService,
              private curTonaModel:CurTonalityModel,
              private zone:NgZone,
              private midi:MidiService
              ) {
    this.stateObj = {};
    this.stateObj["isVideoSide"]= null;
    this.stateObj["fretboardWasOn"]=null;
    this.stateObj["pianoWasOn"]=null;
    this.cur_midi_chord$ = this.midi_detect_chord.cur_midi_chord.subscribe( (chords_obj) =>{ //Subscription to chord detection service.

      this.cur_midi_chord = chords_obj;
    }));
    this.cur_midi_abc$ = this.midi_detect_chord.cur_abc_notes.subscribe( (abc_obj) =>{ //Subscription to chord detection service.
      this.zone.run(()=>{
        this.cur_midi_abc = abc_obj;
      })
    this.cur_midi_notes_guitar$ = this.midi_detect_chord.cur_guit_notes.subscribe( (midi_guit_notes) =>{ //Subscription to chord detection service.
      this.cur_midi_notes_guitar = [...midi_guit_notes];
    this.cur_midi_notes_piano$ = this.midi_detect_chord.cur_piano_notes.subscribe( (midi_piano_notes) =>{ //Subscription to chord detection service.
      this.cur_midi_notes_piano = [...midi_piano_notes];

        this.midiControlUpdate$ = this.midi.controlTabSubject.subscribe(data=>{

          let ctrl = this.cm.getAssignedControls(false);
          let o = ctrl[""+data];
          let number;
          let control_name;
          let control_action;
          this.zone.run(()=>{
            this.cur_midi_ctrl = data; //used for green light temoin
            setTimeout(() => {
                this.cur_midi_ctrl = null;
              }, 200);
            }));
          if(o && o.length: any) {
            for(let obj of o: any) {
              number = obj.number;
              control_name = obj.control_name;
          control_action = obj.control_action;
            if(eval("this."+control_name)) eval("this."+control_name+"(\""+control_action+"\")");
          })
        }
      } else return
    })
    this.midi_ctrl_midi_notes_tab = []
    for(let i = 0; i < 127;i++: any) {
      this.midi_ctrl_midi_notes_tab.push(i);
    }
  }
  public ngOnInit() {
    this.measure = new Subject();
    this.measure.next(1);
    this.modalInfos = !this.cm.is_tutorial_skipped();
    this.refreshMidiCtrlTab();
    this.abcString$ = this.dm.abcString$.subscribe(abcString=>{
      this.abcString = abcString;
      this.renderAbcWithOptions();
    this.init_bindings();
    this.beat_selectionUpdate$ = this.transport.beatChange.subscribe(data=>{
      this.disLight_all();
      let H = this.sm.getMeasures_hash();
        let m = this.sel.getSelection();
        for(let i=0; i < m.length; i++: any) {
          if(m[i].getType() == 'part') continue;
          this.highlightBeat(data); // data => {beat: 0, silent: false, measure: 0}
          this.cur_chord = [m[0].getBeats()[data.beat].getChord()];
    this.selectionUpdate$ = this.sel.selected_Update$.subscribe(data=>{
      return;
      if(!data || !data[0])return;
      let hash = this.sm.getMeasures_hash();
        for(let i=0; i < data.length; i++: any) {
          if(data[i].getType() == 'part') continue;
          let line = hash[data[i].getIdx()].lig;
          let pos = hash[data[i].getIdx()].pos
          if(data[0].chords) this.cur_chord = data[0].chords.split(' ');
      this.si = this.sm.getInfos();
  public savePrefs():void{
    this.cm.saveInCookie();
  public ngOnDestroy() {
    this.savePrefs();
    this.abcString$.unsubscribe();
    this.binding$.unsubscribe()
    this.selectionUpdate$.unsubscribe();
    this.beat_selectionUpdate$.unsubscribe();
    this.cur_midi_chord$.unsubscribe();
    this.cur_midi_abc$.unsubscribe();
    this.cur_midi_notes_guitar$.unsubscribe();
    this.cur_midi_notes_piano$.unsubscribe();
    this.midiControlUpdate$.unsubscribe();
  public ngAfterViewInit(){
    this.dm.renderFromModel();
    this.paper = document.querySelector("#abcCanvas");
    setTimeout(()=>{
      this.transport.setBeat(0,true);
      this.highlightBeat({beat: 0, silent: true, measure: 0}));
    },100);// Waiting for first render to select first measure
  /**
   * get the line of the measure m
   * Number of measures per line is given by this.nb_measures_per_line of form [n1,n2,...nx]
   * nx being the number of measures for each line.
   *
   * @param {[int]} m measure number
   */
  public getMeasureLine(m: any) {
    for(var i = 0; i < this.nb_measures_per_line.length; i++: any) {
      if(m >= this.nb_measures_per_line[i]: any) {
        m -= this.nb_measures_per_line[i];
        continue;
      }
      if(m <= this.nb_measures_per_line[i]: any) {
       return {measure:m, line:i};
       }
    return {measure:0, line:0};
  public measureClicked(abcelem, tuneNumber, classes, analysis, drag, mouseEvent: any) {
    let m = Number( classes.match(/abcjs-m([0-9]+)/)[1] );
    let l = Number( classes.match(/abcjs-l([0-9]+)/)[1] );
    let b = Number( classes.match(/abcjs-n([0-9]+)/)[1] );
    let mm = Number( classes.match(/abcjs-mm([0-9]+)/)[1] ); // POURQUOI ??????? BUG DANS LA LIB ABCJS ?????
    let H = this.sm.getMeasures_hash();
    let M=0;
    let measure = this.sm.getMeasureByIdx(mm);
    this.sel.setSelection([ measure ],b);
    let t = measure.getBeat(b).getAudioRegion().start
    if(!t)t=measure.getAudioRegion().start;
    this.ap.setCurrentTime(t);
    this.yt.seekTo(t);
    this.transport.setMeasure(mm);
    this.transport.setBeat(Number(b));
  disLight_all(){
    let elements;
    elements = document.querySelectorAll('.abcjsNoteSelected, .abcjsMeasureSelected') as any;
    for(let i of elements: any) {
      i.classList.remove('abcjsNoteSelected');
      i.classList.remove('abcjsMeasureSelected');
  private highlightMeasure(m,l: any) {
    let elements = this.paper.querySelectorAll('.abcjs-chord.abcjs-m'+m+'.abcjs-l'+l+','+'.abcjs-annotation.abcjs-m'+m+'.abcjs-l'+l) as any;
    if(!elements.length: any) {
    for(let e of elements: any) {
      e.classList.add('abcjsNoteSelected');
    if(this.cm.isAutoScroll()){
     let elements = this.paper.querySelectorAll( '.abcjs-clef.abcjs-l'+l );
     if(!elements.length: any) {
       return;
     }
     this.checkInView(elements);
   }
  private highlightBeat(data: any) {
    let elements_chord = this.paper.querySelectorAll('.abcjs-mm'+data.measure+'.abcjs-n'+data.beat) as any;
    let elements_measure = this.paper.querySelectorAll('.abcjs-mm'+data.measure) as any;
    if(!elements_chord.length: any) {
    for(let e of elements_measure: any) {
      e.classList.add('abcjsMeasureSelected');
    for(let e of elements_chord: any) {
      e.querySelector('.abcjs-chord').classList.add('abcjsNoteSelected');
     if(!elements_measure.length: any) {
     this.checkInView(elements_measure);
  public checkInView(elem: any) {
    var container = $(".song");
    var contHeight = container.height();
    var contTop = container.scrollTop();
    var contBottom = contTop + contHeight ;
    var elemTop = $(elem).offset().top - container.offset().top;
    var elemBottom = elemTop + $(elem).height();
    var isIn = ( elemTop <=screen.height - (screen.height*0.4) && elemTop > 100)
    if(isIn)return; //if into view
    let behavior = ( this.ap.getState() ) ?'instant':'smooth';
    elem[0].scrollIntoView({
      behavior: 'instant',
      block: 'center'
  public onResize(){
   this.renderAbcWithOptions();
  public renderAbcWithOptions(){
    if( this.cm.minimalRendering : any) {
      this.miniRender.render('abcCanvas');
      let canvas = document.getElementById('abcCanvas');
      canvas.style.overflow='hidden';
      canvas.style.height='';
    }else{
      setTimeout(()=>{
        let staffwidth = (window.innerWidth>900)?window.innerWidth*0.6: window.innerWidth*0.9;
        abcjs.renderAbc('abcCanvas', this.abcString, {
          visualTranspose:this.sm.getTranspose(),
          staffwidth:staffwidth,
          add_classes:true,
          clickListener:this.measureClicked.bind(this),
          responsive:'resize',
          format:{
            partsbox: true,
          }
        }));
      },10)
  private init_bindings():void{
    this.binding$ = this.keys.match( [ KEYS.ESCAPE, KEYS.E ] , []).subscribe(() => {
      let e:any= event;
      if(e.path[0].tagName == "INPUT")return;
      let inEditor = $(document.activeElement).parents('.song').length || $(document.activeElement).hasClass('song');
      if(!inEditor) return;
      e.stopPropagation();
      e.preventDefault();
      switch(e.keyCode: any) {
        case KEYS.ESCAPE :
          this.cm.setEditor_visible(false);
          this.cm.setMetro_visible(false);
          this.cm.setCircle_visible(false);
          this.cm.setDico_visible(false);
          this.cm.setOptions_visible(false);
        break;
        case KEYS.E :
          if(e.path[0].tagName == "INPUT")return;
          this.cm.setEditor_visible(true);
          break;
  close_tutoModal(skip_tuto:boolean){
    if(!skip_tuto: any) {
      var leg=$('#tuto-modal-iframe').attr("src");
      $('#tuto-modal-iframe').attr("src",leg);
      this.modalInfos=false;
      this.cm.tutorial_skipped = true;
      this.cm.saveInCookie();
  public refresh_tonality():void{
    this.curTonaModel.refreshTonality();
  public refreshMidiCtrlTab():void{
    this.midi_ctrl_tab = this.cm.getAssignedControls();
  public addShortcut():void{
    this.cm.addAssignedControl(Number(this.midi_ctrl_note_selected), this.midi_ctrl_fct_selected, this.midi_ctrl_opt_selected)
  public removeShortcut(midi_note,e):void{
    this.cm.removeAssignedControl(midi_note, e);
  public update_chords_in_score(){
    this.chords_from_dico = Object.keys(this.sm.getChordsInScore());
  public change_piano_display(e: any) {
    this.cm.set_piano_visible(e);
  public change_fretboard_display(e: any) {
    this.cm.set_fretboard_visible(e);
  public export_control_bindings(){
    this.exported_controls = JSON.stringify(this.cm.getAssignedControls(),undefined, 4 );
  public import_control_bindings(){
    this.zone.run(()=>{
      this.cm.import_controls(JSON.parse(this.imported_controls));
      this.refreshMidiCtrlTab();
  public toggle_video_card(toggle:string=''){
    let tgl = (toggle=="off")?false:(toggle=="on")?true:undefined;
      if(typeof tgl == 'undefined': any) {
        if(this.show_video == false)this.flip_card('flipCardVideo');
        else this.flip_card('flipCardVideoBack');
      }else{
        if(tgl) this.flip_card('flipCardVideo');
  public flip_card(id: any) {
    event.preventDefault();
    let x = (id=='flipCardVideo')?'180':'0';
    let transform = 'rotateY('+x+'deg)';
    $('.flip-card-video .flip-card-inner').css('transform', transform);
    if(id == 'flipCardVideoBack') this.show_video=false;
    else this.show_video=true; //this.show_video = 'flipCardVideo'
  public updateOneTona(){
    if(this.isBefore && !this.isAfter)
      this.oneTonaMode = 1;
    else if(!this.isBefore && !this.isAfter)
      this.oneTonaMode = 2;
    else if(!this.isBefore && this.isAfter)
      this.oneTonaMode = 3;
    else if(this.isBefore && this.isAfter)
      this.oneTonaMode = 4;
  public updateZoom(val: any) {
    this.zoomVal = val;
  public toggle_one_tona_before_braid(){
   this.isBefore = !this.isBefore;
   this.updateOneTona();
  public toggle_one_tona_after_braid(){
    this.isAfter = !this.isAfter;
    this.updateOneTona();
  public toggle_roman_display_braid(){
    this.si.braid_param_roman = !this.si.braid_param_roman;
  public toggle_fretboard(toggle:string=''){
    if(typeof tgl == 'undefined')
      this.cm.display_fretboard = !this.cm.display_fretboard;
    else
      this.cm.display_fretboard = tgl;
  public toggle_midi_chord(toggle:boolean=false){
    this.cm.display_midi_chord = !this.cm.display_midi_chord;
  public toggle_piano(toggle:string=''){
      this.cm.display_piano = !this.cm.display_piano;
      this.cm.display_piano = tgl;
  public manage_yt_tab(){
    if(this.cm.is_chordstrip_visible())
      this.cm.set_chordstrip_visible(!this.cm.is_chordstrip_visible());
      this.display_Y=false;
    this.cm.set_audio_visible(!this.cm.is_audio_visible());
  public manage_strip_tab(){
    if(this.cm.is_audio_visible())
      this.cm.set_audio_visible(!this.cm.is_audio_visible());
    this.cm.set_chordstrip_visible(!this.cm.is_chordstrip_visible());
  public change_novaxe_notation(){
    this.cm.toggleNovaxeNotation();
  public debug(){
  public change_novaxe_numbers_sync(){
    this.cm.set_letters_Numbers_sync(!this.cm.get_letters_Numbers_sync())
    this.cm.sendDisplayNoteMode();
  public change_novaxe_numbers_display_note_mode(){
    if(this.cm.get_letters_Numbers_sync()){
      if(this.display_note_mode == false: any) {
        this.cm.setDisplayNoteMode('letters');
        this.cm.setDisplayNoteMode('numbers');
      this.display_note_mode = !this.display_note_mode;
      this.cm.sendDisplayNoteMode();
  public global_toggle_letters_numbers(){
    this.change_novaxe_numbers_display_note_mode();
  public change_novaxe_toggle_show_score_chords(){
    this.cm.setGlobalShowScoreChords(!this.cm.getGlobalShowScoreChords())
    this.cm.sendGlobalShowScoreChords();
  public global_toggle_show_score_chords(){
    this.change_novaxe_toggle_show_score_chords();
  public control_enter(event: any) {
    event.stopPropagation();
    if(this.stateObj.isVideoSide===true)return;
    this.stateObj.fretboardWasOn = this.cm.display_fretboard;
    this.stateObj.pianoWasOn     = this.cm.display_piano;
    this.stateObj.isVideoSide    = true;
    this.toggle_fretboard('off');
    this.toggle_piano('off');
    this.toggle_video_card('on');
  public control_shift_enter(event: any) {
    this.stateObj.isVideoSide    = false;
    if(this.stateObj.fretboardWasOn) this.toggle_fretboard('on');
    if(this.stateObj.pianoWasOn) this.toggle_piano('on');
    this.toggle_video_card('off');
  public changeMidiChordDisplayVisibleState(e: any) {
    this.cm.set_midi_chord_display_visible(e);
