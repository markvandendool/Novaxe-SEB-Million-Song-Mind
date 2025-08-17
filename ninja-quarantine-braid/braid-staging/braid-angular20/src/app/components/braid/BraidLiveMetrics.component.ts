import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-braidlivemetrics',
  template: '<div class="braidlivemetrics">{{componentName}} - Migrated from React</div>',
  styleUrls: ['./braidlivemetrics.component.scss'],
  standalone: false
})
export class BraidLiveMetricsComponent implements OnInit {
  componentName = 'BraidLiveMetrics';
  
  constructor() { }
  
  ngOnInit(): void {
    console.log('BraidLiveMetrics component initialized');
  }
}
