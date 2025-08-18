import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-page-author',
  templateUrl: './page-author.component.html',
  styleUrls: ['./page-author.component.scss']
})
export class PageAuthorComponent implements OnInit {

  public author:string = '';

  constructor(private route:ActivatedRoute) {

  }

  ngOnInit(): void {
    this.route.paramMap.subscribe( paramMap => {
      this.author = paramMap.get('author');
    })
  }
}