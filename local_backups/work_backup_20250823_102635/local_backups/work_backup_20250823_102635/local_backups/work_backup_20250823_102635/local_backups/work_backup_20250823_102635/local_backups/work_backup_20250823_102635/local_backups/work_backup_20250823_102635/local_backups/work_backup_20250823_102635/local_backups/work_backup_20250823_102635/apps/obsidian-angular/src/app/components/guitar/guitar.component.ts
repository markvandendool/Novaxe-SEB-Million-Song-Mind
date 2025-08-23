import { Component, OnInit } from '@angular/core';
import { GuitarService } from './guitar.service';

@Component({
    selector: 'app-guitar',
    templateUrl: './guitar.component.html',
    styleUrls: ['./guitar.component.scss'],
    standalone: false
})
export class GuitarComponent implements OnInit {

	public delay:number = 0;
	public midinote:number=60;
	public bend_factor:number=1;
	public selected_instrument:any;

  constructor( public guit:GuitarService) { }

  ngOnInit() {

  }

 play_note(){
 	console.log("play_note");

 	this.guit.play( this.delay, this.midinote );	

 } 

}
