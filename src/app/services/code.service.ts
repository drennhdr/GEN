import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Config } from "../models/Config";

import { from, Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { ValidationModel } from '../models/ValidationModel';

import { CodeListModel, CodeAlphaItemModel, CountryListModel, CodeAlphaListModel, BillingCodeListModel } from '../models/CodeModel';
import { GenericResponseModel } from '../models/GenericResponseModel';

@Injectable({
    providedIn: 'root'
  })
  export class CodeService {
    apiRoot: string = new Config().apiRoot;
    tranSourceId: number = new Config().corpTranSource;
    version: string = new Config().version;
    constructor(private httpClient: HttpClient) {}
 

  getList( codeType: string ) {
    // Validate input
    if (typeof codeType=='undefined') codeType = '';

    var validation = new ValidationModel();
    validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
    validation.userId_Login =  parseInt(sessionStorage.getItem('userId_Login'));
    validation.token = sessionStorage.getItem('token');
    validation.tranSourceId = this.tranSourceId;
    validation.version = this.version;

    var url =  this.apiRoot + 'api/Code/GetList' + '?validation=' + JSON.stringify(validation) + '&codeType=' + codeType;

    return this.httpClient.get(url)
        .pipe(
           map((data: CodeListModel) => {
             return data;
           }), catchError( error => {
             return throwError(  error );//'Something went wrong!' );
           })
        )
    }

getAlphaList( codeType: string ) {
  // Validate input
  if (typeof codeType=='undefined') codeType = '';

  var validation = new ValidationModel();
  validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
  validation.userId_Login =  parseInt(sessionStorage.getItem('userId_Login'));
  validation.token = sessionStorage.getItem('token');
  validation.tranSourceId = this.tranSourceId;
  validation.version = this.version;
  validation.tranSourceId = this.tranSourceId;
  validation.version = this.version;

  var url =  this.apiRoot + 'api/Code/GetAlphaList' + '?validation=' + JSON.stringify(validation) + '&codeType=' + codeType;

  return this.httpClient.get(url)
      .pipe(
          map((data: CodeAlphaListModel) => {
            return data;
          }), catchError( error => {
            return throwError(  error );//'Something went wrong!' );
          })
      )
  }
        

  getCountryList() {
    var validation = new ValidationModel();
    validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
    validation.userId_Login =  parseInt(sessionStorage.getItem('userId_Login'));
    validation.token = sessionStorage.getItem('token');
    validation.tranSourceId = this.tranSourceId;
    validation.version = this.version;

  
    validation.tranSourceId = 0;
    validation.version = '';

    var url =  this.apiRoot + 'api/Code/GetCountryList' + '?validation=' + JSON.stringify(validation) 

    return this.httpClient.get(url)
        .pipe(
            map((data: CountryListModel) => {
              return data;
            }), catchError( error => {
              return throwError(  error );//'Something went wrong!' );
            })
        )
    }

  getCountryCodeFromName(countryName: string) {
    var validation = new ValidationModel();
    validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
    validation.userId_Login =  parseInt(sessionStorage.getItem('userId_Login'));
    validation.token = sessionStorage.getItem('token');
    validation.tranSourceId = this.tranSourceId;
    validation.version = this.version;

  
    validation.tranSourceId = 0;
    validation.version = '';

    var url =  this.apiRoot + 'api/Code/CountryCodeFromName' + '?validation=' + JSON.stringify(validation) + "&countryName=" + countryName;

    return this.httpClient.get(url)
        .pipe(
            map((data: GenericResponseModel) => {
              return data;
            }), catchError( error => {
              return throwError(  error );//'Something went wrong!' );
            })
        )
  }

  getCountryIso2ToIso3(countryCode: string) {
    var validation = new ValidationModel();
    validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
    validation.userId_Login =  parseInt(sessionStorage.getItem('userId_Login'));
    validation.token = sessionStorage.getItem('token');
    validation.tranSourceId = this.tranSourceId;
    validation.version = this.version;

  
    validation.tranSourceId = 0;
    validation.version = '';

    var url =  this.apiRoot + 'api/Code/CountryIso2ToIso3' + '?validation=' + JSON.stringify(validation) + "&countryCode=" + countryCode;

    return this.httpClient.get(url)
        .pipe(
            map((data: GenericResponseModel) => {
              return data;
            }), catchError( error => {
              return throwError(  error );//'Something went wrong!' );
            })
        )
  }

  getBillingCodeList( ) {
    // Validate input

    var validation = new ValidationModel();
    validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
    validation.userId_Login =  parseInt(sessionStorage.getItem('userId_Login'));
    validation.token = sessionStorage.getItem('token');
    validation.tranSourceId = this.tranSourceId;
    validation.version = this.version;

 
    validation.tranSourceId = 0;
    validation.version = '';

    var url =  this.apiRoot + 'api/Code/GetBillingCodeList' + '?validation=' + JSON.stringify(validation) + '&entityId=' + parseInt(sessionStorage.getItem('entityId_Login'));

    return this.httpClient.get(url)
        .pipe(
           map((data: BillingCodeListModel) => {
             return data;
           }), catchError( error => {
             return throwError(  error );//'Something went wrong!' );
           })
        )
    }
}