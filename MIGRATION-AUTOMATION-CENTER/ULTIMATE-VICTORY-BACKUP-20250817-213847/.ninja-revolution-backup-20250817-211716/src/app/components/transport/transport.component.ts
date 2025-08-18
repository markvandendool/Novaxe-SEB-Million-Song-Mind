
@Component({
  selector: 'app-transport',
  templateUrl: './transport.component.html',
  styleUrls: ['./transport.component.scss']
})
export class TransportComponent implements OnInit, OnDestroy {
  public constructor(public public transport:TransportService){
    // console.log('transport => ',transport);
    // this.transp = transport;
  }
  public ngOnInit(){
    this.transport.stop(1,true);
  public ngOnDestroy(){
  play_pause(){}
  public stop(){}
  public onKeydown(event: any) {
    // console.log(event.key);
    // if(event.code === 'Space' && event.target.nodeName != "TEXTAREA" && event.target.nodeName != "INPUT" && event.target.nodeName != "SELECT": any) {
    //   this.transport.stop(0);
    // }
}
