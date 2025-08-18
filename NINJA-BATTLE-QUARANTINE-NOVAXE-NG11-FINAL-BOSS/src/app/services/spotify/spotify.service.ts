
@Injectable({
  providedIn: 'root'
})
export class SpotifyService  {
  public constructor(public private _http: HttpClient) { }
  public getItems(song:object){
    const headers = new HttpHeaders({ 'Content-Type': 'application/json'}));
    return this._http.post(environment.apiSpotify, song,{responseType: 'text', headers})
      .map(res => {
        try{
          return JSON.parse(res);
        }catch(e: any) {
          return "Spotify api error"
          console.clear();
        }
      })
  }
  public getFeatures(id:object){
    return this._http.post(environment.apiSpotifyAnalysis, id,{responseType: 'text', headers})
  public getInfos(id:object){
    return this._http.post(environment.apiSpotifyContents, id,{responseType: 'text', headers})
  public getReco(infos:object){
    return this._http.post(environment.apiSpotifyReco, infos,{responseType: 'text', headers})
  public getTop(id:object){
    return this._http.post(environment.apiSpotifyTop, id,{responseType: 'text', headers})
}
