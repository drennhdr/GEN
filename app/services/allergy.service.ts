// Service Name  : allergy.service.ts
// Date Created  : 8/29/2022
// Written By    : Stephen Farkas
// Description   : Interface to allergy api to get allergy info
// MM/DD/YYYY XXX Description
//
//------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Config } from "../models/Config";

import { from, Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { ValidationModel } from '../models/ValidationModel';

import { AllergyListModel, AllergySearchModel } from '../models/AllergyModel';
import { GenericResponseModel } from '../models/GenericResponseModel';

@Injectable({
    providedIn: 'root'
  })
  export class AllergyService {
    apiRoot: string = new Config().apiRoot;
    tranSourceId: number = new Config().corpTranSource;
    version: string = new Config().version;
    constructor(private httpClient: HttpClient) {}
 

  search( allergy: string ) {

    var validation = new ValidationModel();
    validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
    validation.userId_Login =  parseInt(sessionStorage.getItem('userId_Login'));
    validation.token = sessionStorage.getItem('token');
    validation.tranSourceId = this.tranSourceId;
    validation.version = this.version;
    validation.tranSourceId = this.tranSourceId;
    validation.version = this.version;

    var search = new AllergySearchModel();
    search.description = allergy;

    var url =  this.apiRoot + 'api/Allergy/GetAllergyList' + '?validation=' + JSON.stringify(validation) + '&searchCriteria=' + JSON.stringify(search);

    return this.httpClient.get(url)
        .pipe(
           map((data: AllergyListModel) => {
             return data;
           }), catchError( error => {
             return throwError(  error );//'Something went wrong!' );
           })
        )
    }
}