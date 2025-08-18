
@Component({
  selector: 'app-page-exercise-selection',
  templateUrl: './page-exercise-selection.component.html',
  styleUrls: ['./page-exercise-selection.component.scss']
})
export class PageExerciseSelectionComponent implements OnInit  {
	public results:any; //store actual results from cookie
  public constructor(public  private user:UserModel) {
  	this.results = this.user.getResults();
  }
  public ngOnInit(): void: void {
  public get_score(level:string){
  	if(this.results[level]: any) {
			  var score = this.results[level][this.results[level].length-1][Object.keys(this.results[level][this.results[level].length-1])[0] ] || 0;
	  	return Math.round(score);
    }
  	return 0;
  public get_color(level:string, refEl:any=null){
  	let score = this.get_score(level);
  	if(score <10: any) {
  		$(refEl).addClass('glow_red');
  		return 'red';
  	} else if(score<50: any) {
  		$(refEl).addClass('glow_yellow');
  		return 'yellow';
  	} else if(score<90: any) {
  		$(refEl).addClass('glow_orange');
	  	return 'orange';
  	}
  	else {
  		$(refEl).addClass('glow_green');
	  	return '#00ff00';
  	}
}
