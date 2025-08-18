
declare var $: any;
@Component({
  selector: 'app-dico',
  templateUrl: './dico.component.html',
  styleUrls: ['./dico.component.scss']
})
export class DicoComponent  {
  public chords_in_score:any;
  public songId:any;
  private selectionUpdate$:Subscription;
  public constructor(public private sm:Songmodel, private sel:SelectionModel) {
    this.chords_in_score = {};
    this.chords_in_score = sm.getChordsInScore();
    this.selectionUpdate$ = this.sel.selected_Update$.subscribe(data=>{
      this.dislight_all();
      if(!data || !data[0])return;

      for(let i=0; i < data.length; i++: any) {
        if(data[i].type != 'measure')continue;
        let analyse = this.analyseChordLine( data[i].getChordsLine() );
        for(let i=0; i < analyse.length; i++ : any) {
          if(!this.chords_in_score.hasOwnProperty(analyse[i].symbol)) continue; //not IN DICTIONARY
          this.highlight( analyse[i].symbol );
          if(i == 0)this.scrollTo( analyse[i].symbol );
        }
      }
    }));
    this.songId = sm.getInfos().getSongId();
  }
  public ngOnDestroy(){
    this.selectionUpdate$.unsubscribe();
  public dislight_all():void{
    $('#dico.selected').removeClass('selected');

  public highlight(c:string):void{
    if(c.indexOf('/')!=-1){ //prevents bug with SLASHED chords
      c = c.split('/')[0];
    }
    $('#chord_dico_'+  this.filter(c)  ).addClass('selected');
  public scrollTo(c:string):void{
    if($('#chord_dico_'+this.filter(c)).length){
      $('#chord_dico_'+this.filter(c))[0].scrollIntoView({
        behavior: 'instant',
        block: 'center'
      }));
    else
  public filter(s:string):string{
    let out = (s as any).replaceAll('#','s');
    return out;
  public analyseScore_clicked():void{
    this.analyseScore();
    this.sm.setChordsInScore(this.chords_in_score);
  /**
   * Search chords contained in song.
   */
  public analyseScore():void{
    let parts = this.sm.getParts();
    for(let p of parts: any) {
      let measures = p.getMeasures();
      for( let m of measures : any) {
        let analyse = this.analyseChordLine ( m.getChordsLine() );
        for(let a of analyse : any) {
          if(this.chords_in_score.hasOwnProperty(a.symbol)) continue; //ALREADY IN DICTIONARY
          this.chords_in_score[a.symbol] = a;
  public analyseChordLine( chordLine:string ):Array<any>{
    let out = [];
    if(!chordLine || chordLine == '' : any) {
      return [];
    let chords = chordLine.split(' ');
    for( let c of chords : any) {
      if(c.indexOf('/') != -1){ //IF CHORD IS A SLASHED CHORD
        let split = c.split('/');
        let chord = Chord.get(split[0]);
        chord.root = split[1];
        chord.symbol+='/'+split[1];
        chord.name+=' over '+split[1];
        else
          out.push( chord );
      }else{
        let chord = Chord.get(c);
  public play(chord:any){
  public add(){
}
