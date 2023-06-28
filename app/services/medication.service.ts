// Service Name  : medication.service.ts
// Date Created  : 8/24/2022
// Written By    : Stephen Farkas
// Description   : Interface to medication api to get medication info
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

import { MedicationListModel, MedicationSearchModel } from '../models/MedicationModel';
import { GenericResponseModel } from '../models/GenericResponseModel';

@Injectable({
    providedIn: 'root'
  })
  export class MedicationService {
    apiRoot: string = new Config().apiRoot;
    tranSourceId: number = new Config().corpTranSource;
    version: string = new Config().version;
    constructor(private httpClient: HttpClient) {}
 

  search( medication: string ) {

    var validation = new ValidationModel();
    validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
    validation.userId_Login =  parseInt(sessionStorage.getItem('userId_Login'));
    validation.token = sessionStorage.getItem('token');
    validation.tranSourceId = this.tranSourceId;
    validation.version = this.version;
    validation.tranSourceId = this.tranSourceId;
    validation.version = this.version;

    var search = new MedicationSearchModel();
    search.medicationName = medication;

    var url =  this.apiRoot + 'api/Medication/GetMedicationList' + '?validation=' + JSON.stringify(validation) + '&searchCriteria=' + JSON.stringify(search);

    return this.httpClient.get(url)
        .pipe(
           map((data: MedicationListModel) => {
             return data;
           }), catchError( error => {
             return throwError(  error );//'Something went wrong!' );
           })
        )
    }
}