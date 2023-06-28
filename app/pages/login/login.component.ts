import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { AuthenticationService } from '../../services/authentication.service';
import { CustomerService } from '../../services/customer.service';
import { LocationService } from '../../services/location.service';
//import { DataSharingService } from '../../services/datasharing.service';
// import swal from 'sweetalert2/dist/sweetalert2.js';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})



export class LoginComponent implements OnInit {
 
  userEmail: string;
  userPassword: string;
  userCode: string;
  userPassword1: string;
  userPassword2: string;
  userError: string;
  resetCodeGenerated: string;
  corpdashboardUrl: string = "/dashboard";
  warehousedashboardUrl: string = "/dashboard-warehouse";
  orderStatusUrl: string = "/order-status";
  loginText: string = "Login";
  getCodeText: string = "Get Code";
  validateText: string = "Validate";
  resetText: string = "Reset";
  loading = false;
  showLogin: boolean;
  showGetCode: boolean;
  showReset: boolean;
  ResetPassword: string = "Reset Your Password";

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    private customerService: CustomerService,
    private locationService: LocationService,
    // private dataSharingService: DataSharingService,
  ) { }

  ngOnInit() {
    // if (this.authenticationService.currentUserActive) { 
    //   this.router.navigate(['/dashboard']);
    // }
    this.showLogin = true;
    this.showGetCode = false;
    this.showReset = false;

    sessionStorage.setItem('entityId_Login','');
    sessionStorage.setItem('userId_Login','');
    sessionStorage.setItem('userName','');
    sessionStorage.setItem('token','');
    sessionStorage.setItem('signatureId','');
    sessionStorage.setItem('userType','');
    sessionStorage.setItem('physician','');
  }

  loginButtonClicked() {
    if (!this.userEmail) {
      this.userError = "Please enter a valid email.";
    } else if (!this.userPassword) {
      this.userError = "Please enter your password.";
    } else {
      this.loading = true;
      this.authenticationService.login({ username: this.userEmail, password: this.userPassword })
        .pipe(first())
        .subscribe(
          data => {
            if (data.valid) {
                if (data.changePwd){
                  this.userError = "";
                  this.showLogin = false;
                  this.showGetCode = false;
                  this.showReset = true;
                  this.ResetPassword = "Your Password Has Expired, Please Reset Your Password";
                }
                else{
                  if (data.customerId > 0){
                      this.locationService.search(data.userId)
                        .pipe(first())
                        .subscribe(
                        data => {
                          if (data.valid)
                          {
                            sessionStorage.setItem('locationId',data.list[0].locationId.toString());
                            sessionStorage.setItem('locationName',data.list[0].locationName);
                          }
                          else
                          {
                            //
                          }
                        },
                        error => {
                          //
                        });
                  }
                  this.router.navigate([this.corpdashboardUrl]);
                }
            }
            else {
              this.userError = "Invalid email or password.";
            }
          },
          error => {
            this.userError = error;
            this.loading = false;
          });
    }
  }

  forgotButtonClicked() {
    this.showLogin = false;
    this.showGetCode = true;
    this.showReset = false;
  }

  resetCodeButtonClicked() {

    if (!this.userEmail) {
      this.userError = "Please enter a valid email.";
    } else {
      this.loading = true;
      this.authenticationService.resetCode(this.userEmail)
        .pipe(first())
        .subscribe(
          data => {
            if (data.valid) {
              this.resetCodeGenerated = data.id;
              this.userError = "A reset code has been sent to your email.";
            }
            else {
              this.userError = "Invalid email.";
            }
          },
          error => {
            //this.error = error;
            this.loading = false;
          });
    }
  }

  validateButtonClicked() {
    if (this.userCode == this.resetCodeGenerated) {
      this.userError = "";
      this.showLogin = false;
      this.showGetCode = false;
      this.showReset = true;
      this.resetCodeGenerated = "djdjdjee733hh9883lk";
    }
    else {
      this.userError = "Invalid code entered.";
    }
  }

  resetButtonClicked() {
    if (this.userPassword1 != this.userPassword2) {
      this.userError = "passwords do not match";
    }
    else {
      var valid = false;
      var number = 0;
      var upper = 0;
      var lower = 0;
      var special = 0;
      var bad = 0;
      for (var i=0;i<this.userPassword1.length;i++){
        var c = this.userPassword1.charCodeAt(i);
        if (c >= 48 && c <= 57){
          number++;
        }
        else if (c >= 65 && c <= 90){
          upper++;
        }
        else if (c >= 97 && c <= 122){
          lower++;
        }
        else if (c == 33 || c == 36 || c == 42 || c == 64){  //!$*!
          special++;
        }
        else {
          bad++;
        }
      }

      if (bad > 0){
        this.userError = "Invalid character in password";
      }
      else if (this.userPassword1.length >= 10 && number >= 1 && upper >= 1 && lower >= 1 && special >= 1){
        valid = true;
      }
      else {
        this.userError = "Password did not meet minimum requirements";
      }

      if (valid){

        this.loading = true;
        this.authenticationService.resetPassword(this.userEmail, this.userPassword1)
          .pipe(first())
          .subscribe(
            data => {
              if (data.valid) {
                this.userError = "";
                this.showLogin = true;
                this.showGetCode = false;
                this.showReset = false;
              }
              else {
                this.userError = data.message;
              }
            },
            error => {
              //this.error = error;
              this.loading = false;
            });
      }
    }
  }

  // loadSwalAlert(title: string, text: string, type: string, confirmButtonText: string){
  //   swal({
  //     title: title,
  //     toast: true,
  //     timer: 3000,
  //     position: 'bottom-end',
  //     showConfirmButton: false,
  //     text: text,
  //     type: type,
  //     confirmButtonText: confirmButtonText,
  //     confirmButtonColor: "#f5811f"
  //   })
  // }
}

