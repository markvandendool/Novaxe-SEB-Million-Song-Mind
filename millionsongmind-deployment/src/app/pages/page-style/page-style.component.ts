import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-page-style',
  templateUrl: './page-style.component.html',
  styleUrls: ['./page-style.component.scss']
})
export class PageStyleComponent implements OnInit {

  public style:string = '';

  constructor(private route:ActivatedRoute) {

  }

  ngOnInit(): void {
    this.route.paramMap.subscribe( paramMap => {
      this.style = paramMap.get('style');
    })
  }
}