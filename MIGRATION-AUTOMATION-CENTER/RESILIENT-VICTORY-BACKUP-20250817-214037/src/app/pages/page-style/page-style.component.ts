
@Component({
  selector: 'app-page-style',
  templateUrl: './page-style.component.html',
  styleUrls: ['./page-style.component.scss']
})
export class PageStyleComponent implements OnInit  {
  public style:string = '';
  public constructor(public private route:ActivatedRoute) {
  }
  public ngOnInit(): void {
    this.route.paramMap.subscribe( paramMap => {
      this.style = paramMap.get('style');
    })
}
