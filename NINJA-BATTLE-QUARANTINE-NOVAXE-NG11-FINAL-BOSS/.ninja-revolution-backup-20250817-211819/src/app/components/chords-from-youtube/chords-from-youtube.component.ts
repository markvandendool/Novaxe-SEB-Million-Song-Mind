
@Component({
  selector: 'app-chords-from-youtube',
  templateUrl: './chords-from-youtube.component.html',
  styleUrls: ['./chords-from-youtube.component.scss']
})
export class ChordsFromYoutubeComponent implements OnInit  {
	parsed_tab:string;
	edit:boolean = false;
	loading:boolean=false;
  link:string='';
  public constructor(public public parsing:ParsingService, public eRef: ElementRef) { }
  public ngOnInit(): void {
		this.parsing.yChords.subscribe((data)=>{this.parsed_tab = data; this.loading=false;}));
  }
  public searchYoutube(l: any) {
  	if(l=="")return;
  	this.loading = true;
  	this.parsed_tab="";
  	this.parsing.searchYoutube(l);
  @HostListener('document:click', ['$event'])
  public clickout(event: any) {
    if(!this.eRef.nativeElement.contains(event.target)) {
      this.edit = false;
    }
}
