export interface RegionObject {
	start:number;
	end:number;
  };
export class Beat {

	//abc strings
	private chord:string='';
	private notes:string='';
	private notes_lh:string='';
	private analysis:string='';
	private lyrics:string='';
	private pos:number=0;
	private audioRegion:RegionObject = {start:null,end:null};


	public constructor(private c:string='',private n:string='',private a:string='',private l:string='', private n_lh:string=''){
		this.chord = c;
		this.notes = n;
		this.analysis = a;
		this.lyrics = l;
		this.notes_lh = n_lh;
	}

	public render(){

		let str = '';
		str += "\""+this.chord+"\"";
		str += " ";
		str += "\"_"+this.analysis+"\"";
		str += " ";
		str += this.notes;
		str += " x ";

		return str;
	}

	public render_lh(){
		let str = '';
		str += this.notes_lh;
		str += " x ";

		return str;

	}

	//--------getters/setters

	public setChord(x:string){
		this.chord = x;
	}
	public setNotes(x:string){
		this.notes = x;
	}
	public setNotes_lh(x:string){
		this.notes_lh = x;
	}
	public setAnalysis(x:string){
		this.analysis = x;
	}
	public setLyrics(x:string){
		this.lyrics = x;
	}


	public getChord(){
		return this.chord;
	}
	public getNotes(){
		return this.notes;
	}
	public getNotes_lh(){
		return this.notes_lh;
	}
	public getAnalysis(){
		return this.analysis;
	}
	public getLyrics(){
		return this.lyrics;
	}
	public getAudioRegion(){
		return this.audioRegion;
	}
	public setAudioRegion(a:RegionObject){
		this.audioRegion.start = a.start;
		this.audioRegion.end = a.end; 	
	}
	public setPos(p:number){
		this.pos = p;
	}
	public getPos(){
		return this.pos;
	}
}
