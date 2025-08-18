import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { loadScript } from "@paypal/paypal-js";
declare var paypal: any;
@Component({
  selector: 'app-donate',
  templateUrl: './donate.component.html',
  styleUrls: ['./donate.component.scss']
})
export class DonateComponent implements OnInit {

  public modalPayment :any = {hide:true, loading:true};
  public modalPaymentSuccess :any = {hide:true};

  public amount_symbol: any = {'pick':5, 'strings':10, 'metronome':20, 'ukulele':50, 'pedal':100, 'other':'?' }

  public amount:any = 0;
  public symbol:string;

  private client_token:string='';

  private client:any;
  public transaction_number = null;

  constructor(private _http:HttpClient) { }
  
  ngOnInit(): void { }

  public show_payment_modal(amount:string='other'){
    console.log("payment initiated => "+amount);

    if(Object.keys(this.amount_symbol).indexOf(amount) != -1){
      this.amount = this.amount_symbol[amount];
      switch(amount){
        case('pick'):
          this.symbol='Buy me guitar picks!';
        break;
        case('strings'):
          this.symbol='Buy me guitar strings!';
        break;
        case('metronome'):
          this.symbol='Buy me a metronome!';
        break;
        case('ukulele'):
          this.symbol='Buy me a ukulele!';
        break;
        case('pedal'):
          this.symbol='Buy me a guitar pedal!';
        break;
        case('other'):
          this.symbol='Buy me anything you want!';
        break;
        // case('chords'):
        //  this.searchPattrn.chords=this.param;
        // break;
        default:
        break;
      }
    }else{
      this.amount = null;
      this.symbol = null;
    }
    this.getToken_paypal();
    this.modalPayment.hide = false

  }


  private getToken_paypal(){

    const headers = new HttpHeaders({ 'Content-Type': 'application/json'}); 
      this._http.get(environment.apiGetPaymentToken,{responseType: 'text', headers}).subscribe((res)=>{

        this.modalPayment.loading = false;
        
        let json_res = JSON.parse(res);
        console.log(json_res);
        
        this.client_token = json_res.client_token;
        console.log("this.client_token =>", this.client_token)

        this.loadExternalScript().then(()=>{ this.loadButtons(); })
        

    });
  }

  private loadExternalScript() {
    return new Promise((resolve, reject) => {
      const scriptElement = document.createElement('script')
      scriptElement.src = "https://www.paypal.com/sdk/js?client-id="+environment.clientId_prod;
      scriptElement['data-client-token'] = this.client_token;
      scriptElement.onload = resolve
      document.body.appendChild(scriptElement)
    })
  }

  private loadButtons(){
    
      paypal.Buttons({
        // Sets up the transaction when a payment button is clicked
        createOrder: (data, actions) => {
          return actions.order.create({
            purchase_units: [{
              amount: { value: this.amount }
            }]
          });
        },
        // Finalize the transaction after payer approval
        onApprove: (data, actions) => {
          return actions.order.capture().then(function(orderData) {
            // Successful capture! For dev/demo purposes:
            console.log('Capture result', orderData, JSON.stringify(orderData, null, 2));
            const transaction = orderData.purchase_units[0].payments.captures[0];
            
            // alert(`Transaction ${transaction.status}: ${transaction.id}\n\nSee console for all available details`);
            // When ready to go live, remove the alert and show a success message within this page. For example:
            const element = document.getElementById('paymentModal-body');
            element.innerHTML = '<div><h3>Thank you !</h3></div><div> Transaction status: '+transaction.status+'</div>'+'<div>Transaction Id : '+transaction.id+'</div>'+'<div>Transaction amount : '+transaction.amount.value+'</div>';
            // Or go to another URL:  actions.redirect('thank_you.html');
          });
        }
      }).render('#paypal-button-container');
  }

}
