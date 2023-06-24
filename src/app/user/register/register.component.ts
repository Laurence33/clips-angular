import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import IUser from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { RegisterValidators } from '../validators/register-validators';
import { EmailTaken } from '../validators/email-taken';
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  showAlert = false;
  alertMsg = 'Please wait! Your account is being created.';
  alertColor = 'blue';
  inSubmission = false;

  registerForm = new FormGroup(
    {
      name: new FormControl('', [Validators.required, Validators.minLength(3)]),
      email: new FormControl(
        '',
        [Validators.required, Validators.email],
        [this.emailTaken.validate]
      ),
      age: new FormControl<number | null>(null, [
        Validators.required,
        Validators.min(18),
        Validators.max(120),
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.pattern(
          /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm
        ),
      ]),
      confirm_password: new FormControl('', [Validators.required]),
      phone: new FormControl('', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(10),
      ]),
    },
    [RegisterValidators.match('password', 'confirm_password')]
  );

  constructor(
    private authService: AuthService,
    private emailTaken: EmailTaken
  ) {}

  async register() {
    this.inSubmission = true;

    // console.log('Submitted:',  this.registerForm.value);

    this.showAlert = true;
    this.alertMsg = 'Please wait! Your account is being created.';
    this.alertColor = 'blue';

    try {
      // do not pass the object directly, initialize a new object
      await this.authService.register({
        name: this.registerForm.value.name!,
        email: this.registerForm.value.email!,
        age: this.registerForm.value.age!,
        phone: this.registerForm.value.phone!,
        password: this.registerForm.value.password!,
      });
      // console.log('From component', this.registerForm.value);
      this.alertMsg = 'Registration Successful!';
      this.alertColor = 'green';
    } catch (err: any) {
      this.alertMsg = err as string;
      this.alertColor = 'red';
    }

    this.inSubmission = false;
  }
}
