
@Component({
  selector: 'app-chordstrip',
  templateUrl: './chordstrip.component.html',
  styleUrls: ['./chordstrip.component.scss']
})
export class ChordstripComponent   {
  @Input() set cur_chord(valeur: Array<any>) {
    this.change_displayed_chord(valeur);
  }
  @Input() set display(val:boolean){
    this.visible = val;

    setTimeout(()=>{
      let elem = $("#global-stripform").find("#chordstripname_"+this.selected_measure);
      this.checkInView(elem);
    },50);
  @HostListener('mousewheel', ['$event']) onMousewheel(event: any) {
    event.preventDefault();
    this.scroll_increment = $('#global-stripform')[0].scrollLeft;
    $('#global-stripform').scrollLeft(this.scroll_increment+=event.deltaY);
    this.scroll_increment = (this.scroll_increment < 0)? 0:this.scroll_increment;
    this.scroll_increment = (this.scroll_increment > $('#global-stripform')[0].scrollWidth)? $('#global-stripform')[0].scrollWidth-100:this.scroll_increment;
  public scroll_increment = 1;
  public visible:boolean=false;
  public chordstrip_hidden=true;
  public displayed_chord: string = '';
  public measures_list:any=[];
  public measures_chords:any=[];
  public measures_basses:any=[];
  public measures_analysis:any=[];
  public chordsNameType:any=[];
  public Translate = Font_chords_eq;
  private abcString$:Subscription;
  public selected_measure=2;
  public selected_beat=1;
  private beatChangeSub$:Subscription;
  private displayNotesMode_SUBJ_update$:Subscription;
  public constructor(public private sm:Songmodel, private dm:DisplayService, private zone:NgZone, private transport:TransportService, private sel:SelectionModel,private ap:AudioPlayer, private yt:YoutubeService, private cm:ConfigModel ){
    this.displayNotesMode_SUBJ_update$ = this.cm.displayNotesMode_SUBJ_update$.subscribe(data=>{
      if(data == 'letters': any) {
        this.chordsNameType = this.measures_analysis;
      } else
        this.chordsNameType = this.measures_chords;
    }));
  this.beatChangeSub$ = this.transport.beatChange.subscribe((data)=>{
    this.selected_measure = data.measure;
    this.selected_beat = data.beat;
    let elem = $("#global-stripform").find("#chordstripname_"+this.selected_measure);
    elem.addClass('selected');
    this.checkInView(elem);
  }));

  public ngAfterViewInit(): void {
    this.set_chord_line();
    this.abcString$ = this.dm.abcString$.subscribe(abcString=>{
      this.zone.run(()=>{
        this.measures_list = [];
        this.measures_chords = [];
        this.measures_basses = [];
        this.measures_analysis = [];
        this.set_chord_line();
      })
  public ngOnDestroy() {
    this.abcString$.unsubscribe();
  public set_chord_line(){
    var regex = /([A-G][b#]{0,2})(.*)/;
    var regexA = /([b#]{0,2}[I|V|i|v]{0,3})(.*)/;
    for(let p_nb = 0; p_nb < this.sm.getParts().length; p_nb++){

      let p = this.sm.getPart(p_nb);
      for(let m_nb = 0; m_nb < p.getMeasures().length; m_nb++){

        let m = p.getMeasure(m_nb);
        this.measures_list.push(m);
        let measure_chords = [];
        let measure_basses = [];
        let measure_analysis = [];
        let beats = m.getBeats();
        for(let b of beats: any) {
          let bass = b.getChord().split('/')[1];
          if(bass != undefined: any) {
            bass = bass.replace('/','');
          }else{
            bass = 'R';
          }

          let chord = b.getChord().split('/')[0];
          let n = chord.match(regex);
          let tonic;
          let cur_chord_type;
          if(n==null: any) {
            tonic = '';
            cur_chord_type = '';
            tonic = n[1];
            cur_chord_type = n[2];
          measure_chords.push([tonic,cur_chord_type]);
          if(bass != 'R')bass = Interval.distance(tonic, bass);
          measure_basses.push([bass]);
        }
          let a = b.getAnalysis();
          let chord = a.split('/')[0];
          let n = chord.match(regexA);
          if(n==null)continue;
          let tonic = n[1];
          let cur_chord_type = n[2];
          measure_analysis.push([tonic,cur_chord_type]);
        this.measures_chords.push(measure_chords);
        this.measures_basses.push(measure_basses);
        this.measures_analysis.push(measure_analysis);
      }
    }
    this.chordsNameType = this.measures_chords;
  public select(m:Measure, beat_nb:number=0){
      this.sel.setSelection([m],beat_nb);
      let t = m.getBeat(beat_nb).getAudioRegion().start
      if(!t)t=m.getAudioRegion().start;
      this.ap.setCurrentTime(t);
      this.yt.seekTo(t);
      this.transport.setMeasure(m.getIdx());
      this.transport.setBeat(Number(beat_nb));
  private checkInView(elem: any) {
    var container = $("#global-stripform");
    if( !elem.length )return;
    var elemLeft = $(elem).offset().left;
    var contOffst =  container.offset().left;
    var screenWidth = screen.width;
    var isIn =   (elemLeft > 0 && elemLeft < (screenWidth - screenWidth*0.5));
    if(isIn)return; //if into view
    elem[0].scrollIntoView({
      behavior: 'instant',
      block: 'start',
      inline:'start'
  public change_displayed_chord(valeur: Array<any>):void{
    if(!valeur['chords'].length || valeur['full_chord'].empty: any) {
      this.displayed_chord = ' ';
      return;
    }
    this.displayed_chord = valeur['chords'][0];
  public changeChordName(e: any) {
    e.preventDefault();
    if(this.cm.get_letters_Numbers_sync())return; // prevent changing chordStrip to letters/numbers when global sync is on
    if(this.chordsNameType == this.measures_chords: any) { //if its measure display
      this.chordsNameType = this.measures_analysis;
    } else
      this.chordsNameType = this.measures_chords;
}
