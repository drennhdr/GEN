// Service Name  : physicianPreference.service.ts
// Date Created  : 8/10/2022
// Written By    : Stephen Farkas
// Description   : Interface to LabOrder api
// MM/DD/YYYY XXX Description
//
//------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Config } from '../models/Config';

import { from, Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

// Import data models used by the service
import { PhysicianPreferenceModel, PhysicianPreferenceSearchModel, PhysicianPreferenceListModel} from '../models/PhysicianPreferenceModel';
import { ValidationModel } from '../models/ValidationModel';
import { GenericResponseModel} from '../models/GenericResponseModel';

@Injectable({
  providedIn: 'root'
})
export class PhysicianPreferenceService {
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

  // ------------------------------------------------------------------------------------------------------------------
  // Search - retrun a list of PhysicianPreference that meet the search criteria
  // ------------------------------------------------------------------------------------------------------------------
  search(userId: number, customerId: number, labTypeId: number ) {

      var validation = new ValidationModel();
      validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
      validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
      validation.token = sessionStorage.getItem('token');
      validation.tranSourceId = this.tranSourceId;
      validation.version = this.version;
      var searchCriteria = new PhysicianPreferenceSearchModel();
       searchCriteria.userId = userId;
       searchCriteria.customerId = customerId;
       searchCriteria.labTypeId = labTypeId;
      var url = this.apiRoot + 'api/LabOrder/GetPhysicianPreferenceList' + '?validation=' + JSON.stringify(validation) + '&searchCriteria=' + JSON.stringify(searchCriteria);
      return this.httpClient.get(url)
          .pipe(
             map((data: PhysicianPreferenceListModel) => {
          return data;
      }), catchError(error => {
          return throwError('Something went wrong!'); 
      })
    )
  }

  // ------------------------------------------------------------------------------------------------------------------
  // Get - return the physicianPreference based on the id passed in
  // ------------------------------------------------------------------------------------------------------------------
  get(physicianPreferenceId: number )
  {
      var validation = new ValidationModel();
      validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
      validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
      validation.token = sessionStorage.getItem('token');
      validation.tranSourceId = this.tranSourceId;
      validation.version = this.version;

      var url = this.apiRoot + 'api/LabOrder/GetPhysicianPreference' + '?validation=' + JSON.stringify(validation) + '&physicianPreferenceId=' + physicianPreferenceId;

      return this.httpClient.get(url)
          .pipe(
              map((data: PhysicianPreferenceModel) => { 
                  return data;
              }), catchError(error => {
                  return throwError('Something went wrong!');
              })
      )
  }

  // ------------------------------------------------------------------------------------------------------------------
  // Save - Write the updated physicianPreference data to the server
  // ------------------------------------------------------------------------------------------------------------------
  save(physicianPreference: PhysicianPreferenceModel)
  {

      var validation = new ValidationModel();
      validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
      validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
      validation.token = sessionStorage.getItem('token');
      validation.tranSourceId = this.tranSourceId;
      validation.version = this.version;

      physicianPreference.validation = validation;
      physicianPreference.userId_Updated = parseInt(sessionStorage.getItem('userId_Login'));

      physicianPreference.userId = Number(physicianPreference.userId);
      physicianPreference.customerId = Number(physicianPreference.customerId);
      physicianPreference.labTypeId = Number(physicianPreference.labTypeId);
      physicianPreference.userId_Updated = Number(physicianPreference.userId_Updated);

      for (let item of  physicianPreference.tests)
      {
          item.physicianPreferenceId = Number(item.physicianPreferenceId);
          item.labTestId = Number(item.labTestId);
      }

      var url = this.apiRoot + 'api/LabOrder/SavePhysicianPreference'
      var headers = new HttpHeaders();
      headers = headers.set("Content-Type", "application/json; charset=utf-8");

      return this.httpClient.post(url, physicianPreference, { headers: headers })
          .pipe(
              map((data: GenericResponseModel) => {
                  return data;
              }), catchError(error => {
                  console.log("Error", error)
                  return throwError('Something went wrong!');
              })
            )
  }

    // ------------------------------------------------------------------------------------------------------------------
  // Save - Write the updated physicianPreference data to the server
  // ------------------------------------------------------------------------------------------------------------------
  sunset(physicianPreference: PhysicianPreferenceModel)
  {

      var validation = new ValidationModel();
      validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
      validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
      validation.token = sessionStorage.getItem('token');
      validation.tranSourceId = this.tranSourceId;
      validation.version = this.version;

      physicianPreference.validation = validation;
      physicianPreference.userId_Updated = parseInt(sessionStorage.getItem('userId_Login'));

      physicianPreference.userId = Number(physicianPreference.userId);
      physicianPreference.customerId = Number(physicianPreference.customerId);
      physicianPreference.labTypeId = Number(physicianPreference.labTypeId);
      physicianPreference.userId_Updated = Number(physicianPreference.userId_Updated);

      for (let item of  physicianPreference.tests)
      {
          item.physicianPreferenceId = Number(item.physicianPreferenceId);
          item.labTestId = Number(item.labTestId);
      }

      var url = this.apiRoot + 'api/LabOrder/SunsetPhysicianPreference'
      var headers = new HttpHeaders();
      headers = headers.set("Content-Type", "application/json; charset=utf-8");

      return this.httpClient.post(url, physicianPreference, { headers: headers })
          .pipe(
              map((data: GenericResponseModel) => {
                  return data;
              }), catchError(error => {
                  console.log("Error", error)
                  return throwError('Something went wrong!');
              })
            )
  }
}
