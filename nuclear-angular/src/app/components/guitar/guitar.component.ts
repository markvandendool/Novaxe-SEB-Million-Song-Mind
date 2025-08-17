import { Component, OnInit } from '@angular/core';
import { GuitarService } from '@services/guitar/guitar.service';

@Component({
  selector: 'app-guitar',
  templateUrl: './guitar.component.html',
  styleUrls: ['./guitar.component.scss']
})
export class GuitarComponent implements OnInit {

  public delay: number = 0;
  public midinote: number = 60;
  public bend_factor: number = 1;
  public selected_instrument: any;

  constructor(public guit: GuitarService) { }

  ngOnInit(): void {

  }

  play_note(): void {
    console.log("play_note");

    this.guit.play(this.delay, this.midinote);

  }

}
