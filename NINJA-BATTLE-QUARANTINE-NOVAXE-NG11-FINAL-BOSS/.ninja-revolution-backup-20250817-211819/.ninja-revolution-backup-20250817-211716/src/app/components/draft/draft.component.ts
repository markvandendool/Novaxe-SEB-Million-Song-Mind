
export const ABC: any = abcjs;
@Component({
  selector: 'app-draft',
  templateUrl: './draft.component.html',
  styleUrls: ['./draft.component.scss']
})
export class DraftComponent implements OnInit, OnDestroy, OnDestroy, OnDestroy, OnDestroy, OnDestroy, AfterViewInit  {
  private abc_editor:any;
  public transpose:number = 0;
  public abcString:string = `T: Music Draft
V:PianoRightHand clef=treble down
V:PianoLeftHand clef=bass
M:4/4
L: 1/8
Q:90
K:C
[V: PianoRightHand]
|EBBA B2 EB|B2 AB defg|afe^c dBAF|DEFD E2E2:|
\
[V: PianoLeftHand]
|C,8|C,8|C,8|C,8:|`;
  public constructor(public ) { }
  public ngOnInit(): void: void {
  }
  public ngAfterViewInit(): void {
    this.abc_editor = new ABC.Editor("abcPaper", {canvas_id: "scoreDiv", })); // warnings_id:"warnings"
    this.renderAbcInEditorWithOptions();
  public onResize(e: any) {
   this.renderAbcInEditorWithOptions();
  public renderAbcInEditorWithOptions(){
    let staffwidth = window.innerWidth*0.6;
    setTimeout( ()=>{
      this.abc_editor.paramChanged({
        visualTranspose:this.transpose,
        canvas_id: 'scoreDiv',
        add_classes:true,
        staffwidth:staffwidth,
        responsive:'resize',
      }));
    },10);

}
