import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  credentials = {
    email: '',
    password: '',
  };

  alertColor = 'blue'
  showAlert = false;
  alertMsg = '';
  inSubmission = false;

  constructor(private authService: AuthService){}


  async login(values: {email: string, password: string}) {
    console.log(values )

    this.showAlert = true;
    this.alertMsg = 'You are being logged in, please wait';
    this.alertColor = 'blue';
    this.inSubmission = true;

    try {
       await this.authService.login(values.email, values.password) ;
       this.alertMsg = 'Sucess! You are now logged in.';
       this.alertColor = 'green';
    } catch(ex: any) {
      this.alertMsg = ex;
      this.alertColor = 'red';
    }

    this.inSubmission = false;
  }
}

