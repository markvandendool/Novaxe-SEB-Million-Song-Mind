import { Injectable } from '@angular/core';

import abcjs from 'abcjs';
export const ABC: any = abcjs;

@Injectable({
  providedIn: 'root'
})
export class SynthService {

	public synth:any;
	private synthControl:any;

	private audioParams:any;
	private visualObj:any;
	private callback:any;

  constructor() { 
  	// console.log("SYNTH CONSTRUCTOR==============================");
  	this.synthControl = new ABC.synth.SynthController();

    this.synth = new ABC.synth.CreateSynth();

  }

  set_sound(on:boolean): void{

  	this.audioParams.voicesOff=!on;

    let options: {
      // soundFontUrl: "https://paulrosen.github.io/midi-js-soundfonts/FluidR3_GM/" ,
      // soundFontUrl: "https://paulrosen.github.io/midi-js-soundfonts/abcjs/" ,
      // sequenceCallback: function(noteMapTracks, callbackContext) { return noteMapTracks; },
      // callbackContext: this,
      // onEnded: function(callbackContext),
      // pan: [ -0.5, 0.5 ]
    }

  	this.synth.init({ visualObj: this.visualObj, millisecondsPerMeasure: 500,options:options }).then(()=> {

  	  this.synthControl.setTune(this.visualObj, false, this.audioParams).then( ()=> {
  	    // console.log("Audio successfully loaded.")

  	    this.callback();
  	  }).catch(function (error) {
  	    console.warn("Audio problem:", error);
  	  });
  	}).catch(function (error) {
  	  console.warn("Audio problem:", error);
  	});

  }

  init( visualObj, audioParams, callback ) :void{

  	this.audioParams = audioParams;
  	this.visualObj = visualObj;
  	this.callback = callback;

	  this.synth.init({ visualObj: visualObj }).then(()=> {

	    this.synthControl.setTune(visualObj, true, audioParams).then( ()=> {
	      // console.log("Audio successfully loaded.")

	      callback();
	    }).catch(function (error) {
	      console.warn("Audio problem:", error);
	    });
	  }).catch(function (error) {
	    console.warn("Audio problem:", error);
	  });
	
  }

  load( selector, cursorControl, visualOptions){

	  this.synthControl.load( selector, cursorControl, visualOptions );
  }

  play() :void{
  	this.synthControl.play();
  }
  stop(): void{
  	this.synthControl.pause();
  }
}
