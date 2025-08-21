
import { Beat } from '@models/songmodel/beat';
import { METERS, NB_BEATS } from '@models/songmodel/Meters';

//used for youtube region
export interface RegionObject {
  start:number;
  end:number;
};

export class Measure {

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

	//optionals
	private audioRegion:RegionObject;
	private meter:string=null;

	constructor(){
		this.beats = [];	
		// this.addBeat(new Beat());
	}

	public addScale(s:any){
		this.scale = s;
		if(!this.scale.hasOwnProperty('caged_filter')) this.scale.caged_filter = [];
		if(!this.scale.hasOwnProperty('caged_position')) this.scale.caged_position = [];
	}

	public getScale(){
		return this.scale;
	}

	public addBeat(x:Beat){
		this.beats.push(x);
		this.beats[this.beats.length-1].setPos(this.beats.length-1);
	}
	public addNewBeat(){
		let b = new Beat();
		this.beats.push(b);
		this.beats[this.beats.length-1].setPos( this.beats.length-1 );
		return b;
	}

	public removeLastBeat(){
		this.beats.pop();
	}

	public render(){

		let str = "";
		if(this.meter && !this.eol)str+="\\"
		if(this.meter && this.eol)str+="\n"
		if(!this.meter && this.eol)str+="\n";

		for(let i = 0; i < this.beats.length; i++)
			str += this.beats[i].render();

		str += "|";

		// if(this.eol)str+="\n";
		if(str == "||")str = "| x |"

		return str;
	}

	public renderLeftHand(){

		let str = "";

		if(this.meter && !this.eol)str+="\\\n"
		if(this.meter && this.eol)str+="\n"
		if(!this.meter && this.eol)str+="\n";

		for(let i = 0; i < this.beats.length; i++)
			str += this.beats[i].render_lh();

		str += "|";

		// if(this.eol)str+="\n";
		if(str == "||")str = "| x |"

		return str;
	}

	public renderLyrics(){
		let str = "";
		if(this.eol)str+="\n";

		for(let i = 0; i < this.beats.length; i++)
			str += this.beats[i].getLyrics()+" ";

		str += "|";

		return str;
	}


	//--------getters/setters

	public setMeter(x:string){

		if(METERS.indexOf(x) < 0 )x = '4/4';
		this.meter = x;
	}
	public setBeats(x:Array<Beat>){
		this.beats = x;
	}
	public setIdx(x:number){
		this.idx = x;
	}
	public setId(x:number){
		this.id = x;
	}
	public getType(){
		return this.type;
	}
	public setAudioRegion(x:RegionObject){
		this.audioRegion = x;
	}
	public setAudioRegionStart(x:number){
		if(this.hasOwnProperty('audioRegion'))
			this.audioRegion.start = x;
	}
	public setAudioRegionEnd(x:number){
		if(this.hasOwnProperty('audioRegion'))
			this.audioRegion.end = x;
	}
	public removeAudioRegion(){
		delete this.audioRegion;
	}
	public getIdx(){
		return this.idx;
	}
	public getId(){
		return this.id;
	}
	public getAudioRegion(){
		return this.audioRegion;
	}
	public getAudioDuration(){
		if(!this.audioRegion)return 0;
		return this.audioRegion.end - this.audioRegion.start;
	}

	public getBeat(nb:number){
		
		let b = null

		if(nb<this.beats.length) b =  this.beats[nb];
		
		return b;
	}

	public getBeats(){
		return this.beats;
	}
	public setEol(x:boolean){
		this.eol = x;
	}
	public getEol(){
		return this.eol;
	}
	public getMeter(){
		return this.meter;
	}

	// set the new beat system for the measure.
	public setBeatsFromMeter(){
		
		let meter = null;
		
		if(this.meter != null){

			
			let new_nb_beats = NB_BEATS[METERS.indexOf(this.meter)];

			let curr_nb_beats = this.beats.length;
			
			
			if(this.beats.length ){
				if(new_nb_beats > curr_nb_beats )
				for(let b = 0; b < new_nb_beats-curr_nb_beats; b++){
					
					this.addNewBeat();
				}else if(new_nb_beats < curr_nb_beats){
					for(let b = 0; b < curr_nb_beats - new_nb_beats; b++){	
						this.removeLastBeat();
					}
				}
				
			}
			
			
			let b_dur = this.getAudioDuration()/this.beats.length;

			for(let b = 0; b < this.beats.length; b++){

				let beat_name = "B_"+this.idx+"_"+(b+1);
				let b_pos = this.audioRegion.start + (b_dur*b);
				let beat = this.beats[b];
				if(beat == null)debugger
				beat.setAudioRegion({"start":b_pos,"end":b_pos+b_dur});
			}
			// debugger
  
			
		}
	

		return meter;
		
	}

	// Set number of beats in the measure.
	// The number of beats is deduced from abcJS chord text line.
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

		// let nb_beats = Math.max(cl,nl,al,ll,n_ll);
		let nb_beats = this.getBeats().length;

		// this.setBeats([]);
		for(let b = 0; b < nb_beats; b++ ){
		//   let nb = new Beat();

		this.beats[b].setChord( chords[b]||' ' );
		// debugger
		//   if(b<cl)nb.setChord(chords[b]);
		//   if(b<nl)nb.setNotes(notes[b]);
		//   if(b<al)nb.setAnalysis(analysis[b]);
		//   if(b<ll)nb.setLyrics(lyrics[b]);
		//   if(b<n_ll)nb.setNotes_lh(notes_lh[b]);

		//   this.addBeat(nb);
		}

		// if the chords entered with the string are longer than the number of beats of the measure : we cut the chord string.
		if(chords.length > this.beats.length){
			this.chords = chords.slice(0,nb_beats).join(' ');
			return 1;
		} else if(chords.length < this.beats.length){

			return -1;
		} 
		return 0;
	}
	
	public getChordsLine(){
		let l='';
		for(let i=0; i<this.beats.length; i++){
					let c = this.beats[i].getChord();
					if(c!="" && c!=' '){
						l+=c;
						l+=" ";
					}else if(c == ' '){
						l+=' ';
					}
		}
		if(l[l.length-1] == ' ') l=l.slice(0,-1);
		return l;
	}

	public getLyricsLine(){
		let l='';
		for(let i=0; i<this.beats.length; i++){
					let c = this.beats[i].getLyrics();
					if(c!=""){
						l+=c;
						l+=" ";
					}
		}
		l=l.slice(0,-1);
		return l;
	}

	public getAnalysisLine(){
		let l='';
		for(let i=0; i<this.beats.length; i++){
					let c = this.beats[i].getAnalysis();
					if(c!=""){
						l+=c;
						l+=" ";
					}
		}
		l=l.slice(0,-1);
		return l;
	}

  public setAnalysisLine(l:string){
    this.analysis = l;

	let spl = l.split(' ');

	for(let i=0; i < spl.length; i++){
		if(this.beats.length > i){
			this.beats[i].setAnalysis(spl[i]);
		}	
	}
  }

  public getNotesLine(){
  	let l='';
  	for(let i=0; i<this.beats.length; i++){
  				let c = this.beats[i].getNotes();
  				if(c!=""){
  					l+=c;
  					l+=" ";
  				}
  	}
  	l=l.slice(0,-1);
  	return l;
  }
  public getNotes_lhLine(){
  	let l='';
  	for(let i=0; i<this.beats.length; i++){
  				let c = this.beats[i].getNotes_lh();
  				if(c!=""){
  					l+=c;
  					l+=" ";
  				}
  	}
  	l=l.slice(0,-1);
  	return l;
  }


	public getCollapse(){
		return this.collapse;
	}
	public setCollapse(x:boolean){
		this.collapse = x;
	}


}
