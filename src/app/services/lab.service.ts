import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Config } from '../models/Config';

import { from, Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

// Import data models used by the service
import { LabModel, LabSearchModel, LabListModel} from '../models/LabModel';
import { ValidationModel } from '../models/ValidationModel';
import { GenericResponseModel} from '../models/GenericResponseModel';

@Injectable({
  providedIn: 'root'
})
export class LabService {
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
  // Search - retrun a list of Lab that meet the search criteria
  // ------------------------------------------------------------------------------------------------------------------
  search(Name: string ) {

      var validation = new ValidationModel();
      validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
      validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
      validation.token = sessionStorage.getItem('token');
      validation.tranSourceId = this.tranSourceId;
      validation.version = this.version;
      var searchCriteria = new LabSearchModel();
       searchCriteria.Name = Name;

      var url = this.apiRoot + 'api/Lab/GetLabList' + '?validation=' + JSON.stringify(validation) + '&searchCriteria=' + JSON.stringify(searchCriteria);

      return this.httpClient.get(url)
          .pipe(
             map((data: LabListModel) => {
          return data;
      }), catchError(error => {
          return throwError('Something went wrong!'); 
      })
    )
  }

  // ------------------------------------------------------------------------------------------------------------------
  // Get - return the lab based on the id passed in
  // ------------------------------------------------------------------------------------------------------------------
  get(labId: number )
  {
      var validation = new ValidationModel();
      validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
      validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
      validation.token = sessionStorage.getItem('token');
      validation.tranSourceId = this.tranSourceId;
      validation.version = this.version;

      var url = this.apiRoot + 'api/Lab/GetLab' + '?validation=' + JSON.stringify(validation) + '&labId=' + labId;

      return this.httpClient.get(url)
          .pipe(
              map((data: LabModel) => { 
                  return data;
              }), catchError(error => {
                  return throwError('Something went wrong!');
              })
      )
  }

  // ------------------------------------------------------------------------------------------------------------------
  // Save - Write the updated lab data to the server
  // ------------------------------------------------------------------------------------------------------------------
  save(lab: LabModel)
  {

      var validation = new ValidationModel();
      validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
      validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
      validation.token = sessionStorage.getItem('token');
      validation.tranSourceId = this.tranSourceId;
      validation.version = this.version;

      lab.validation = validation;
      lab.userId_Updated = parseInt(sessionStorage.getItem('userId_Login'));

      lab.addressId = Number(lab.addressId);
      lab.userId_Updated = Number(lab.userId_Updated);


      var url = this.apiRoot + 'api/Lab/SaveLab'
      var headers = new HttpHeaders();
      headers = headers.set("Content-Type", "application/json; charset=utf-8");

      return this.httpClient.post(url, lab, { headers: headers })
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
