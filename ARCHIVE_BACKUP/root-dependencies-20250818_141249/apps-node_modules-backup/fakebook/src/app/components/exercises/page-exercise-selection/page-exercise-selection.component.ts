import { Component, OnInit } from '@angular/core';

import { UserModel } from '@models/usermodel/usermodel';

@Component({
  selector: 'app-page-exercise-selection',
  templateUrl: './page-exercise-selection.component.html',
  styleUrls: ['./page-exercise-selection.component.scss']
})
export class PageExerciseSelectionComponent implements OnInit {

	public results:any; //store actual results from cookie

  constructor( private user:UserModel) { 
  	this.results = this.user.getResults();
  }

  ngOnInit(): void {
  }


  public get_score(level:string){
  	if(this.results[level]){
			  var score = this.results[level][this.results[level].length-1][Object.keys(this.results[level][this.results[level].length-1])[0] ] || 0;
	  	return Math.round(score);
    }

  	return 0;
  }

  public get_color(level:string, refEl:any=null){
  	let score = this.get_score(level);

  	if(score <10){

  		$(refEl).addClass('glow_red');
  		return 'red';
  	} else if(score<50){
  		$(refEl).addClass('glow_yellow');
  		return 'yellow';
  	} else if(score<90){
  		$(refEl).addClass('glow_orange');
	  	return 'orange';
  	} 
  	else {
  		$(refEl).addClass('glow_green');
	  	return '#00ff00';
  	}

  }





}
