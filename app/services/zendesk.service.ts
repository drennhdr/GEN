// Service Name  : zendesk.service.ts
// Date Created  : 10/3/2022
// Written By    : Stephen Farkas
// Description   : Interface to zendesk api
// MM/DD/YYYY XXX Description
//------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaderResponse, HttpHeaders } from '@angular/common/http';
import { Config } from '../models/Config';

import { from, Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

// Import data models used by the service

import { CodeItemModel } from '../models/CodeModel';
import { LabOrderModel, LabOrderSearchModel, LabOrderListModel, LabOrderForAccessioningModel, LabOrderSummarySearchModel, LabOrderSummaryModel, LabOrderPOCTModel, LabOrderStatusModel, LabOrderESignModel, LabOrderIssueModel, LabOrderForManifestModel, SpecimenTestModel, LabOrderBatchDemographicsModel} from '../models/LabOrderModel';
import { LabOrderAttachmentModel, LabOrderAttachmentListModel } from '../models/LabOrderAttachmentModel';
import { LabOrderNoteModel } from '../models/LabOrderNoteModel';
import { ValidationModel } from '../models/ValidationModel';
import { GenericResponseModel} from '../models/GenericResponseModel';


@Injectable({
  providedIn: 'root'
})
export class ZendeskService {
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
  // Save - Write the updated labOrder data to the server
  // ------------------------------------------------------------------------------------------------------------------
  createTicket(title:string, message:string)
  {

    var url = 'https://genesisreferencelabshelp.zendesk.com/api/v2/tickets.json'
    var headers = new HttpHeaders();
    headers = headers.set("Content-Type", "application/json; charset=utf-8");
    
    var user = "stephen.farkas@genesisreferencelabs.com" + '/token';
    var token = 'Z331bolxt1bwacCnaJTeOcoRCGg1NYzdCqlxqV6o';
    var ticket = {
        "ticket": {
          "comment": {
            "body": "This a test transaction from the portal."
          },
          "priority": "urgent",
          "subject": "Portal Test"
        }
      }

    return this.httpClient.post(url, ticket,  { headers: headers, params: {user:user, token: token} })
        .pipe(
            map((data: GenericResponseModel) => {
                console.log("Data",data);
                return data;
            }), catchError(error => {
                console.log("Error", error)
                return throwError('Something went wrong!');
            })
        )
    }
}