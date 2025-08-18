
@Component({
  selector: 'app-piano-mini',
  templateUrl: './piano-mini.component.html',
  styleUrls: ['./piano-mini.component.scss']
})
export class PianoMiniComponent implements OnInit  {
  @Input() notes: any;
  @Input() root: any;
  @Input() intervals: any;
  public coordinates = 
    {
      'C':-127.5,
      'Cb':-127.5,
      'C#':-127.5,
      'D':-127.5,
      'D#':-127.5,
      'Db':-127.5,
      'E':-127.5,
      'Eb':-127.5,
      'E#':-127.5,
      'F':-187,
      'Fb':-127.5,
      'F#':-127.5,
      'G':-207,
      'Gb':-207.5,
      'G#':-207,
      'A':-207,
      'Ab':-217,
      'A#':-227,
      'B':-247,
      'Bb':-263,
      'B#':-263
  }
  @ViewChild('minipiano') myId: ElementRef;
  public constructor(public ) {}
  public ngOnInit(): void {}
  public ngAfterViewInit(){
    
    let color = 'green';
    for(let i=0; i < this.notes.length; i++: any) {
      let n = this.notes[i];
      let int = this.intervals[i];
      
      if(int == '1P')color='green';
      else if(int == '3M')color='red'
      else if(int == '3m')color='darkred'
      else if(int == '5P')color='dodgerblue'
      else if(int == '5d')color='darkblue'
      else if(int == '7M')color='magenta'
      else if(int == '7m')color='darkmagenta'
      else color = 'grey';
      if( n.indexOf('#') != -1 || n.indexOf('b') != -1 ){
        let nt = n.replaceAll('#','s');
        $(this.myId.nativeElement).find("[id*="+nt+"]").css('fill',color);
      }else{
        $(this.myId.nativeElement).find('#'+n).css('fill',color);
      }
    }
}
