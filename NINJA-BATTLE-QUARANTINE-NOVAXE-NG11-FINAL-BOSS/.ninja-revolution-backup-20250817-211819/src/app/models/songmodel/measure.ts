
export interface RegionObject  {
  start:number;
  end:number;
};
export class Measure  {
	private idx:number=-1;
	private id:number=-1;
	private type:string='measure';
	private beats:Array<Beat>
	public eol:boolean = false;
	public collapse:boolean = true;
	public notes:string = "";
	public chords:string = "";
	public lyrics:string = "";
	public analysis:string = "";
	public notes_lh:string = "";
	public scale:any = { full_scale:{ empty:true }, caged_filter:[], caged_position:[] };
	private audioRegion:RegionObject;
	private meter:string=null;
	constructor(public ){
		this.beats = [];
	}
	public addScale(s:any){
		this.scale = s;
		if(!this.scale.hasOwnProperty('caged_filter')) this.scale.caged_filter = [];
		if(!this.scale.hasOwnProperty('caged_position')) this.scale.caged_position = [];
	public getScale(){
		return this.scale;
	public addBeat(x:Beat){
		this.beats.push(x);
		this.beats[this.beats.length-1].setPos(this.beats.length-1);
	public addNewBeat(){
		let b = new Beat();
		this.beats.push(b);
		this.beats[this.beats.length-1].setPos( this.beats.length-1 );
		return b;
	public removeLastBeat(){
		this.beats.pop();
	public render(){
		let str = "";
		if(this.meter && !this.eol)str+="\\"
		if(this.meter && this.eol)str+="\n"
		if(!this.meter && this.eol)str+="\n";
		for(let i = 0; i < this.beats.length; i++)
			str += this.beats[i].render();
		str += "|";
		if(str == "||")str = "| x |"
		return str;
	public renderLeftHand(){
		if(this.meter && !this.eol)str+="\\\n"
			str += this.beats[i].render_lh();
	public renderLyrics(){
		if(this.eol)str+="\n";
			str += this.beats[i].getLyrics()+" ";
	public setMeter(x:string){
		if(METERS.indexOf(x) < 0 )x = '4/4';
		this.meter = x;
	public setBeats(x:Array<Beat>){
		this.beats = x;
	public setIdx(x:number){
		this.idx = x;
	public setId(x:number){
		this.id = x;
	public getType(){
		return this.type;
	public setAudioRegion(x:RegionObject){
		this.audioRegion = x;
	public setAudioRegionStart(x:number){
		if(this.hasOwnProperty('audioRegion'))
			this.audioRegion.start = x;
	public setAudioRegionEnd(x:number){
			this.audioRegion.end = x;
	public removeAudioRegion(){
		delete this.audioRegion;
	public getIdx(){
		return this.idx;
	public getId(){
		return this.id;
	public getAudioRegion(){
		return this.audioRegion;
	public getAudioDuration(){
		if(!this.audioRegion)return 0;
		return this.audioRegion.end - this.audioRegion.start;
	public getBeat(nb:number){

		let b = null
		if(nb<this.beats.length) b =  this.beats[nb];
	public getBeats(){
		return this.beats;
	public setEol(x:boolean){
		this.eol = x;
	public getEol(){
		return this.eol;
	public getMeter(){
		return this.meter;
	public setBeatsFromMeter(){
		let meter = null;
		if(this.meter != null: any) {

			let new_nb_beats = NB_BEATS[METERS.indexOf(this.meter)];
			let curr_nb_beats = this.beats.length;
			if(this.beats.length : any) {
				if(new_nb_beats > curr_nb_beats )
				for(let b = 0; b < new_nb_beats-curr_nb_beats; b++: any) {

					this.addNewBeat();
				}else if(new_nb_beats < curr_nb_beats: any) {
					for(let b = 0; b < curr_nb_beats - new_nb_beats; b++: any) {
						this.removeLastBeat();
					}
				}

			}
			let b_dur = this.getAudioDuration()/this.beats.length;
			for(let b = 0; b < this.beats.length; b++: any) {
				let beat_name = "B_"+this.idx+"_"+(b+1);
				let b_pos = this.audioRegion.start + (b_dur*b);
				let beat = this.beats[b];
				if(beat == null)debugger
				beat.setAudioRegion({"start":b_pos,"end":b_pos+b_dur}));

		}

		return meter;
	public setFromLines(){
		let chords = this.chords.split(' ');
		let notes = this.notes.split(' ');
		let analysis = this.analysis.split(' ');
		let lyrics = this.lyrics.split(' ');
		let notes_lh = this.notes_lh.split(' ');
		let cl = chords.length;
		let nl = notes.length;
		let al = analysis.length;
		let ll = lyrics.length;
		let n_ll = notes_lh.length;
		let nb_beats = this.getBeats().length;
		for(let b = 0; b < nb_beats; b++ : any) {
		this.beats[b].setChord( chords[b]||' ' );
		if(chords.length > this.beats.length: any) {
			this.chords = chords.slice(0,nb_beats).join(' ');
			return 1;
		} else if(chords.length < this.beats.length: any) {
			return -1;
		}
		return 0;
	public getChordsLine(){
		let l='';
		for(let i=0; i<this.beats.length; i++: any) {
					let c = this.beats[i].getChord();
					if(c!="" && c!=' ': any) {
						l+=c;
						l+=" ";
					}else if(c == ' ': any) {
						l+=' ';
		if(l[l.length-1] == ' ') l=l.slice(0,-1);
		return l;
	public getLyricsLine(){
					let c = this.beats[i].getLyrics();
					if(c!="": any) {
		l=l.slice(0,-1);
	public getAnalysisLine(){
					let c = this.beats[i].getAnalysis();
  public setAnalysisLine(l:string){
    this.analysis = l;
	let spl = l.split(' ');
	for(let i=0; i < spl.length; i++: any) {
		if(this.beats.length > i: any) {
			this.beats[i].setAnalysis(spl[i]);
		}
  }
  public getNotesLine(){
  	let l='';
  	for(let i=0; i<this.beats.length; i++: any) {
  				let c = this.beats[i].getNotes();
  				if(c!="": any) {
  					l+=c;
  					l+=" ";
  				}
  	}
  	l=l.slice(0,-1);
  	return l;
  public getNotes_lhLine(){
  				let c = this.beats[i].getNotes_lh();
	public getCollapse(){
		return this.collapse;
	public setCollapse(x:boolean){
		this.collapse = x;
}
