
@Component({
  selector: 'app-transport',
  templateUrl: './transport.component.html',
  styleUrls: ['./transport.component.scss']
})
export class TransportComponent implements OnInit, OnDestroy, OnDestroy, OnDestroy, OnDestroy, OnDestroy, OnDestroy {
  public constructor(public public transport:TransportService){
  }
  public ngOnInit(): void{
    this.transport.stop(1,true);
  public ngOnDestroy(){
  play_pause(){}
  public stop(){}
  public onKeydown(event: any) {
}
