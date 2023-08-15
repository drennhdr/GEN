import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Config } from '../models/Config';

import { from, Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

// Import data models used by the service
import { InboxModel, InboxSearchModel, InboxListModel} from '../models/InboxModel';
import { ValidationModel } from '../models/ValidationModel';
import { GenericResponseModel} from '../models/GenericResponseModel';

@Injectable({
  providedIn: 'root'
})
export class InboxService {
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
  // Search - retrun a list of Inbox that meet the search criteria
  // ------------------------------------------------------------------------------------------------------------------
  search(CustomerId: number ) {

      var validation = new ValidationModel();
      validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
      validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
      validation.token = sessionStorage.getItem('token');
      validation.tranSourceId = this.tranSourceId;
      validation.version = this.version;
      var searchCriteria = new InboxSearchModel();
       searchCriteria.CustomerId = CustomerId;

      var url = this.apiRoot + 'api/Inbox/GetInboxList' + '?validation=' + JSON.stringify(validation) + '&searchCriteria=' + JSON.stringify(searchCriteria);

      return this.httpClient.get(url)
          .pipe(
             map((data: InboxListModel) => {
          return data;
      }), catchError(error => {
          return throwError('Something went wrong!'); 
      })
    )
  }

  // ------------------------------------------------------------------------------------------------------------------
  // Get - return the inbox based on the id passed in
  // ------------------------------------------------------------------------------------------------------------------
  get(inboxId: number )
  {
    var validation = new ValidationModel();
    validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
    validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
    validation.token = sessionStorage.getItem('token');
    validation.tranSourceId = this.tranSourceId;
    validation.version = this.version;

    var url = this.apiRoot + 'api/Inbox/GetInbox' + '?validation=' + JSON.stringify(validation) + '&inboxId=' + inboxId;

      console.log ("URL",url);
      return this.httpClient.get(url)
          .pipe(
            
              map((data: InboxModel) => { 
                console.log("Data",data);
                  return data;
              }), catchError(error => {
                console.log("Error",error);
                  return throwError('Something went wrong!');
              })
      )
  }

  // ------------------------------------------------------------------------------------------------------------------
  // Clear - remove item from inbox based on the id passed in
  // ------------------------------------------------------------------------------------------------------------------
  clearItem(inboxId: number )
  {
    var validation = new ValidationModel();
    validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
    validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
    validation.token = sessionStorage.getItem('token');
    validation.tranSourceId = this.tranSourceId;
    validation.version = this.version;

    var url = this.apiRoot + 'api/Inbox/ClearInboxItem' + '?validation=' + JSON.stringify(validation) + '&inboxId=' + inboxId;

      console.log ("URL",url);
      return this.httpClient.get(url)
          .pipe(
            
              map((data: InboxModel) => { 
                console.log("Data",data);
                  return data;
              }), catchError(error => {
                console.log("Error",error);
                  return throwError('Something went wrong!');
              })
      )
  }
}
