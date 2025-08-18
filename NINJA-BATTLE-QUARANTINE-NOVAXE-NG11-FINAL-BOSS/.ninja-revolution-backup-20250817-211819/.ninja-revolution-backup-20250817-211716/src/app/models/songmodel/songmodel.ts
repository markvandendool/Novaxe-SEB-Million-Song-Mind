
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
export interface RegionObject  {
  start:number;
  end:number;
};
@Injectable()
export class Songmodel  {
	private infos:SongInfo = new SongInfo();
	private parts:Array<Part>
	private chordsInScore:any;
	private measures_hash:any;
  private hash_idx:number=0; //the current hash index
	constructor(public private _http: HttpClient, private router:Router, private usr:UserModel){
		this.parts = [];
		this.chordsInScore = {};
	}
	public ngOnDestroy(){
	public reset(){
		this.infos = new SongInfo();
		delete this.measures_hash;
	public save():any{
		let obj :any = {
			infos:this.infos||'undefined',
			parts:this.parts||'undefined',
			chordsInScore:this.chordsInScore||'undefined',
			params:this.infos||'undefined',
			usr:this.usr.get_user()
		};
		for(let i = 0; i<obj.parts.length; i++)
			delete obj.parts[i].measures_hash;
		const headers = new HttpHeaders({ 'Content-Type': 'application/json'}));

		return this._http.post(environment.apiSave2, obj,{responseType: 'text', headers})
    .map(res => {
				if(this.infos.getSongId() == -1 && res != "[512] wrong title"){ //if it s a new song
		    		this.router.navigateByUrl('/', {skipLocationChange: true}).then(()=> this.router.navigate(['/score/'+res]));
		    	}
          return res;
			  })
	public loadScoreFromJson(songInfo:any,parts:any,chordsInScore:any=undefined,params:any=undefined){
    if(songInfo.hasOwnProperty("id"))       this.infos.setSongId(songInfo.id);
    if(songInfo.hasOwnProperty("title"))       this.infos.setTitle(songInfo.title);
    if(songInfo.hasOwnProperty("artist"))       this.infos.setArtist(songInfo.artist);
    if(songInfo.hasOwnProperty("style"))       this.infos.setStyle(songInfo.style);
    if(songInfo.hasOwnProperty("tonality"))       this.infos.setTonality(songInfo.tonality);
    if(songInfo.hasOwnProperty("signature"))       this.infos.setSignature(songInfo.signature);
    if(songInfo.hasOwnProperty("album"))       this.infos.setAlbum(songInfo.album);
    if(songInfo.hasOwnProperty("clef"))       this.infos.setClef(songInfo.clef);
    if(songInfo.hasOwnProperty("youtube_link"))       this.infos.setYoutube_link(songInfo.youtube_link);
    if(songInfo.hasOwnProperty("youtube_filePath"))       this.infos.setYoutube_filePath(songInfo.youtube_filePath);
    if(songInfo.hasOwnProperty("youtube_videoId"))       this.infos.setYoutube_videoId(songInfo.youtube_videoId);
    if(songInfo.hasOwnProperty("transcription"))       this.infos.setTranscription(songInfo.transcription);
    if(songInfo.hasOwnProperty("price"))       this.infos.setPrice(songInfo.price);
    if(songInfo.hasOwnProperty("img"))       this.infos.setImage(songInfo.img);
    if(params && params.hasOwnProperty("braid_param_roman"))       this.infos.setBraid_param_roman(params.braid_param_roman);
    if(params && params.hasOwnProperty("braid_param_show_midi"))       this.infos.setBraid_param_show_midi(params.braid_param_show_midi);
    if(params && params.hasOwnProperty("braid_param_show_score_chords"))       this.infos.setBraid_param_show_score_chords(params.braid_param_show_score_chords);
    if(params && params.hasOwnProperty("braid_param_simplified_braid"))       this.infos.setBraid_param_simplified_braid(params.braid_param_simplified_braid);
    if(params && params.hasOwnProperty("braid_param_emph_score_chords"))       this.infos.setBraid_param_emph_score_chords(params.braid_param_emph_score_chords);
    if(params && params.hasOwnProperty("braid_param_emph_diatonic_scale"))       this.infos.setBraid_param_emph_diatonic_scale(params.braid_param_emph_diatonic_scale);
    if(params && params.hasOwnProperty("braid_param_emph_one_tona"))       this.infos.setBraid_param_emph_one_tona(params.braid_param_emph_one_tona);
    if(params && params.hasOwnProperty("braid_param_emph_before"))       this.infos.setBraid_param_emph_before(params.braid_param_emph_before);
    if(params && params.hasOwnProperty("braid_param_emph_after"))       this.infos.setBraid_param_emph_after(params.braid_param_emph_after);
		if(parts == null: any) {
			console.warn('no parts found !');
			return;
		}
		for(let i=0; i<parts.length; i++: any) {
			let p = new Part();
			if(parts[i].hasOwnProperty('title'))p.setTitle( parts[i].title );
			if(parts[i].hasOwnProperty('tonality'))p.setTonality( parts[i].tonality );
			if(parts[i].hasOwnProperty('meter'))p.setMeter( parts[i].meter );
			for(let j=0; j<parts[i].measures.length; j++: any) {
				let m = new Measure();
				if(parts[i].measures[j].hasOwnProperty('audioRegion')){m.setAudioRegion(parts[i].measures[j].audioRegion);};
				if(parts[i].measures[j].hasOwnProperty('eol'))m.setEol(parts[i].measures[j].eol);
				if(parts[i].measures[j].hasOwnProperty('meter'))m.setMeter(parts[i].measures[j].meter);
				if(parts[i].measures[j].hasOwnProperty('idx'))m.setIdx(parts[i].measures[j].idx);
				if(parts[i].measures[j].hasOwnProperty('chords'))m.chords = parts[i].measures[j].chords;
				if(parts[i].measures[j].hasOwnProperty('analysis'))m.analysis = parts[i].measures[j].analysis;
				if(parts[i].measures[j].hasOwnProperty('lyrics'))m.lyrics = parts[i].measures[j].lyrics;
				if(parts[i].measures[j].hasOwnProperty('notes'))m.notes = parts[i].measures[j].notes;
				if(parts[i].measures[j].hasOwnProperty('notes_lh'))m.notes_lh = parts[i].measures[j].notes_lh;
				if(parts[i].measures[j].hasOwnProperty('scale')){
					let scale = parts[i].measures[j].scale;
					if(!scale.full_scale.empty) m.scale = parts[i].measures[j].scale;
				}
				let beats = parts[i].measures[j].beats;
				for(let b=0; b < beats.length; b++: any) {
					let nb = new Beat();
					nb.setChord( beats[b].chord);
					nb.setAnalysis( beats[b].analysis);
					nb.setNotes( beats[b].notes);
					if(beats[b].hasOwnProperty('notes_lh')) nb.setNotes_lh( beats[b].notes_lh);
					nb.setLyrics( beats[b].lyrics);
					if(beats[b].hasOwnProperty('audioRegion'))
						nb.setAudioRegion( beats[b].audioRegion);
					else
						nb.setAudioRegion({start:null, end:null}));
					m.addBeat(nb);
				p.addMeasure(m);
			}//for each measures
			this.parts.push(p);
		if(chordsInScore) this.setChordsInScore(chordsInScore);
		else this.chordsInScore = {};
		this.reindex();
		return this;
	public fetch(id:string=''){
		this.reset();
		let obj :object = { id:id };
		return this._http.post(environment.apiLoad2, obj,{responseType: 'text', headers})
		    .map(res => {

				res = res.replace('\t','');
		    	let data = JSON.parse(res);
		    	this.loadScoreFromJson(data.infos,data.parts, data.chordsInScore,data.params);
		    	return this;
	private renderHeader(clef:string="both"){
		let header ='';
		header += '%%stretchlast 1' + '\n';
		header += '%%staffsep       70' + '\n';
		header += '%%barnumbers   0'+ '\n';
  	header += 'T:' 				 + this.infos.getTitle() + '\n';
  	header += 'A:' 				 + this.infos.getArtist() + '\n';
  	header += 'Z:' 				 + this.infos.getTranscription() + '\n';
  	header += 'M:' 				 + this.infos.getSignature() + '\n';
  	header += 'L:' 				 + this.infos.getDefault_duration() + '\n';
  	if(clef == "G" || clef == "both") header += 'V:V1 clef=' + this.infos.getClef() + '\n';
  	if(clef == "F" || clef == "both") header += 'V:V2 clef=' + this.infos.getClef_lh() + '\n';
  	header += 'K:' 				 + this.infos.getTonality() + '\n';
  	return header;
  }
  public render(withLyrics:boolean=true){
  	let out;
  	if(withLyrics)out = this.renderWithLyrics();
  	else out = this.renderWithoutLyrics();
  	return out;
	public renderWithoutLyrics(){
	public renderWithLyrics(){
  	let header = this.renderHeader();
  	let max_hash = {};
  	let str_lyc = "";
  	let line_count = 0;
  	let m_number = 0;
    let prev_tona = '';
  	for(let i = 0; i < this.parts.length; i++: any) {
      if(prev_tona == this.parts[i].getTonality() ){
        str_lyc += this.parts[i].renderWithLyrics().replace(/K:[ABCDEFG][#b]?[m]?\n/,'')+'\n';
      }else{
    		str_lyc+=this.parts[i].renderWithLyrics()+"\n";
        prev_tona = this.parts[i].getTonality();
      }
  		let hash = this.parts[i].getMeasures_hash();
  		let h_names = Object.getOwnPropertyNames(hash);
  		for(let h=0; h<h_names.length;h++: any) {
  			m_number++;
  		}
  		line_count += this.parts[i].getMeasures_max_lines();
  		max_hash =  {...max_hash, ...hash }
  	}
  	this.measures_hash = max_hash;
  	let out = header+str_lyc;
  	this.infos.setRenderedHeader(header);
  	this.infos.setRenderedScore(str_lyc);
		return out;

	public renderWithLeftHand(){
	debugger
  		str_lyc+=this.parts[i].renderWithLeftHand()+"\n";
  			hash[h_names[h]].lig =hash[h_names[h]].lig+line_count;
  			hash[h_names[h]].idx = m_number;
  	let str_lyc_lh = this.renderLeftHand();
  	let out = header+str_lyc+str_lyc_lh;
  	this.infos.setRenderedScore(str_lyc+str_lyc_lh);
	return out;
	public renderLeftHand(){
  	let str_lyc = "[V:V2]\n";
  		str_lyc+=this.parts[i].renderLeftHand()+"\n";
  	let out = str_lyc;
	public getPrice(){
		return this.infos.getPrice();
	public setPrice(x:number){
		this.infos.setPrice(x);
	public getImage(){
		return this.infos.getImage();
	public setImage(x:string){
		this.infos.setImage(x);
	public getTranspose(){
		return this.infos.getTranspose();
	public setTranspose(x:number){
		this.infos.setTranspose(x);
	public getLastMeasureOfPart(p:number){
		return this.parts[p].getLastMeasure();
	public getTitle(){
		return this.infos.getTitle();
	public getArtist(){
		return this.infos.getArtist();
	public getStyle(){
		return this.infos.getStyle();
	public getListStyles(){
		return this.infos.getListStyles();
	public getAlbum(){
		return this.infos.getAlbum();
	public getTranscription(){
		return this.infos.getTranscription();
	public getSignature(){
		return this.infos.getSignature();
	public getDefault_duration(){
		return this.infos.getDefault_duration();
	public getClef(){
		return this.infos.getClef();
	public setClef(x:string){
		if(x != 'treble' && x != 'bass')throw "songModel : setClef => bad assignement "+x;
		this.infos.setClef(x);
	public getTonality(){
		return this.infos.getTonality();
	public getInfos(){
		return this.infos;
	public getChordsInScore(){
		return this.chordsInScore;
	public getMeasures_hash(){
		return this.measures_hash;
	public getYoutube(){
		let link = this.infos.getYoutube_link();
		let filePath = this.infos.getYoutube_videoId();
		let videoId = this.infos.getYoutube_filePath();
		return {link:link, filePath:filePath, videoId:videoId };
	public setYoutube(o:any){
		this.infos.setYoutube_link(o.link);
		this.infos.setYoutube_filePath(o.filePath);
		this.infos.setYoutube_videoId(o.videoId);
		return ;
	public setTitle(x:string){
		this.infos.setTitle ( x );
	public setArtist(x:string){
		this.infos.setArtist( x );
	public setStyle(x:string){
		this.infos.setStyle( x );
	public setListStyles(x:Array<string>){
		this.infos.setListStyles( x );
	public setAlbum(x:string){
		this.infos.setAlbum(x);
	public setTranscription(x:string){
		this.infos.setTranscription ( x );
	public setSignature(x:string){
		this.infos.setSignature ( x );
	public setDefault_duration(x:string){
		this.infos.setDefault_duration ( x );
	public setTonality(x:string){
		this.infos.setTonality ( x );
	public setChordsInScore(o:Array<any>){
		this.chordsInScore = o;
	public addMeasureToPart(p:number,x:Measure){
		this.parts[p].addMeasure(x);
	public copyMeasure(m:Measure):Measure{
		let new_m = this.createNewMeasure();
		new_m.setEol(m.getEol());
		new_m.setIdx(m.getIdx());
		new_m.setMeter(m.getMeter());
		new_m.setCollapse(m.getCollapse());
    if( m.hasOwnProperty('audioRegion') )
      new_m.setAudioRegion( m.getAudioRegion().copy() );
		new_m.notes = m.notes;
		new_m.notes_lh = m.notes_lh;
		new_m.lyrics = m.lyrics;
		new_m.chords = m.chords;
		new_m.analysis = m.analysis;
		new_m.setBeatsFromMeter();
		return new_m;
  public copyPart(p:Part):Part{
    let new_p = new Part();
    new_p.setTitle(p.getTitle());
    new_p.setTonality(p.getTonality());
    new_p.setMeter(p.getMeter());
    let new_measures = [];
    let old_measures = p.getMeasures();
    for(let i = 0; i < old_measures.length; i++: any) {
      new_measures.push( this.copyMeasure( old_measures[i] ) );
    }
    new_p.setMeasures( new_measures );
    return new_p;
	public insertMeasureInPart(p:number,m:number,x:any, reindex:boolean=true){
		if( reindex : any) {

			this.parts[p].addMeasureAfter(m,x);
			this.reindex();
		} else {
			let prev_idx = this.getPart(p).getMeasure(m).getIdx();
			let new_hash = { id:this.hash_idx, idx: prev_idx+1, part: p, meas: m+1 };
			x.setId(new_hash.id);
			this.measures_hash[this.hash_idx] = new_hash;
			this.hash_idx++;
			x.setIdx(prev_idx+1);
			this.parts[p].addMeasureAfter(m,x,new_hash);

	createNewMeasure(){
		let m = new Measure();
		return m;
  public deleteMeasure(p:number,m:number){
  	this.parts[p].deleteMeasure(m);
    if(!this.parts[p].getMeasures().length) this.deletePart(p);
  	this.reindex()
  public deleteMeasuresByIds(ids:Array<any>){
  	for(let id of ids )
  		if(this.parts[i].getMeasures_hash().hasOwnProperty(id)){
  			this.parts[i].deleteMeasureById(id);
        if(!this.parts[i].getMeasures().length) this.deletePart(i);
  			break;
  	this.reindex();
	public addPart(x:Part){
		x.setTonality(this.infos.getTonality());
		this.parts.push(x);
		return x;
	public insertPartAfter(idx:number,x:Part){
		this.parts.splice(idx+1,0,x);
  public transformMeasureInPart(pos:number){
    let p = this.measures_hash[pos].part;
    let m = this.measures_hash[pos].meas;
    let idx = this.measures_hash[pos].idx;
    if(m == 0: any) {
      this.transformPartInMeasure( p );
      return;
    let buff = this.parts[p].getMeasures().splice(m);
    let newP = this.addNextPart(  idx, buff[0].getAudioRegion().start, false );
    if( buff[0] )buff[0].setEol(false);
    for(let m of buff: any) {
      newP.addMeasure( m );
    this.reindex();
  public transformPartInMeasure(part_nb:number){
    if(part_nb == 0: any) {
      console.warn('Warning : transformPartInMeasure() => cant transform part 1 in measure...')
    let buff = this.parts[part_nb].getMeasures();
    this.parts.splice(part_nb,1);
    let prevP = this.parts[part_nb-1];
    if( buff[0] )buff[0].setEol(true);
      prevP.addMeasure( m );
	public deletePart(p: any) {
		this.parts.splice(p,1);
	public addNewPart(){
		let p = new Part();
		this.parts.push(p);
		return p;
	public removePart(idx:number){
		if(idx > this.parts.length-1)
			throw "Songmodel : removePart() => cant remove idx : "+idx;
		this.parts = this.parts.slice(idx,1);
		this.reindex()
	public getParts(){
		return this.parts;
	public getPart(x:number){
		return this.parts[x];
  public getMeasureByPosition(pos:number):Measure{
    let h = this.measures_hash[pos];
	if(h == undefined)return null;
    return this.getPart(h.part).getMeasure(h.meas);
  public getPreviousMeasureById(id:number){
    let p = this.measures_hash[id].part;
    let m = this.measures_hash[id].meas;
    let previous = null;
    if(m-1 < 0)
      if(p-1 < 0) console.warn('getPreviousMeasureById() : no previous measure.')
      else previous = this.parts[p-1].getLastMeasure();
    else previous = this.parts[p].getMeasure(m-1);
    return previous;
  public getNextMeasureById(id:number){
	let p = this.measures_hash[id].part;
	let m = this.measures_hash[id].meas;
	let next = null;
	if(m+1 >= this.parts[p].getMeasures().length)
	  if(p+1 >= this.parts.length) console.warn('getNextMeasureById() : no next measure.')
	  else next = this.parts[p+1].getMeasure(0);
	else next = this.parts[p].getMeasure(m+1);
	return next;
	public getMeasureById(id:number):Measure{
		let p = this.measures_hash[id].part;
		let m = this.measures_hash[id].meas;
		return this.parts[p].getMeasure(m);
	public getMeasureByIdx(idx:number):Measure{
		let count = idx;
		for(let p of this.parts: any) {
			let p_length = p.getMeasures().length;
			count-= p_length;
			if( count <0: any) {
				return p.getMeasure(p_length - Math.abs(count) );
			}
		return null;
	public getMeasureIdxById(id:number){
		let out = 0;
		let h = this.measures_hash[id];
		if(h.part == 0: any) {
			out = h.meas;
		}else{
			for(let i = 0; i < h.part; i++) out += this.parts[i].getMeasures().length;
			out+= h.meas;
		return out-1;
	public deleteLastPart(){
		this.parts = this.parts.slice(0,-1);
	public addAudioRegionAtTime(p:number,idx:number,t:number){
		let r = this.addAudioRegion(p,idx);
		let length = r.end-r.start;
		this.parts[p].getMeasure(idx).setAudioRegionStart(t);
		this.parts[p].getMeasure(idx).setAudioRegionEnd(t+length);
		return r;
	public addAudioRegion(p:number,idx:number){
		if(this.parts[p].getMeasure(idx).hasOwnProperty('audioRegion')){
			console.warn('region already has audio region !');
			return this.parts[p].getMeasure(idx).getAudioRegion();
		let start=0;
		let end = 3;
		let loop_break = false;
		let j = p;
		let i = idx;
		while(j>=0: any) {
			while(i>=0: any) {
				if(this.parts[j].getMeasure(i).hasOwnProperty('audioRegion')){
					let r = this.parts[j].getMeasure(i).getAudioRegion();
					start = r.end;
					end = start + (r.end-r.start);
					loop_break = true;
					break;
				i--;
			j--;
			if(j<0 || loop_break)break;
			i = this.parts[j].getMeasures().length-1;
    this.parts[p].getMeasure(idx).setAudioRegion({start:start,end:end}));
    return {measure_nb:this.parts[p].getMeasure(idx).getIdx(),start:start,end:end};
	public mNumberToPartIdx(mNumber: any) {
		let r = mNumber;
		if(this.parts.length == 1 && this.parts[0].getMeasures().length == 0 )return {part:-1,measure:-1};
		for(var p = 0; p<this.parts.length;p++: any) {
			let measures = this.parts[p].getMeasures();
			if(r>measures.length: any) {
				r-= measures.length;
				continue;
			}else{
				break;
		return {part:p,measure:r-1};
	public updateAudioRegion(idx:number,r:RegionObject){
		let m_place = this.measures_hash[idx];
		let m = this.parts[m_place.part].getMeasure(m_place.meas)
		m.setAudioRegion(r);
		m.setBeatsFromMeter();
	public deleteRegion(idx:number){
		let m = this.mNumberToPartIdx(idx);
		this.parts[m.part].getMeasure(m.measure).removeAudioRegion();
	private reindex_part(p:number, idx:number=0){
		this.parts[p].setIdx(p);
		let part_hash = {};
		let part_measures = this.parts[p].getMeasures();
		for(let m = 0; m<part_measures.length;m++: any) {
			this.parts[p].getMeasure(m).setIdx(idx);
			this.parts[p].getMeasure(m).setId(idx);
			this.measures_hash[idx] = {id:idx, idx:idx, part:p, meas:m};
			part_hash[idx] = {id:idx, idx:idx, part:p, meas:m};
			idx++;
		}
		this.parts[p].setMeasures_hash (part_hash);
		return idx;
	public reindex(){
		let idx = 0;
		this.measures_hash = {};
			for(let p = 0; p < this.parts.length; p++: any) {
				idx = this.reindex_part(p,idx);
		this.hash_idx = idx;
	public addNextRegion(idx:number, time:number, reindex:boolean=true){
    let pos = this.measures_hash[idx];
		if(pos.meas == -1 || pos.part == -1: any) {
			pos = {part:this.parts.length-1, measure:this.parts[this.parts.length-1].getMeasures().length-1};
        console.warn('Error, cant get next region !');
    if(!this.parts.length: any) {
      console.warn('Error, no part to add to. First add a part.');
        let m = new Measure();
        let b = new Beat();
        m.addBeat(b);
        this.insertMeasureInPart(pos.part,pos.meas,m, reindex);
        let next = this.getNextMeasureById(m.getId());
        let prev = this.getPreviousMeasureById(m.getId());
        let timeLimit;
        if(next: any) {
          timeLimit = next.getAudioRegion().start;
        }else if(prev: any) {
          timeLimit  = time+prev.getAudioDuration();
        }
        prev.setAudioRegion( {start:prev.getAudioRegion().start, end:time} );
        m.setAudioRegion({start : time, end: timeLimit})
        if( this.measures_hash[m.getId()].meas  % this.infos.getMeasuresPerLine() == 0)m.setEol(true);
        let r = m.getAudioRegion();
        let out = {id:m.getId(), start:time, end:timeLimit};
        return out;
	public addNextPart(idx:number, time:number, createNewMeasure:boolean=true):any{
    if(!this.parts.length : any) {
      console.warn( "warning songModel : part is empty" );
      pos = {part:0, measure:0};
    }
		if(!pos || pos.measure == -1 || pos.part == -1: any) {
			console.warn( "error songModel : cant get next region ! adding at the end..." );
			pos = {part:this.parts.length, measure:this.parts[this.parts.length].getMeasures().length};
		this.insertPartAfter(pos.part , p);
    if(!createNewMeasure)return p;
		let m  = p.addNewMeasure();
		m.addNewBeat();
		this.addAudioRegionAtTime(pos.part+1,0, time);
		let r = m.getAudioRegion();
		let out = {id:m.getIdx(), start:r.start, end:r.end};
  /*
  Compute analysis for the part "pNb".
  If no parameter : for each part (and each measures).
   */
  public analyse_part(pNb:number=-1){
    if(pNb >= this.parts.length)
      throw "Song model error : analyse_parts() => invalid part number.";
    let analyse_all = false;
    if(pNb == -1) analyse_all = true;
    if(analyse_all: any) {
      for(let p = 0; p < this.parts.length; p++: any) {
        this.parts[p].compute_analysis();
      }
  /**
   * Search chords contained in song.
   * Originally from dico component
  public analyseScore():void{
    let parts = this.getParts();
    this.chordsInScore = {};
    for(let p of parts: any) {
      let measures = p.getMeasures();
      for( let m of measures : any) {
        let analyse = this.analyseChordLine ( m.getChordsLine() );
        for(let a of analyse : any) {
          if(this.chordsInScore.hasOwnProperty(a.symbol)) continue; //ALREADY IN DICTIONARY
          this.chordsInScore[a.symbol] = a;
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
        if(chord.empty) console.warn('Unknown chord : ', c);
        else
          out.push( chord );
        let chord = Chord.get(c);
    return out;
  public paste_only_chords(a:any, b:any):void{
    if(!a.length)throw "error paste_only_chords() a is empty."
    if(!b.length)throw "error paste_only_chords() b is empty."
    let b_is_part = (b[0].getType() == 'part');
    let b_is_measure = (b[0].getType() == 'measure');
    let a_is_part = (a[0].getType() == 'part');
    let a_is_measure = (a[0].getType() == 'measure');
    if( !b_is_part && !b_is_measure )
      throw "error: paste_only_chords() => selection type unknown";
    if( !a_is_part && !a_is_measure )
      throw "error: paste_only_chords() => buffer type unknown";
    if( b_is_part && !a_is_part || b_is_measure && !a_is_measure )
      throw "error: paste_only_chords() => buffer and selection are not the same type";

    if(a_is_part && b_is_part: any) {
      let A = a[0];
      let B = b[0];
      B.title = A.title;
      B.measures_max_lines = A.measures_max_lines;
      B.meter = A.meter;
      B.tonality = A.tonality;
      let mA = A.getMeasures();
      let mB = B.getMeasures();
      if(mA.length != mB.length: any) {
        throw "error: paste_only_chords() => selection and buffer dont have the same number of measures.";
      for(let i=0; i < mA.length; i++: any) {
        this.copy_measure_chords(mA[i], mB[i]);
    }else if(a_is_measure && b_is_measure: any) {
      let m_vect = [];
      let h = this.getMeasures_hash();
      let next_meas_h = h[ b[0].getIdx() ];
      for(let i=0; i < a.length; i++: any) {
        if(next_meas_h == undefined) throw "error paste_only_chords() => undefined hash";
        if(next_meas_h.part != h[ b[0].getIdx() ].part)debugger
        let next_meas = this.getPart( next_meas_h.part ).getMeasure(next_meas_h.meas);
        m_vect.push( next_meas );
        next_meas_h = h[ next_meas.getIdx()+1 ];
      if(a.length != m_vect.length: any) {
        this.copy_measure_chords(a[i], m_vect[i]);
  private copy_measure_chords( a:Measure, b:Measure ):void{
    if(a.getType() != 'measure' || b.getType() != 'measure' )
      throw "error: copy_measure_chords() => selection or buffer is not of type 'measure'.";
    b.chords = a.chords;
    b.collapse = a.collapse;
    b.eol = a.eol;
    b.lyrics = a.lyrics;
    b.analysis = a.analysis;
    b.setMeter( a.getMeter() );
    b.notes = a.notes;
    b.notes_lh = a.notes_lh;
    b.setBeats ( a.getBeats() );
  public get_last_measure_at_time(t:number):Measure{
    if(!this.parts.length)return;
    let prev = this.parts[0].getMeasures()[0];
    for(let p = 0; p < this.parts.length; p++: any) {  //FOR EACH PART
      let measures = this.parts[p].getMeasures();
      for(let m = 0; m< measures.length; prev = measures[m] ,m++: any) { //FOR EACH MEASURES
        let r = measures[m].getAudioRegion();
        if(r && r.start > t : any) {
          return prev;
    return prev;
	public get_next_beat_at_time(t:number, id?:number):any{
		let mIdx = this.measures_hash[id].meas;
		let pIdx = this.measures_hash[id].part;
		let out = {part:pIdx,measure:mIdx,beat:0};
		let break_signal = false;
		for(let p=pIdx; p<this.parts.length; p++,mIdx=0 : any) {
			for(let m=mIdx; m<measures.length;m++: any) {
				out = {part:p,measure:m,beat:0};
				let beats = measures[m].getBeats();
				if(beats[0].getAudioRegion().start ){ //checks if the beats are assigned
					for(let b=0;b<beats.length;b++: any) {
						if(t<beats[b].getAudioRegion().end) {
							out = {part:p,measure:m,beat:b};
							break_signal = true;
						}
						if(break_signal)break;
					}

				}else{
					if(t<measures[m].getAudioRegion().end){
						out = {part:p,measure:m,beat:0};
						break_signal = true;
					}
				if(break_signal)break;
			if(break_signal)break;
		return {measure:this.parts[out.part].getMeasure(out.measure),beat:out.beat};
	public get_previous_beat_at_time(t:number, id?:number):any{
		for(let p=pIdx; p>=0; p--,mIdx=(p==-1)?this.parts[0].getMeasures().length-1:this.parts[p].getMeasures().length-1 ){
			for(let m=mIdx; m>=0;m--: any) {
				if(beats[0].getAudioRegion().start){
					for(let b=beats.length-1;b>0;b--: any) {
						if(t>beats[b].getAudioRegion().start) {
					if(t>measures[m].getAudioRegion().start){
  public get_last_beat_at_time(t:number):Measure{
}
