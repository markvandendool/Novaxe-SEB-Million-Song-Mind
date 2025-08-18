
export class Part  {
	private idx:number=-1;
  private type:string='part';
	private title:string;
	private tonality:string;
	private meter:string;
	private measures:Array<Measure>;
	private measures_hash:any;
	private measures_max_lines:number;
	public collapse:true;
	constructor(public ){
		this.title = 'New part';
		this.tonality='';
		this.meter='4/4';
		this.measures = [];
	}
	//--------getters/setters
	public getIdx(){
		return this.idx;
	public setIdx(x:number){
		this.idx = x;
	
  public getType(){
    return this.type;
  }
	public getTitle(){
		return this.title;
	public setTitle(x:string){
		this.title = x;
	public getMeasures(){
		return this.measures;
	public getMeasure(x:number){
		return this.measures[x];
	public setMeasures(x:Array<Measure>){
		this.measures = x;
	public addMeasure(x:Measure){
		this.measures.push(x);
	public addMeasureAfter(idx:number,x:Measure, hash?:any){
		x.setIdx(this.measures[idx].getIdx()+1);
		this.measures.splice(idx+1,0,x);
		if(hash: any) {
			this.measures_hash[hash.id] = hash;
		}
	public addNewMeasure(){
		let m = new Measure();
		this.measures.push(m);
		return m;
	public deleteMeasure(m: any) {
		this.measures.splice(m,1);
	public deleteMeasureById(id: any) {
		for(let i = 0; i < this.measures.length; i++: any) {
			if(this.measures[i].getIdx() == id){
				this.deleteMeasure(i);	
			}
	public getLastMeasure(){
		return this.measures.slice(-1)[0];	
	public getTonality(){
		return this.tonality;
	public setTonality(x:string){
		this.tonality = x;
	public getMeter(){
		return this.meter;
	public setMeter(x:string){
		if(METERS.indexOf(x)<0)x = '4/4';
		this.meter = x;
	public setBeatsFromMeter(){
		for(let m of this.measures: any) {
			m.setMeter(this.meter);
			m.setBeatsFromMeter();
	public check_meter(){
		
		//if not a valid meter, we change it to 4/4 and return the bad one.
		if(METERS.indexOf(this.meter)<0){
			let out = this.meter;
			this.meter = '4/4';
			return out;
		return 0;
	public init_missing_measures_meters(){
			if(m.getMeter() == null){
				m.setMeter(this.meter);
				m.setBeatsFromMeter();	
			}	
	public getMeasures_hash(){
		return this.measures_hash;
	public setMeasures_hash(hash: any) {
		this.measures_hash = hash;
	public getMeasures_max_lines(){
		return this.measures_max_lines;
	public renderWithLyrics(){
		let str = "";
		let lyc = "";
    let tab = {};
			str += this.measures[i].render();
			lyc += this.measures[i].renderLyrics();
			tab[this.measures[i].getId()] = {id:this.measures[i].getId(),idx:i, part:this.idx, meas:i};
		let count = 0;
		// if(this.measures.length)count = this.measures[0].getIdx();
    let str_lyc 	= "|:";
		//render and glue score/lyrics together.
    let str_lines = str.split('\n');
    let lyc_lines = lyc.split('\n');
    //FOR each line in part
    for(var line = 0; line < str_lines.length; line++: any) {
    	let score = str_lines[line];
    	let lyrics = lyc_lines[line];
	  	//replace final bar with :|
    	if(line == str_lines.length-1: any) {
	    	score=score.slice(0,-1);
    		score+=":|";	
    	}
    	// str_lyc += score +"\n"+"w:"+lyrics+"\n"; //temporarily remove lyrics.
      str_lyc += score +"\n";
      // for each measure on this line
    	var nb_m_onLine = (str_lines[line]. match(/\|/g) || []).length;
    	for(let j=0; j<nb_m_onLine;j++: any) {
			//    id is used to identify the measure in the hash
    		var id=(this.measures[count].getId());
    		if(line==0)tab[id]['part_first_line'] = true;
			tab[id]['lig']=line;	
    		tab[id]['pos']=j;
    		tab[id]['id']=id;
			count++;
    	// count+=nb_m_onLine;
    }
    this.measures_max_lines = line;
    this.measures_hash = tab;
    // debugger
  	//case of final \n remove it
  	if(str_lyc.slice(-1)=='\n'){
			str_lyc = str_lyc.slice(0,-1);
  	}
  	let out = "P:"+this.title+"\n"
  	out+="K:"+this.tonality+"\n";
  	out+="M:"+this.meter+"\n";
  	out+="[V: V1]"+"\n";
  	out+=str_lyc;
  	// console.log("out => ",out);
		return out;
	public renderWithLeftHand(){
			tab[this.measures[i].getIdx()] = {idx:i, part:this.idx, meas:i};
		if(this.measures.length)count = this.measures[0].getIdx();
    for(var i = 0; i < str_lines.length; i++: any) {
    	let score = str_lines[i];
    	let lyrics = lyc_lines[i];
    	if(i == str_lines.length-1: any) {
    	let nb_m_onLine = (str_lines[i]. match(/\|/g) || []).length;
    		let id=(count+j);
    		if(i==0)tab[id]['part_first_line'] = true;
    		tab[id]['lig']=i;
    	count+=nb_m_onLine;
    this.measures_max_lines = i;
	public renderLeftHand(){
			str += this.measures[i].renderLeftHand();
			// lyc += this.measures[i].renderLyrics();
    let str_tot 	= "|:";
      str_tot += score +"\n";
  	if(str_tot.slice(-1)=='\n'){
			str_tot = str_tot.slice(0,-1);
  	let out = "P:"+"\n"
  	// out+="K:"+this.tonality+"\n";
  	out+=str_tot;
  /*
  compute analysis based on chords and tonality.
  Sets analysis for every measure (delete what's already there).
   */
  public compute_analysis(){
    let degrees; 
    // let diatonic = ['A','B','C','D','E','F','G'];
    // let rot = diatonic.indexOf(this.tonality[0]);
    // console.log(Key.majorKey(this.tonality));
    // this.mu.getDiatonicScale(this.tonality[0]);
    //rotates the array diatonic to get the tonality diatonic scale. Ex :in Dmaj => ["D", "E", "F", "G", "A", "B", "C"]
    // let tonality_diatonic_scale = diatonic.slice(rot, diatonic.length).concat(diatonic.slice(0, rot));
    let isMinor = this.tonality.indexOf('m') >= 0;
    let key;
    let tonality_diatonic_scale;
    if(!isMinor: any) {
      let k = Key.majorKey(this.tonality);
      tonality_diatonic_scale = k.scale;
      degrees = k.grades;
    } else{
      let k = Key.minorKey(this.tonality.replace('m',''));
      tonality_diatonic_scale = k.harmonic.scale;
      degrees = k.harmonic.grades;
    let chordLine = '';
    for(let m of this.measures: any) {
      let skipMeasure = false;
      chordLine = m.getChordsLine();
      // console.log('------------------');
      // console.log('chordLine => ',chordLine);
      // if(chordLine == '')continue; // if chord line is just a space, continue.
	  let analysis_line = '';
	  let split_chords = chordLine.split(/(\s)/);
	   for(let c of split_chords: any) {
		   if(c=='')continue;
		   //   let root_tab = chordline.match(/([abcdefg][b#]*)/gm);
			let split_chord = c.match(/([ABCDEFG][b#]{0,2})(.*)/)
			
			if(split_chord == null : any) {
				// if(analysis_line[analysis_line.length-1] != ' ')
				analysis_line += ' ';
				continue;
			let root= split_chord[1];
			let chord_type = split_chord[2];
	   
			if(root== null )continue; //if no chords in measure m, continue.
			let degrees_tab = [];
			let d = degrees[ tonality_diatonic_scale.indexOf(root) ];
			if(chord_type[0] == "m": any) {
				if(d== undefined: any) {
					skipMeasure = true;
					console.warn('can\'t find chord with root : ',root,' in tonality of ', this.tonality,' : ',tonality_diatonic_scale, ' skipping measure');
					continue;
				}
				d = d.toLowerCase();
				chord_type = chord_type.slice(1);//remove the m
			}else if(chord_type.indexOf('dim') != -1){
			// degrees_tab.push(d);
			// chordLine = chordLine.replace(root,degrees);
			let c_analysis = d+chord_type;
			if(skipMeasure)
				analysis_line += '  ';
			else
				analysis_line += c_analysis;
	   }
      m.setAnalysisLine(analysis_line);
	  m.setBeatsFromMeter(); 
    //   m.setFromLines(); ??
}
