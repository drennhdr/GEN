// Service Name  : ShipLog.service.ts
// Date Created  : 2/10/2023
// Written By    : Stephen Farkas
// Description   : Interface to shipLog api to get shipLog info
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
import { ShipLogModel, ShipLogSearchModel, ShipLogListModel} from '../models/ShipLogModel';
import { ValidationModel } from '../models/ValidationModel';
import { GenericResponseModel} from '../models/GenericResponseModel';

@Injectable({
  providedIn: 'root'
})
export class ShipLogService {
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
  // Search - retrun a list of ShipLog that meet the search criteria
  // ------------------------------------------------------------------------------------------------------------------
  search(CustomerId: number, LocationId: number, StartDate: string, EndDate: string ) {

      var validation = new ValidationModel();
      validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
      validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
      validation.token = sessionStorage.getItem('token');
      validation.tranSourceId = this.tranSourceId;
      validation.version = this.version;
      var searchCriteria = new ShipLogSearchModel();
       searchCriteria.CustomerId = CustomerId;
       searchCriteria.LocationId = LocationId;
       searchCriteria.StartDate = StartDate;
       searchCriteria.EndDate = EndDate;

      var url = this.apiRoot + 'api/ShipLog/GetShipLogList' + '?validation=' + JSON.stringify(validation) + '&searchCriteria=' + JSON.stringify(searchCriteria);

      return this.httpClient.get(url)
          .pipe(
             map((data: ShipLogListModel) => {
          return data;
      }), catchError(error => {
          return throwError('Something went wrong!'); 
      })
    )
  }

  // ------------------------------------------------------------------------------------------------------------------
  // Get - return the shipLog based on the id passed in
  // ------------------------------------------------------------------------------------------------------------------
  get(shipLogId: number )
  {
      var validation = new ValidationModel();
      validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
      validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
      validation.token = sessionStorage.getItem('token');
      validation.tranSourceId = this.tranSourceId;
      validation.version = this.version;

      var url = this.apiRoot + 'api/ShipLog/GetShipLog' + '?validation=' + JSON.stringify(validation) + '&shipLogId=' + shipLogId;

      return this.httpClient.get(url)
          .pipe(
              map((data: ShipLogModel) => { 
                  return data;
              }), catchError(error => {
                  return throwError('Something went wrong!');
              })
      )
  }

  // ------------------------------------------------------------------------------------------------------------------
  // Save - Write the updated shipLog data to the server
  // ------------------------------------------------------------------------------------------------------------------
  save(shipLog: ShipLogModel)
  {

      var validation = new ValidationModel();
      validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
      validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
      validation.token = sessionStorage.getItem('token');
      validation.tranSourceId = this.tranSourceId;
      validation.version = this.version;

      shipLog.validation = validation;
      shipLog.userId_Updated = parseInt(sessionStorage.getItem('userId_Login'));

      shipLog.customerId = Number(shipLog.customerId);
      shipLog.locationId = Number(shipLog.locationId);
      shipLog.userId_Updated = Number(shipLog.userId_Updated);

      for (let item of  shipLog.specimens)
      {
          item.shipLogId = Number(item.shipLogId);
          item.labOrderSpecimenId = Number(item.labOrderSpecimenId);
      }

      var url = this.apiRoot + 'api/ShipLog/SaveShipLog'
      var headers = new HttpHeaders();
      headers = headers.set("Content-Type", "application/json; charset=utf-8");

      return this.httpClient.post(url, shipLog, { headers: headers })
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
  // Received - Write the updated shipLog data to the server
  // ------------------------------------------------------------------------------------------------------------------
  received(shipLog: ShipLogModel)
  {

      var validation = new ValidationModel();
      validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
      validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
      validation.token = sessionStorage.getItem('token');
      validation.tranSourceId = this.tranSourceId;
      validation.version = this.version;

      shipLog.validation = validation;
      shipLog.userId_Updated = parseInt(sessionStorage.getItem('userId_Login'));

      shipLog.customerId = Number(shipLog.customerId);
      shipLog.locationId = Number(shipLog.locationId);
      shipLog.userId_Updated = Number(shipLog.userId_Updated);

      for (let item of  shipLog.specimens)
      {
          item.shipLogId = Number(item.shipLogId);
          item.labOrderSpecimenId = Number(item.labOrderSpecimenId);
      }

      var url = this.apiRoot + 'api/ShipLog/ReceiveShipLog'
      var headers = new HttpHeaders();
      headers = headers.set("Content-Type", "application/json; charset=utf-8");

      return this.httpClient.post(url, shipLog, { headers: headers })
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
