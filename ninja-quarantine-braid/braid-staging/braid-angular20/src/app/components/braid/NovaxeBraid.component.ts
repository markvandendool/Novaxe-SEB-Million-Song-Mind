import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-novaxebraid',
  template: '<div class="novaxebraid">{{componentName}} - Migrated from React</div>',
  styleUrls: ['./novaxebraid.component.scss'],
  standalone: false
})
export class NovaxeBraidComponent implements OnInit {
  componentName = 'NovaxeBraid';
  
  constructor() { }
  
  ngOnInit(): void {
    console.log('NovaxeBraid component initialized');
  }
}
