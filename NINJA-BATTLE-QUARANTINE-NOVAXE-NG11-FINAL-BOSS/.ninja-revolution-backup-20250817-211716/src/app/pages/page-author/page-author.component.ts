
@Component({
  selector: 'app-page-author',
  templateUrl: './page-author.component.html',
  styleUrls: ['./page-author.component.scss']
})
export class PageAuthorComponent implements OnInit  {
  public author:string = '';
  public constructor(public private route:ActivatedRoute) {
  }
  public ngOnInit(): void: void {
    this.route.paramMap.subscribe( paramMap => {
      this.author = paramMap.get('author');
    })
}
