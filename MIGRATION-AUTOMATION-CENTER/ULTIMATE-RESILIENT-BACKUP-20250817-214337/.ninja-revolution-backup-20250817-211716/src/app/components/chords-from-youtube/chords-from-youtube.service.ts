
@Injectable({
  providedIn: 'root'
})
export class ChordsFromYoutubeService  {
  
	yChords:any;
  public constructor(public private _http: HttpClient ) { 
	  this.yChords = new Subject();
  }
  public searchYoutube(l: any) {
		let obj :object = {
			link:l
		};
		const headers = new HttpHeaders({ 'Content-Type': 'application/json'}));  
		this._http.post(environment.apiGetChordsFromYoutube, obj,{responseType: 'text', headers})
	    .map(res => {
	    	this.yChords.next(res);
		  })
	    .subscribe(
	      data => console.log('data  : '+data),
	      err => console.log(err),
	      () => {
	      }
	    );
}
