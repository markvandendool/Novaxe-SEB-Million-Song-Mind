import { Injectable } from '@angular/core';

@Injectable()
export class Statsmodel {
	private sm;
	private parts:any;

	public chordsCounting:any = {};
	public analysisPerMeasure:any = {};
	public simpleAnalysisPerMeasure:any = {};
	public totalChordsInParts:any = {};

	public chordsInScore:Array<string>;
	public partTonalities:Array<string> = [];
	
	constructor(){}

	public compute(sm){
		this.sm = sm;
		this.chordsInScore = Object.keys(this.sm.getChordsInScore());
		this.parts = Object.values(this.sm.getParts());
		this.getPartTonalities();
	    this.nbChordsInScore();
	    this.computeAnalysis();
	}



	public reset(){
		this.parts = {};
		this.chordsCounting = {};
		this.analysisPerMeasure = {};
		this.simpleAnalysisPerMeasure = {};
		this.totalChordsInParts = {};

		this.chordsInScore = [];
		this.partTonalities = [];
	}



	public nbChordsInScore(){

		for (var i = 0; i < this.chordsInScore.length; i++)
		  this.chordsCounting[this.chordsInScore[i]] = 0;
		
		for(let i=0; i<this.parts.length; i++){
			var mes = this.parts[i].measures;
			
			for(let j=0; j<mes.length; j++){
				var c = mes[j].chords;
				var chord = c.split(' ');

				for(let k=0; k<chord.length; k++){
					if(this.chordsCounting.hasOwnProperty(chord[k]))
						this.chordsCounting[chord[k]]+=1;
				}
			}
		}
	}



	private getPartTonalities(){
		
		for(let i=0; i<this.parts.length; i++){
			var tona = this.parts[i].tonality;
			this.partTonalities.push(tona);
		}
		return this.partTonalities;
	}



	public computeAnalysis(){
		  
		for(let i=0; i<this.parts.length; i++){
			this.analysisPerMeasure[i] = [];
			this.totalChordsInParts[i] = [];

			var mes = this.parts[i].measures;
			
			for(let j=0; j<mes.length; j++){
				var a = mes[j].analysis;
				var analysis = a.split(' ');

				var c = mes[j].chords;
				var chords = c.split(' ');
				chords = chords.filter((val)=>{return val!=''});

				for(let k=0; k<chords.length; k++){

					let prop:any = {};
					prop.c = chords[k];
					prop.a = analysis[k];
					prop.nb = 0;

					this.analysisPerMeasure[i].push(prop);
				}
			}
			this.totalChordsInParts[i] = this.analysisPerMeasure[i].length;
		}
		this.setSimpifiedAnalysis();
	}



	private setSimpifiedAnalysis(){

		for(let i=0; i<this.parts.length; i++){

			for(let j=0; j<this.analysisPerMeasure[i].length; j++){
				if(this.analysisPerMeasure[i][j].c == undefined  && this.analysisPerMeasure[i][j].a == '')
					delete this.analysisPerMeasure[i][j];
			}
		}

		for(let i=0; i<this.parts.length; i++){

			this.analysisPerMeasure[i] = this.analysisPerMeasure[i].filter((val)=>{
			    return val!=undefined
			});

			
			var newAnalyse = {};
			let uniq = {};

			if(this.analysisPerMeasure[i].length != 0){
				newAnalyse[i] = this.analysisPerMeasure[i].filter((obj)=>{ 
					return !uniq[obj.c] && (uniq[obj.c] = true) 
				});

				this.analysisPerMeasure[i].forEach((val, index)=>{

					for(let j=0; j<newAnalyse[i].length; j++){
						if(val.c == newAnalyse[i][j].c){
							newAnalyse[i][j].nb += 1;
							break;
						}
					}
				});
			}
			else
				newAnalyse[i] = [];

			this.analysisPerMeasure[i] = newAnalyse[i];
		}
	}

	

}
