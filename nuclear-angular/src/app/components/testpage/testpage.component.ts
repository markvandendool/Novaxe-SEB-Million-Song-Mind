import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-testpage',
  templateUrl: './testpage.component.html',
  styleUrls: ['./testpage.component.scss'],
  standalone: false, // SENSEI FIX: Prevent CLI phantom standalone bug
})
export class TestpageComponent implements OnInit {

	private part: any;
	private measure: any;

  public abcChordString: string = "ceg";
  public chordString: string = "c,e,g";

  constructor() { 
  	this.measure = new Subject();
	  this.measure.next(1);  
  }

  measureChanged(m: any) {
    console.log("measureChanged in testpage");
    this.measure.next(m);
  }

  renderChord() {

  }

  ngOnInit() {
  }

}
