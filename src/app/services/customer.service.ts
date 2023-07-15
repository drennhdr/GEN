// Service Name  : customer.service.ts
// Date Created  : 8/1/2022
// Written By    : Stephen Farkas
// Description   : Interface to customer api
// MM/DD/YYYY XXX Description
// 01/20/2023 SJF Added LCS
// 04/10/2023 SJF Added deletedCustomerAttachment
//------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Config } from '../models/Config';

import { from, Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

// Import data models used by the service
import { CustomerModel, CustomerSaveModel, CustomerSearchModel, CustomerListModel} from '../models/CustomerModel';
import { CustomerAttachmentModel, CustomerAttachmentListModel} from '../models/CustomerAttachmentModel';
import { CustomerNoteModel, CustomerNoteListModel} from '../models/CustomerNoteModel';
import { ValidationModel } from '../models/ValidationModel';
import { GenericResponseModel} from '../models/GenericResponseModel';
import { formatDate } from '@angular/common';

@Injectable({ 
  providedIn: 'root'
})
export class CustomerService {
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
  // Search - retrun a list of Customer that meet the search criteria
  // ------------------------------------------------------------------------------------------------------------------
  search(name: string, active: number, city: string, state: string, facilityCode: string, regionId: number, userId_AM: number, userId_TM: number, userId_RM: number, userId_LCS: number) {

      var validation = new ValidationModel();
      validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
      validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
      validation.token = sessionStorage.getItem('token');
      validation.tranSourceId = this.tranSourceId;
      validation.version = this.version;
      var searchCriteria = new CustomerSearchModel();
      searchCriteria.name = name;
      searchCriteria.active = active;
      searchCriteria.city = city;
      searchCriteria.state = state;
      searchCriteria.facilityCode = facilityCode;
      searchCriteria.regionId = regionId;
      searchCriteria.userId_AM = userId_AM;
      searchCriteria.userId_TM = userId_TM;
      searchCriteria.userId_RM = userId_RM;
      searchCriteria.userId_LCS = userId_LCS;

      var url = this.apiRoot + 'api/Customer/GetCustomerList' + '?validation=' + JSON.stringify(validation) + '&searchCriteria=' + JSON.stringify(searchCriteria);

      return this.httpClient.get(url)
          .pipe(
             map((data: CustomerListModel) => {
          return data;
      }), catchError(error => {
          return throwError('Something went wrong!'); 
      })
    )
  }

  // ------------------------------------------------------------------------------------------------------------------
  // Get - return the customer based on the id passed in
  // ------------------------------------------------------------------------------------------------------------------
  get(customerId: number )
  {
      var validation = new ValidationModel();
      validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
      validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
      validation.token = sessionStorage.getItem('token');
      validation.tranSourceId = this.tranSourceId;
      validation.version = this.version;

      var url = this.apiRoot + 'api/Customer/GetCustomer' + '?validation=' + JSON.stringify(validation) + '&customerId=' + customerId;
      return this.httpClient.get(url)
          .pipe(
              map((data: CustomerModel) => { 
                  return data;
              }), catchError(error => {
                  return throwError('Something went wrong!');
              })
      )
  }

  // ------------------------------------------------------------------------------------------------------------------
  // Save - Write the updated customer data to the server
  // ------------------------------------------------------------------------------------------------------------------
  save(customer: CustomerModel)
  {
      var customerSave = new CustomerSaveModel();
      var validation = new ValidationModel();
      validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
      validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
      validation.token = sessionStorage.getItem('token');
      validation.tranSourceId = this.tranSourceId;
      validation.version = this.version;

      customerSave.customerId = customer.customerId;
      customerSave.validation = validation;
      
      customerSave.active = customer.active;
      customerSave.accountTypeId = Number(customer.accountTypeId);
      customerSave.name = customer.name;
      customerSave.facilityCode = customer.facilityCode;
      customerSave.contactName = customer.contactName;
      customerSave.contactPosition = customer.contactPosition;
      customerSave.contactEmail = customer.contactEmail;
      customerSave.regionId = Number(customer.regionId);
      customerSave.userId_AM = Number(customer.userId_AM);
      customerSave.userId_TM = Number(customer.userId_TM);
      customerSave.userId_RM = Number(customer.userId_RM);
      customerSave.customerBillingTypeId = Number(customer.customerBillingTypeId);
      customerSave.service_ToxUrine = customer.service_ToxUrine;
      customerSave.service_ToxOral = customer.service_ToxOral;
      customerSave.service_RPP = customer.service_RPP;
      customerSave.service_UTISTI = customer.service_UTISTI;
      customerSave.service_GPP = customer.service_GPP;
      customerSave.service_Urinalysis = customer.service_Urinalysis;
      customerSave.service_Hematology = customer.service_Hematology;
      customerSave.lab_ToxUrine =  Number(customer.lab_ToxUrine);
      customerSave.lab_ToxOral =  Number(customer.lab_ToxOral);
      customerSave.lab_RPP =  Number(customer.lab_RPP);
      customerSave.lab_UTISTI =  Number(customer.lab_UTISTI);
      customerSave.lab_GPP =  Number(customer.lab_GPP);
      customerSave.lab_Urinalysis =  Number(customer.lab_Urinalysis);
      customerSave.lab_Hematology =  Number(customer.lab_Hematology);
      customerSave.multiple_Tox = customer.multiple_Tox;
      customerSave.multiple_RPP = customer.multiple_RPP;
      customerSave.multiple_UTISTI = customer.multiple_UTISTI;
      customerSave.multiple_GPP = customer.multiple_GPP;
      customerSave.pct_Commercial = Number(customer.pct_Commercial);
      customerSave.pct_SelfPay = Number(customer.pct_SelfPay);
      customerSave.pct_Medicare = Number(customer.pct_Medicare);
      customerSave.pct_Medicaid = Number(customer.pct_Medicaid);     
      customerSave.userId_Updated = parseInt(sessionStorage.getItem('userId_Login'));
      customerSave.allowSelfPay = customer.allowSelfPay;
      customerSave.requireInsurance = customer.requireInsurance;
      customerSave.shipLog = customer.shipLog
      customerSave.parolOfficer = customer.parolOfficer;
      customerSave.taxId = customer.taxId;
      customerSave.pecosEnrolled = customer.pecosEnrolled;
      customerSave.sharePatients = customer.sharePatients;
      customerSave.lcs = customer.lcs;

        console.log(customerSave);

      var url = this.apiRoot + 'api/Customer/SaveCustomer'
      var headers = new HttpHeaders();
      headers = headers.set("Content-Type", "application/json; charset=utf-8");

      return this.httpClient.post(url, customerSave, { headers: headers })
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
  // Get Customer Attachment - return the customer attachment based on the id passed in
  // ------------------------------------------------------------------------------------------------------------------
  getCustomerAttachment(attachmentId: number )
  {
      var validation = new ValidationModel();
      validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
      validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
      validation.token = sessionStorage.getItem('token');
      validation.tranSourceId = this.tranSourceId;
      validation.version = this.version;

      var url = this.apiRoot + 'api/Customer/GetCustomerAttachment' + '?validation=' + JSON.stringify(validation) + '&CustomerAttachmentId=' + attachmentId + '&b64=true';

      return this.httpClient.get(url)
          .pipe(
              map((data: CustomerAttachmentModel) => { 
                  return data;
              }), catchError(error => {
                  return throwError('Something went wrong!');
              })
      )
  }

  // ------------------------------------------------------------------------------------------------------------------
  // Save - Write the updated customer attachment data to the server
  // ------------------------------------------------------------------------------------------------------------------
  saveCustomerAttachment(customerAttachment: CustomerAttachmentModel)
  {

      var validation = new ValidationModel();
      validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
      validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
      validation.token = sessionStorage.getItem('token');
      validation.tranSourceId = this.tranSourceId;
      validation.version = this.version;

      customerAttachment.validation = validation;

      customerAttachment.customerId = Number(customerAttachment.customerId);
      customerAttachment.userId_Created = parseInt(sessionStorage.getItem('userId_Login'));

      const dt = new Date().toISOString();
      customerAttachment.dateCreated = formatDate(dt,'MM/dd/yyyy HH:mm:ss', 'en');

      var url = this.apiRoot + 'api/Customer/SaveCustomerAttachment'
      var headers = new HttpHeaders();
      headers = headers.set("Content-Type", "application/json; charset=utf-8");

      return this.httpClient.post(url, customerAttachment, { headers: headers })
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
  // Deleted - mark customerAttachment deleted based on the id passed in
  // ------------------------------------------------------------------------------------------------------------------
  deletedCustomerAttachment(customerAttachmentId: number )
  {
      var validation = new ValidationModel();
      validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
      validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
      validation.token = sessionStorage.getItem('token');
      validation.tranSourceId = this.tranSourceId;
      validation.version = this.version;

      var url = this.apiRoot + 'api/Customer/DeletedCustomerAttachment' + '?validation=' + JSON.stringify(validation) + '&CustomerAttachmentId=' + customerAttachmentId + '&b64=true';

      return this.httpClient.get(url)
          .pipe(
              map((data: GenericResponseModel) => { 
                  return data;
              }), catchError(error => {
                  return throwError('Something went wrong!');
              })
      )
  }
  // ------------------------------------------------------------------------------------------------------------------
  // Get Customer Note - return the customer note based on the id passed in
  // ------------------------------------------------------------------------------------------------------------------
  getCustomerNote(noteId: number )
  {
      var validation = new ValidationModel();
      validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
      validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
      validation.token = sessionStorage.getItem('token');
      validation.tranSourceId = this.tranSourceId;
      validation.version = this.version;

      var url = this.apiRoot + 'api/Customer/GetCustomerNote' + '?validation=' + JSON.stringify(validation) + '&CustomerNoteId=' + noteId;

      return this.httpClient.get(url)
          .pipe(
              map((data: CustomerNoteModel) => { 
                  return data;
              }), catchError(error => {
                  return throwError('Something went wrong!');
              })
      )
  }

  // ------------------------------------------------------------------------------------------------------------------
  // Save - Write the updated customer note data to the server
  // ------------------------------------------------------------------------------------------------------------------
  saveCustomerNote(customerNote: CustomerNoteModel)
  {

    var validation = new ValidationModel();
    validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
    validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
    validation.token = sessionStorage.getItem('token');
    validation.tranSourceId = this.tranSourceId;
    validation.version = this.version;

    customerNote.validation = validation;

    customerNote.customerId = Number(customerNote.customerId);
    customerNote.customerNoteId = Number(customerNote.customerNoteId);
    customerNote.userId_Created = parseInt(sessionStorage.getItem('userId_Login'));


    var url = this.apiRoot + 'api/Customer/SaveCustomerNote'
    var headers = new HttpHeaders();
    headers = headers.set("Content-Type", "application/json; charset=utf-8");

    return this.httpClient.post(url, customerNote, { headers: headers })
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
  // Reviewed - Mark customer as reviewed on the server
  // ------------------------------------------------------------------------------------------------------------------
  reviewed(customer: CustomerModel)
  {
      var customerSave = new CustomerSaveModel();
      var validation = new ValidationModel();
      validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
      validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
      validation.token = sessionStorage.getItem('token');
      validation.tranSourceId = this.tranSourceId;
      validation.version = this.version;

      customerSave.customerId = customer.customerId;
      customerSave.validation = validation;
      
      customerSave.active = customer.active;
      customerSave.accountTypeId = Number(customer.accountTypeId);
      customerSave.name = customer.name;
      customerSave.facilityCode = customer.facilityCode;
      customerSave.contactName = customer.contactName;
      customerSave.contactPosition = customer.contactPosition;
      customerSave.contactEmail = customer.contactEmail;
      customerSave.regionId = Number(customer.regionId);
      customerSave.userId_AM = Number(customer.userId_AM);
      customerSave.userId_TM = Number(customer.userId_TM);
      customerSave.userId_RM = Number(customer.userId_RM);
      customerSave.customerBillingTypeId = Number(customer.customerBillingTypeId);
      customerSave.service_ToxUrine = customer.service_ToxUrine;
      customerSave.service_ToxOral = customer.service_ToxOral;
      customerSave.service_RPP = customer.service_RPP;
      customerSave.service_UTISTI = customer.service_UTISTI;
      customerSave.service_GPP = customer.service_GPP;
      customerSave.service_Urinalysis = customer.service_Urinalysis;
      customerSave.service_Hematology = customer.service_Hematology;
      customerSave.lab_ToxUrine =  Number(customer.lab_ToxUrine);
      customerSave.lab_ToxOral =  Number(customer.lab_ToxOral);
      customerSave.lab_RPP =  Number(customer.lab_RPP);
      customerSave.lab_UTISTI =  Number(customer.lab_UTISTI);
      customerSave.lab_GPP =  Number(customer.lab_GPP);
      customerSave.lab_Urinalysis =  Number(customer.lab_Urinalysis);
      customerSave.lab_Hematology =  Number(customer.lab_Hematology);
      customerSave.pct_Commercial = Number(customer.pct_Commercial);
      customerSave.pct_SelfPay = Number(customer.pct_SelfPay);
      customerSave.pct_Medicare = Number(customer.pct_Medicare);
      customerSave.pct_Medicaid = Number(customer.pct_Medicaid); 
      customerSave.taxId = customer.taxId;
      customerSave.pecosEnrolled = customer.pecosEnrolled;    
      customerSave.userId_Updated = parseInt(sessionStorage.getItem('userId_Login'));

    //   console.log(customerSave);

      var url = this.apiRoot + 'api/Customer/ReviewedCustomer'
      var headers = new HttpHeaders();
      headers = headers.set("Content-Type", "application/json; charset=utf-8");

      return this.httpClient.post(url, customerSave, { headers: headers })
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
