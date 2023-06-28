// Service Name  : Manifest.service.ts
// Date Created  : 8/2/2022
// Written By    : Stephen Farkas
// Description   : Interface to manifest api to get manifest info
// MM/DD/YYYY XXX Description
// 03/17/2023 SJF Updated to new format
// 03/28/2023 SJF Added GetForSpecimenBarcode
//------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Config } from '../models/Config';

import { from, Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

// Import data models used by the service
import { ManifestModel, ManifestSearchModel, ManifestListModel} from '../models/ManifestModel';
import { ValidationModel } from '../models/ValidationModel';
import { GenericResponseModel} from '../models/GenericResponseModel';

@Injectable({
  providedIn: 'root'
})
export class ManifestService {
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
  // Search - retrun a list of Manifest that meet the search criteria
  // ------------------------------------------------------------------------------------------------------------------
  search(LabId: number, StartDate: string, EndDate: string ) {

      var validation = new ValidationModel();
      validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
      validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
      validation.token = sessionStorage.getItem('token');
      validation.tranSourceId = this.tranSourceId;
      validation.version = this.version;
      var searchCriteria = new ManifestSearchModel();
       searchCriteria.LabId = LabId;
       searchCriteria.StartDate = StartDate;
       searchCriteria.EndDate = EndDate;

      var url = this.apiRoot + 'api/Manifest/GetManifestList' + '?validation=' + JSON.stringify(validation) + '&searchCriteria=' + JSON.stringify(searchCriteria);

      return this.httpClient.get(url)
          .pipe(
             map((data: ManifestListModel) => {
          return data;
      }), catchError(error => {
          return throwError('Something went wrong!'); 
      })
    )
  }

  // ------------------------------------------------------------------------------------------------------------------
  // Get - return the manifest based on the id passed in
  // ------------------------------------------------------------------------------------------------------------------
  get(manifestId: number )
  {
      var validation = new ValidationModel();
      validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
      validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
      validation.token = sessionStorage.getItem('token');
      validation.tranSourceId = this.tranSourceId;
      validation.version = this.version;

      var url = this.apiRoot + 'api/Manifest/GetManifest' + '?validation=' + JSON.stringify(validation) + '&manifestId=' + manifestId;

      return this.httpClient.get(url)
          .pipe(
              map((data: ManifestModel) => { 
                  return data;
              }), catchError(error => {
                  return throwError('Something went wrong!');
              })
      )
  }

  // ------------------------------------------------------------------------------------------------------------------
  // Save - Write the updated manifest data to the server
  // ------------------------------------------------------------------------------------------------------------------
  save(manifest: ManifestModel)
  {

      var validation = new ValidationModel();
      validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
      validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
      validation.token = sessionStorage.getItem('token');
      validation.tranSourceId = this.tranSourceId;
      validation.version = this.version;

      manifest.validation = validation;
      manifest.userId_Updated = parseInt(sessionStorage.getItem('userId_Login'));

      manifest.labId = Number(manifest.labId);
      manifest.sequence = Number(manifest.sequence);
      manifest.userId_Updated = Number(manifest.userId_Updated);

      for (let item of  manifest.specimens)
      {
          item.manifestId = Number(item.manifestId);
          item.labOrderSpecimenId = Number(item.labOrderSpecimenId);
      }

      var url = this.apiRoot + 'api/Manifest/SaveManifest'
      var headers = new HttpHeaders();
      headers = headers.set("Content-Type", "application/json; charset=utf-8");

      return this.httpClient.post(url, manifest, { headers: headers })
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
  // Get the manifest base on a spedimen barcode
  // ------------------------------------------------------------------------------------------------------------------
  getForSpecimenBarcode(specimenBarcode: string){
    var validation = new ValidationModel();
      validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
      validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
      validation.token = sessionStorage.getItem('token');
      validation.tranSourceId = this.tranSourceId;
      validation.version = this.version;

      var url = this.apiRoot + 'api/Manifest/GetForSpecimenBarcode' + '?validation=' + JSON.stringify(validation) + '&SpecimenBarcode=' + specimenBarcode;

      return this.httpClient.get(url)
          .pipe(
              map((data: ManifestModel) => { 
                  return data;
              }), catchError(error => {
                  return throwError('Something went wrong!');
              })
      )
  }
}
