import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-realnovaxebraid',
  template: '<div class="realnovaxebraid">{{componentName}} - Migrated from React</div>',
  styleUrls: ['./realnovaxebraid.component.scss'],
  standalone: false
})
export class RealNovaxeBraidComponent implements OnInit {
  componentName = 'RealNovaxeBraid';
  
  constructor() { }
  
  ngOnInit(): void {
    console.log('RealNovaxeBraid component initialized');
  }
}
