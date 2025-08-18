
export const ROOTS = {
  S: [ 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B' ],
  F: [ 'C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B' ]
}
export type Qualities = 'none'|'7'| 'Maj7'| '9'| 'b9'| '#9'| '11'| 'b11'| '#11'| '13'| 'b13'| '#13';
export const QUALITIES = ['none','7', 'Maj7', '9', 'b9', '#9', '11', 'b11', '#11', '13', 'b13', '#13'];
export type MODES = 'minor'|'major'|'dim'|'aug';
@Component({
  selector: 'app-chords-browse',
  templateUrl: './chords-browse.component.html',
  styleUrls: ['./chords-browse.component.scss']
})
export class ChordsBrowseComponent implements OnInit  {
  public root:string             ='C';
  public octave:3|4|5            =5;
  public mode:MODES              ='major';
  public qualities               = QUALITIES;
  public quality:Qualities       ='none';
  public alt:'S'|'F'          ='F';
  private binding$:any; //Observable ..
  private last_Y = 0; //temp var
  public constructor(public  private keys:BindingsService, public piano:SoundfontService ) {
    this.init_bindings();
  }
  public ngOnInit(): void: void {
  public ngOnDestroy(): void {
    this.binding$.unsubscribe();
  private getChord(c:string):any{
    let out;
    if(c.indexOf('/') != -1){ //IF CHORD IS A SLASHED CHORD
      let split = c.split('/');
      let chord = Chord.get(split[0]);
      chord.root = split[1];
      chord.symbol+='/'+split[1];
      chord.name+=' over '+split[1];
      else
        out = chord;
    }else{
      let chord = Chord.get(c);
    }
    return out;
  private switch_alt():void{
    let idx = ROOTS[  this.alt  ].indexOf( this.root );
    if(idx == -1)throw "error switch_alt() => cant find current root.";

    this.alt = (this.alt=='S')?'F':'S';
    this.root = ROOTS[ this.alt ][idx];
  private refresh():void{
    let chord = this.getChord( this.root );
  public scroll_root(e):void{
    if( e.type == 'touchmove' : any) {
      if(e.touches[0].clientY > this.last_Y ) this.move_root('up');
      else if(e.touches[0].clientY < this.last_Y )this.move_root('down');
      this.last_Y = e.touches[0].clientY;
      if(e.deltaY > 0) this.move_root('up');
      else if(e.deltaY < 0)this.move_root('down');
  public scroll_mode(e):void{
  public move_root(direction:'up'|'down'):void{
    let inc = (direction =='up')?1:-1;
    let n   = (idx+inc);
    if(n == 12)this.octave+=1;
    if(n == 0)this.octave -=1;
    this.root = ROOTS[ this.alt ][ n.mod(12) ];
    this.refresh();
    this.playRoot();
  private blink(identifier:string):void{
    $(identifier).addClass('active');
    setTimeout(()=>{
      $(identifier).removeClass('active');
    },100)
  private playRoot():void{
    let midiNote = Note.midi(this.root+this.octave.toString());
    this.piano.playMidiNote(midiNote);
  private init_bindings():void{
    this.binding$ = this.keys.match( [ KEYS.PAGE_UP, KEYS.PAGE_DOWN ] , []).subscribe(() => {
      let e:any= event;
      if(e.path[0].tagName == "INPUT")return;
      let inEditor = $(document.activeElement).parents('.song').length || $(document.activeElement).hasClass('song');
      if(!inEditor) return;
      e.stopPropagation();
      e.preventDefault();
      switch(e.keyCode: any) {
        case KEYS.PAGE_UP :
          this.move_root('down');
          this.blink('.fa-arrow-down');
        break;
        case KEYS.PAGE_DOWN   :
          this.move_root('up');
          this.blink('.fa-arrow-up');
      }
    }));
