import { Component, OnInit, ElementRef } from '@angular/core';
import { ExerciseModel } from '@models/exercisemodel/exercisemodel';

@Component({
  selector: 'app-create-fifths-exercise',
  templateUrl: './create-fifths-exercise.component.html',
  styleUrls: ['./create-fifths-exercise.component.scss']
})

export class CreateFifthsExerciseComponent implements OnInit {

	public progressions:Array<Array<Object>>;

  constructor(public elRef:ElementRef, public exo:ExerciseModel) { 
    console.log(this.exo.get_progressions())
  }

  ngOnInit() {
  }


  public addChord(p){

    let fourths = Number(this.elRef.nativeElement.querySelector('#add_fourths_'+p).value);
    let quality = this.elRef.nativeElement.querySelector('#add_quality_'+p).value;
    this.exo.add_chord_in_progression(p,{fourths:fourths,quality:quality});
    this.elRef.nativeElement.querySelector('#add_fourths_'+p).value = undefined;
    this.elRef.nativeElement.querySelector('#add_quality_'+p).value = '';

  }

  public removeChord(p,c){
  	this.exo.remove_chord_in_progression(p,c);
  }

  public addProgression(){
    this.exo.add_progression(); 
  }

  public removeProgression(p){
    this.exo.remove_progression(p);
  }
}
