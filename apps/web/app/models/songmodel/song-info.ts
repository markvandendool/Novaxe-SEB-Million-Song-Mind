export class SongInfo {

	private songId:number=-1;
	private title:string='Score title';
	private artist:string='unknown';
	private album:string='unknown';
	private transcription:string='';
	private signature:string='4/4';
	private tonality:string='C';
	private style:string='unknown';
	private listStyles:Array<string>=[];
	private measures_per_line:number=4;
	private price:number=0;
	private img:string='';

	private transpose:number=0;

	private default_duration:string='1/8';
	private clef:string='treble';
	private clef_lh:string='bass';
	
	private youtube_link:string='';
	private youtube_videoId:string='';
	private youtube_filePath:string='';

	//rendered
	private renderedHeader:string = '';
	private renderedScore:string = '';

	public braid_param_roman:boolean = false;
	public braid_param_show_midi:boolean = true;
	public braid_param_show_score_chords:boolean = true;
	public braid_param_simplified_braid:boolean = false;
	public braid_param_emph_score_chords:boolean = false;
	public braid_param_emph_diatonic_scale:boolean = false;
	public braid_param_emph_one_tona:boolean = false;
	public braid_param_emph_before:boolean = false;
	public braid_param_emph_after:boolean = false;

	
	constructor(){
		console.log('info build !')
	}
	public setPrice(x:number){
		this.price = x;
	}
	public getPrice(){
		return this.price;
	}
	public setImage(x:string){
		this.img = x;
	}
	public getImage(){
		return this.img;
	}
	public setMeasuresPerLine(x:number){
		this.measures_per_line = x;
	}
	public getMeasuresPerLine(){
		return this.measures_per_line;
	}
	public setTranspose(x:number){
		this.transpose = x;
	}
	public getTranspose(){
		return this.transpose;
	}
	public setAlbum(x:string){
		this.album = x;
	}
	public getAlbum(){
		return this.album;
	}
	public getSongId(){
		return this.songId;
	}
	public setSongId(x:number){
		this.songId = x;
	}
	public getTitle(){
		return this.title;
	}
	public setTitle(x:string){
		this.title = x;
	}
	public getArtist(){
		return this.artist;
	}
	public setArtist(x:string){
		this.artist = x;
	}
	public getTranscription(){
		return this.transcription;
	}
	public setTranscription(x:string){
		this.transcription = x;
	}
	public getSignature(){
		return this.signature;
	}
	public setSignature(x:string){
		this.signature = x;
	}
	public getDefault_duration(){
		return this.default_duration;
	}
	public setDefault_duration(x:string){
		this.default_duration = x;
	}
	public getClef(){
		return this.clef;
	}
	public getClef_lh(){
		return this.clef_lh;
	}
	public setClef(x:string){
		this.clef = x;
	}
	public setClef_lh(x:string){
		this.clef_lh = x;
	}
	public getTonality(){
		return this.tonality;
	}
	public setTonality(x:string){
		this.tonality = x;
	}
	public getStyle(){
		return this.style;
	}
	public getListStyles(){
		return this.listStyles;
	}
	public setStyle(x:string){
		this.style = x;
	}
	public setListStyles(x:Array<string>){
		this.listStyles = x;
	}

	public getYoutube_link(){
		return this.youtube_link;
	}
	public setYoutube_link(x:string){
		this.youtube_link = x;
	}
	public getYoutube_videoId(){
		return this.youtube_videoId;
	}
	public setYoutube_videoId(x:string){
		this.youtube_videoId = x;
	}
	public getYoutube_filePath(){
		return this.youtube_filePath;
	}
	public setYoutube_filePath(x:string){
		this.youtube_filePath = x;
	}

	public getRenderedHeader(){
		return this.renderedHeader;
	}
	public setRenderedHeader(x:string){
		this.renderedHeader = x;
	}
	public getRenderedScore(){
		return this.renderedScore;
	}
	public setRenderedScore(x:string){
		this.renderedScore = x;
	}


	
	public setBraid_param_roman(x:boolean){
		this.braid_param_roman = x;
	}
	public getBraid_param_roman(){
		return this.braid_param_roman;
	}

	public setBraid_param_show_midi(x:boolean){
		this.braid_param_show_midi = x;
	}
	public getBraid_param_show_midi(){
		return this.braid_param_show_midi;
	}
	
	public setBraid_param_show_score_chords(x:boolean){
		this.braid_param_show_score_chords = x;
	}
	public getBraid_param_show_score_chords(){
		return this.braid_param_show_score_chords;
	}
	
	public setBraid_param_simplified_braid(x:boolean){
		this.braid_param_simplified_braid = x;
	}
	public getBraid_param_simplified_braid(){
		return this.braid_param_simplified_braid;
	}
	
	public setBraid_param_emph_score_chords(x:boolean){
		this.braid_param_emph_score_chords = x;
	}
	public getBraid_param_emph_score_chords(){
		return this.braid_param_emph_score_chords;
	}

	public setBraid_param_emph_diatonic_scale(x:boolean){
		this.braid_param_emph_diatonic_scale = x;
	}
	public getBraid_param_emph_diatonic_scale(){
		return this.braid_param_emph_diatonic_scale;
	}

	public setBraid_param_emph_one_tona(x:boolean){
		this.braid_param_emph_one_tona = x;
	}
	public getBraid_param_emph_one_tona(){
		return this.braid_param_emph_one_tona;
	}

	public setBraid_param_emph_before(x:boolean){
		this.braid_param_emph_before = x;
	}
	public getBraid_param_emph_before(){
		return this.braid_param_emph_before;
	}

	public setBraid_param_emph_after(x:boolean){
		this.braid_param_emph_after = x;
	}
	public getBraid_param_emph_after(){
		return this.braid_param_emph_after;
	}

}
