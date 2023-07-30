import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Config } from "../models/Config";
import { UserModel } from "../models/UserModel";
import {formatDate} from '@angular/common';

import { from, Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { GenericResponseModel} from '../models/GenericResponseModel';
import { ValidationModel } from '../models/ValidationModel';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
    apiRoot: string = new Config().apiRoot;
    tranSourceId: number = new Config().corpTranSource;
    version: string = new Config().version;
    constructor(private httpClient: HttpClient) {}

  public get currentUserActive() {
    var user = sessionStorage.getItem('userId_Login');
    if (user == "undefined") 
      return false;
    else
      return true;
  }

  login({ username, password }: { username; password; }) {
    var parms = '?email=' + username + '&password=' + encodeURIComponent(password) ;

    var url =  this.apiRoot + 'api/User/Authenticate' + parms
    return this.httpClient.get(url)
        .pipe(
           map((data: UserModel) => {
            console.log("Validation",data);
              if (data.valid == true && !data.changePwd)
              {
                console.log("User",data);
                sessionStorage.setItem('unsavedChanges',"0");
                sessionStorage.setItem('entityId_Login',String(data.customerId));
                sessionStorage.setItem('userId_Login',String(data.userId));
                sessionStorage.setItem('userName',String(data.firstName + " " + data.lastName));
                sessionStorage.setItem('token',data.validation.token);
                sessionStorage.setItem('signatureId',String(data.userSignatureId));
                sessionStorage.setItem('userType',String(data.userTypeId));
                sessionStorage.setItem('physician',String(data.physician));
                sessionStorage.setItem('barcodePrinter',String(data.barcodePrinter));
                sessionStorage.setItem('barcodeQty',data.barcodeQty.toString());
                sessionStorage.setItem('camera',data.camera.toString());
                sessionStorage.setItem('delegate',JSON.stringify(data.delegates));
                sessionStorage.setItem('shipLog',JSON.stringify(data.shipLog));
                if (data.salesUserEdit){
                  sessionStorage.setItem('salesUserEdit',"1");
                }
                else{
                  sessionStorage.setItem('salesUserEdit',"0");
                }
                if (data.salesPatientReport){
                  sessionStorage.setItem('salesPatientReport',"1");
                }
                else{
                  sessionStorage.setItem('salesPatientReport',"0");
                }
                sessionStorage.setItem('locationId','');
                sessionStorage.setItem('locationName','');
                if (data.multiLogin){
                  sessionStorage.setItem('multilogin','1');
                }
                else{
                  sessionStorage.setItem('multilogin','0');
                }
                sessionStorage.setItem('userAccounts',JSON.stringify(data.accounts));

                if (data.customerId == 0){
                  sessionStorage.setItem('customerId','0');
                  sessionStorage.setItem('customerName','Genesis Reference Labs');
                }
                else{
                  sessionStorage.setItem('customerId','');
                  sessionStorage.setItem('customerName',data.customerName);
                }
                sessionStorage.setItem('topMessage',data.topMessage);
              }
              return data;
           }), catchError( error => {
               console.log("error",error)
             return throwError( 'Something went wrong! ' + error);
           })
        )
    }


  resetCode(email: string){
    var dateStamp = new Date();
    dateStamp.setDate(dateStamp.getDate());

    var validation = new ValidationModel();
    validation.entityId_Login = 1;
    validation.userId_Login =  -1;
    validation.token = formatDate(dateStamp , 'yyyyMMdd', 'en');
    validation.tranSourceId = 1;
    validation.version = '1.0';

    var parms = '?validation=' +  JSON.stringify(validation) + '&email=' + email ;

    var url =  this.apiRoot + 'api/User/ResetCode' + parms

    return this.httpClient.get(url)
        .pipe(
           map((data: GenericResponseModel) => {
            return data;
           }), catchError( error => {
             console.log("error",error)
             return throwError( 'Something went wrong! ' );
           })
        )
  }

  resetPassword(email: string, password: string){
    var dateStamp = new Date();
    dateStamp.setDate(dateStamp.getDate());

    var validation = new ValidationModel();
    validation.entityId_Login = 1;
    validation.userId_Login =  -1;
    validation.token = formatDate(dateStamp , 'yyyyMMdd', 'en');
    validation.tranSourceId = 1;
    validation.version = '1.0';

    var parms = '?validation=' +  JSON.stringify(validation) + '&email=' + email + '&password=' + password;

    var url =  this.apiRoot + 'api/User/ResetPassword' + parms

    return this.httpClient.get(url)
        .pipe(
           map((data: GenericResponseModel) => {

            return data;
           }), catchError( error => {
             console.log("error",error)
             return throwError( 'Something went wrong!' );
           })
        )
  }

  logout() {
    console.log("Authentication Logout");
        // remove user from local storage and set current user to null
        sessionStorage.removeItem('entityId_Login');
        sessionStorage.removeItem('userId_Login');
        sessionStorage.removeItem('userName');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('signatureId');
        sessionStorage.removeItem('userType');
        sessionStorage.removeItem('physician');
        sessionStorage.setItem('topMessage','');
        sessionStorage.setItem('customerName','');
        sessionStorage.setItem('locationId','');
        sessionStorage.setItem('locationName','');
    }
}
