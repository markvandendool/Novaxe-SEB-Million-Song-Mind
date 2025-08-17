import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-braidclassic',
  template: '<div class="braidclassic">{{componentName}} - Migrated from React</div>',
  styleUrls: ['./braidclassic.component.scss'],
  standalone: false
})
export class BraidClassicComponent implements OnInit {
  componentName = 'BraidClassic';
  
  constructor() { }
  
  ngOnInit(): void {
    console.log('BraidClassic component initialized');
  }
}
