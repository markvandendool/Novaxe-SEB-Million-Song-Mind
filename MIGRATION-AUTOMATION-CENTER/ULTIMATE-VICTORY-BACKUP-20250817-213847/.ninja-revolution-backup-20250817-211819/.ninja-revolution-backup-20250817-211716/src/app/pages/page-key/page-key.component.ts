
@Component({
  selector: 'app-page-key',
  templateUrl: './page-key.component.html',
  styleUrls: ['./page-key.component.scss']
})
export class PageKeyComponent implements OnInit  {
  public key:string = '';
  public constructor(public private route:ActivatedRoute) {
  }
  public ngOnInit(): void {
    this.route.paramMap.subscribe( paramMap => {
      this.key = paramMap.get('key');
    })
}
