import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: false, // SENSEI FIX: Prevent CLI phantom standalone bug
})
export class HomeComponent implements OnInit {

  public appName: string = 'Novaxe SEB - Million Song Mind';
  public version: string = 'Angular 20.1.7';

  constructor() { }

  ngOnInit(): void {
    console.log('🎯 HomeComponent initialized (migrated from 15 lines)');
  }

}
