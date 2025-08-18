
@Component({
  selector: 'app-page-album',
  templateUrl: './page-album.component.html',
  styleUrls: ['./page-album.component.scss']
})
export class PageAlbumComponent implements OnInit  {
  public album:string = '';
  public constructor(public private route:ActivatedRoute) {
  }
  public ngOnInit(): void {
    this.route.paramMap.subscribe( paramMap => {
      this.album = paramMap.get('album');
    })
}
