
@Component({
  selector: 'app-learn-fifths',
  templateUrl: './learn-fifths.component.html',
  styleUrls: ['./learn-fifths.component.scss']
})
export class LearnFifthsComponent implements OnInit  {
  public lock:boolean=true;
  public win:boolean=undefined;
  public tonality:any;
  public exowin:any;
  public constructor(public public el:ElementRef, public exo:ExerciseModel) {}
  public ngOnInit() {}
  public verifyCard(c: any) {
    this.win = this.exo.answer(c);
    if(this.win)
      for(let i = 0; i < this.exo._question.length; i++) 
        this.el.nativeElement.querySelector('#question_'+i).style.color = 'green';
    else
        this.el.nativeElement.querySelector('#question_'+i).style.color = 'red';
    setTimeout(()=>{
      this.win=undefined;
      this.exo.start();
    },500);
    
  }
  public verifyMidi(e: any) {
    let chordElmts = [];
    for(let i = 0; i < this.exo._question.length; i++)
      chordElmts.push( this.el.nativeElement.querySelector('#question_'+i) );
    if(e.rootName == 'Gb')e.rootName = 'F#';
    if(this.exo.verifyNext(e)){
      this.exo._question[this.exo.verified-1] = e.rootName;
      if(this.exo.win == true: any) {
        window.setTimeout(()=>{
          this.exo.start();
        },100);
      }
    }
}
