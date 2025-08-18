import { Component, OnInit, AfterViewInit, ViewChild, ViewContainerRef, ComponentFactoryResolver } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AbcCheckerComponent } from '@components/exercises/templates/abc-checker/abc-checker.component';

import { ExoGenService } from '@services/exercises/exercise_generator/exo-gen.service';

@Component({
  selector: 'app-page-generator',
  templateUrl: './page-generator.component.html',
  styleUrls: ['./page-generator.component.scss']
})
export class PageGeneratorComponent implements OnInit, AfterViewInit {

  //configuration object that gather every parameter on the page
  config:any = {} 

  tonalities = [];
  public rhythm_section_to_show:string = 'rh';
  public debug_mode = false;
  public template_selected ="DEFAULT";
  public template_options = ["DEFAULT","lvl_1_0","lvl_1_1","lvl_1_2","lvl_1_3","lvl_1_4","lvl_1_5","lvl_1_6","lvl_1_7","lvl_1_8","lvl_1_9","DEBUG"];
  public display_preview = false;
  @ViewChild('viewContainer', {read: ViewContainerRef } ) viewContainer: ViewContainerRef;



  constructor(public gen:ExoGenService, public router: Router, private route: ActivatedRoute, private resolver: ComponentFactoryResolver) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe( params => {

      let callback = ()=>{
        this.setParamsFromUrl(params);
        if(Object.keys(params).length > 0){ // if parameters with the page : jump to exercise 
          if(this.debug_mode) this.preview();
          else var json = this.gen.generate();
          if(params.hasOwnProperty('fastload') && params["fastload"] == 'true') this.router.navigate(['exo'],{skipLocationChange: true });
        } 
      }

      if(params.hasOwnProperty("debug")){
        this.template_selected = "DEBUG";
        this.debug_mode = true;
        this.gen.load_parameters_from_template( "DEBUG", callback );
        return;
      }

      if(params.hasOwnProperty("level")){
        this.gen.load_parameters_from_template( params.level, callback );
        return;
      }else{
        this.gen.load_parameters_from_template( "DEFAULT", callback );
        return;
      }
    });
  }

  public setParamsFromUrl(params){

 
    if(params.hasOwnProperty("tempo")){
      this.gen.loaded_exo_params.global_gen_params.tempo  = Number( params.tempo );
    }

    if(params.hasOwnProperty('level') && params['level']=='FULL_SCORE')
    if(params.hasOwnProperty("score")){
      this.gen.loaded_exo_params["FILE"]  = params['score'] ;
    }else{
      this.gen.loaded_exo_params["FILE"]  = 'rag' ;
      console.warn('No score provided !');
    }

    if(params.hasOwnProperty("ex_type")){
      //get 11000 as [true, true, false, false, false]
      let tab = params["ex_type"].toString().split('').map((x)=>{return Boolean(Number(x))});
      if(tab.length == 3){
        this.gen.loaded_exo_params.exercise_types_selected.reading_untimed=tab[0];
        this.gen.loaded_exo_params.exercise_types_selected.reading_timed=tab[1];
        this.gen.loaded_exo_params.exercise_types_selected.hearing=tab[2];
      }
    }


    if(params.hasOwnProperty("meas_type")){

      //get 11000 as [true, true, false, false, false]
      let tab = params.meas_type.toString().split('').map((x)=>{return Boolean(Number(x))});

      if(tab.length == 5){
        this.gen.loaded_exo_params.measure_types_selected.simple_notes_right_hand=tab[0];
        this.gen.loaded_exo_params.measure_types_selected.simple_notes_left_hand=tab[1];
        this.gen.loaded_exo_params.measure_types_selected.simple_notes_both_hands=tab[2];
        this.gen.loaded_exo_params.measure_types_selected.chords_first_beat_lh_and_notes_rh=tab[3];
        this.gen.loaded_exo_params.measure_types_selected.intervals=tab[4];
      }
    }

  }

  ngAfterViewInit(): void {
    $('#start_button').focus();
  }

  start():any{
    //go_to_exercise_page with info : exercices_json.... and exec
    let json = this.gen.generate();
    console.log('json generated exercise => ',json);
    this.router.navigate(['exo'],{skipLocationChange: true });
  }

  public preview():void{
    this.display_preview = true;
    let json = this.gen.generate({add_instructions:false});
    this.display_in_same_window();
  }


  public load_template(template:string):void{
    console.log("loading template => ",template);
    this.gen.load_parameters_from_template(template);
  }


  public log_template(){
    console.clear();
    console.log('====================================\n');

    console.log(JSON.stringify(this.gen.loaded_exo_params) );

    console.log('\n====================================');

  }

  private display_in_same_window():void{

    this.viewContainer.clear();
    this.gen.json_generated.templates[0].template_type
    let componentFactory = this.resolver.resolveComponentFactory( AbcCheckerComponent );
    let componentRef = this.viewContainer.createComponent(componentFactory);

    (componentRef.instance).receivedData = this.gen.json_generated.templates[0]; //sets data for template

    // triggers change detection in template (otherwise create a bug in midi selector...)
    componentRef.changeDetectorRef.detectChanges();

    setTimeout(()=>{
      $("#templateContainer").scrollTop( $("#abcjs-wrapper").get(0).offsetTop+67 );
    },200);

  }
}
