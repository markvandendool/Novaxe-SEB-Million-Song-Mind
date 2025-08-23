import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserModel } from '@models/usermodel/usermodel';
import { Router } from '@angular/router';

declare var $: any;

@Component({
  selector: 'app-premium-auth',
  templateUrl: './premium-auth.component.html',
  styleUrls: ['./premium-auth.component.scss'],
  standalone: false
})
export class PremiumAuthComponent implements OnInit, OnDestroy {
  
  public isSignUp = false;
  public email = '';
  public password = '';
  public confirmPassword = '';
  public nickname = '';
  public showPassword = false;
  public isLoading = false;
  public errorMessage = '';
  public successMessage = '';

  private loginRes$: any;
  private signupRes$: any;

  constructor(
    public user: UserModel,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check if user is already logged in
    if (this.user.user_is_logged.value) {
      this.router.navigate(['/home']);
    }
  }

  ngOnDestroy(): void {
    if (this.loginRes$) this.loginRes$.unsubscribe();
    if (this.signupRes$) this.signupRes$.unsubscribe();
  }

  toggleAuthMode(): void {
    this.isSignUp = !this.isSignUp;
    this.clearMessages();
    this.clearForm();
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  clearForm(): void {
    this.email = '';
    this.password = '';
    this.confirmPassword = '';
    this.nickname = '';
  }

  validateForm(): boolean {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please fill in all required fields';
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.errorMessage = 'Please enter a valid email address';
      return false;
    }

    if (this.isSignUp) {
      if (!this.nickname) {
        this.errorMessage = 'Please enter a nickname';
        return false;
      }
      
      if (this.password.length < 6) {
        this.errorMessage = 'Password must be at least 6 characters long';
        return false;
      }

      if (this.password !== this.confirmPassword) {
        this.errorMessage = 'Passwords do not match';
        return false;
      }
    }

    return true;
  }

  onSubmit(): void {
    this.clearMessages();
    
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;

    if (this.isSignUp) {
      this.performSignUp();
    } else {
      this.performLogin();
    }
  }

  performLogin(): void {
    this.user.set_user_email(this.email);
    this.loginRes$ = this.user.login(this.password).subscribe({
      next: (data) => {
        console.log('Login response:', data);
        this.isLoading = false;
        
        switch(data) {
          case "wrong email":
            this.errorMessage = 'Email not found';
            break;
          case "wrong pass":
            this.errorMessage = 'Incorrect password';
            break;
          case "empty infos":
            this.errorMessage = 'Please fill in all fields';
            break;
          case "login ok":
            this.successMessage = 'Welcome back!';
            setTimeout(() => {
              this.router.navigate(['/home']);
            }, 1500);
            break;
          default:
            this.errorMessage = 'Login failed. Please try again.';
        }
      },
      error: (err) => {
        console.error('Login error:', err);
        this.isLoading = false;
        this.errorMessage = 'Login failed. Please try again.';
      }
    });
  }

  performSignUp(): void {
    this.signupRes$ = this.user.sign_up(this.password, this.email, this.nickname).subscribe({
      next: (data) => {
        console.log('Sign up response:', data);
        this.isLoading = false;
        
        switch(data) {
          case "email error":
            this.errorMessage = 'This email is already registered';
            break;
          case "nick error":
            this.errorMessage = 'This nickname is already taken';
            break;
          case "signup complete":
            this.successMessage = 'Account created successfully! Welcome!';
            setTimeout(() => {
              this.router.navigate(['/home']);
            }, 1500);
            break;
          default:
            this.errorMessage = 'Sign up failed. Please try again.';
        }
      },
      error: (err) => {
        console.error('Sign up error:', err);
        this.isLoading = false;
        this.errorMessage = 'Sign up failed. Please try again.';
      }
    });
  }

  // BYPASS AUTHENTICATION - Direct access to the app
  bypassAuth(): void {
    this.isLoading = true;
    this.successMessage = 'Entering demo mode...';
    
    // Set a demo user
    this.user.set_user_nick('Demo User');
    this.user.set_user_email('demo@millionsongmind.com');
    this.user.user_is_logged.next(true);
    
    setTimeout(() => {
      this.router.navigate(['/home']);
    }, 1500);
  }

  // Quick demo credentials
  useDemoCredentials(): void {
    this.email = 'demo@millionsongmind.com';
    this.password = 'demo123';
    if (this.isSignUp) {
      this.confirmPassword = 'demo123';
      this.nickname = 'Demo User';
    }
  }
}
