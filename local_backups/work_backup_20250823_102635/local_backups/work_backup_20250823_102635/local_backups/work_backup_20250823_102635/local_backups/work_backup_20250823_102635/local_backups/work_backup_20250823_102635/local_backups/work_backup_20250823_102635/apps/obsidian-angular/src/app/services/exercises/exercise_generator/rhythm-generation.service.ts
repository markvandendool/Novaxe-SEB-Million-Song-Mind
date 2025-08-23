import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RhythmGenerationService {

  constructor() { }













  

  public get_rand_in_rhythm_motives(motives){

    // Sums all probas of input motives
    let total = 0;
    for(let i in motives){
      total+=motives[i].proba;
    }

    let r = Math.random();

    let cheese = [0];
    let cursor = 0;
    let rand_motive;
    for(let i in motives){
      cheese.push(motives[i].proba/total+cursor);
      cursor+=motives[i].proba/total;

      if(r > cheese[cheese.length-2] && r < cursor){
        rand_motive = motives[i];
        break;
      }
    } 

    return rand_motive;
  }












  

  public generate_measure_rythm7(motives, duration=3840){

    let abc_value = {
      whole : '8',
      half : '4',
      quarter : '2',
      eights : '',
      sixteenth : '/2',
      d_whole : '12',
      d_half : '6',
      d_quarter : '3',
      d_eights : '3/2',
      d_sixteenth : '3/4',
    }

    var value_num = {
      d_whole:5760,
      whole:3840,
      d_half:2880,
      half:1920,
      d_quarter:1440,
      quarter:960,
      d_eights:720,
      eights:480,
      d_sixteenth:360,
      sixteenth:240,
    }

   let string = ""; 
   let authorised_motives = JSON.parse(JSON.stringify(motives));
   let rhythm = [];


   let position = 0;
   while(duration > 0){

    // Compose an array of motives that fit in the duration left and are proba > 0.
    let new_authorised_motives = [];
    for(let i =0; i < authorised_motives.length; i++)
      if( authorised_motives[i].duration <= duration && authorised_motives[i].proba > 0){
        new_authorised_motives.push(authorised_motives[i]);
      }

    authorised_motives = new_authorised_motives;

    // Pick a random motive in the composed array.
    let rand_motive = this.get_rand_in_rhythm_motives(new_authorised_motives);

    if(!rand_motive){
      console.warn("no rythmic motive provided, picking default 'whole'.")
      rand_motive = { duration: 3840, name: "whole", proba: 100 };
    }
    string += rand_motive.name+" ";


    let s = rand_motive.name.split(' ');
    for(let j = 0; j < s.length; j++){

      let strong_beat = false;
      if(position%1920 == 0)strong_beat = true;

      let obj = { 
        duration_name: s[j], 
        duration: value_num[ s[j] ], 
        abc_string: abc_value[ s[j] ], 
        position: position, 
        is_rest:false,
        is_strong:strong_beat
      };

      position += obj['duration'];

      rhythm.push(obj);
    }
    duration-=rand_motive.duration;
   }

   return rhythm;
  }

}
