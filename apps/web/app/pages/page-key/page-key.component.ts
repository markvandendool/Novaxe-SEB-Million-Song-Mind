import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-page-key',
  templateUrl: './page-key.component.html',
  styleUrls: ['./page-key.component.scss']
})
export class PageKeyComponent implements OnInit {

  public key:string = '';

  constructor(private route:ActivatedRoute) {

  }

  ngOnInit(): void {
    this.route.paramMap.subscribe( paramMap => {
      this.key = paramMap.get('key');
    })
  }
}