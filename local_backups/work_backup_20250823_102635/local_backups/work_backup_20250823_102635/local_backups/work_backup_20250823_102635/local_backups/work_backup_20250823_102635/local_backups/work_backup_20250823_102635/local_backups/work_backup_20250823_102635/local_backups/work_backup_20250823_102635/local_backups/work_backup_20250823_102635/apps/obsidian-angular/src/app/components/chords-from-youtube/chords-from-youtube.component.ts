import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { ParsingService } from '../../services/parsing.service';

@Component({
    selector: 'app-chords-from-youtube',
    templateUrl: './chords-from-youtube.component.html',
    styleUrls: ['./chords-from-youtube.component.scss'],
    standalone: false
})
export class ChordsFromYoutubeComponent implements OnInit {

	parsed_tab:string;
	edit:boolean = false;
	loading:boolean=false;
  link:string='';

  constructor(public parsing:ParsingService, public eRef: ElementRef) { }

  ngOnInit() {
		this.parsing.yChords.subscribe((data)=>{this.parsed_tab = data; this.loading=false;});
  }

  searchYoutube(l){
  	if(l=="")return;
  	this.loading = true;
  	this.parsed_tab="";
  	this.parsing.searchYoutube(l);
  }

  @HostListener('document:click', ['$event'])
  clickout(event) {
    if(!this.eRef.nativeElement.contains(event.target)) {
      this.edit = false;
    }
  }
}
