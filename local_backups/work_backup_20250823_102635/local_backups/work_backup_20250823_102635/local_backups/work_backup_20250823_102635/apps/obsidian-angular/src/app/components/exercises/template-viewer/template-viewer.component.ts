import { Component, OnInit, ComponentFactoryResolver, ViewChild, ViewContainerRef } from '@angular/core';
import { Router  } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

import { ExoGenService } from '@services/exercises/exercise_generator/exo-gen.service';
import { ExerciseResultsService } from '@services/exercises/exercise_results/exercise-results.service';

import { ChordComponent } from '@components/exercises/templates/chord/chord.component';
import { CountdownComponent } from '@components/exercises/templates/countdown/countdown.component';
import { InstrLvl1Component } from '@components/exercises/templates/instr-lvl1/instr-lvl1.component';
import { NotesComponent } from '@components/exercises/templates/notes/notes.component';
import { MixedTemplateComponent } from '@components/exercises/templates/mixed-template/mixed-template.component';
import { ExerciceRythmComponent } from '@components/exercises/templates/rhythm/exercice-rythm.component';
import { AbcCheckerComponent } from '@components/exercises/templates/abc-checker/abc-checker.component';
import { AbcCheckerFullScoreComponent } from '@components/exercises/templates/abc-checker-full-score/abc-checker-full-score.component';
import { AbcHearingComponent } from '@components/exercises/templates/abc-hearing/abc-hearing.component';

@Component({
    selector: 'app-template-viewer',
    templateUrl: './template-viewer.component.html',
    styleUrls: ['./template-viewer.component.scss'],
    standalone: false
})

export class TemplateViewerComponent implements OnInit {

  @ViewChild('viewContainer', {read: ViewContainerRef } ) viewContainer: ViewContainerRef;
  componentFactory:any;
  componentRef:any;

  template_number:number = 0;

  constructor( private resolver: ComponentFactoryResolver, public gen: ExoGenService, private res:ExerciseResultsService, private router:Router ) {

    console.log('Constructor');
  }

  ngOnInit(): void {
    console.log('init');
  }

  ngAfterViewInit(): void {

    this.res.reset();
    //pass the generation parameters to response service
    this.res.exo = this.gen.json_generated.exo_parameters;
    console.log('this.gen.json_generated => ',this.gen.json_generated);

    //and go for the first template
    this.next_template();
  }

  next_template(): void {
    console.log("SOMEONE'S ASKING FOR next_template=============");

    //if finished all templates navigates to exercices
    if(this.template_number > this.gen.json_generated.templates.length-1){
      console.log("NO MORE TEMPLATES TO SHOW : ROUTING TO RESULTS ======================");
      this.router.navigate(['results'],{skipLocationChange:true}); 
      return;
    }

    //else create and display the next template.
    this.viewContainer.clear();
    switch(this.gen.json_generated.templates[this.template_number].template_type){
      case "template_instr_lvl1":
        this.componentFactory = this.resolver.resolveComponentFactory( InstrLvl1Component );
        break;
      case "template_countdown":
        this.componentFactory = this.resolver.resolveComponentFactory( CountdownComponent );
        break;
      case "reading_timed":
        this.componentFactory = this.resolver.resolveComponentFactory( AbcCheckerComponent );
        break;
      case "reading_untimed":
        this.componentFactory = this.resolver.resolveComponentFactory( AbcCheckerComponent );
        break;
      case "full_score":
        this.componentFactory = this.resolver.resolveComponentFactory( AbcCheckerFullScoreComponent );
        break;
      case "hearing":
        this.componentFactory = this.resolver.resolveComponentFactory( AbcHearingComponent );
        break;
      default :
        debugger
      break;

    }

    this.componentRef = this.viewContainer.createComponent(this.componentFactory);

    (this.componentRef.instance).receivedData = this.gen.json_generated.templates[this.template_number]; //sets data for template

    // triggers change detection in template (otherwise create a bug in midi selector...)
    this.componentRef.changeDetectorRef.detectChanges();

    //subscribe to when this new template will be over 
    (this.componentRef.instance).askNext.subscribe( this.animate_before_next.bind(this) );
  }


  private animate_before_next(event):void{
      console.log("asked for next template with event => ",event);

      (this.componentRef.instance).askNext.unsubscribe();
      // event is a bool with true if answer is correct.
      // (this.componentRef.instance).answerJson.unsubscribe();
      // console.log(event)
      if(!event){ //IF REPONSE IS FALSE 
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
            console.log('animate red')
            $("#templateContainer").css("opacity","1");
            $("#templateContainer").css("height","content");
            $("#templateContainer").css("border-top-color","black");
            $("#templateContainer").css("border-bottom-color","black");

            $("#templateContainer").animate({height:"toggle"},100,()=>{
              $("#templateContainer").css("display","block");
            });
          })
      }else{
        $("#templateContainer").css("border-top-color","green");
        $("#templateContainer").css("border-bottom-color","green");
        $("#templateContainer").animate({
            opacity: 0.25,
            // left: "+=50",
            height: "toggle"
          }, 200, ()=>{
              // Animation complete.
              this.template_number++;
              this.next_template();
              console.log('animate green')
              $("#templateContainer").css("opacity","1");
              $("#templateContainer").css("height","content");
              $("#templateContainer").css("border-top-color","black");
              $("#templateContainer").css("border-bottom-color","black");
              $("#templateContainer").animate({height:"toggle"},100,()=>{
                $("#templateContainer").css("display","block");
            });
          })
      }
    }

    public debug(left,right):void{

      (this.componentRef.instance).debug_fct(left,right);
    }

}
