
@Component({
  selector: 'app-countdown',
  templateUrl: './countdown.component.html',
  styleUrls: ['./countdown.component.scss']
})
export class CountdownComponent implements OnInit, AfterViewInit  {
	@Output() askNext     = new EventEmitter<boolean>(); //output answer
	public num:number=3;
	public receivedData:any;
  public constructor(public ) { }
  public ngOnInit(): void {
  	this.receivedData = this.receivedData;
  	this.num = this.receivedData.count;
  }
  public ngAfterViewInit():void{
  	setInterval( ()=> {
  		this.num -=1;
  		if(this.num == 0)this.askNext.emit(true);
  	},1000);
}
