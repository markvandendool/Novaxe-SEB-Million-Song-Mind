import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-page-album',
  templateUrl: './page-album.component.html',
  styleUrls: ['./page-album.component.scss'],
  standalone: false
})
export class PageAlbumComponent implements OnInit {

  public album:string = '';

  constructor(private route:ActivatedRoute) {

  }

  ngOnInit(): void {
    this.route.paramMap.subscribe( paramMap => {
      this.album = paramMap.get('album') || 'unknown';
    })
  }
}
