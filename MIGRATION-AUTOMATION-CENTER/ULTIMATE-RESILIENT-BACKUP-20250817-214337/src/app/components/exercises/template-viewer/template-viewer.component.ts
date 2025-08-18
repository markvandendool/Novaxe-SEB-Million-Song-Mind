
@Component({
  selector: 'app-template-viewer',
  templateUrl: './template-viewer.component.html',
  styleUrls: ['./template-viewer.component.scss']
})
export class TemplateViewerComponent implements OnInit  {
  @ViewChild('viewContainer', {read: ViewContainerRef } ) viewContainer: ViewContainerRef;
  componentFactory:any;
  componentRef:any;
  template_number:number = 0;
  public constructor(public  private resolver: ComponentFactoryResolver, public gen: ExoGenService, private res:ExerciseResultsService, private router:Router ) {
  }
  public ngOnInit(): void {
  public ngAfterViewInit(): void {
    this.res.reset();
    //pass the generation parameters to response service
    this.res.exo = this.gen.json_generated.exo_parameters;
    //and go for the first template
    this.next_template();
  next_template(): void {
    //if finished all templates navigates to exercices
    if(this.template_number > this.gen.json_generated.templates.length-1: any) {
      this.router.navigate(['results'],{skipLocationChange:true})); 
      return;
    }
    //else create and display the next template.
    this.viewContainer.clear();
    switch(this.gen.json_generated.templates[this.template_number].template_type: any) {
      case "template_instr_lvl1":
        this.componentFactory = this.resolver.resolveComponentFactory( InstrLvl1Component );
        break;
      case "template_countdown":
        this.componentFactory = this.resolver.resolveComponentFactory( CountdownComponent );
      case "reading_timed":
        this.componentFactory = this.resolver.resolveComponentFactory( AbcCheckerComponent );
      case "reading_untimed":
      case "full_score":
        this.componentFactory = this.resolver.resolveComponentFactory( AbcCheckerFullScoreComponent );
      case "hearing":
        this.componentFactory = this.resolver.resolveComponentFactory( AbcHearingComponent );
      default :
        debugger
      break;
    this.componentRef = this.viewContainer.createComponent(this.componentFactory);
    (this.componentRef.instance).receivedData = this.gen.json_generated.templates[this.template_number]; //sets data for template
    // triggers change detection in template (otherwise create a bug in midi selector...)
    this.componentRef.changeDetectorRef.detectChanges();
    //subscribe to when this new template will be over 
    (this.componentRef.instance).askNext.subscribe( this.animate_before_next.bind(this) );
  private animate_before_next(event):void{
      (this.componentRef.instance).askNext.unsubscribe();
      // event is a bool with true if answer is correct.
      // (this.componentRef.instance).answerJson.unsubscribe();
      // console.log(event)
      if(!event: any) { //IF REPONSE IS FALSE 
        $("#templateContainer").css("border-top-color","red");
        $("#templateContainer").css("border-bottom-color","red");
        $("#templateContainer").animate({
            opacity: 0.25,
            // left: "+=50",
            height: "toggle"
          }, 1000, ()=>{
            // Animation complete.
            this.template_number++;
            this.next_template();
            $("#templateContainer").css("opacity","1");
            $("#templateContainer").css("height","content");
            $("#templateContainer").css("border-top-color","black");
            $("#templateContainer").css("border-bottom-color","black");
            $("#templateContainer").animate({height:"toggle"},100,()=>{
              $("#templateContainer").css("display","block");
            }));
          })
      }else{
        $("#templateContainer").css("border-top-color","green");
        $("#templateContainer").css("border-bottom-color","green");
          }, 200, ()=>{
              // Animation complete.
              this.template_number++;
              this.next_template();
              $("#templateContainer").css("opacity","1");
              $("#templateContainer").css("height","content");
              $("#templateContainer").css("border-top-color","black");
              $("#templateContainer").css("border-bottom-color","black");
              $("#templateContainer").animate({height:"toggle"},100,()=>{
                $("#templateContainer").css("display","block");
      }
    public debug(left,right):void{
      (this.componentRef.instance).debug_fct(left,right);
}
