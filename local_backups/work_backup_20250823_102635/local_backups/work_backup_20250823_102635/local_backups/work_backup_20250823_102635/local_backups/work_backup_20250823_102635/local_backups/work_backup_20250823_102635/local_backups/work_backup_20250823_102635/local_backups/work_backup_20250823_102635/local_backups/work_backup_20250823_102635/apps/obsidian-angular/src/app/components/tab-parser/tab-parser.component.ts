import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { ParsingService } from '../../services/parsing.service';

@Component({
    selector: 'app-tab-parser',
    templateUrl: './tab-parser.component.html',
    styleUrls: ['./tab-parser.component.scss'],
    standalone: false
})
export class TabParserComponent implements OnInit {

  edit:any ;
  tab:string;
  parsed_tab:string;

  constructor(private parser:ParsingService,private eRef: ElementRef) { }

  ngOnInit() {
    this.edit = false;
  }

  onChange(t) {
  	let res = this.parser.parseTab(t); 
    this.parsed_tab = this.parser.parsedTab_to_abc(res);
   	console.log("res => ",res);
  }

  @HostListener('document:click', ['$event'])
  clickout(event) {
    if(!this.eRef.nativeElement.contains(event.target)) {
      this.edit = false;
    }
  }

}
