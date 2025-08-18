import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment'
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie';

@Injectable({
	providedIn: 'root'
})
export class UserModel {

	private user_nick: string = '';
	private user_email: string = '';
	private user_pass: string = '';
	private user_folder: string = '';

	private user_is_logged: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

	constructor(private _http: HttpClient, private cookieService: CookieService) {
		// Initialize from cookie if available
		const savedUser = this.cookieService.getObject('user') as any;
		if (savedUser) {
			this.user_nick = savedUser.user_nick || '';
			this.user_email = savedUser.user_email || '';
			this.user_folder = savedUser.user_folder || '';
			this.user_is_logged.next(!!savedUser.user_pass);
		}
	}

	public create(nick: string, email: string, pass: string): Observable<string> {
		const obj = {
			user_nick: nick,
			user_email: email,
			user_pass: pass
		};

		if (!nick || !email || !pass)
			throw "userModel : create() => missing information";

		const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

		return this._http.post(environment.apiCreateUser, obj, { responseType: 'text', headers })
			.pipe(map(res => {
				try {
					if (res == "creating user : email error")
						return "email error";
					else if (res == "creating user : nick error")
						return "nick error";
					else if (res.indexOf('created successfully') > -1) {
						const data = JSON.parse(res);
						this.user_nick = data.user_nick;
						this.user_email = data.user_email;
						this.user_folder = data.user_folder;
						this.user_is_logged.next(true);
						this.cookieService.putObject('user', { user_nick: this.user_nick, user_email: this.user_email, user_folder: this.user_folder, user_pass: pass });
						return "success";
					}
					return "unknown response";
				} catch (e) {
					return "signup error";
				}
			}));
	}

	public login(pass: string): Observable<string> {
		const obj = {
			user_email: this.user_email,
			user_pass: pass
		};

		const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

		return this._http.post(environment.apiSignIn, obj, { responseType: 'text', headers })
			.pipe(map(res => {
				try {
					const data = JSON.parse(res);
					if (data.hasOwnProperty('error')) {
						switch (data.error) {
							case '0':
								return "empty infos";
							case '-1':
								return "wrong email";
							case '-2':
								return "wrong pass";
							default:
								return "signin error";
						}
					} else {
						this.user_nick = data.user_nick;
						this.user_email = data.user_email;
						this.user_folder = data.user_folder;
						this.user_is_logged.next(true);
						this.cookieService.putObject('user', { user_nick: this.user_nick, user_email: this.user_email, user_folder: this.user_folder, user_pass: pass });
						return "login success";
					}
				} catch (e) {
					return "login error";
				}
			}));
	}

	public sendLink(): Observable<string> {
		const obj = {
			user_email: this.user_email,
			adress: environment.serverAdress + "reset-password?key="
		};

		const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
		return this._http.post(environment.apiSendLink, obj, { responseType: 'text', headers })
			.pipe(map(res => {
				try {
					const data = JSON.parse(res);
					if (data.hasOwnProperty('code')) {
						switch (data.code) {
							case '1':
								this.cookieService.putObject('user', { user_nick: this.user_nick, user_email: this.user_email, user_folder: this.user_folder, user_pass: undefined });
								return "Thank you for sending e-mail.";
							case '0':
								return "Error while sending email.";
							case '-1':
								return "Unknown email adress.";
							default:
								return "Error while sending email.";
						}
					}
					return "Error while sending email.";
				} catch (e) {
					return "Error while sending email.";
				}
			}));
	}

	public get_user_infos(key: string, reset: string): Observable<string> {
		const obj = {
			email_encrypt: key,
			pass_encrypt: reset,
		};

		const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
		return this._http.post(environment.apiUserInfos, obj, { responseType: 'text', headers })
			.pipe(map(res => {
				try {
					if (res == "link error")
						return "link error";
					else {
						const data = JSON.parse(res);
						this.user_nick = data.nick;
						this.user_email = data.email;
						this.user_folder = data.folder;
						this.user_is_logged.next(false);
						this.cookieService.putObject('user', { user_nick: this.user_nick, user_email: this.user_email, user_folder: this.user_folder, user_pass: undefined });
						return "get infos ok";
					}
				} catch (e) {
					return "infos error";
				}
			}));
	}

	public update_user_pass(pass: string): Observable<string> {
		const obj = {
			user_email: this.user_email,
			user_pass: pass
		};

		if (this.user_email == "" || pass == "")
			throw "userModel : update() => missing information";

		const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

		return this._http.post(environment.apiUpdateUserPass, obj, { responseType: 'text', headers })
			.pipe(map(res => {
				if (res = "User " + this.get_user_email() + " updated successfully.") {
					this.user_is_logged.next(false);
					return "Updated";
				}
				else
					return "Error";
			}));
	}

	public is_logged(): BehaviorSubject<boolean> {
		return this.user_is_logged;
	}

	public getCookie(key: string) {
		return this.cookieService.get(key);
	}

	public addResults(level: string, result: any): any {
		let old_results = this.cookieService.getObject('results');

		if (!old_results) old_results = {};

		if (!old_results.hasOwnProperty(level)) {
			old_results[level] = [];
		}

		let D = new Date();
		let date = (D.getUTCMonth() + 1) + "-" + D.getUTCDate() + "-" + D.getUTCFullYear();

		if (old_results[level].length && old_results[level][old_results[level].length - 1].hasOwnProperty(date)) {
			old_results[level][old_results[level].length - 1][date] = (old_results[level][old_results[level].length - 1][date] + result) / 2;
		} else {
			old_results[level].push({ [date]: result });
		}

		this.cookieService.putObject("results", old_results);
		return old_results;
	}

	public clearAllResults() {
		this.cookieService.putObject("results", {});
	}

	public clearResults(level: string) {
		let old_results = this.cookieService.getObject('results');
		old_results[level] = [];
		this.cookieService.putObject("results", old_results);
	}

	public getResults() {
		if (!this.cookieService.getObject('results'))
			this.cookieService.putObject("results", {});

		return this.cookieService.getObject('results');
	}

	public get_folder(): string {
		return this.user_folder;
	}

	public get_nick(): string {
		return this.user_nick;
	}

	public set_user_nick(nic: string) {
		this.user_nick = nic;
	}

	public get_user_email(): string {
		return this.user_email;
	}

	public set_user_email(email: string) {
		this.user_email = email;
	}

	public get_user() {
		let usr = {
			userNick: this.user_nick,
			user_email: this.user_email,
			user_folder: this.user_folder,
			user_pass: this.user_pass,
			is_logged: this.is_logged().getValue()
		}
		return usr;
	}
}
