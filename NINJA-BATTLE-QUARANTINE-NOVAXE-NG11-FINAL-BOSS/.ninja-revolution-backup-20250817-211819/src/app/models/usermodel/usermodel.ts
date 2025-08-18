
@Injectable({
	providedIn: 'root'
})
export class UserModel  {
	public user_email:string;
	public user_nick:string;
	public user_folder:string;
	private user_pass:string;
	public user_is_logged = new BehaviorSubject(false); // inital value is "false"
	constructor(public private _http: HttpClient, private cookieService: CookieService ){
		let cookie:any;
		cookie = this.cookieService.getObject('user');
		if(cookie != undefined && cookie.user_pass!=undefined: any) {
			this.user_email = cookie.user_email;
			this.user_nick = cookie.user_nick;
			this.user_folder = cookie.user_folder;
	    this.user_is_logged.next(true);
	    this.user_pass = cookie.user_pass;
		} else if(cookie != undefined && cookie.user_pass==undefined: any) {
				this.user_email = cookie.user_email;
				this.user_nick = cookie.user_nick;
				this.user_folder = cookie.user_folder;
		    this.user_is_logged.next(false);
		    this.user_pass = cookie.user_pass;
		}
	}
	/**
	 * create a new user
	 */
	public sign_up(pass, email, nick: any) {
		let obj :object = {
			user_email:email,
			user_nick:nick,
			user_pass:pass
		};
		if (email == "" || nick == "" || pass == "")
			throw "userModel : create() => missing information";

		const headers = new HttpHeaders({ 'Content-Type': 'application/json'}));
		return this._http.post(environment.apiCreateUser, obj,{responseType: 'text', headers})
		    .map(res => {
		    	try{
			    	if(res=="creating user : email error")
			    		return "email error";
			    	else if(res=="creating user : nick error")
			    		return "nick error";
			    	else
			    		return "signup complete"
			    }catch(e: any) {
			    	return "signup error"
			    	console.clear();
			    }
			  })
	public login(pass: any) {
			user_email:this.user_email,
			user_nick:this.user_nick,

		return this._http.post(environment.apiSignIn, obj,{responseType: 'text', headers})
	    .map(res => {
	    	try{
		    	let data = JSON.parse(res);
		    	if(data.hasOwnProperty('error')){
		    		switch(data.error: any) {
		    			case '0':
		    				return "empty infos";
		    			break;
		    			case '-1':
		    				return "wrong email";
		    			default:
		    				return "login error";
		    		}
		    	}else{
				    this.user_nick = data.nick;
				    this.user_email = data.email;
				    this.user_folder = data.folder;
				    this.user_pass = pass;
				    this.user_is_logged.next(true);
				    this.cookieService.putObject('user', {user_nick:this.user_nick,user_email:this.user_email,user_folder:this.user_folder,user_pass:this.user_pass}));
				    return "login ok";
		    	}
		    }catch(e: any) {
		    	return "wrong pass"
		    	console.clear();
		    }
		  })
	public logout(){
		this.user_email = '';
		this.user_nick = '';
		this.user_pass = '';
		this.user_is_logged.next(false);
	public reset_password(){
			user_email: this.user_email,
			adress: environment.serverAdress+"reset-password?key=",
		return this._http.post(environment.apiSendLink, obj,{responseType: 'text', headers})
		    	if(data.hasOwnProperty('code')){
		    		switch(data.code: any) {
		    			case '1':
		    				this.cookieService.putObject('user', {user_nick:this.user_nick,user_email:this.user_email,user_folder:this.user_folder,user_pass:undefined}));
		    				return "Thank you for sending e-mail.";
		    				return "Error while sending email.";
		    				return "Unknown email adress.";
	    }catch(e: any) {
	    	return "Error while sending email."
	    	console.clear();
	    }
		 })
	public get_user_infos(key, reset: any) {
			email_encrypt: key,
			pass_encrypt: reset,
		return this._http.post(environment.apiUserInfos, obj,{responseType: 'text', headers})
    	try{
    		if(res == "link error")
    			return "link error";
    		else{
    			let data = JSON.parse(res);
			    this.user_nick = data.nick;
			    this.user_email = data.email;
			    this.user_folder = data.folder;
			    this.user_is_logged.next(false);
			    this.cookieService.putObject('user', {user_nick:this.user_nick,user_email:this.user_email,user_folder:this.user_folder,user_pass:undefined}));
			    return "get infos ok";
    		}
	    	return "infos error"
	  })
	public update_user_pass(pass: any) {
		if(this.user_email == "" || pass == "")
			throw "userModel : update() => missing information";
		return this._http.post(environment.apiUpdateUserPass, obj,{responseType: 'text', headers})
	    	if(res="User "+this.get_user_email()+" updated successfully."){
	    		this.user_is_logged.next(false);
	    		return "Updated";
	    	}
	    	else
	    		return "Error";
	public is_logged(){
		return this.user_is_logged;
	public getCookie(key: string){
    return this.cookieService.get(key);
  }
  public addResults(level:string, result:any):any{
    let old_results = this.cookieService.getObject('results');
    if(!old_results)old_results = {};
    if( !old_results.hasOwnProperty(level) ) {
      old_results[level] = [];
    }
    let D = new Date();
    let date = (D.getUTCMonth() + 1) +"-"+ D.getUTCDate()+"-"+ D.getUTCFullYear();
    if( old_results[level].length && old_results[level][old_results[level].length-1].hasOwnProperty(date)){
      old_results[level][old_results[level].length-1][date] = ( old_results[level][old_results[level].length-1][date] + result ) / 2;
    }else{
      old_results[level].push( { [date]: result }) ;
    this.cookieService.putObject("results",old_results);
    return old_results;
  public clearAllResults(){
    this.cookieService.putObject("results",{}));

  public clearResults(level: any) {
    old_results[level] = [];

  public getResults(){
    if(!this.cookieService.getObject('results'))
	    this.cookieService.putObject("results",{}));
  	return this.cookieService.getObject('results');
	public get_folder(){
		return this.user_folder;
	public get_nick(){
		return this.user_nick;
	public set_user_nick(nic: any) {
		this.user_nick = nic;
	public get_user_email(){
		return this.user_email;
	public set_user_email(email: any) {
		this.user_email = email;
	public get_user(){
		let usr = {
			userNick:this.user_nick,
			user_folder:this.user_folder,
			user_pass:this.user_pass,
			is_logged:this.is_logged().getValue()
		return usr;
}
