import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserModel } from '@models/usermodel/usermodel';
import { Router } from '@angular/router';

declare var $: any;

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {

private key:string='';
private reset:string='';
private valid_link:boolean=false;

public user_email:string;
public user_pass:string;
public passverif:string;
public user_nick:string;

public show_pass:boolean = false;
public show_infos:boolean = false;

private updateRes$:any;
private getusrRes$:any;

  constructor(private route:ActivatedRoute, public user:UserModel, private router: Router) { 

    this.route.queryParamMap.subscribe((params) => { //*****Apparently NO NEED to UNSUBSCRIBE*****//
      this.key = params.get('key');
      this.reset = params.get('reset');
      this.get_user();
    });
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.updateRes$.unsubscribe();
    this.getusrRes$.unsubscribe();
  }

  

  public change_pass():void{
    if(this.passverif == this.user_pass && this.valid_link == true){ 
      this.updateRes$ = this.user.update_user_pass(this.user_pass).subscribe((data) => {
        let status = data;
        if(status == "Updated"){
          $('#rst_infos').text('Password updated successfully');
          $('#rst_infos').css('color', 'var(--green_nvx)');
        } else{
          $('#rst_infos').text('A problem occurred while updating password. Please try again later.');
        }
        this.show_infos=true;
      },
        err => console.log(err),
        () => {setTimeout(()=>{this.router.navigate(['home']);}, 3000);}
      );
    }
  }

  private get_user(){
    this.getusrRes$ = this.user.get_user_infos(this.key, this.reset).subscribe((data)=>{
      if(data == "link error"){
        $('#rst_infos').text('This link is no longer available.');
        this.show_infos=true;
      }
      else if(data == "get infos ok"){
        this.user_nick = this.user.get_nick();
        this.user_email = this.user.get_user_email();
        this.valid_link = true;
      }
      else{
        $('#rst_infos').text('A problem occurred while resetting password. Please try again later.');
        this.show_infos=true;
      }
    });
  }

  public showPass():void{
    this.show_pass = !this.show_pass;
  }

}
