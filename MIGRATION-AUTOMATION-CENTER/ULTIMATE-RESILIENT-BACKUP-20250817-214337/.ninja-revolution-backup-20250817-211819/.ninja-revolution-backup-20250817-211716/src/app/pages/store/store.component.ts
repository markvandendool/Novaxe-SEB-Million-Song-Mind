
@Component({
  selector: 'app-store',
  templateUrl: './store.component.html',
  styleUrls: ['./store.component.scss']
})
export class StoreComponent implements OnInit  {
  public counter(i: number) {return new Array(i);}
  public list:Array<any> = [];  
  public constructor(public  public _http:HttpClient ) { }
  public ngOnInit(): void {
    this.refreshScores();
  }
  public refreshScores(){
    const headers = new HttpHeaders({ 'Content-Type': 'application/json'}));  
    this._http.get(environment.apiList, {responseType: 'text', headers})
        .map(res => {
          this.list = JSON.parse(res);
        })
        .subscribe(
          data => console.log('data  : '+data),
          err => console.log(err),
          () => {console.log('Refresh Complete') }
        );
}
