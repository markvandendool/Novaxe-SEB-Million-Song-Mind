import { Injectable } from '@angular/core';

@Injectable()
export class ExerciseModel {
	
	private progressions:Array<Array<any>>;

  public _solution:Array<String>;
  public _reponse:Array<String> = [];
  public _question:Array<String>;

  public _nb_hidden:number=1;
  public _max_hidden:number=1;
	public _fourths:Array<String>=[ 'C','F','Bb','Eb','Ab','Db','F#','B','E','A','D','G'];
  public _cards:Array<String>=[ 'C','Db','D','Eb','E','F','F#','G','Ab','A','Bb','B'];
  public win:boolean=undefined;
  public verified =0;
  public curProg:number=0;


	private nb_questions:number;

	public constructor(){
		this.progressions  = [ [{fourths:-2,quality:'m7b9'},{fourths:-1,quality:'7b913'},{fourths:0,quality:'7n9'}] ]	// ii/V/I
    // this.progressions  = [ [{fourths:-2,quality:'m7b9'},{fourths:-1,quality:'7b913'},{fourths:0,quality:'7n9'},{fourths:-2,quality:'m7b9'},{fourths:-1,quality:'7b913'},{fourths:0,quality:'7n9'}],[{fourths:-1,quality:'7b913'},{fourths:0,quality:'7n9'}] ]  // ii/V/I
    // this.progressions  = [ [{fourths:-1,quality:'7b913'},{fourths:0,quality:'7n9'}] ] // V/I
    // this.progressions  = [ [{fourths:-1,quality:'b7'},{fourths:0,quality:'maj'}] ] // V/I
    // this.progressions  = [ [{fourths:-2,quality:'m7b9'},{fourths:0,quality:'7n9'}] ] // ii / I
    // Object.defineProperty(Number.prototype, 'mod', { value: function(n) {
    //   return ((this%n)+n)%n;
    // }});
		this.start();
	}	

  get_rand_between(min:number=0,max:number=11){
    let n = min + Math.floor( Math.random() * (max) ); 
    return n;
  }


  public get_progressions(){
    return this.progressions;
  }

  public remove_chord_in_progression(p,c){
    this.progressions[p].splice(c,1);
    return;
  }

  public add_chord_in_progression(p,chord){
    this.progressions[p].push(chord);
    console.log(this.progressions)
  }

  public add_progression(){
    this.progressions.push([]);
  }

  public remove_progression(p){
    this.progressions.splice(p,1);
  }

  /**
   * Create a new exercice by searching a new solution.
   */
  private get_solution(){

    //Pick a random progression in the progression tab (see constructor).
  	this.curProg = this.get_rand_between(0,this.progressions.length);
  	let prog = this.progressions[this.curProg];


    //Pick a random tonality.
    let t = this.get_rand_between(); //0-11

    //Create solution
    let s = [];  
    for(let i = 0; i < prog.length; i++)
      s.push( this._fourths[ (t+prog[i].fourths).mod(12) ] );
    
    this._solution = s;
    console.log('solution => ',s);
  } 

  /**
   * Create a question from a solution.
   */
  private get_question(){
    //Get random number of hidden parts.
    this._nb_hidden = this.get_rand_between(1,this._max_hidden);

    //create a temp array with [1,2,3,...,n] with n=this.solution.length
    let temp =[];
    for(let i = 0; i < this._solution.length; i++) temp.push(i);

    //tirage sans remise dans le tableau précedent. Stocké dans tab2.
    //On obtient un tableau d'indices a masquer.
    let tabIndx= [];
    for(let i=0; i < this._nb_hidden; i++){
      let n3 = this.get_rand_between(0,temp.length);
      tabIndx.push( temp.splice(n3,1)[0] );
    }

    //hard copy this._solution in this._question
    this._question = JSON.parse(JSON.stringify(this._solution));

    //for each index contained in tab2 replace that question[index] with a "_"
    for(let i = 0 ; i < tabIndx.length; i++){
      this._question[ tabIndx[i] ] = "_";
    }
    console.log("this._question => ",this._question);
  }

  private arraysMatch (arr1, arr2) {

    // Check if the arrays are the same length
    if (arr1.length !== arr2.length) return false;

    // Check if all items exist and are in the same order
    for (var i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) return false;
    }

    // Otherwise, return true
    return true;
  }

  private verify(){

    if(this._reponse.length != this._nb_hidden)return;

    let tab = this._question;

    for(let i =0; i<this._reponse.length; i++){
      tab[ tab.indexOf('_') ] = this._reponse[i];
    }

    if(this.arraysMatch(tab, this._solution) ){
      this.win = true;
    } else {
      this.win = false;
      this._question = this._solution;
    }
  }

  public verifyNext(c){

    let ok               = false;
    let currentSolution  = this._solution[this.verified];
    let curChord         = this.progressions[this.curProg][this.verified];

    // if(c.rootName == currentSolution ){
    if(c.rootName == currentSolution && c.name == curChord.quality){
      ok = true;
      this.verified+=1;
      if(this.verified == this._solution.length) this.win=true;
    }

    return ok;
  }

  public start(){
    this.win = undefined;
    this._reponse = [];
    this.verified=0;
    // this.shuffle(this._cards);
    this.get_solution();
    this.get_question();
  }

  public answer(a){
    this._reponse.push(a);
    this.verify();

    return this.win;
  }

  private shuffle(array) {

	  var currentIndex = array.length, temporaryValue, randomIndex;
	  // While there remain elements to shuffle...
	  while (0 !== currentIndex) {

	    // Pick a remaining element...
	    randomIndex = Math.floor(Math.random() * currentIndex);
	    currentIndex -= 1;

	    // And swap it with the current element.
	    temporaryValue = array[currentIndex];
	    array[currentIndex] = array[randomIndex];
	    array[randomIndex] = temporaryValue;
	  }

	  return array;
	}
}
