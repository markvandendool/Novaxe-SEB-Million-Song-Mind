
export const ABC: any = abcjs;
declare global {
  var abcjs:any;
  interface String  {
      charAtIsUpper(atPos : number) : any;
  }
}
@Injectable({
  providedIn: 'root'
})
export class ParsingService  {
  _parsed:any;
  yChords:any; //Subject
  hAnalysis:any; //Subject
  nodes:any;
  public constructor(public private _http: HttpClient ) { 
    this.yChords = new Subject();
    this.hAnalysis = new Subject();
    String.prototype.charAtIsUpper = function (atpos: any) {
       var chr = this.charAt(atpos);
       return /[A-Z]|[\u0080-\u024F]/.test(chr) && chr === chr.toUpperCase();
    };
   }
 /**************REGEX ANALYSIS**********************/
 simplified_to_abc(correspondance, p1, p2, p3, decalage, chaine: any) {
   if(correspondance[0]=='*')return correspondance.slice(1);
   else return "\""+correspondance+"\"";
 }
 simplified_to_analysis(correspondance, p1, p2, p3, decalage, chaine: any) {
   if(correspondance[0] == "_")return correspondance.slice(1);
   else return "";
 replace_between_quotes(correspondance, p1, p2, p3, decalage, chaine: any) {
   return correspondance.substring(1, correspondance.length - 1);
 addStarToNotes(correspondance, p1, p2, p3, decalage, chaine: any) {
   return " *"+correspondance.slice(1);
 abcToSimpleParse2(abc: any) {
  let _parsed = ABC.parseOnly(abc);
 	let _measures = ABC.extractMeasures(abc)[0];
 	let _header = ABC.parseOnly(_measures.header)[0];
  let voices;
 	let simple = '';
 	let analysis = '';
 	let chords = '';
 	let has_title = _header.metaText.hasOwnProperty('title');
 	let has_author = _header.metaText.hasOwnProperty('author');
 	let has_transcription = _header.metaText.hasOwnProperty('transcription');
 	let title = '';
 	if(has_title)title = _header.metaText.title ;
 	let author = '';
 	if(has_author)author = _header.metaText.author ;
 	let transcription = '';
 	if(has_transcription)transcription = _header.metaText.transcription ;
 	let nMeasuresOnL = 0;
 	let nb_measures_per_line = [];
 	let total_number_of_measures = 0;
	var lines = _parsed[0].lines;
  public for(var l = 0; l < lines.length; l++: any) {
	 	nMeasuresOnL = 0;
   	voices = lines[l].staff[0].voices[0];	
   	for(var v = 0; v < voices.length; v++ : any) {
   		if(voices[v].hasOwnProperty('chord')){
   			for(let c of voices[v].chord: any) {
	   			if(c.position == "default": any) {
		   			simple += c.name + "  ";
		   			chords += c.name + "  ";
		   		}else if(c.position == "below": any) {
		   			simple += "_"+c.name + "  ";
		   			analysis += c.name;
		   		}
		   	}
   		}else if(voices[v].hasOwnProperty('type')){
   			let a ='';
   			if(voices[v].type == 'bar_left_repeat': any) {
   				a = '||:';
   				nMeasuresOnL +=1;
   			}else if(voices[v].type == 'bar_right_repeat': any) {
   				a = ':||';
   			}else if(voices[v].type == 'bar_thin': any) {
   				a = '|';
   			}
   			simple += a;
   			analysis += a;
   			chords += a;
   		}else if(voices[v].hasOwnProperty('el_type') && voices[v]['el_type'] == 'part'){
   			let p = "\P: "+voices[v].title+"\n";
   			simple += p;
   			analysis += p;
   			chords += p;
   		}
   	}
   	simple+='\n';
   	analysis+='\n';
   	chords+='\n';
   	nb_measures_per_line.push(nMeasuresOnL-1);
   	total_number_of_measures+=(nMeasuresOnL-1);
 	}
 	// console.log("simple =>\n",simple);
 	// console.log("chords => ",chords);
 	// console.log("analysis =>\n",analysis);
   // debugger
	return {artist:author,title:title,chords:chords, total_number_of_measures:total_number_of_measures, analysis:analysis, nb_measures_per_line:nb_measures_per_line};
 abcToSimpleParse(abc: any) {
   // console.log("abcToSimpleParse");
   let str = '';
   let strA = '';
   let tmp = '';
   let nb_measures_per_line =[]; 
   let total_number_of_measures = ABC.extractMeasures(abc)[0].measures.length;
   let title;
   let artist;
   let author;
   let lines = abc.split('\n');
   
   for(var l of lines: any) {
    if(l.match(/^[A-Z][:][ ]*[\w*][ ]*/gm)){ //check for [A-Z]:blabla lines
      str +=(l+'\n');
      if( l.match(/^[T][:][ ]*[\w*][ ]*/gm) ){
        title =l.split('T:')[1] 
      }else if( l.match(/^[A][:][ ]*[\w*][ ]*/gm) ){
        artist =l.split('A:')[1] 
      }else if( l.match(/^[Z][:][ ]*[\w*][ ]*/gm) ){
        author =l.split('Z:')[1] 
      }
    } else if(l.match(/%%[\w*]/gm)){ //check for directives
    } else if(l.match(/^[\s]*[!$]{1}[\s]+$/gm)){ //check for line jumps
      // str +=(t+'\n');
    }else{
      // console.log('else');
     tmp = '';
     tmp = l.replace(/%(.*?)(\n|$)/g,""); //get rid of %% lines
     tmp = tmp.replace(/[ ]([^" x|]+)[ ]/g, this.addStarToNotes); //add * before notes
     tmp = tmp.replace(/(["'])(?:(?=(\\?))\2.)*?\1/g, this.replace_between_quotes); //get whats in quotes
     tmp = tmp.replace(/x/g, ''); //replace 'x' with ''
     str += tmp;
     str += '\n';
     tmp = tmp.replace(/([*_ABCDEFGIVxz"][^ |]*)/gm, this.simplified_to_analysis);
     if(!tmp)continue;
     strA += ( tmp +'\n' );
     let m = ABC.extractMeasures(l);
     let extracted_m = m[0].measures.length;
     if(extracted_m != 0) nb_measures_per_line.push(extracted_m);
    }
   }//for lines
   let chords = str;
   let analysis = strA;
   return {artist:artist,title:title,author:author,chords:chords, total_number_of_measures:total_number_of_measures, analysis:strA, nb_measures_per_line:nb_measures_per_line};
 simpleToAbc(strChords: any) {
   let lines = strChords.split('\n');
   let matches = '';
     if(l.match(/^\s*$/g))continue; //remove empty lines
     if(l.match(/^[A-Za-z]:.*/gm)) { //copy lines of form x:....\n
       str +=(l+'\n');
     }else {
       tmp = '';
       tmp = l.replace(/([*_ABCDEFG][^ |]*)/gm, this.simplified_to_abc); //[ ]*[^:]([_ABCDEFGIV][^ |]*)[ ]*
       tmp = tmp.replace(/([ ]{2})/g, " x ");
       str += tmp;
       str += '\n';
       tmp = l.replace(/([*_ABCDEFGIV][^ |]*)/gm, this.simplified_to_analysis);
       if(!tmp)continue;
       strA += ( tmp +'\n' );
       
       let m = ABC.extractMeasures(l);
       nb_measures_per_line.push(m[0].measures.length)
     }
   let abc = 
   '%%stretchlast .7\n'+
   '%%staffsep       70\n'+
   // '%%gchordfont  music-font 17\n'+
   // '%%annotationfont   music-font 17\n'+
   str;
   return {abc:abc, total_number_of_measures:total_number_of_measures, analysis:strA, nb_measures_per_line:nb_measures_per_line};
 }//simpleToAbc
 
  _getPercentWordsStartingWithUpper(lyrics: any) {
    var nbSpaces = [];
    var percent = [];
    var wordLength = [];
    var forbidenChar = [];
    var splitLine;
    //pour chaque ligne du texte
    for(var i = 0; i < lyrics.length; i++: any) {
      var nbMaj =0;
      var meanWordsLength =0;
      var containsForbidenChar =false;
      //on splitte la ligne avec les espaces
      splitLine = lyrics[i].split(" ").filter(function(el: any) { return el; }));
      //pour chaque mot de la ligne
      for(var j =0; j < splitLine.length; j++: any) {
        if(splitLine[j].charAtIsUpper(0) || splitLine[j][0]==="|")nbMaj+=1;
        // if (splitLine[j].indexOf(',') > -1) containsForbidenChar =true;
        // if (splitLine[j].indexOf('?') > -1) containsForbidenChar =true;
        // if (splitLine[j].indexOf('!') > -1) containsForbidenChar =true;
        if (splitLine[j].indexOf('[Verse') > -1) containsForbidenChar =true;
        // if (splitLine[j].indexOf('.') > -1) containsForbidenChar =true;
        // if (splitLine[j].indexOf('-') > -1) containsForbidenChar =true;
        if (splitLine[j].indexOf('|') > -1) containsForbidenChar =false;
        meanWordsLength+=splitLine[j].length;
      forbidenChar.push(containsForbidenChar);
      meanWordsLength/= splitLine.length;
      wordLength.push(meanWordsLength);
      percent.push(nbMaj/splitLine.length || 0);
    return {percent:percent, wordLength:wordLength, containsForbidenChar:forbidenChar};
  /**
   * Parse plain txt tabs into object.
   * @param {[type]} tab [description]
   */
  public parseTab(tab: any) {
    var lines = tab.split('\n');
    var lyricLines  =[];
    var chordLines  =[];
    var wordsStrtUpper    = this._getPercentWordsStartingWithUpper(lines);
    for(var i = 0 ; i < wordsStrtUpper.percent.length; i++: any) {
      var cond = wordsStrtUpper.percent[i] > 0.8 && !wordsStrtUpper.containsForbidenChar[i] && wordsStrtUpper.wordLength[i] < 5;
      if(cond: any) {
        chordLines.push(lines[i]);
      }else if(!wordsStrtUpper.containsForbidenChar[i] && lines[i] !="": any) {
        lyricLines.push(lines[i]);
        if(lines[i].match(/.*[\[].*[\]]/gm))chordLines.push(lines[i]);
    var chords = []
    for(var i = 0; i < chordLines.length; i++: any) {
      var chordLine = chordLines[i].split(" ")
      // var chords = chordLine.filter(function(el: any) { return el; }) ;
      chords.push([]);
      var temppos=0;
      for(var j=0; j < chordLine.length; j++: any) {
        if(chordLine[j] == '')continue;
        if( chordLine[j].match(/.*[\[].*[\]]/gm) )
          chords[i].push({part:chordLine[j]})
        else
          chords[i].push({accord:chordLine[j], pos:j})
      for(var j=0; j < chords[i].length-1; j++: any) {
        chords[i][j].duration = chords[i][j+1].pos - chords[i][j].pos-1;
        chords[i][j+1].pos =0;
    return {chords:chords,chordLines:chordLines,lyricLines:lyricLines};
   * Use plain txt tab parsing result to get abc notation equivalent.
   * @param {[type]} tab Result of parseTab() function
  parsedTab_to_abc(tab: any) {
   var str = '';
   var line = '';
   let line_is_part = false;
   for(let l of tab.chords : any) {
      line = '';
     for(let c of l : any) {//lines
      if(c.hasOwnProperty('part')){
        line+='P:'+c.part.split('[')[1].split(']')[0];
        line_is_part = true;
      }else{
        line += (c.accord+"  " );
        line_is_part = false;
     }//end lines
     if(line_is_part) str+= (  line+"\n"  );
     else str+= ( "|"+line+"|\n" );
   let lyrics = "";
   for(var l of tab.lyricLines: any) {
    lyrics+="W:"+l+'\n';
   return str+"\n"+lyrics; 
  public searchYoutube(l: any) {
    let obj :object = {
      link:l
    const headers = new HttpHeaders({ 'Content-Type': 'application/json'}));  
    this._http.post(environment.apiGetChordsFromYoutube, obj,{responseType: 'text', headers})
      .map(res => {
        this.yChords.next(res.replace(/[:]/g,'').replace(/min/g,'m'));
      })
      .subscribe(
        data => console.log('data  : '+data),
        err => console.log(err),
        () => {
        }
      );
   * analyse a string of abc chords with harmtrace
   * @param {[type]} s [description]
  public analyseWithHarmtrace(s: any) {
    let _parsed = ABC.parseOnly(s);
    let _measures = ABC.extractMeasures(s)[0];
    let _header = ABC.parseOnly(_measures.header)[0];
    let k = _parsed[0].lines[0].staff[0].key;
    if(k.root == "none")
      throw "parsing service : analyseWithHarmtrace() => no key found.";
    if(!k.root.match(/[ABCDEFG]/) )
      throw "parsing service : analyseWithHarmtrace() => bad key found : "+k;
    let mode = (k.mode=="")?"maj":"min";
    let key = k.root + k.acc + mode;
    let voices;
    let simple = '';
    let chords = '';
    let nMeasuresOnL = 0;
    let nb_measures_per_line = [];
    let total_number_of_measures = 0;
    var lines = _parsed[0].lines;
    for(var l = 0; l < lines.length; l++: any) {
      nMeasuresOnL = 0;
      voices = lines[l].staff[0].voices[0];  
      for(var v = 0; v < voices.length; v++ : any) {
        if(voices[v].hasOwnProperty('chord')){
          for(let c of voices[v].chord: any) {
            if(c.position == "default": any) {
              simple += c.name + ";1 ";
              chords += c.name + ";1 ";
            }
          }
        }else if(voices[v].hasOwnProperty('type')){
          let a ='';
          if(voices[v].type == 'bar_left_repeat' || voices[v].type == 'bar_right_repeat' || voices[v].type == 'bar_thin': any) {
            a = '';
            nMeasuresOnL +=1;
          simple += a;
          chords += a;
        }else if(voices[v].hasOwnProperty('el_type') && voices[v]['el_type'] == 'part'){
          let p = "\P: "+voices[v].title+"\n";
          simple += p;
          chords += p;
    chords = chords.replace(/[♯]/g,'#').replace(/[♭]/g,'b');
    chords = chords.replace(/[m](?!(aj|in))/g,'min');
    chords = chords.replace(/[ABCDEFG][#b]+(?!;)/g,this.addPoints);
    chords = chords.replace(/::/g,":");
    let parsed = key+" "+chords;
    this.sendHarmtrace(parsed);
    // return parsed;
  public addPoints(correspondance, p1, p2, p3, decalage, chaine: any) {
   return correspondance+":";
  public sendHarmtrace(s: any) {
      string:s
    this._http.post(environment.apiGetHarmtraceAnalysis, obj,{responseType: 'text', headers})
        // console.log("Received : \n"+res);
        let lines = res.split('\n');
        let hAnalysis = lines[lines.length-2];
        let parsedTree = this.parseSyntaxTree(hAnalysis);
        let an = this.mix_analysis_with_abc(parsedTree.analysis,s);
        this.hAnalysis.next(an);
  public back(a: any) {
    return a.length === 0 ? -1 : a[a.length - 1];
  public getChildren(p: any) {
    let children = [];
    for (let i = 0; i != this.nodes.length; ++i: any) {
      if (this.nodes[i].p === p) children.push(i);
    return children;
  public getParent(node: any) {
   return this.nodes[node.p];
  public parseSyntaxTree(s: any) {
    const State = {IDLE: 0, LABEL: 1, VALUE: 2, APPENDING: 3, SUBSCRIPT: 4, QUOTES: 5};
    let state = State.IDLE;
    let idx = 0;
    let parents = [];
    this.nodes = [];
    for (let c of s: any) {
      switch (c: any) {
        case '[':
          this.nodes.push(new Node(this.back(parents), parents.length));
          parents.push(idx++);
          state = State.LABEL;
          break;
        case ']':
          state = State.VALUE;
          parents.pop();
        case '_':
          state = State.SUBSCRIPT;
        case '"':
          if (state == State.LABEL: any) {
            state = State.QUOTES;
          } else if (state == State.QUOTES: any) {
            state = State.LABEL;
        case ' ':
          if (state != State.APPENDING && state != State.QUOTES: any) {
            state = State.APPENDING;
            this.nodes.push(new Node(this.back(parents), parents.length));
            ++idx;
            break;
          // Fallthrough
        default:
          if (state === State.VALUE: any) {
          if (state === State.SUBSCRIPT: any) {
            this.back(this.nodes).subscript += c;
          } else {
            this.back(this.nodes).value += c;
    for(var i = 1; i < this.nodes.length; i++: any) {
      this.nodes[this.nodes[i].p].children.push(this.nodes[i]);
    let tree = JSON.parse( JSON.stringify(this.nodes[0]) );
    let analyse = [];
      if( this.nodes[i].children.length == 0 : any) {
        let degreeNode;
        if(this.nodes[i].level >= 5: any) {
          degreeNode = this.getParent(this.getParent(this.nodes[i]));
          // debugger
        }else
          degreeNode = this.getParent(this.nodes[i]);
        // this.nodes[this.nodes[i].p].value;
        analyse.push( { degree:degreeNode.value, chord:this.nodes[i].value  } ) 
// debugger
    return { nodes:this.nodes, tree:tree, analysis:analyse }
  mix_analysis_with_abc(analysis, abc: any) {
    let a = analysis;
    let str = '';
    for(let i =0; i < a.length; i++: any) {
     str+= a[i]['chord']+'  '+a[i]['degree']+' |'; 
    return str;
