
@Injectable({
  providedIn: 'root'
})
export class DiscogsService  {
  public constructor(public private _http: HttpClient) { }
  public getItemsEditor(song:object){
    const headers = new HttpHeaders({ 'Content-Type': 'application/json'}));
    return this._http.post(environment.apiDiscogs, song,{responseType: 'text', headers})
      .map(res => {
        try{
          return res;
        }catch(e: any) {
          return "Discogs api error"
          console.clear();
          console.warn(res);
        }
      })
  }
}
