import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment'
import { BehaviorSubject } from 'rxjs';
import { CookieService } from 'ngx-cookie';

@Injectable({
	providedIn: 'root'
})

export class UserModel {

	public user_email:string;
	public user_nick:string;
	public user_folder:string;
	private user_pass:string;

	public user_is_logged = new BehaviorSubject(false); // inital value is "false"

	constructor(private _http: HttpClient, private cookieService: CookieService ){
		let cookie:any;
		cookie = this.cookieService.getObject('user');

		if(cookie != undefined && cookie.user_pass!=undefined){
			this.user_email = cookie.user_email;
			this.user_nick = cookie.user_nick;
			this.user_folder = cookie.user_folder;
	    this.user_is_logged.next(true);
	    this.user_pass = cookie.user_pass;
		} else if(cookie != undefined && cookie.user_pass==undefined){
				this.user_email = cookie.user_email;
				this.user_nick = cookie.user_nick;
				this.user_folder = cookie.user_folder;
		    this.user_is_logged.next(false);
		    this.user_pass = cookie.user_pass;
		}


		// CLEAR ALL RESULTS in COOKIE =============DEBUG ONLY=============
		// 
  	// this.clearAllResults();
  	// 
  	// ================================================================
  	// console.log(this.getResults())
	}

	/**
	 * create a new user
	 */
	public sign_up(pass, email, nick){

		let obj :object = {
			user_email:email,
			user_nick:nick,
			user_pass:pass
		};

		if (email == "" || nick == "" || pass == "")
			throw "userModel : create() => missing information";
			
		const headers = new HttpHeaders({ 'Content-Type': 'application/json'});  

		return this._http.post(environment.apiCreateUser, obj,{responseType: 'text', headers})
		    .map(res => {
		    	try{
			    	if(res=="creating user : email error")
			    		return "email error";
			    	else if(res=="creating user : nick error")
			    		return "nick error";
			    	else
			    		return "signup complete"
			    	console.log("Received : \n"+res);
			    }catch(e){
			    	return "signup error"
			    	console.clear();
			    	console.warn(res);
			    }
			  })
	}

	public login(pass){
		let obj :object = {
			user_email:this.user_email,
			user_nick:this.user_nick,
			user_pass:pass
		};

		// if(this.user_email == undefined || pass == undefined)
		// 	return "userModel : sign_in() => missing information";
			
		const headers = new HttpHeaders({ 'Content-Type': 'application/json'});  
		
		return this._http.post(environment.apiSignIn, obj,{responseType: 'text', headers})
	    .map(res => {
	    	try{
		    	let data = JSON.parse(res);
		    	if(data.hasOwnProperty('error')){
		    		switch(data.error){
		    			case '0':
		    				return "empty infos";
		    			break;
		    			case '-1':
		    				return "wrong email";
		    			break;
		    			default:
		    				return "login error";
		    		}
		    	}else{
				    this.user_nick = data.nick;
				    this.user_email = data.email;
				    this.user_folder = data.folder;
				    this.user_pass = pass;
				    this.user_is_logged.next(true);
				    this.cookieService.putObject('user', {user_nick:this.user_nick,user_email:this.user_email,user_folder:this.user_folder,user_pass:this.user_pass});
				    return "login ok";
		    	}
		    }catch(e){
		    	return "wrong pass"
		    	console.clear();
		    	console.warn(res);
		    }
		  })
	}

	public logout(){
		this.user_email = '';
		this.user_nick = '';
		this.user_pass = '';
		this.user_is_logged.next(false); 
	}

	public reset_password(){
		
		let obj :object = {
			user_email: this.user_email,
			adress: environment.serverAdress+"reset-password?key=",
		};
		
		const headers = new HttpHeaders({ 'Content-Type': 'application/json'});  
		return this._http.post(environment.apiSendLink, obj,{responseType: 'text', headers})
	    .map(res => {
	    	try{
		    	let data = JSON.parse(res);
		    	if(data.hasOwnProperty('code')){
		    		switch(data.code){
		    			case '1':
		    				this.cookieService.putObject('user', {user_nick:this.user_nick,user_email:this.user_email,user_folder:this.user_folder,user_pass:undefined});
		    				return "Thank you for sending e-mail.";
		    			break;
		    			case '0':
		    				return "Error while sending email.";
		    			break;
		    			case '-1':
		    				return "Unknown email adress.";
		    			break;
		    			default:
		    				return "Error while sending email.";
		    		}
		    	}
	    }catch(e){
	    	return "Error while sending email."
	    	console.clear();
	    	console.warn(res);
	    }
		 })
	}

	public get_user_infos(key, reset){
		
		let obj :object = {
			email_encrypt: key,
			pass_encrypt: reset,
		};
		
		const headers = new HttpHeaders({ 'Content-Type': 'application/json'});  
		return this._http.post(environment.apiUserInfos, obj,{responseType: 'text', headers})
	    .map(res => {
    	try{
    		if(res == "link error")
    			return "link error";
    		else{
    			let data = JSON.parse(res);
			    this.user_nick = data.nick;
			    this.user_email = data.email;
			    this.user_folder = data.folder;
			    this.user_is_logged.next(false);
			    this.cookieService.putObject('user', {user_nick:this.user_nick,user_email:this.user_email,user_folder:this.user_folder,user_pass:undefined});
			    return "get infos ok";
    		}
	    }catch(e){
	    	return "infos error"
	    	console.clear();
	    	console.warn(res);
	    }
	  })
	}


	public update_user_pass(pass){

		let obj :object = {
			user_email:this.user_email,
			user_pass:pass
		};

		if(this.user_email == "" || pass == "")
			throw "userModel : update() => missing information";
			
		const headers = new HttpHeaders({ 'Content-Type': 'application/json'});  

		return this._http.post(environment.apiUpdateUserPass, obj,{responseType: 'text', headers})
	    .map(res => {
	    	if(res="User "+this.get_user_email()+" updated successfully."){
	    		this.user_is_logged.next(false);
	    		return "Updated";
	    	}
	    	else
	    		return "Error";
	    	console.log("Received : \n"+res);
		  })
	}


	public is_logged(){
		return this.user_is_logged;
	}

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


    // if already results for this exo : mean it. else create it.
    if( old_results[level].length && old_results[level][old_results[level].length-1].hasOwnProperty(date)){
      console.log("MEAN OF ",old_results[level][old_results[level].length-1][date], "and ", result)
      old_results[level][old_results[level].length-1][date] = ( old_results[level][old_results[level].length-1][date] + result ) / 2;
    }else{
      old_results[level].push( { [date]: result }) ;
    }
    // old_results[level]["3-7-2021"]= Math.round(Math.random()*100);
    // old_results[level]["3-6-2021"]= Math.round(Math.random()*100);
    // old_results[level]["3-5-2021"]= Math.round(Math.random()*100);
    // old_results[level]["3-4-2021"]= Math.round(Math.random()*100);
    // old_results[level]["3-3-2021"]= Math.round(Math.random()*100);
    // old_results[level]["3-2-2021"]= Math.round(Math.random()*100);

    // this.cookieService.putObject("results",{});
    this.cookieService.putObject("results",old_results);

    return old_results;
  }

  public clearAllResults(){
    this.cookieService.putObject("results",{});
  
  }

  public clearResults(level){
    let old_results = this.cookieService.getObject('results');
    old_results[level] = [];
    this.cookieService.putObject("results",old_results);
 
  }

  public getResults(){

    if(!this.cookieService.getObject('results'))
	    this.cookieService.putObject("results",{});

  	return this.cookieService.getObject('results');	
  }

	public get_folder(){
		return this.user_folder;
	}

	public get_nick(){
		return this.user_nick;
	}

	public set_user_nick(nic){
		this.user_nick = nic;
	}

	public get_user_email(){
		return this.user_email;
	}

	public set_user_email(email){
		this.user_email = email;
	}

	public get_user(){
		let usr = {
			userNick:this.user_nick,
			user_email:this.user_email,
			user_folder:this.user_folder,
			user_pass:this.user_pass,
			is_logged:this.is_logged().getValue()
		}
		return usr;
	}


}
