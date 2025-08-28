import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Songmodel } from '@models/songmodel/songmodel';
import { Statsmodel } from '@models/statsmodel/statsmodel';

import { SpotifyService } from '@services/spotify/spotify.service';

import * as CanvasJS from '@assets/canvasjs.min.js';
// import $ from 'jquery';

@Component({
    selector: 'app-stats',
    templateUrl: './stats.component.html',
    styleUrls: ['./stats.component.scss'],
    standalone: false
})
export class StatsComponent implements OnInit {

  public selected_score_chord:any = null;
  public partsTonas:Array<string>;
  public analysis:any = {};
  public parts:any;
  public songId:any;
  
  private idAnalysis:string;
  public pitchClass:Array<string> = ['C', 'C#/Db', 'D', 'D#/Eb', 'E', 'F', 'F#/Gb', 'G', 'G#/Ab', 'A', 'A#/Bb', 'B'];
  public tempo:any;
  public matchingKeys:boolean = true;
  public matchingSignatures:boolean = true;
  public duration:any;
  public editorKey:string;
  public editorMode:string;
  public mode:any;
  public key:any;
  public signature:any;
  private popularity:any;
  public release_date:any;
  public album_name:any;
  public explicit:any;

  public songContents:any;
  public songInfo:any;
  public songFeatures:any;
  public songReco:any;

  public songsRecomended = [];

  constructor(public sm:Songmodel, public stm:Statsmodel, private spot: SpotifyService) {
    this.partsTonas = this.stm.partTonalities;
    this.analysis = this.stm.analysisPerMeasure;
    this.parts = this.sm.getParts();
    this.songId = this.sm.getInfos().getSongId();
  }

  ngOnInit(): void {
    this.getSongItems();
  }

  ngAfterViewInit(): void {
    this.nbChordsChart();
    this.partsCharts();
  }



  public nbChordsChart(): void {
    var chordsWithCount = this.chordsCount();
    var analysisWithCount = this.analysisCount(chordsWithCount);

    var data = [];
    data.push({type:"column", dataPoints: chordsWithCount});

    for(let i=0; i<analysisWithCount.length; i++){
      data.push({type:"column", dataPoints: analysisWithCount[i]})
    }

    let chart = new CanvasJS.Chart("chartContainer_nbChords", {
      animationEnabled: true,
      exportEnabled: true,
      zoomEnabled: true, 
      data: data,
      axisX: {
        interval: 1,
        labelFontSize: 16,
        labelTextAlign: "left",
      },
      axisY:{
        suffix: "%",
        labelFontSize: 16,
        titleFontSize: 16,
        gridColor: "#e2e2e2",
      },
      toolTip:{
        content: "{name}: {y} %",
      },
    });
    
    chart.render();
  }



  private partsCharts(): void{

    for(let i=0; i<this.partsTonas.length; i++){

      // CREATE ONE PART
      var dataPoints = [];
      var dataPointsA = [];
      var titlesX = [];
      var data = [];

      var blue = getComputedStyle(document.documentElement).getPropertyValue('--blue_nvx');
      var red = '#5160be';
      var gray = '#bababa';

      for(let j=0; j<this.analysis[i].length; j++) {  

        let y = this.analysis[i][j].nb / this.stm.totalChordsInParts[i] * 100;
        let label = this.analysis[i][j].c;
        let color = gray;
        let labelA = ' ';
        let name = "Unknown analysis for "+this.analysis[i][j].c;

        if(this.analysis[i][j].a != '' && this.analysis[i][j].a != undefined){
          labelA = this.analysis[i][j].a;
          color = red;
          name = this.analysis[i][j].a;
        }

        dataPoints.push({ y: y, label: label, name: label, color: blue});
        dataPointsA.push({ y: y, color: color, label: labelA, name: name});
      }

      // FIRST LINE (CHORDS)
      data.push({
        type:"column", 
        dataPoints: dataPoints,
        axisXIndex: 0, 
        yValueFormatString: "###.00",
        showInLegend: true,
        legendText: "Chords in "+this.partsTonas[i]+" part",
        legendMarkerColor: blue
      });

      // SECOND LINE (ANALYSIS)
      data.push({
        type:"column", 
        dataPoints: dataPointsA,
        axisXIndex: 1, 
        yValueFormatString: "###.00",
        showInLegend: true,
        legendText: "Analysis of "+this.partsTonas[i]+" part",
        legendMarkerColor: red
      });

      let chart = new CanvasJS.Chart("chartContainer_parts"+i, {
        animationEnabled: true,
        exportEnabled: false,
        zoomEnabled: true, 
        legend: {
          horizontalAlign: "center",
          verticalAlign: "bottom",
          fontSize: 15
        },
        title: {
          text: this.sm.getInfos().getTitle()+" - "+this.parts[i].title+" in "+this.partsTonas[i],
          fontSize: 20,
        },
        data: data,
        axisX:[
          {
            lineColor: blue,
            interval: 1,
            labelFontSize: 16,
          }, 
          {
            lineColor: red,
            interval: 1,
            labelFontSize: 16,
          }
        ],
        axisY:{    
          suffix: "%",
          gridColor: "#e2e2e2",
        },
        toolTip:{
          content: "{name}: {y} %",
        },
      });

      chart.render();
    }
  }



  private chordsCount(){

    let dataPoints = [];
    var totalChords = 0;

    for (let i=0; i<this.parts.length; i++) totalChords+=this.stm.totalChordsInParts[i];

    for (let i=0; i<this.stm.chordsInScore.length; i++) {    
      let y = this.stm.chordsCounting[this.stm.chordsInScore[i]] / totalChords * 100;
      let l = this.stm.chordsInScore[i];
      let color = getComputedStyle(document.documentElement).getPropertyValue('--blue_nvx');

      dataPoints.push({ y: y, label: l, x:i, color: color,name: l, yValueFormatString: "###.00",});
    }
    return dataPoints;
  }



  private analysisCount(dataPoints){

    var dataPointsAna = [] ;
    var totalChords = 0;

    for (let i=0; i<this.parts.length; i++) totalChords+=this.stm.totalChordsInParts[i];

    for(let i=0; i<this.partsTonas.length; i++){

      dataPointsAna[i] = [] ;
      
      if(this.partsTonas[i].length != 0){
        for(let j=0; j<this.analysis[i].length; j++) {  

          let y = this.analysis[i][j].nb / totalChords * 100;
          let label = this.analysis[i][j].c;
          let color = getComputedStyle(document.documentElement).getPropertyValue('--yellow_nvx');

          if(this.analysis[i][j].a != '' && this.analysis[i][j].a != undefined){
            
            label = this.analysis[i][j].a;

            // SET COLOR TO ROMAN
            let regexp = /(III|II|IV|VII|VI|V|I)(.*)/mi;
            let res = regexp.exec(label);
            
            if(res[1]=='I') color = "#70E57D";        
            if(res[1]=='II') color = "#5BD16B";
            if(res[1]=='III') color = "#28A745";
            if(res[1]=='IV') color = "#008627";
            if(res[1]=='V') color = "#006703";
            if(res[1]=='VI') color = "#004800";
            if(res[1]=='VII') color = "#002D00";

            // GET INDEX WITH CHORD NAME
            let index = dataPoints.find(element => element.label == this.analysis[i][j].c); 

            // CONSTRUCT DATA IF ANALYSIS
            if(index != '' && index != undefined){
              dataPointsAna[i].push({ 
                y: y, 
                yValueFormatString: "###.00",
                name: this.analysis[i][j].c+" as "+label, 
                color: color, 
                x: index.x, 
                indexLabelPlacement: "outside",
                indexLabel: label,
                indexLabelFontSize: 14,
                indexLabelOrientation: "vertical",
                indexLabelFontWeight: "bold",
              });
            } 
          }
          // CONSTRUCT DATA IF !ANALYSIS
          else{
            for(let k=0; k<this.stm.chordsInScore.length; k++){

              let index = dataPoints.find(element => element.label == this.analysis[i][j].c);

              if(index != '' && index != undefined){
                dataPointsAna[i].push({ 
                  y: this.stm.chordsCounting[this.analysis[i][j].c] / totalChords * 100, 
                  yValueFormatString: "###.00",
                  name: "Unknown analysis for "+this.analysis[i][j].c, 
                  color: "#bababa",
                  x: index.x, 
                });
              }
            }
          }
        }
      }
    }

    // REMOVE EMPTY ANALYSIS DATA
    for(let i=0; i<dataPointsAna.length; i++){
      if(dataPointsAna[i].length == 0)
        delete dataPointsAna[i];
    }
    
    dataPointsAna = dataPointsAna.filter((el) => {
      return el !== null && typeof el !== 'undefined';
    });

    return this.removeDoubles(dataPointsAna);
  }



  private removeDoubles(dataPointsAna){

    var dataPointsAnaOk = [];
    var dataPointsAnaUnique = [];

    // CONSTRUCT SIMPLE STRUCTURE
    for(let i=0; i<dataPointsAna.length; i++){
      for(let j=0; j<dataPointsAna[i].length; j++){
          dataPointsAnaOk.push(dataPointsAna[i][j]);
      }
    }

    // REMOVE DOUBLES IN SIMPLE ARRAY
    var uniqueDataPoints = dataPointsAnaOk.reduce((acc, current) => {
      var found = acc.find(item => item.name === current.name && item.x === current.x);
      if (!found)
        return acc.concat([current]);
      else {
        if(!current.name.includes('Unknown analysis'))
          found.y += current.y;
        return acc;
      }
    }, []);

    // RECONSTRUCT COMPLEX STRUCTURE
    for(let i=0; i<dataPointsAna.length; i++){
      dataPointsAnaUnique[i] = [] ;
      for(let j=0; j<uniqueDataPoints.length; j++){
        if(dataPointsAna[i].includes(uniqueDataPoints[j])){
          dataPointsAnaUnique[i].push(uniqueDataPoints[j]);
        }
      }
    }
    return dataPointsAnaUnique;
  }

  public analyse(){
    console.log('analyse');

    this.sm.analyse_part();
    this.sm.analyseScore();

    
    this.partsTonas = this.stm.partTonalities;
    this.stm.chordsInScore = Object.keys(this.sm.getChordsInScore());
    this.stm.nbChordsInScore();
    this.stm.computeAnalysis();
    this.analysis = this.stm.analysisPerMeasure;
    this.parts = this.sm.getParts();

    // this.stm.compute(this.sm);

    console.log('partsTonas :',this.partsTonas);
    console.log('analysis :',this.analysis);
    console.log('parts :',this.parts);


    this.nbChordsChart();
    this.partsCharts();
  }

  //////////////////////////////////////////////// SPOTIFY API PART //////////////////////////////////////////////
  private getSongItems(){

    var title = this.sm.getInfos().getTitle();
    var artist = this.sm.getInfos().getArtist();
    var album = this.sm.getInfos().getAlbum();
    var comp = 'stats';

    this.spot.getItems({title:title, artist:artist, album:album, comp:comp})
      .subscribe(
        data => {
          this.songInfo = data;
          this.idAnalysis = data.tracks.items[0].id;

          this.getSongInfos();
        });
  }


  private getSongFeatures(){
    this.spot.getFeatures({id:this.idAnalysis})
      .subscribe(
        data => {
          this.songFeatures = data;
          this.tempo = Math.round(this.songFeatures.tempo);
          this.duration = this.msToTime(this.songFeatures.duration_ms);
          this.mode = this.songFeatures.mode;
          this.key = this.songFeatures.key;
          this.signature = this.songFeatures.time_signature;

          this.compareKeys();
          this.compareSignatures();

          this.analyseChart();

          this.getSongReco();
        });
  }

  private getSongInfos(){
    this.spot.getInfos({id:this.idAnalysis})
      .subscribe(
        data => {
          this.songContents = data;
          this.popularity = this.songContents.popularity;
          this.release_date = this.songContents.album.release_date;
          this.album_name = this.songContents.album.name;
          this. explicit = this.songContents.explicit;

          this.getSongFeatures();
        });
  }


  private getSongReco(){

    this.spot.getReco({key:this.key, mode:this.mode, bpm:this.tempo, id:this.idAnalysis})
      .subscribe(
        data => {
          this.songReco = data;

          for(let i=0; i<this.songReco.tracks.length; i++){

            let s_title = this.songReco.tracks[i].name.toLowerCase();
            let s_artist = this.songReco.tracks[i].artists[0].name.toLowerCase();

            if(!s_title.includes(this.sm.getInfos().getTitle().toLowerCase()) && !s_artist.includes(this.sm.getInfos().getArtist().toLowerCase())){

              var reco_title = this.songReco.tracks[i].name;
              var reco_artist = this.songReco.tracks[i].artists[0].name;
              var reco_album = this.songReco.tracks[i].album.name;

              var reco_image = this.songReco.tracks[i].album.images[0].url;

              var reco_id = this.songReco.tracks[i].id;

              var reco = {
                title:reco_title, 
                artist:reco_artist, 
                album:reco_album,
                image:reco_image
              };
              // debugger
              this.songsRecomended.push(reco);

              this.spot.getFeatures({id:reco_id})
                .subscribe(
                  data => {
                    this.songsRecomended[i].key = data.key;
                    this.songsRecomended[i].mode = data.mode;
                    this.songsRecomended[i].tempo = Math.round(data.tempo);
                    this.songsRecomended[i].duration = this.msToTime(data.duration_ms);
                  }
                );
            }
          }
        }
      );
  }


  private msToTime(millis) {
    var minutes = Math.floor(millis / 60000);
    var seconds = ((millis % 60000) / 1000).toFixed(0) as any;

    return minutes+':'+((seconds < 10) ? "0" : "")+seconds;
  }


  private compareKeys(){

    var c = this.sm.getInfos().getTonality();
    var k = this.pitchClass[this.songFeatures.key];

    var regex = /([A-G][b#]{0,2})(.*)/;

    let chord = c.split('/')[0];
    let n = chord.match(regex);

    let tonic = n[1];
    let mode = n[2];

    this.editorKey = tonic;
    (mode=='') ? this.editorMode = 'Major' : this.editorMode = 'Minor';

    if( !k.includes(tonic) || (k.includes(tonic+'#') || k.includes(tonic+'b')) || (this.songFeatures.mode==1 && mode!='') )
      this.matchingKeys = false;

  }


  private compareSignatures(){
    var s = this.sm.getInfos().getSignature().charAt(0);

    if(Number(s) != this.songFeatures.time_signature)
      this.matchingSignatures = false;
  }


  public analyseChart(): void {
    var chart = new CanvasJS.Chart("chartContainer_pop", {
      exportEnabled: false,
      animationEnabled: true,
      title: {
        text: this.popularity==0 ? '0' : this.popularity,
        fontSize: 20,
        verticalAlign: "center",
        padding: {
          top: 7,
        },
      },
      toolTip:{
        enabled: false,
        animationEnabled: false
      },
      data: [{
        type: "doughnut",
        startAngle: 270,
        dataPoints: [
          { y: this.popularity, color: "#28A745"},
          { y: 100-this.popularity, color: "#ffffff"}
        ]
      }]
    });

    chart.render(); 

    var chart = new CanvasJS.Chart("chartContainer_dance", {
      exportEnabled: false,
      animationEnabled: true,
      title: {
        text: Math.round(this.songFeatures.danceability*100)==0 ? '0' : Math.round(this.songFeatures.danceability*100),
        fontSize: 20,
        verticalAlign: "center",
        padding: {
          top: 7,
        },
      },
      toolTip:{
        enabled: false,
        animationEnabled: false
      },
      data: [{
        type: "doughnut",
        startAngle: 270,
        dataPoints: [
          { y: this.songFeatures.danceability*100, color: "#28A745"},
          { y: 100-(this.songFeatures.danceability*100), color: "#ffffff"}
        ]
      }]
    });

    chart.render(); 

    var chart = new CanvasJS.Chart("chartContainer_energy", {
      exportEnabled: false,
      animationEnabled: true,
      title: {
        text: Math.round(this.songFeatures.energy*100)==0 ? '0' : Math.round(this.songFeatures.energy*100),
        fontSize: 20,
        verticalAlign: "center",
        padding: {
          top: 7,
        },
      },
      toolTip:{
        enabled: false,
        animationEnabled: false
      },
      data: [{
        type: "doughnut",
        startAngle: 270,
        dataPoints: [
          { y: this.songFeatures.energy*100, color: "#28A745"},
          { y: 100-(this.songFeatures.energy*100), color: "#ffffff"}
        ]
      }]
    });

    chart.render(); 

    var chart = new CanvasJS.Chart("chartContainer_loud", {
      exportEnabled: false,
      animationEnabled: true,
      title: {
        text: Math.round(this.songFeatures.loudness)==0 ? '0' : Math.round(this.songFeatures.loudness)+'dB',
        fontSize: 20,
        verticalAlign: "center",
        padding: {
          top: 7,
        },
      },
      toolTip:{
        enabled: false,
        animationEnabled: false
      },
      data: [{
        type: "doughnut",
        startAngle: 270,
        dataPoints: [
          { y: this.songFeatures.loudness, color: "#28A745"},
          { y: (-66)-(this.songFeatures.loudness), color: "#ffffff"}
        ]
      }]
    });

    chart.render(); 

    var chart = new CanvasJS.Chart("chartContainer_speech", {
      exportEnabled: false,
      animationEnabled: true,
      title: {
        text: Math.round(this.songFeatures.speechiness*100)==0 ? '0' : Math.round(this.songFeatures.speechiness*100),
        fontSize: 20,
        verticalAlign: "center",
        padding: {
          top: 7,
        },
      },
      toolTip:{
        enabled: false,
        animationEnabled: false
      },
      data: [{
        type: "doughnut",
        startAngle: 270,
        dataPoints: [
          { y: this.songFeatures.speechiness*100, color: "#28A745"},
          { y: 100-(this.songFeatures.speechiness*100), color: "#ffffff"}
        ]
      }]
    });

    chart.render(); 

    var chart = new CanvasJS.Chart("chartContainer_acoustic", {
      exportEnabled: false,
      animationEnabled: true,
      title: {
        text: Math.round(this.songFeatures.acousticness*100)==0 ? '0' : Math.round(this.songFeatures.acousticness*100),
        fontSize: 20,
        verticalAlign: "center",
        padding: {
          top: 7,
        },
      },
      toolTip:{
        enabled: false,
        animationEnabled: false
      },
      data: [{
        type: "doughnut",
        startAngle: 270,
        dataPoints: [
          { y: this.songFeatures.acousticness*100, color: "#28A745"},
          { y: 100-(this.songFeatures.acousticness*100), color: "#ffffff"}
        ]
      }]
    });

    chart.render(); 

    var chart = new CanvasJS.Chart("chartContainer_instru", {
      exportEnabled: false,
      animationEnabled: true,
      title: {
        text: Math.round(this.songFeatures.instrumentalness*100)==0 ? '0' : Math.round(this.songFeatures.instrumentalness*100),
        fontSize: 20,
        verticalAlign: "center",
        padding: {
          top: 7,
        },
      },
      toolTip:{
        enabled: false,
        animationEnabled: false
      },
      data: [{
        type: "doughnut",
        startAngle: 270,
        dataPoints: [
          { y: this.songFeatures.instrumentalness*100, color: "#28A745"},
          { y: 100-(this.songFeatures.instrumentalness*100), color: "#ffffff"}
        ]
      }]
    });

    chart.render(); 

    var chart = new CanvasJS.Chart("chartContainer_live", {
      exportEnabled: false,
      animationEnabled: true,
      title: {
        text: Math.round(this.songFeatures.liveness*100)==0 ? '0' : Math.round(this.songFeatures.liveness*100),
        fontSize: 20,
        verticalAlign: "center",
        padding: {
          top: 7,
        },
      },
      toolTip:{
        enabled: false,
        animationEnabled: false
      },
      data: [{
        type: "doughnut",
        startAngle: 270,
        dataPoints: [
          { y: this.songFeatures.liveness*100, color: "#28A745"},
          { y: 100-(this.songFeatures.liveness*100), color: "#ffffff"}
        ]
      }]
    });

    chart.render(); 

    var chart = new CanvasJS.Chart("chartContainer_valence", {
      exportEnabled: false,
      animationEnabled: true,
      title: {
        text: Math.round(this.songFeatures.valence*100)==0 ? '0' : Math.round(this.songFeatures.valence*100),
        fontSize: 20,
        verticalAlign: "center",
        padding: {
          top: 7,
        },
      },
      toolTip:{
        enabled: false,
        animationEnabled: false
      },
      data: [{
        type: "doughnut",
        startAngle: 270,
        dataPoints: [
          { y: this.songFeatures.valence*100, color: "#28A745"},
          { y: 100-(this.songFeatures.valence*100), color: "#ffffff"}
        ]
      }]
    });

    chart.render(); 

  }

  private capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }


}
