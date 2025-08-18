import { Injectable } from '@angular/core';

import Soundfont from 'soundfont-player';
declare global {
  var Soundfont:any;
}

@Injectable({
  providedIn: 'root'
})
export class SoundfontService {

  public piano:any;
  public audioCtx:any;

  constructor() { 

    this.audioCtx = new AudioContext();
    Soundfont.instrument(this.audioCtx, 'acoustic_grand_piano').then((piano)=> {
      this.piano = piano;
    });
  }



  playNote(note:string){

    // format: can be 'mp3' or 'ogg'
    // soundfont: can be 'FluidR3_GM' or 'MusyngKite'
    // nameToUrl: a function to convert from instrument names to URL
    // destination: by default Soundfont uses the audioContext.destination but you can override it.
    // gain: the gain (volume) of the player (1 by default)
    // attack: the attack time of the amplitude envelope
    // decay: the decay time of the amplitude envelope
    // sustain: the sustain gain value of the amplitude envelope
    // release: the release time of the amplitude envelope
    // adsr: the amplitude envelope as array of [attack, decay, sustain, release]. It overrides other options.
    // loop: set to true to loop audio buffers
    // notes: an array of the notes to decode. It can be an array of strings with note names or an array of numbers with midi note numbers. This is a performance option: since decoding mp3 is a cpu intensive process, you can limit limit the number of notes you want and reduce the time to load the instrument.
    let time = this.audioCtx.currentTime;
    let duration = { duration: 0.8};
    let options = {};
    this.piano.play(note, time, duration, options);
  }

  playMidiNote(note:number){

    let time = this.audioCtx.currentTime;
    let duration = { duration: 0.8};
    let options = {};
    this.piano.play(note, time, duration, options);
  }

}
