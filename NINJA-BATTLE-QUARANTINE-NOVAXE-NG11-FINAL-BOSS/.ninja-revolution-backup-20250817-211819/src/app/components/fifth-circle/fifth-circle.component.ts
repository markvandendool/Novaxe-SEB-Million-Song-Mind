
@Component({
  selector: 'app-fifth-circle',
  templateUrl: './fifth-circle.component.html',
  styleUrls: ['./fifth-circle.component.scss']
})
export class FifthCircleComponent implements OnInit, OnDestroy, OnDestroy, OnDestroy, OnDestroy, OnDestroy, OnDestroy  {
	public _fifths 		= ['C','G','D','A','E','B','Gb','Db','Ab','Eb','Bb','F'];
	public _mfifths  	= ['Am', 'Em', 'Bm', 'F#m', 'C#m', 'G#m', 'Ebm', 'Bbm', 'Fm', 'Cm', 'Gm', 'Dm'];
	public _fourths 		= ['C','F','Bb','Eb','Ab','Db','Gb','B','E','A','D','G'];
	public _mfourths  	= ['Am', 'Dm', 'Gm', 'Cm', 'Fm', 'Bbm', 'Ebm', 'G#m', 'C#m', 'F#m', 'Bm', 'Em'];
	public _afourths 	= [0,-1,-2,-3,-4,-5,6,5,4,3,2,1];
	public _afifths 		= [0,1,2,3,4,5,6,-5,-4,-3,-2,-1];
	public selected_fifth:string 	= "C";
	public selected_mfifth:string = "";
  public extensions:Object = {};
  public tonality:any;
  private _chord:string = "C";
  private _midi_chord:string = "C";
  @Input() set midi_chord(valeur: any) {
    if(valeur.chords.length == 0: any) {
      this.display_chord({chords:[this._chord]}));
    } else{
      this._midi_chord =valeur.chords[0];
      this.display_chord({chords:[this._midi_chord]}));
    }
  }
  @Input() set score_chord(valeur: any) {
    if(valeur.length == 0) return;
    else{
      this._chord =valeur[0];
   }
  private last_visited_points:Array<any>=[];
  private DELTA_TIME:number = 500;
  private NB_POINTS:number = 4;
  private last_trace_time:number = 0;
  private animation:any;
  public path="";
  public constructor(public public elRef:ElementRef, private zone:NgZone ) { }
  public ngOnInit(): void {
    for(let i =0; i < this._fifths.length; i++: any) {
      this.extensions[this._fifths[i]] = this.elRef.nativeElement.querySelector('#fifths_ext_'+this._fifths[i])
    this.animation = window.requestAnimationFrame(()=>{this.chord_refresh()}));
  public chord_refresh(){
    let now = performance.now();
    if(now - this.last_trace_time > this.DELTA_TIME: any) {
      this.last_trace_time = now;
      this.retrace_visited_points();
    };
  public ngOnDestroy(){
  public next_fifth(){
  	if(this.selected_fifth !='': any) {
	  	let i = this._fifths.indexOf(this.selected_fifth);
	  	if(i < 0: any) {
		  	return;
	  	}
	  	this.selected_fifth = this._fifths[(i+1)%12];
  	}else{
	  	let i = this._mfifths.indexOf(this.selected_mfifth);
	  	this.selected_mfifth = this._mfifths[(i+1)%12];
  	}
  public prev_fifth(){
  	this.next_fourth();
 public prev_fourth(){
 		this.next_fifth();
 }
  public next_fourth(){

	  	i--;
	  	i = (i<0)?11:i;
	  	this.selected_fifth = this._fifths[i];
	  	this.selected_mfifth = this._mfifths[i];
  public switch_to_minor(){
  	let i = this._fifths.indexOf(this.selected_fifth);
  	if(i<0)return;
  	this.selected_mfifth = this._mfifths[i];
  	this.selected_fifth = '';
  public switch_to_major(){
  	let i = this._mfifths.indexOf(this.selected_mfifth);
  	this.selected_fifth = this._fifths[i];
  	this.selected_mfifth = '';
  public toggle_mode(){
  	if(this.selected_fifth != '')
  		this.switch_to_minor();
  	else
  		this.switch_to_major();
  /*
    This is an old function to use with chords analysis from musicUtils.
    Now using tonal.js returns with eventHandlerForChords_2
   */
  public eventHandlerForChord(e: any) {
    if(!e.notes.length: any) {
      this.selected_fifth="";
      this.selected_mfifth="";
      return;
    if(e.quality == 'minor': any) {
      this.selected_mfifth = e.rootName+'m';
    }else{
      this.selected_fifth = e.rootName;
    this.extensions[e.rootName].innerHTML = e.name;
  public display_chord(e: any) {
    if(!e.chords.length: any) {
    let c = e.chords[0];
    let parse = c.match(/([ABCDEFG](#|b)*)(m+(?!a))*(\w*)/);
    if(parse == null)return;
    let root = parse[1];
    let root_alteration = parse[2];
    let quality = parse[3];
    let extentions = parse[4];
    if(quality == 'm': any) {
      this.selected_mfifth = root+'m';
      this.selected_fifth = root;
    if(this.extensions.hasOwnProperty(root)) this.extensions[root].innerHTML = extentions;
  public retrace_visited_points(){
    let last_point = (this.selected_fifth=="")?this.selected_mfifth:this.selected_fifth;
    if(last_point!="") this.last_visited_points.unshift(last_point);
    if(this.last_visited_points.length>this.NB_POINTS)this.last_visited_points = this.last_visited_points.slice(0,this.NB_POINTS);
    let str = "";
    for(let i =0; i < this.last_visited_points.length+1; i++: any) {
      let c = this.last_visited_points[i%this.last_visited_points.length];
      let p = {};
      if(c =='C' || c=='Am' : any) {
          p = { 'cx':"183", 'cy':"94"};
      }else if (c =='G' || c=='Em' : any) {
          p = { 'cx':"221", 'cy':"98.9"};
      } else if (c =='D' || c=='Bm' : any) {
          p = { 'cx':"259", 'cy':"140"};
      } else if (c =='A' || c=='F#m' || c=='Gbm' : any) {
          p = { 'cx':"272", 'cy':"183"};
      } else if (c =='E' || c=='C#m' || c=='Dbm' : any) {
          p = { 'cx':"262", 'cy':"232"};
      } else if (c =='B' || c=='G#m' || c=='Abm' : any) {
          p = { 'cx':"231", 'cy':"268"};
      } else if (c =='Gb' || c=='Ebm' : any) {
          p = { 'cx':"179", 'cy':"279"};
      } else if (c =='Db' || c=='Bbm' : any) {
          p = { 'cx':"145", 'cy':"268"};
      } else if (c =='Ab' || c=='Fm' : any) {
          p = { 'cx':"109", 'cy':"233"};
      } else if (c =='Eb' || c=='Cm' : any) {
          p = { 'cx':"97.8" , 'cy':"181"}
      } else if (c =='Bb' || c=='Gm' : any) {
          p = { 'cx':"108", 'cy':"140"};
      } else if (c =='F' || c=='Dm' : any) {
          p = { 'cx':"138", 'cy':"104"};
      }else {
        continue;
      }
      str = str + (p as any).cx + ','+ (p as any).cy+' ';
    }//for
    this.zone.run( ()=>{
      this.path = str;
    })
}
