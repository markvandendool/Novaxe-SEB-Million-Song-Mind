
@Component({
  selector: 'app-page-artist',
  templateUrl: './page-artist.component.html',
  styleUrls: ['./page-artist.component.scss']
})
export class PageArtistComponent implements OnInit  {
  public artist:string = '';
  public artist_id:any;
  
  public img:string;
  public img_w:any;
  public img_h:any;
  private desc:string;
  private extract:any;
  public loaded:boolean = false;
  private artistId:string;
  public topTracks:Array<any> = [];
  public constructor(public private route:ActivatedRoute, private _http: HttpClient, public sm:Songmodel, private spot: SpotifyService) {
  }
  public ngOnInit(): void {
    this.route.paramMap.subscribe( paramMap => {
      this.artist = paramMap.get('artist');
      this.loaded = true;
    })
    this.callWikiApiInfos();
    this.callWikiApiText();
    this.getSongItems();
  public ngOnDestroy(){
    this.loaded = false;
  private callWikiApiInfos(){
    var url = "https://en.wikipedia.org/w/rest.php/v1/search/page?q="+this.artist+"_(band)&limit=1";
    const headers = new HttpHeaders({ 'Content-Type': 'application/json'})); 
    this._http.get(url, {responseType: 'text', headers})
      .subscribe(
        data => {
          var result = JSON.parse(data);
          if( result.pages[0].key.toLowerCase() != (this.artist.replace(" ", "_")+'_(band)').toLowerCase() ){
            url = url.replace("_(band)&limit=1", "&limit=1");
            this._http.get(url, {responseType: 'text', headers})
              .subscribe(
                data => {
                  var result = JSON.parse(data);
                  this.desc = result.pages[0].description;
                  this.img = result.pages[0].thumbnail.url;
                  this.img_w = result.pages[0].thumbnail.width;
                  this.img_h = result.pages[0].thumbnail.height;
                  $(".desc").html(this.desc);
                },
                err => console.log(err),
                () => {console.log('Infos OK')}
              );
            return
          }
          this.desc = result.pages[0].description;
          this.img = result.pages[0].thumbnail.url;
          this.img_w = result.pages[0].thumbnail.width;
          this.img_h = result.pages[0].thumbnail.height;
          $(".desc").html(this.desc);
        },
        err => console.log(err),
        () => {console.log('Infos OK')}
      );
  private callWikiApiText(){
    var url = "https://en.wikipedia.org/w/api.php?format=json&action=query&origin=*&prop=extracts&exintro&explaintext&redirects=1&titles="+this.artist+"_(band)";
          if(Object.keys(result.query.pages)[0] == "-1"){
            url = url.replace("_(band)", "");
                  for (let i in result.query.pages: any) {
                    this.extract = result.query.pages[i].extract;
                    this.artist_id = result.query.pages[i].pageid;
                  }
                  $(".extract").html('<p>'+this.extract.split('\n').join('</p><p>')+'</p>');
                () => {console.log('Extract OK')}
          for (let i in result.query.pages: any) {
            this.extract = result.query.pages[i].extract;
            this.artist_id = result.query.pages[i].pageid;
          $(".extract").html('<p>'+this.extract.split('\n').join('</p><p>')+'</p>');
        () => {console.log('Extract OK')}
  } 
  private getSongItems(){
    var title = '';
    var album = '';
    var artist = this.artist;
    var comp = 'p-artist'
    this.spot.getItems({title:title, artist:artist, album:album, comp:comp})
          this.artistId = data.artists.items[0].id;
          this.getTopTracks();
        }));
  private getTopTracks(){
    this.spot.getTop({id:this.artistId})
          for (let i in data.tracks: any) {
            var obj = {
              title: data.tracks[i].name,
              album: data.tracks[i].album.name,
              img: data.tracks[i].album.images[0].url,
              duration: this.msToTime(data.tracks[i].duration_ms)
            };
            this.topTracks.push(obj);
  private msToTime(millis: any) {
    var minutes = Math.floor(millis / 60000);
    var seconds = ((millis % 60000) / 1000).toFixed(0) as any;
    return minutes+':'+((seconds < 10) ? "0" : "")+seconds;
    
}
