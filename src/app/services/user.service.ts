// Service Name  : user.service.ts
// Date Created  : 
// Written By    : Stephen Farkas
// Description   : Interface to User api
// MM/DD/YYYY XXX Description
// 07/21/2023 SJF Added SetTempPassword
//------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Config } from "../models/Config";

import { from, Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

// Import data models used by the service
import { UserModel, UserSearchModel, UserListModel, UserDelegateModel} from "../models/UserModel";
import { UserSignatureModel} from "../models/UserSignatureModel";
import { ValidationModel } from '../models/ValidationModel';
import { GenericResponseModel} from '../models/GenericResponseModel';


@Injectable({
  providedIn: 'root'
})
export class UserService {
  apiRoot: string = new Config().apiRoot;
  tranSourceId: number = new Config().corpTranSource;
  version: string = new Config().version;
  constructor(private httpClient: HttpClient) {}

  // ------------------------------------------------------------------------------------------------------------------
  // Search - retrun a list of users that meet the search criteria
  // ------------------------------------------------------------------------------------------------------------------
  search(cutomerId: number, firstName: string, lastName: string, physicianOnly: boolean, paroleOfficer: boolean ) {
    // Validate input
    if (typeof firstName=='undefined') firstName = '';
    if (typeof lastName=='undefined') lastName = '';


    var validation = new ValidationModel();
    validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
    validation.userId_Login =  parseInt(sessionStorage.getItem('userId_Login'));
    validation.token = sessionStorage.getItem('token');
    validation.tranSourceId = this.tranSourceId;
    validation.version = this.version;
    var searchCriteria = new UserSearchModel();
    searchCriteria.customerId = cutomerId;
    searchCriteria.firstName = firstName;
    searchCriteria.lastName = lastName
    searchCriteria.physicianOnly = physicianOnly;
    searchCriteria.paroleOfficer = paroleOfficer;

    var url =  this.apiRoot + 'api/User/GetUserList' + '?validation=' + JSON.stringify(validation) + '&searchCriteria=' + JSON.stringify(searchCriteria);
    return this.httpClient.get(url)
        .pipe(
           map((data: UserListModel) => {
             return data;
           }), catchError( error => {
             return throwError( 'Something went wrong!' );
           })
        )
    }

  // ------------------------------------------------------------------------------------------------------------------
  // Get - return the user based on the id passed in
  // ------------------------------------------------------------------------------------------------------------------
  get( userId: number ) {
    var validation = new ValidationModel();
    validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
    validation.userId_Login =  parseInt(sessionStorage.getItem('userId_Login'));
    validation.token = sessionStorage.getItem('token');
    validation.tranSourceId = this.tranSourceId;
    validation.version = this.version;

    var url =  this.apiRoot + 'api/User/GetUser' + '?validation=' + JSON.stringify(validation) + '&userId=' + userId;
  
    return this.httpClient.get(url)
        .pipe(
            map((data: UserModel) => {
              
              return data;
            }), catchError( error => {
              return throwError( 'Something went wrong!' );
            })
        )
    }

  // ------------------------------------------------------------------------------------------------------------------
  // Save - Write the updated user data to the server
  // ------------------------------------------------------------------------------------------------------------------
  save( user: UserModel ) {

    var validation = new ValidationModel();
    validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
    validation.userId_Login =  parseInt(sessionStorage.getItem('userId_Login'));
    validation.token = sessionStorage.getItem('token');
    validation.tranSourceId = this.tranSourceId;
    validation.version = this.version;

    user.validation = validation;
    user.userId_Updated = parseInt(sessionStorage.getItem('userId_Login'));
    

    // user.widget1 = parseInt(user.widget1.toString());
    // user.widget2 = parseInt(user.widget2.toString());
    // user.widget3 = parseInt(user.widget3.toString());
    // user.widget4 = parseInt(user.widget4.toString());
    // user.widget5 = parseInt(user.widget5.toString());

    user.userTypeId = Number(user.userTypeId);

    var url =  this.apiRoot + 'api/User/SaveUser' 
    var headers = new HttpHeaders();
    headers = headers.set("Content-Type", "application/json; charset=utf-8");

    return this.httpClient.post(url, user, { headers: headers })
        .pipe(
            map((data: GenericResponseModel) => {
              return data;
            }), catchError( error => {
              console.log ("Error", error)
              return throwError( 'Something went wrong!' );
            })
        )
      }

  // ------------------------------------------------------------------------------------------------------------------
  // Save - Write the updated user data to the server
  // ------------------------------------------------------------------------------------------------------------------
  resetUserPassword( user: UserModel ) {

    var validation = new ValidationModel();
    validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
    validation.userId_Login =  parseInt(sessionStorage.getItem('userId_Login'));
    validation.token = sessionStorage.getItem('token');
    validation.tranSourceId = this.tranSourceId;
    validation.version = this.version;

    user.validation = validation;
    user.userId_Updated = parseInt(sessionStorage.getItem('userId_Login'));
    
    user.userTypeId = Number(user.userTypeId);

    var url =  this.apiRoot + 'api/User/ResetPasswordForUser' 
    var headers = new HttpHeaders();
    headers = headers.set("Content-Type", "application/json; charset=utf-8");

    return this.httpClient.post(url, user, { headers: headers })
        .pipe(
            map((data: GenericResponseModel) => {
              return data;
            }), catchError( error => {
              console.log ("Error", error)
              return throwError( 'Something went wrong!' );
            })
        )
      }      

  // ------------------------------------------------------------------------------------------------------------------
  // Set Temp Password - Write the updated user data to the server
  // ------------------------------------------------------------------------------------------------------------------

  setTempPassword(email: string, password: string){
    var validation = new ValidationModel();
    validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
    validation.userId_Login =  parseInt(sessionStorage.getItem('userId_Login'));
    validation.token = sessionStorage.getItem('token');
    validation.tranSourceId = this.tranSourceId;
    validation.version = this.version;

   
    var parms = '?validation=' +  JSON.stringify(validation) + '&email=' + email + '&password=' + password;

    var url =  this.apiRoot + 'api/User/SetTempPassword' + parms

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

  // ------------------------------------------------------------------------------------------------------------------
  // getTicketAssignList - retrun a list of users that can have tickets assigned by user
  // ------------------------------------------------------------------------------------------------------------------
  getTicketAssignList( userId: number ) {
    // Validate input

    var validation = new ValidationModel();
    validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
    validation.userId_Login =  parseInt(sessionStorage.getItem('userId_Login'));
    validation.token = sessionStorage.getItem('token');
    validation.tranSourceId = this.tranSourceId;
    validation.version = this.version;

    var url =  this.apiRoot + 'api/User/GetTicketAssignList' + '?validation=' + JSON.stringify(validation) + '&userId=' + userId;

    return this.httpClient.get(url)
        .pipe(
           map((data: UserListModel) => {
             return data;
           }), catchError( error => {
             return throwError( 'Something went wrong!' );
           })
        )
    }
  // ------------------------------------------------------------------------------------------------------------------
  // addTicketAssign - Write the userticketassign data to the server
  // ------------------------------------------------------------------------------------------------------------------
  addTicketAssign( userId: number, userId_Assign: number ) {

    var validation = new ValidationModel();
    validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
    validation.userId_Login =  parseInt(sessionStorage.getItem('userId_Login'));
    validation.token = sessionStorage.getItem('token');
    validation.tranSourceId = this.tranSourceId;
    validation.version = this.version;

    var url =  this.apiRoot + 'api/User/AddTicketAssign' + '?validation=' + JSON.stringify(validation) + '&userId=' + userId + '&userId_Assign=' + userId_Assign;

    return this.httpClient.get(url)
        .pipe(
           map((data: GenericResponseModel) => {
             return data;
           }), catchError( error => {
             return throwError( 'Something went wrong!' );
           })
        )
    }

  // ------------------------------------------------------------------------------------------------------------------
  // Save the user signature to the server
  // ------------------------------------------------------------------------------------------------------------------
  saveSignature( userSignature: UserSignatureModel ) {

    var validation = new ValidationModel();
    validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
    validation.userId_Login =  parseInt(sessionStorage.getItem('userId_Login'));
    validation.token = sessionStorage.getItem('token');
    validation.tranSourceId = this.tranSourceId;
    validation.version = this.version;

    userSignature.validation = validation;

    var url =  this.apiRoot + 'api/User/SaveSignature' 
    var headers = new HttpHeaders();
    headers = headers.set("Content-Type", "application/json; charset=utf-8");

    return this.httpClient.post(url, userSignature, { headers: headers })
        .pipe(
            map((data: GenericResponseModel) => {
              return data;
            }), catchError( error => {
              console.log ("Error", error)
              return throwError( 'Something went wrong!' );
            })
        )
      }

  // ------------------------------------------------------------------------------------------------------------------
  // Get the user signature form the server
  // ------------------------------------------------------------------------------------------------------------------
  getSignature( userId: number, userSignatureId: number ) {
      var validation = new ValidationModel();
      validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
      validation.userId_Login =  parseInt(sessionStorage.getItem('userId_Login'));
      validation.token = sessionStorage.getItem('token');
      validation.tranSourceId = this.tranSourceId;
      validation.version = this.version;

      var url =  this.apiRoot + 'api/User/GetSignature' + '?validation=' + JSON.stringify(validation) + '&UserId=' + userId + "&UserSignatureId=" + userSignatureId + "&b64=true";
    
      return this.httpClient.get(url)
          .pipe(
              map((data: UserSignatureModel) => {
                
                return data;
              }), catchError( error => {
                return throwError( 'Something went wrong!' );
              })
          )
      
  }

  // ------------------------------------------------------------------------------------------------------------------
  // Save - Write the updated user data to the server
  // ------------------------------------------------------------------------------------------------------------------
  savePrinter(printer: string, quantity:number, camera: boolean ) {

    var validation = new ValidationModel();
    validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
    validation.userId_Login =  parseInt(sessionStorage.getItem('userId_Login'));
    validation.token = sessionStorage.getItem('token');
    validation.tranSourceId = this.tranSourceId;
    validation.version = this.version;

    var user = new UserModel();
    user.validation = validation;
    user.userId = parseInt(sessionStorage.getItem('userId_Login'));;
    user.barcodePrinter = printer;
    user.barcodeQty = quantity;
    user.camera = camera;

    var url =  this.apiRoot + 'api/User/SavePrinter' 
    var headers = new HttpHeaders();
    headers = headers.set("Content-Type", "application/json; charset=utf-8");
    console.log ("Call WS");
    return this.httpClient.post(url, user, { headers: headers })
        .pipe(
            map((data: GenericResponseModel) => {
              return data;
              console.log("Saved", data);
            }), catchError( error => {
              console.log ("Error", error)
              return throwError( 'Something went wrong!' );
            })
        )
      }

  // ------------------------------------------------------------------------------------------------------------------
  // Save Delegates - Update delegates data to the server
  // ------------------------------------------------------------------------------------------------------------------
  saveDelegates( userDelegate: UserDelegateModel ) {

    var validation = new ValidationModel();
    validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
    validation.userId_Login =  parseInt(sessionStorage.getItem('userId_Login'));
    validation.token = sessionStorage.getItem('token');
    validation.tranSourceId = this.tranSourceId;
    validation.version = this.version;

    userDelegate.validation = validation;

    var url =  this.apiRoot + 'api/User/SaveUserDelegates' 
    var headers = new HttpHeaders();
    headers = headers.set("Content-Type", "application/json; charset=utf-8");

    return this.httpClient.post(url, userDelegate, { headers: headers })
        .pipe(
            map((data: GenericResponseModel) => {
              return data;
            }), catchError( error => {
              console.log ("Error", error)
              return throwError( 'Something went wrong!' );
            })
        )
      }

  // ------------------------------------------------------------------------------------------------------------------
  // getDelegateList - retrun a list of user's delegates
  // ------------------------------------------------------------------------------------------------------------------
  getDelegateList( userId: number ) {
    // Validate input

    var validation = new ValidationModel();
    validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
    validation.userId_Login =  parseInt(sessionStorage.getItem('userId_Login'));
    validation.token = sessionStorage.getItem('token');
    validation.tranSourceId = this.tranSourceId;
    validation.version = this.version;

    var url =  this.apiRoot + 'api/User/GetUserDelegates' + '?validation=' + JSON.stringify(validation) + '&userId=' + userId;

    return this.httpClient.get(url)
        .pipe(
           map((data: UserDelegateModel) => {
             return data;
           }), catchError( error => {
             return throwError( 'Something went wrong!' );
           })
        )
    }

  // ------------------------------------------------------------------------------------------------------------------
  // Get user signature id
  // ------------------------------------------------------------------------------------------------------------------

  GetUserSignatureId(userId: number) {
    var validation = new ValidationModel();
    validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
    validation.userId_Login =  parseInt(sessionStorage.getItem('userId_Login'));
    validation.token = sessionStorage.getItem('token');
    validation.tranSourceId = this.tranSourceId;
    validation.version = this.version;

    var url =  this.apiRoot + 'api/User/GetUserSignatureId' + '?validation=' + JSON.stringify(validation) + '&UserId=' + userId;

    
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

  // ------------------------------------------------------------------------------------------------------------------
  // SwitchCustomer - for logins with multiple customer accounts, switch the customer
  // ------------------------------------------------------------------------------------------------------------------
  switchCustomer( userId: number ) {
    var validation = new ValidationModel();
    validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
    validation.userId_Login =  parseInt(sessionStorage.getItem('userId_Login'));
    validation.token = sessionStorage.getItem('token');
    validation.tranSourceId = this.tranSourceId;
    validation.version = this.version;

    var url =  this.apiRoot + 'api/User/SwitchCustomer' + '?validation=' + JSON.stringify(validation) + '&userId=' + userId;
  
    return this.httpClient.get(url)
        .pipe(
            map((data: UserModel) => {
              
              return data;
            }), catchError( error => {
              return throwError( 'Something went wrong!' );
            })
        )
    }
}
