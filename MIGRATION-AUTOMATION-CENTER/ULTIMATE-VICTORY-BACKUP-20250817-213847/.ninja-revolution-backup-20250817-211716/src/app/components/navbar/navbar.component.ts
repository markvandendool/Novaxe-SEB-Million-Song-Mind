
declare var $: any;
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  public user_email:string;
  public user_pass:string;
  public passverif:string;
  public user_nick:string;
  public newScoreLink:string;
  public storeLink:string;
  public show_pass:boolean = false;
  public show_resetInfos:boolean = false;
  public show_signupInfos:boolean = false;
  private loginRes$:any;
  private resetRes$:any;
  private signupRes$:any;
  public searchPattrn:string='';
  public searchResults1:any = [];
  public searchResults2:any = [];
  public searchResults3:any = [];
  public searchResults4:any = [];
  public searchResults5:any = [];
  public searchResults6:any = [];
  public searchResults7:any = [];
  public constructor(public public user:UserModel, public router:Router, public _http:HttpClient) {}
  public ngOnInit(){
    this.newScoreLink = environment.newScore;
    this.storeLink = environment.store;
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
  }
  public ngAfterViewInit(){
    $(document).ready(function(: any) {
      if(window.location.href.indexOf('#sign-up-modal') != -1) {
        $('#sign-up-modal').modal('show');
      }
    }));
  public ngOnDestroy(){
    this.loginRes$.unsubscribe();
    this.resetRes$.unsubscribe();
    this.signupRes$.unsubscribe();
    // this.router.onSameUrlNavigation = 'ignore';
  public login(){
    this.user.set_user_email(this.user_email);
    this.loginRes$ = this.user.login(this.user_pass)
      .subscribe(
        data => {
          switch(data: any) {
            case "wrong email" :
              $('#li_email').css('border-color', 'red');
              $('#li_psw').css('border-color', 'black');
            break;
            
            case "wrong pass":
              $('#li_email').css('border-color', 'black');
              $('#li_psw').css('border-color', 'red');
            case "empty infos":
            case "login ok":
              this.closeModal();
            default:
          }
        },
        err => console.log(err),
        () => {console.log('Login Complete'); }
    );
  public logout(){
    this.user.logout();
  public closeModal(){
    $('#li_psw').css('border-color', 'black');
    $('#li_email').css('border-color', 'black');
    $('#li_psw').val('');
    $('#li_email').val('');
    $('#su_psw').css('border-color', 'black');
    $('#su_email').css('border-color', 'black');
    $('#su_psw2').css('border-color', 'black');
    $('#su_nick').css('border-color', 'black');
    $('#su_psw').val('');
    $('#su_email').val('');
    $('#su_psw2').val('');
    $('#su_nick').val('');
    $('#su_infos').css('color', 'var(--red_nvx)');
    $('.modal').modal('hide');
    $('.toggle_pass').prop( "checked", false );
    $('#fp_email').css('border-color', 'black');
    $('#fp_infos').text('');
    this.show_resetInfos=false;
    this.show_signupInfos = false;
  public signUp(){
    if(this.passverif == this.user_pass: any) { 
      
      this.signupRes$ = this.user.sign_up(this.user_pass, this.user_email, this.user_nick)
            case "email error":
              $('#su_email').css('border-color', 'red');
              $('#su_nick').css('border-color', 'black');
              $('#su_infos').text('This email is already used.');
              this.show_signupInfos = true;
            case "nick error":
              $('#su_email').css('border-color', 'black');
              $('#su_nick').css('border-color', 'red');
              $('#su_infos').text('This nickname is already used.');
            case "signup complete":
              this.user.set_user_email(this.user_email);
              this.user.set_user_nick(this.user_nick);
              $('#su_infos').text('Account created successfully !');
              $('#su_infos').css('color', 'var(--green_nvx)');
              setTimeout(()=>{this.closeModal();}, 3000);
        () => {console.log('Sign Up Complete'); }
      );
    }
  public showPass() {
    this.show_pass = !this.show_pass;
  public resetPass(){
    // this.user.reset_password();
    this.resetRes$ = this.user.reset_password()
            case "Error while sending email." :
              $('#fp_infos').text('An error occured. We are unable to reset your password at the moment. Please try again later.');
              $('#fp_infos').css('color', 'var(--red_nvx)');
              this.show_resetInfos=true;
            case "Unknown email adress.":
              $('#fp_email').css('border-color', 'red');
              $('#fp_infos').text('Unknown email adress. Please enter a valid email.');
            case "Thank you for sending e-mail.":
              $('#fp_infos').text('Email sent! Don\'t forget to check your spams :)');
              $('#fp_infos').css('color', 'var(--green_nvx)');
        () => {console.log('Reset Complete'); }
  public search(){
    
    this.clearSearch();
    if(this.searchPattrn == '') return;
    this.searchWithObject( this.getSearchObj('title',this.searchPattrn),this.searchResults1,'title');
    this.searchWithObject( this.getSearchObj('artist',this.searchPattrn),this.searchResults2,'artist');
    this.searchWithObject( this.getSearchObj('album',this.searchPattrn),this.searchResults3,'album');
    this.searchWithObject( this.getSearchObj('author',this.searchPattrn),this.searchResults4,'author');
    this.searchWithObject( this.getSearchObj('key',this.searchPattrn),this.searchResults5,'key');
    this.searchWithObject( this.getSearchObj('style',this.searchPattrn),this.searchResults6,'style');
    this.searchWithObject( this.getSearchObj('chords',this.searchPattrn),this.searchResults7,'chords');
  private clearSearch(){
    this.searchResults1 = [];
    this.searchResults2 = [];
    this.searchResults3 = [];
    this.searchResults4 = [];
    this.searchResults5 = [];
    this.searchResults6 = [];
    this.searchResults7 = [];
  private getSearchObj(category, search: any) {
    let obj= {
      pattrnTitle:"",
      pattrnArtist:"",
      pattrnAlbum:"",
      pattrnAuthor:"",
      pattrnKey:"",
      pattrnStyle:"",
      pattrnChords:"",
    };
    switch(category: any) {
      case 'title':
        obj.pattrnTitle = search
      break;
      case 'artist':
        obj.pattrnArtist = search
      case 'album':
        obj.pattrnAlbum = search
      case 'author':
        obj.pattrnAuthor = search
      case 'key':
        obj.pattrnKey = search
      case 'style':
        obj.pattrnStyle = search
      case 'chords':
        obj.pattrnChords = search
    return obj;
  public searchWithObject(obj,resultObj,category: any) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json'})); 
			
		this._http.post(environment.apiSearchAnalysis, obj, {responseType: 'text', headers})
    .map(res => {
      try{	
        var temp = JSON.parse(res)
        for(let t of temp: any) {
          if(resultObj.filter(e => e.name === t[category]).length == 0 && resultObj.filter(e => e.name === t['title']).length == 0){
            let obj = {};
            let name = t[(category=='key'||category=='chords')?'title':category];
            obj['name'] = name;
            obj['id'] = t[0];
            resultObj.push(obj);
        }
			}catch(e: any) {
				// console.log(e)
				// console.log('res => ');
				// console.log(res)
			}
			}).subscribe( data => {
        // console.log('data  : '+data)
      }, err => {
        // console.log(err)
      }, () => {
        // console.log('Search Complete') 
      }));
  public redirect(path: any) {
    this.router.navigateByUrl('/', {skipLocationChange: true}).then(()=>
    this.router.navigate([path]));
    this.searchPattrn=''
}
