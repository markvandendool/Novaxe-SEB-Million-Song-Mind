
@Component({
  selector: 'app-create-fifths-exercise',
  templateUrl: './create-fifths-exercise.component.html',
  styleUrls: ['./create-fifths-exercise.component.scss']
})
export class CreateFifthsExerciseComponent implements OnInit  {
	public progressions:Array<Array<Object>>;
  public constructor(public public elRef:ElementRef, public exo:ExerciseModel) {
  }
  public ngOnInit(): void {
  public addChord(p: any) {
    let fourths = Number(this.elRef.nativeElement.querySelector('#add_fourths_'+p).value);
    let quality = this.elRef.nativeElement.querySelector('#add_quality_'+p).value;
    this.exo.add_chord_in_progression(p,{fourths:fourths,quality:quality}));
    this.elRef.nativeElement.querySelector('#add_fourths_'+p).value = undefined;
    this.elRef.nativeElement.querySelector('#add_quality_'+p).value = '';
  public removeChord(p,c: any) {
  	this.exo.remove_chord_in_progression(p,c);
  public addProgression(){
    this.exo.add_progression();
  public removeProgression(p: any) {
    this.exo.remove_progression(p);
}
