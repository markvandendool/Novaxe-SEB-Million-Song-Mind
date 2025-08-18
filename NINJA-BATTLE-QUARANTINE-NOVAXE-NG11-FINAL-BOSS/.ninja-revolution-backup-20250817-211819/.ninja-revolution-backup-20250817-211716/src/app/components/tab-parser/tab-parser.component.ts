
@Component({
  selector: 'app-tab-parser',
  templateUrl: './tab-parser.component.html',
  styleUrls: ['./tab-parser.component.scss']
})
export class TabParserComponent implements OnInit  {
  edit:any ;
  tab:string;
  parsed_tab:string;
  public constructor(public private parser:ParsingService,private eRef: ElementRef) { }
  public ngOnInit(): void {
    this.edit = false;
  }
  public onChange(t: any) {
  	let res = this.parser.parseTab(t);
    this.parsed_tab = this.parser.parsedTab_to_abc(res);
  @HostListener('document:click', ['$event'])
  public clickout(event: any) {
    if(!this.eRef.nativeElement.contains(event.target)) {
      this.edit = false;
    }
}
