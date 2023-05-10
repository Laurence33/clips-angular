import {AuthService} from 'src/app/services/auth.service';
import {Injectable} from '@angular/core';
import { AsyncValidator, AbstractControl, ValidationErrors} from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class EmailTaken implements AsyncValidator {
  private intervalId : any;
  constructor(private authService: AuthService){}

  validate = (control: AbstractControl) : Promise<ValidationErrors | null> => {
    if(this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    return new Promise((resolve) => {
      this.intervalId = setTimeout(() =>
                                   this.authService.emailExists(control.value)
                                   .then(exists => exists ? resolve({emailTaken: true}) : resolve(null))
                                  , 300);
    });
  }
}
