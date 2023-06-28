// Service Name  : location.service.ts
// Date Created  : 8/2/2022
// Written By    : Stephen Farkas
// Description   : Interface to location api to get location info
// MM/DD/YYYY XXX Description
// 06/17/2023 SJF Added GetForSalesRep
//------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Config } from '../models/Config';

import { from, Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

// Import data models used by the service
import { LocationModel, LocationSearchModel, LocationListModel} from '../models/LocationModel';
import { ValidationModel } from '../models/ValidationModel';
import { GenericResponseModel} from '../models/GenericResponseModel';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
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
  // Search - retrun a list of Location that meet the search criteria
  // ------------------------------------------------------------------------------------------------------------------
  search(userId: number ) {

      var validation = new ValidationModel();
      validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
      validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
      validation.token = sessionStorage.getItem('token');
      validation.tranSourceId = this.tranSourceId;
      validation.version = this.version;

      var url = this.apiRoot + 'api/Customer/GetLocationList' + '?validation=' + JSON.stringify(validation) + '&UserId=' + userId;
      return this.httpClient.get(url)
          .pipe(
             map((data: LocationListModel) => {
          return data;
      }), catchError(error => {
        console.log("Error",error);
          return throwError('Something went wrong!'); 
      })
    )
  }

  // ------------------------------------------------------------------------------------------------------------------
  // Search - retrun a list of Location that meet the search criteria
  // ------------------------------------------------------------------------------------------------------------------
  getForCustomer(customerId: number ) {

    var validation = new ValidationModel();
    validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
    validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
    validation.token = sessionStorage.getItem('token');
    validation.tranSourceId = this.tranSourceId;
    validation.version = this.version;

    var url = this.apiRoot + 'api/Customer/GetLocationListForCustomer' + '?validation=' + JSON.stringify(validation) + '&CustomerId=' + customerId;
    return this.httpClient.get(url)
        .pipe(
           map((data: LocationListModel) => {
        return data;
    }), catchError(error => {
      console.log("Error",error);
        return throwError('Something went wrong!'); 
    })
  )
}


  // ------------------------------------------------------------------------------------------------------------------
  // Search - retrun a list of Location that meet the search criteria
  // ------------------------------------------------------------------------------------------------------------------
  getForSalesRep(userId: number ) {

    var validation = new ValidationModel();
    validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
    validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
    validation.token = sessionStorage.getItem('token');
    validation.tranSourceId = this.tranSourceId;
    validation.version = this.version;

    var url = this.apiRoot + 'api/Customer/GetLocationListForSalesRep' + '?validation=' + JSON.stringify(validation) + '&UserId=' + userId;
    return this.httpClient.get(url)
        .pipe(
           map((data: LocationListModel) => {
        return data;
    }), catchError(error => {
      console.log("Error",error);
        return throwError('Something went wrong!'); 
    })
  )
}

  // ------------------------------------------------------------------------------------------------------------------
  // Get - return the location based on the id passed in
  // ------------------------------------------------------------------------------------------------------------------
  get(locationId: number )
  {
      var validation = new ValidationModel();
      validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
      validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
      validation.token = sessionStorage.getItem('token');
      validation.tranSourceId = this.tranSourceId;
      validation.version = this.version;

      var url = this.apiRoot + 'api/Customer/GetLocation' + '?validation=' + JSON.stringify(validation) + '&locationId=' + locationId;

      return this.httpClient.get(url)
          .pipe(
              map((data: LocationModel) => { 
                  return data;
              }), catchError(error => {
                  return throwError('Something went wrong!');
              })
      )
  }

  // ------------------------------------------------------------------------------------------------------------------
  // Save - Write the updated location data to the server
  // ------------------------------------------------------------------------------------------------------------------
  save(location: LocationModel)
  {

      var validation = new ValidationModel();
      validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
      validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
      validation.token = sessionStorage.getItem('token');
      validation.tranSourceId = this.tranSourceId;
      validation.version = this.version;

      location.validation = validation;

      location.customerId = Number(location.customerId);
      location.specialtyId = Number(location.specialtyId);
      location.address.addressId = Number(location.address.addressId);
      location.timeZoneId = Number(location.timeZoneId);
      location.shipingMethodId_Preferred = Number(location.shipingMethodId_Preferred);
      location.userId_Updated = parseInt(sessionStorage.getItem('userId_Login'));


      var url = this.apiRoot + 'api/Customer/SaveLocation'
      var headers = new HttpHeaders();
      headers = headers.set("Content-Type", "application/json; charset=utf-8");

      return this.httpClient.post(url, location, { headers: headers })
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
