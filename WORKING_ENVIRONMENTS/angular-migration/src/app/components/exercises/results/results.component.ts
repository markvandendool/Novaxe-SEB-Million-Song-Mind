import { Component, OnInit, AfterViewInit, OnDestroy, NgZone } from '@angular/core';
import { ExerciseResultsService } from '@services/exercises/exercise_results/exercise-results.service';
import { Router  } from '@angular/router';
import { ExoGenService } from '@services/exercises/exercise_generator/exo-gen.service';
import { Subscription } from 'rxjs';

import * as CanvasJS from '@assets/canvasjs.min.js';
import $ from 'jquery';
import { MidiService } from "@services/midi/midi.service"

import { UserModel } from '@models/usermodel/usermodel';
// declare global {
//   var CanvasJS:any;
// }


@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss']
})
export class ResultsComponent implements OnInit, AfterViewInit{

  public result:number=0;
  private midiNotesTab$:Subscription;
  public counter = 0;
  public animationFrameAnim:any;

  constructor( public results:ExerciseResultsService, private router:Router, private gen:ExoGenService, public midi:MidiService, private zone:NgZone, private user:UserModel ) { }

  ngOnInit(): void {
    // debugger
    console.log("this.results.getResults_chords().length => ",this.results.getResults_chords().length);
    console.log("this.results.getResults_notes().length => ",this.results.getResults_notes().length);

  	if( !this.results.getResults_chords().length && !this.results.getResults_notes().length && !this.results.getResults_rhythm().length) {
      
      this.result = Math.round( Math.random()*100 );
      // this.router.navigate(['select-exercise']);
    } else{

      this.results.compute();
      if(this.results.getResults_rhythm().length) this.result = Math.round(this.results['computed_rhythm'].total_accuracy*100);
      if(this.results.getResults_chords().length) this.result = Math.round(this.results['computed_chords'].total_accuracy*100);

      this.midiNotesTab$ = this.midi.notesTabSubject.subscribe((data)=>{
        if(!data.length)return;
        this.zone.run(()=>{this.restart(); });
      });

    }

  }

  private renderChart(result_obj):void{

    let obj = "computed_rhythm";
    if(this.results.getResults_chords().length) obj = "computed_chords";

    // if(!$("#chartContainer_"+obj).length)return;

    // =========================================

    let data = [];
    for(let res of result_obj){
      let date = Object.keys(res)[0];
      data.push( {x: new Date( Date.parse(date) ), y: res[date]} );
    }
    console.log("data => ",data);

    // data = [
    //   { x: new Date(2017, 0, 3), y: 65 },
    //   { x: new Date(2017, 0, 4), y: 70 },
    //   { x: new Date(2017, 0, 5), y: 71 },
    //   { x: new Date(2017, 0, 6), y: 65 },
    //   { x: new Date(2017, 0, 7), y: 73 },
    //   { x: new Date(2017, 0, 8), y: 96 },
    //   { x: new Date(2017, 0, 9), y: 84 },
    //   { x: new Date(2017, 0, 10), y: 85 },
    //   { x: new Date(2017, 0, 11), y: 86 },
    //   { x: new Date(2017, 0, 12), y: 94 },
    //   { x: new Date(2017, 0, 13), y: 97 },
    //   { x: new Date(2017, 0, 14), y: 86 },
    //   { x: new Date(2017, 0, 15), y: 89 },
    //   { x: new Date(2017, 0, 16), y: 93 }
    // ];

    let chart = this.create_chart( data, this.gen.loaded_exo_params.TEMPLATE );
    chart.render();

    // =========================================



  }

  public ngAfterViewInit(): void {

    if(this.result!=0) this.animateValue(0, this.result, 1000);
    this.autoFocusRestart();

    let level = this.gen.loaded_exo_params.TEMPLATE; //"LEVEL_1_1"
    // let level = "LEVEL_1_1";
    let results = this.user.addResults(level, this.result);
    console.log('results => ',results);
    this.renderChart(results[level]);
  }

  public clearResults():void{
    let level = this.gen.loaded_exo_params.TEMPLATE; //"LEVEL_1_1"
    this.user.clearResults(level);
    let results = this.user.addResults(level, this.result);
    this.renderChart(results[level]);
  }

  private autoFocusRestart():void{

  	// $("#ok_button").focus();	
    if(this.results["computed_rhythm"].total_accuracy*100 < 90 || this.results["computed_chords"].total_accuracy*100<90 ){
     $("#restart_button").focus();
    }else{
     $("#ok_button").focus();
    }
  }

  private ngOnDestroy(): void {  
    this.midiNotesTab$.unsubscribe();
  }

  public navigate(url){
    console.log('ROUTING FROM RESULTS========================')
  	this.router.navigate([url]);
    window.cancelAnimationFrame(this.animationFrameAnim);
  }

  public restart(){
    this.gen.generate();
    setTimeout(()=> this.router.navigate(["exo"],{skipLocationChange:true}) , 100);
  }

  private animateValue(start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      this.counter = Math.floor(progress * (end - start) + start);
      if (progress < 1) {
        this.animationFrameAnim = window.requestAnimationFrame(step);
      }
    };
    this.animationFrameAnim = window.requestAnimationFrame(step);
  }




  private create_chart(data=[], level="DEFAULT"):any{

    var chart = new CanvasJS.Chart("chartContainer_computed_rhythm", {
      animationEnabled: true,
      theme: "light2",
      title:{
        text: "Your progression at "+level.toLowerCase()
      },
      axisX:{
        valueFormatString: "DD MMM",
        crosshair: {
          enabled: true,
          snapToDataPoint: true
        }
      },
      axisY: {
        title: "Score",
        includeZero: true,
        crosshair: {
          enabled: true
        }
      },
      toolTip:{
        shared:true
      },  
      legend:{
        cursor:"pointer",
        verticalAlign: "bottom",
        horizontalAlign: "left",
        dockInsidePlotArea: true,
        // itemclick: togleDataSeries
      },
      data: [{
        type: "line",
        showInLegend: false,
        name: "Score",
        // markerType: "square",
        xValueFormatString: "DD MMM, YYYY",
        color: "#F08080",
        dataPoints: data 
      },
      // {
      //   type: "line",
      //   showInLegend: true,
      //   name: "Unique Visit",
      //   lineDashType: "dash",
      //   dataPoints: [
      //     { x: new Date(2017, 0, 3), y: 510 },
      //     { x: new Date(2017, 0, 4), y: 560 },
      //     { x: new Date(2017, 0, 5), y: 540 },
      //     { x: new Date(2017, 0, 6), y: 558 },
      //     { x: new Date(2017, 0, 7), y: 544 },
      //     { x: new Date(2017, 0, 8), y: 693 },
      //     { x: new Date(2017, 0, 9), y: 657 },
      //     { x: new Date(2017, 0, 10), y: 663 },
      //     { x: new Date(2017, 0, 11), y: 639 },
      //     { x: new Date(2017, 0, 12), y: 673 },
      //     { x: new Date(2017, 0, 13), y: 660 },
      //     { x: new Date(2017, 0, 14), y: 562 },
      //     { x: new Date(2017, 0, 15), y: 643 },
      //     { x: new Date(2017, 0, 16), y: 570 }
      //   ]
      // }
      ]
    });
    return chart;
  } //create_chart
}
