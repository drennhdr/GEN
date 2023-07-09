// Service Name  : icd10.service.ts
// Date Created  : 8/25/2022
// Written By    : Stephen Farkas
// Description   : Interface to icd10 api to get icd info
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

import { Icd10ListModel, Icd10SearchModel } from '../models/Icd10Model';
import { GenericResponseModel } from '../models/GenericResponseModel';

@Injectable({
    providedIn: 'root'
  })
  export class Icd10Service {
    apiRoot: string = new Config().apiRoot;
    tranSourceId: number = new Config().corpTranSource;
    version: string = new Config().version;
    constructor(private httpClient: HttpClient) {}
 

  search( description: string ) {

    var validation = new ValidationModel();
    validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
    validation.userId_Login =  parseInt(sessionStorage.getItem('userId_Login'));
    validation.token = sessionStorage.getItem('token');
    validation.tranSourceId = this.tranSourceId;
    validation.version = this.version;
    validation.tranSourceId = this.tranSourceId;
    validation.version = this.version;

    var search = new Icd10SearchModel();
    search.description = description;

    var url =  this.apiRoot + 'api/ICD/GetICD10List' + '?validation=' + JSON.stringify(validation) + '&searchCriteria=' + JSON.stringify(search);

    return this.httpClient.get(url)
        .pipe(
           map((data: Icd10ListModel) => {
             return data;
           }), catchError( error => {
             return throwError(  error );//'Something went wrong!' );
           })
        )
    }
}