// Service Name  : labOrder.service.ts
// Date Created  : 8/1/2022
// Written By    : Stephen Farkas
// Description   : Interface to labOrder api
// MM/DD/YYYY XXX Description
// 08/31/2022 SJF Added Search Signature
// 09/14/2022 SJF Added eSign
// 09/19/2022 SJF Added getLabOrderIssueList
// 09/20/2022 SJF Added getLabOrderForManifest
// 09/22/2022 SJF Added getTestsForSpecimen
// 09/26/2022 SJF Added getLabDemographicsChange
// 09/27/2022 SJF Added batchDemographicsUpdate & getLabOrderNote
// 11/07/2022 SJF Added GePatienttSignature
// 11/22/2022 SJF Added GetAuditList
// 12/05/2022 SJF Added Reviewed
// 01/08/2023 SJF Added loadToxOralData
// 01/17/2023 SJF Added specimenStatusChange
// 02/27/2023 SJF Added accessionedReport
// 03/01/2023 SJF Added salesReport, salesDailyReport
// 03/18/2023 SJF Added manifestSearch
// 03/23/2023 SJF Added getMissingPreAuth
// 03/29/2023 SJF Added cetIssueReport, cetRejectReport
// 05/08/2023 SJF Added getLabOrderResultPdf
// 06/01/2023 SJF Added uncancel
// 06/06/2023 SJF Added unAccession
// 06/18/2023 SJF Added locationUnsignedCount
// 07/09/2023 SJF Removed Norhydrocodone & Noroxycodone
//------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Config } from '../models/Config';

import { from, Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

// Import data models used by the service
import { LabOrderModel, LabOrderSearchModel, LabOrderListModel, LabOrderForAccessioningModel, LabOrderSummarySearchModel, LabOrderSummaryModel, LabOrderBatchDemographicsItemModel, LabOrderStatusModel, LabOrderESignModel, LabOrderIssueModel, LabOrderForManifestModel, SpecimenTestModel, LabOrderBatchDemographicsModel, LabOrderTestItemModel, LabOrderAuditSearchModel, LabOrderAuditListModel, LabOrderSpecimenInsuranceModel, LabOrderReviewModel, LabOrderSpecimenStatusModel, LabOrderForShipLogModel, LabOrderPreAuthSearchModel, LabOrderPreAuthListModel} from '../models/LabOrderModel';
import { LabOrderAttachmentModel, LabOrderAttachmentListModel, LabOrderPdfModel } from '../models/LabOrderAttachmentModel';
import { LabOrderNoteModel } from '../models/LabOrderNoteModel';
import { GPPModel, UTIModel, RPPModel, ToxModel, ToxOralModel } from '../models/LabOrderTestModel';
import { PhysicianPreferenceTestModel } from '../models/PhysicianPreferenceModel';
import { ValidationModel } from '../models/ValidationModel';
import { GenericResponseModel} from '../models/GenericResponseModel';
import { UserSignatureModel} from "../models/UserSignatureModel";
import { formatDate } from '@angular/common';
import { CodeItemModel } from '../models/CodeModel';
import { AccessionedReportModel, SalesReportModel, CETIssueReportModel, CETRejectReportModel } from '../models/ReportModel';
import { end } from '@popperjs/core';

@Injectable({
  providedIn: 'root'
})
export class LabOrderService {
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
  // Search - retrun a list of LabOrders that meet the search criteria
  // ------------------------------------------------------------------------------------------------------------------
  search(customerId: number, locationId: number, labStatusId: number, physicianId: number, patientId: number, patientName: string, specimenBarcode: string, labTypeId: number, collectionDateStart: string, collectionDateEnd:string, dateType:number ) {

    var validation = new ValidationModel();
    validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
    validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
    validation.token = sessionStorage.getItem('token');
    validation.tranSourceId = this.tranSourceId;
    validation.version = this.version;
    var searchCriteria = new LabOrderSearchModel();
    searchCriteria.customerId = customerId;
    searchCriteria.locationId = locationId;
    searchCriteria.labStatusId = labStatusId;
    searchCriteria.physicianId = physicianId;
    searchCriteria.patientId = patientId;
    searchCriteria.patientName = patientName;
    searchCriteria.specimenBarcode = specimenBarcode;
    searchCriteria.labTypeId = labTypeId;
    searchCriteria.collectionDateStart = collectionDateStart;
    searchCriteria.collectionDateEnd = collectionDateEnd;
    searchCriteria.dateType = dateType;

    var url = this.apiRoot + 'api/LabOrder/GetLabOrderList' + '?validation=' + JSON.stringify(validation) + '&searchCriteria=' + JSON.stringify(searchCriteria);
    return this.httpClient.get(url)
        .pipe(
             map((data: LabOrderListModel) => {

                if (data.list != null)
                {
                    data.list.forEach(item => {
                        if (item.collectionDate != null)
                        {
                            var localDate = new Date(item.collectionDate + 'Z');
                            item.collectionDate = formatDate(localDate, 'MM/dd/yyyy hh:mm a', 'en');
                        }
                        if (item.receivedDate != null)
                        {
                            var localDate = new Date(item.receivedDate + 'Z');
                            item.receivedDate = formatDate(localDate, 'MM/dd/yyyy hh:mm a', 'en');
                        }
                        if (item.accessionedDate != null)
                        {
                            var localDate = new Date(item.accessionedDate + 'Z');
                            item.accessionedDate = formatDate(localDate, 'MM/dd/yyyy hh:mm a', 'en');
                        }
                        if (item.resultedDate != null)
                        {
                            var localDate = new Date(item.resultedDate + 'Z');
                            item.resultedDate = formatDate(localDate, 'MM/dd/yyyy hh:mm a', 'en');
                        }
                    });
                }

          return data;
      }), catchError(error => {
          return throwError('Something went wrong!'); 
          console.log("Error");
      })
    )
  }

  // ------------------------------------------------------------------------------------------------------------------
  // SearchSignature - retrun a list of LabOrders that meet the search criteria
  // ------------------------------------------------------------------------------------------------------------------
  signatureCount(userId: number) {

    var validation = new ValidationModel();
    validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
    validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
    validation.token = sessionStorage.getItem('token');
    validation.tranSourceId = this.tranSourceId;
    validation.version = this.version;

    var url = this.apiRoot + 'api/LabOrder/GetSignatureCount' + '?validation=' + JSON.stringify(validation) + '&userId=' + userId;

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
  // locationUnsigned - retrun a list of LabOrders that meet the search criteria
  // ------------------------------------------------------------------------------------------------------------------
  locationUnsignedCount(locationId: number) {

    var validation = new ValidationModel();
    validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
    validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
    validation.token = sessionStorage.getItem('token');
    validation.tranSourceId = this.tranSourceId;
    validation.version = this.version;

    var url = this.apiRoot + 'api/LabOrder/GetLocationUnsignedCount' + '?validation=' + JSON.stringify(validation) + '&locationId=' + locationId;

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
  // SearchSignature - retrun a list of LabOrders that meet the search criteria
  // ------------------------------------------------------------------------------------------------------------------
  searchSignature(userId: number) {

    var validation = new ValidationModel();
    validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
    validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
    validation.token = sessionStorage.getItem('token');
    validation.tranSourceId = this.tranSourceId;
    validation.version = this.version;

    var url = this.apiRoot + 'api/LabOrder/GetSignatureList' + '?validation=' + JSON.stringify(validation) + '&userId=' + userId;

    return this.httpClient.get(url)
        .pipe(
             map((data: LabOrderListModel) => {
          return data;
      }), catchError(error => {
          return throwError('Something went wrong!'); 
      })
    )
  }

  // ------------------------------------------------------------------------------------------------------------------
  // SearchDelegate - retrun a list of LabOrders that meet the search criteria
  // ------------------------------------------------------------------------------------------------------------------
  searchDelegate(userId: number) {

    var validation = new ValidationModel();
    validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
    validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
    validation.token = sessionStorage.getItem('token');
    validation.tranSourceId = this.tranSourceId;
    validation.version = this.version;

    var url = this.apiRoot + 'api/LabOrder/GetDelegateList' + '?validation=' + JSON.stringify(validation) + '&userId=' + userId;

    return this.httpClient.get(url)
        .pipe(
             map((data: LabOrderListModel) => {
          return data;
      }), catchError(error => {
          return throwError('Something went wrong!'); 
      })
    )
  }

  // ------------------------------------------------------------------------------------------------------------------
  // Get - return the labOrder based on the id passed in
  // ------------------------------------------------------------------------------------------------------------------
  get(labOrderId: number )
  {
      var validation = new ValidationModel();
      validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
      validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
      validation.token = sessionStorage.getItem('token');
      validation.tranSourceId = this.tranSourceId;
      validation.version = this.version;

      var url = this.apiRoot + 'api/LabOrder/GetLabOrder' + '?validation=' + JSON.stringify(validation) + '&labOrderId=' + labOrderId;

      return this.httpClient.get(url)
          .pipe(
              map((data: LabOrderModel) => { 
                  return data;
              }), catchError(error => {
                  return throwError('Something went wrong!');
              })
      )
  }

  // ------------------------------------------------------------------------------------------------------------------
  // Get for accessioning - return the labOrder based on the specimen barcode  passed in
  // ------------------------------------------------------------------------------------------------------------------
  getLabOrderForAccessioning(specimenBarcode: string )
  {
      var validation = new ValidationModel();
      validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
      validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
      validation.token = sessionStorage.getItem('token');
      validation.tranSourceId = this.tranSourceId;
      validation.version = this.version;

      var url = this.apiRoot + 'api/LabOrder/GetLabOrderForAccessioning' + '?validation=' + JSON.stringify(validation) + '&SpecimenBarcode=' + specimenBarcode;

      return this.httpClient.get(url)
          .pipe(
              map((data: LabOrderForAccessioningModel) => { 
                  return data;
              }), catchError(error => {
                  return throwError('Something went wrong!');
              })
      )
  }

    // ------------------------------------------------------------------------------------------------------------------
  // Get for accessioning - return the labOrder based on the specimen barcode  passed in
  // ------------------------------------------------------------------------------------------------------------------
  getLabOrderBasic(labOrderId: number )
  {
      var validation = new ValidationModel();
      validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
      validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
      validation.token = sessionStorage.getItem('token');
      validation.tranSourceId = this.tranSourceId;
      validation.version = this.version;

      var url = this.apiRoot + 'api/LabOrder/GetLabOrderBasic' + '?validation=' + JSON.stringify(validation) + '&LabOrderId=' + labOrderId;

      return this.httpClient.get(url)
          .pipe(
              map((data: LabOrderModel) => { 
                  return data;
              }), catchError(error => {
                  return throwError('Something went wrong!');
              })
      )
  }

  // ------------------------------------------------------------------------------------------------------------------
  // Get for maninfest - return the labOrder based on the specimen barcode  passed in
  // ------------------------------------------------------------------------------------------------------------------
  getLabOrderForManifest(specimenBarcode: string )
  {
      var validation = new ValidationModel();
      validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
      validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
      validation.token = sessionStorage.getItem('token');
      validation.tranSourceId = this.tranSourceId;
      validation.version = this.version;

      var url = this.apiRoot + 'api/LabOrder/GetLabOrderForManifest' + '?validation=' + JSON.stringify(validation) + '&SpecimenBarcode=' + specimenBarcode;
      return this.httpClient.get(url)
          .pipe(
              map((data: LabOrderForManifestModel) => { 
                  return data;
              }), catchError(error => {
                  return throwError('Something went wrong!');
              })
      )
  }

  // ------------------------------------------------------------------------------------------------------------------
  // Get missing PreAuth - return the labOrders based on passed in criteria
  // ------------------------------------------------------------------------------------------------------------------
  getMissingPreAuth(dateStart: string, dateEnd: string, labId: number, labTypeId: number, customerId: number) 
  {
      var validation = new ValidationModel();
      validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
      validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
      validation.token = sessionStorage.getItem('token');
      validation.tranSourceId = this.tranSourceId;
      validation.version = this.version;

      var searchCriteria = new LabOrderPreAuthSearchModel();
      searchCriteria.collectionDateStart = dateStart;
      searchCriteria.collectionDateEnd = dateEnd;
      searchCriteria.labId = labId;
      searchCriteria.labTypeId = labTypeId;
      searchCriteria.customerId = customerId;

      var url = this.apiRoot + 'api/LabOrder/GetMissingPreAuth' + '?validation=' + JSON.stringify(validation) + '&searchCriteria=' + JSON.stringify(searchCriteria);
      return this.httpClient.get(url)
          .pipe(
              map((data: LabOrderPreAuthListModel) => { 
                  return data;
              }), catchError(error => {
                  return throwError('Something went wrong!');
              })
      )
  }

  // ------------------------------------------------------------------------------------------------------------------
  // Get for shipLog - return the labOrder based on the specimen barcode  passed in
  // ------------------------------------------------------------------------------------------------------------------
  getLabOrderForShipLog(specimenBarcode: string )
  {
      var validation = new ValidationModel();
      validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
      validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
      validation.token = sessionStorage.getItem('token');
      validation.tranSourceId = this.tranSourceId;
      validation.version = this.version;

      var url = this.apiRoot + 'api/LabOrder/GetLabOrderForShipLog' + '?validation=' + JSON.stringify(validation) + '&SpecimenBarcode=' + specimenBarcode;

      return this.httpClient.get(url)
          .pipe(
              map((data: LabOrderForShipLogModel) => { 
                  return data;
              }), catchError(error => {
                  return throwError('Something went wrong!');
              })
      )
  }


  // ------------------------------------------------------------------------------------------------------------------
  // Get for Specimen based on the specimen id passed in return a list of tests
  // ------------------------------------------------------------------------------------------------------------------
  getTestsForSpecimen(labOrderSpecimenId: number )
  {
      var validation = new ValidationModel();
      validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
      validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
      validation.token = sessionStorage.getItem('token');
      validation.tranSourceId = this.tranSourceId;
      validation.version = this.version;

      var url = this.apiRoot + 'api/LabOrder/GetTestsForSpecimen' + '?validation=' + JSON.stringify(validation) + '&LabOrderSpecimenId=' + labOrderSpecimenId;

      return this.httpClient.get(url)
          .pipe(
              map((data: SpecimenTestModel) => { 
                  return data;
              }), catchError(error => {
                  return throwError('Something went wrong!');
              })
      )
  }

  // ------------------------------------------------------------------------------------------------------------------
  // Get - return the labOrderIssueList based on the labOrderId passed in
  // ------------------------------------------------------------------------------------------------------------------
  getLabOrderIssueList(labOrderId: number )
  {
      var validation = new ValidationModel();
      validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
      validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
      validation.token = sessionStorage.getItem('token');
      validation.tranSourceId = this.tranSourceId;
      validation.version = this.version;

      var url = this.apiRoot + 'api/LabOrder/GetLabOrderIssueList' + '?validation=' + JSON.stringify(validation) + '&LabOrderId=' + labOrderId;

      return this.httpClient.get(url)
          .pipe(
              map((data: LabOrderIssueModel) => { 
                  return data;
              }), catchError(error => {
                  return throwError('Something went wrong!');
              })
      )
  }

  // ------------------------------------------------------------------------------------------------------------------
  // Save - Write the updated labOrder data to the server
  // ------------------------------------------------------------------------------------------------------------------
  save(labOrder: LabOrderModel)
  {
    var validation = new ValidationModel();
    validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
    validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
    validation.token = sessionStorage.getItem('token');
    validation.tranSourceId = this.tranSourceId;
    validation.version = this.version;

    labOrder.validation = validation;
    labOrder.userId_Updated = parseInt(sessionStorage.getItem('userId_Login'));
  
    labOrder.patientId = Number(labOrder.patientId);
    labOrder.userId_Physician = Number(labOrder.userId_Physician);
    labOrder.customerId = Number(labOrder.customerId);
    labOrder.locationId = Number(labOrder.locationId);
    labOrder.labId = Number(labOrder.labId);
    labOrder.billingTypeId = Number(labOrder.billingTypeId);
    labOrder.patientInsuranceId_Primary = Number(labOrder.patientInsuranceId_Primary);
    labOrder.patientInsuranceId_Secondary = Number(labOrder.patientInsuranceId_Secondary);
    labOrder.userSignatureId_Physician = Number(labOrder.userSignatureId_Physician);
    labOrder.patientSignatureId = Number(labOrder.patientSignatureId);
    labOrder.genderId = Number(labOrder.genderId);
    
    labOrder.userId_Updated = Number(labOrder.userId_Updated);

    for (let item of labOrder.specimens){
        item.labStatusId = Number(item.labStatusId);
        item.labTypeId = Number(item.labTypeId);
        for (let item2 of  item.tests){
            item2.labOrderSpecimenId = Number(item2.labOrderSpecimenId);
            item2.labTestId = Number(item2.labTestId);
        }
    }
    if(labOrder.medications.length > 0){
        for (let item of  labOrder.medications){
            item.labOrderId = labOrder.labId;
            item.medicationId = Number(item.medicationId);
            item.medicationId_Generic = Number(item.medicationId_Generic);
        }
    }
    console.log("Diagnosis", labOrder.diagnosis);
    if (labOrder.diagnosis.length > 0){
        for (let item of  labOrder.diagnosis){
            item.labOrderId = labOrder.labId;
            item.icd_Version = Number(item.icd_Version);
        }
    }
    if (labOrder.poctScreen){
        labOrder.poct.pocResultId_AMP = Number(labOrder.poct.pocResultId_AMP);
        labOrder.poct.pocResultId_BAR = Number(labOrder.poct.pocResultId_BAR);
        labOrder.poct.pocResultId_BUP = Number(labOrder.poct.pocResultId_BUP);
        labOrder.poct.pocResultId_BZO = Number(labOrder.poct.pocResultId_BZO);
        labOrder.poct.pocResultId_COC = Number(labOrder.poct.pocResultId_COC);
        labOrder.poct.pocResultId_MDMA = Number(labOrder.poct.pocResultId_MDMA);
        labOrder.poct.pocResultId_MET = Number(labOrder.poct.pocResultId_MET);
        labOrder.poct.pocResultId_MTD = Number(labOrder.poct.pocResultId_MTD);
        labOrder.poct.pocResultId_OPI = Number(labOrder.poct.pocResultId_OPI);
        labOrder.poct.pocResultId_OXY = Number(labOrder.poct.pocResultId_OXY);
        labOrder.poct.pocResultId_PCP = Number(labOrder.poct.pocResultId_PCP);
        labOrder.poct.pocResultId_TCA = Number(labOrder.poct.pocResultId_TCA);
        labOrder.poct.pocResultId_THC = Number(labOrder.poct.pocResultId_THC);
    }

    console.log("Lab Order",labOrder);
    var url = this.apiRoot + 'api/LabOrder/SaveLabOrder'
    var headers = new HttpHeaders();
    headers = headers.set("Content-Type", "application/json; charset=utf-8");

    return this.httpClient.post(url, labOrder, { headers: headers })
        .pipe(
            map((data: GenericResponseModel) => {
                console.log("Datar",data);
                return data;
            }), catchError(error => {
                console.log("Error", error)
                return throwError('Something went wrong!');
            })
        )
    }

  // ------------------------------------------------------------------------------------------------------------------
  // Cancel - Write the updated labOrder data to the server
  // ------------------------------------------------------------------------------------------------------------------
  cancel(labOrder: LabOrderModel)
  {
    var validation = new ValidationModel();
    validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
    validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
    validation.token = sessionStorage.getItem('token');
    validation.tranSourceId = this.tranSourceId;
    validation.version = this.version;
    labOrder.validation = validation;
    labOrder.userId_Updated = parseInt(sessionStorage.getItem('userId_Login'));
  
    labOrder.patientId = Number(labOrder.patientId);
    labOrder.userId_Physician = Number(labOrder.userId_Physician);
    labOrder.customerId = Number(labOrder.customerId);
    labOrder.locationId = Number(labOrder.locationId);
    labOrder.labId = Number(labOrder.labId);
    labOrder.billingTypeId = Number(labOrder.billingTypeId);
    labOrder.patientInsuranceId_Primary = Number(labOrder.patientInsuranceId_Primary);
    labOrder.patientInsuranceId_Secondary = Number(labOrder.patientInsuranceId_Secondary);
    labOrder.userSignatureId_Physician = Number(labOrder.userSignatureId_Physician);
    labOrder.patientSignatureId = Number(labOrder.patientSignatureId);
    labOrder.genderId = Number(labOrder.genderId);
    
    labOrder.userId_Updated = Number(labOrder.userId_Updated);

    var url = this.apiRoot + 'api/LabOrder/CancelLabOrder'
    var headers = new HttpHeaders();
    headers = headers.set("Content-Type", "application/json; charset=utf-8");

    return this.httpClient.post(url, labOrder, { headers: headers })
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

  // ------------------------------------------------------------------------------------------------------------------
  // Cancel - Write the updated labOrder data to the server
  // ------------------------------------------------------------------------------------------------------------------
  unCancel(labOrder: LabOrderModel)
  {
    var validation = new ValidationModel();
    validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
    validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
    validation.token = sessionStorage.getItem('token');
    validation.tranSourceId = this.tranSourceId;
    validation.version = this.version;
    labOrder.validation = validation;
    labOrder.userId_Updated = parseInt(sessionStorage.getItem('userId_Login'));
  
    labOrder.patientId = Number(labOrder.patientId);
    labOrder.userId_Physician = Number(labOrder.userId_Physician);
    labOrder.customerId = Number(labOrder.customerId);
    labOrder.locationId = Number(labOrder.locationId);
    labOrder.labId = Number(labOrder.labId);
    labOrder.billingTypeId = Number(labOrder.billingTypeId);
    labOrder.patientInsuranceId_Primary = Number(labOrder.patientInsuranceId_Primary);
    labOrder.patientInsuranceId_Secondary = Number(labOrder.patientInsuranceId_Secondary);
    labOrder.userSignatureId_Physician = Number(labOrder.userSignatureId_Physician);
    labOrder.patientSignatureId = Number(labOrder.patientSignatureId);
    labOrder.genderId = Number(labOrder.genderId);
    
    labOrder.userId_Updated = Number(labOrder.userId_Updated);

    var url = this.apiRoot + 'api/LabOrder/UnCancelLabOrder'
    var headers = new HttpHeaders();
    headers = headers.set("Content-Type", "application/json; charset=utf-8");

    return this.httpClient.post(url, labOrder, { headers: headers })
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

  // ------------------------------------------------------------------------------------------------------------------
  // Summary - retrun a LabOrder summary that meets the search criteria
  // ------------------------------------------------------------------------------------------------------------------
  summary(customerId: number, locationId: number, userId: number, labStatusId: number, labTypeId: number, collectionDateStart:string, collectionDateEnd:string ) {

    var validation = new ValidationModel();
    validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
    validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
    validation.token = sessionStorage.getItem('token');
    validation.tranSourceId = this.tranSourceId;
    validation.version = this.version;
    var searchCriteria = new LabOrderSummarySearchModel();
    searchCriteria.customerId = customerId;
    searchCriteria.locationId = locationId;
    searchCriteria.userId = userId;
    searchCriteria.labStatusId = labStatusId;
    searchCriteria.labTypeId = labTypeId;
    searchCriteria.collectionDateStart = collectionDateStart;
    searchCriteria.collectionDateEnd = collectionDateEnd;

    var url = this.apiRoot + 'api/LabOrder/GetSummary' + '?validation=' + JSON.stringify(validation) + '&searchCriteria=' + JSON.stringify(searchCriteria);

    return this.httpClient.get(url)
        .pipe(
             map((data: LabOrderSummaryModel) => {
          return data;
      }), catchError(error => {
          return throwError('Something went wrong!'); 
      })
    )
  }

  // ------------------------------------------------------------------------------------------------------------------
  // Get Lab Order Attachment List - return a list of lab oirder attachments based on the id passed in
  // ------------------------------------------------------------------------------------------------------------------
  getLabOrderAttachmentList(labOrderId: number )
  {
      var validation = new ValidationModel();
      validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
      validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
      validation.token = sessionStorage.getItem('token');
      validation.tranSourceId = this.tranSourceId;
      validation.version = this.version;

      var url = this.apiRoot + 'api/LabOrder/GetLabOrderAttachmentList' + '?validation=' + JSON.stringify(validation) + '&LabOrderId=' + labOrderId;

      return this.httpClient.get(url)
          .pipe(
              map((data: LabOrderAttachmentListModel) => { 
                  return data;
              }), catchError(error => {
                  return throwError('Something went wrong!');
              })
      )
  }

  // ------------------------------------------------------------------------------------------------------------------
  // Get Lab Order Attachment - return the lab order attachment based on the id passed in
  // ------------------------------------------------------------------------------------------------------------------
  getLabOrderAttachment(attachmentId: number )
  {
      var validation = new ValidationModel();
      validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
      validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
      validation.token = sessionStorage.getItem('token');
      validation.tranSourceId = this.tranSourceId;
      validation.version = this.version;

      var url = this.apiRoot + 'api/LabOrder/GetLabOrderAttachment' + '?validation=' + JSON.stringify(validation) + '&LabOrderAttachmentId=' + attachmentId + '&b64=true';

      return this.httpClient.get(url)
          .pipe(
              map((data: LabOrderAttachmentModel) => { 
                  return data;
              }), catchError(error => {
                  return throwError('Something went wrong!');
              })
      )
  }

  // ------------------------------------------------------------------------------------------------------------------
  // Get Lab Order Note - return the lab order note based on the id passed in
  // ------------------------------------------------------------------------------------------------------------------
  getLabOrderNote(noteId: number )
  {
      var validation = new ValidationModel();
      validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
      validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
      validation.token = sessionStorage.getItem('token');
      validation.tranSourceId = this.tranSourceId;
      validation.version = this.version;

      var url = this.apiRoot + 'api/LabOrder/GetLabOrderNote' + '?validation=' + JSON.stringify(validation) + '&LabOrderNoteId=' + noteId;

      return this.httpClient.get(url)
          .pipe(
              map((data: LabOrderNoteModel) => { 
                  return data;
              }), catchError(error => {
                  return throwError('Something went wrong!');
              })
      )
  }

  // ------------------------------------------------------------------------------------------------------------------
  // Save - Write the updated lab order note data to the server
  // ------------------------------------------------------------------------------------------------------------------
  saveLabOrderNote(labOrderNote: LabOrderNoteModel)
  {

      var validation = new ValidationModel();
      validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
      validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
      validation.token = sessionStorage.getItem('token');
      validation.tranSourceId = this.tranSourceId;
      validation.version = this.version;

      labOrderNote.validation = validation;

      labOrderNote.labOrderId = Number(labOrderNote.labOrderId);
      labOrderNote.labOrderNoteId = Number(labOrderNote.labOrderNoteId);
      labOrderNote.userId_Created = parseInt(sessionStorage.getItem('userId_Login'));

      const dt = new Date().toISOString();
      labOrderNote.dateTime = formatDate(dt,'MM/dd/yyyy HH:mm:ss', 'en');

      var url = this.apiRoot + 'api/LabOrder/SaveLabOrderNote'
      var headers = new HttpHeaders();
      headers = headers.set("Content-Type", "application/json; charset=utf-8");

      return this.httpClient.post(url, labOrderNote, { headers: headers })
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
  // Save - Write the updated lab order attachment data to the server
  // ------------------------------------------------------------------------------------------------------------------
  saveLabOrderAttachment(labOrderAttachment: LabOrderAttachmentModel)
  {

      var validation = new ValidationModel();
      validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
      validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
      validation.token = sessionStorage.getItem('token');
      validation.tranSourceId = this.tranSourceId;
      validation.version = this.version;

      labOrderAttachment.validation = validation;

      labOrderAttachment.labOrderId = Number(labOrderAttachment.labOrderId);
      labOrderAttachment.labOrderAttachmentId = Number(labOrderAttachment.labOrderAttachmentId);
      labOrderAttachment.loAttachmentTypeId = Number(labOrderAttachment.loAttachmentTypeId);
      labOrderAttachment.userId_Created = parseInt(sessionStorage.getItem('userId_Login'));

      const dt = new Date().toISOString();
      labOrderAttachment.dateCreated = formatDate(dt,'MM/dd/yyyy HH:mm:ss', 'en');

      //console.log("Attachment",labOrderAttachment);

      var url = this.apiRoot + 'api/LabOrder/SaveLabOrderAttachment'
      var headers = new HttpHeaders();
      headers = headers.set("Content-Type", "application/json; charset=utf-8");

      return this.httpClient.post(url, labOrderAttachment, { headers: headers })
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
  // Accessioned - Lab order has been accessioned - write data to the server
  // ------------------------------------------------------------------------------------------------------------------
  accessioned(labOrder: LabOrderForAccessioningModel, accessionedDate: string, mismatchDate: boolean, mismatchDOB: boolean, mismatchName: boolean, mismatchPregnant: boolean, labId: number, physicianHardcopy: boolean, patientHardcopy:boolean )
  {

    console.log("LabId",labId);


    var labStatus = new LabOrderStatusModel();
    var validation = new ValidationModel();
    validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
    validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
    validation.token = sessionStorage.getItem('token');
    validation.tranSourceId = this.tranSourceId;
    validation.version = this.version;

    labStatus.validation = validation;
    labStatus.userId_Updated = parseInt(sessionStorage.getItem('userId_Login'));
    labStatus.labOrderId = Number(labOrder.labOrderId);
    labStatus.labOrderSpecimenId = Number(labOrder.labOrderSpecimenId);
    labStatus.labStatusId = Number(labOrder.labStatusId);
    labStatus.statusDate = accessionedDate;

    labStatus.mismatchDate = mismatchDate;
    labStatus.mismatchDOB = mismatchDOB;
    labStatus.mismatchName = mismatchName;
    labStatus.mismatchPregnant = mismatchPregnant;
    labStatus.accessioningNote =  labOrder.accessioningNote;
    labStatus.labId = labId;
    labStatus.physicianHardcopy = physicianHardcopy;
    labStatus.patientHardcopy = patientHardcopy;
  
    var url = this.apiRoot + 'api/LabOrder/AccessionLabOrder'
    var headers = new HttpHeaders();
    headers = headers.set("Content-Type", "application/json; charset=utf-8");

    return this.httpClient.post(url, labStatus, { headers: headers })
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

  // ------------------------------------------------------------------------------------------------------------------
  // Hold - Place lab order on hold - write data to the server
  // ------------------------------------------------------------------------------------------------------------------
  hold(labOrder: LabOrderForAccessioningModel, holdComment: string, mismatchDate: boolean, mismatchDOB: boolean, mismatchName: boolean, mismatchPregnant: boolean, labId: number, physicianHardcopy: boolean, patientHardcopy:boolean)
  {
    var labStatus = new LabOrderStatusModel();
    var validation = new ValidationModel();
    validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
    validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
    validation.token = sessionStorage.getItem('token');
    validation.tranSourceId = this.tranSourceId;
    validation.version = this.version;

    if (holdComment == null){
        holdComment = "";
    }

    labStatus.validation = validation;
    labStatus.userId_Updated = parseInt(sessionStorage.getItem('userId_Login'));
    labStatus.labOrderId = Number(labOrder.labOrderId);
    labStatus.labOrderSpecimenId = Number(labOrder.labOrderSpecimenId);
    labStatus.labStatusId = Number(labOrder.labStatusId);
    const dt = new Date().toISOString();
    labStatus.statusDate = formatDate(dt,'MM/dd/yyyy HH:mm:ss', 'en');
    labStatus.comment = holdComment;

    labStatus.mismatchDate = mismatchDate;
    labStatus.mismatchDOB = mismatchDOB;
    labStatus.mismatchName = mismatchName;
    labStatus.mismatchPregnant = mismatchPregnant;
    labStatus.accessioningNote =  labOrder.accessioningNote;
    labStatus.labId = labId;
    labStatus.physicianHardcopy = physicianHardcopy;
    labStatus.patientHardcopy = patientHardcopy;
  
    var url = this.apiRoot + 'api/LabOrder/HoldLabOrder'
    var headers = new HttpHeaders();
    headers = headers.set("Content-Type", "application/json; charset=utf-8");

    return this.httpClient.post(url, labStatus, { headers: headers })
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

  // ------------------------------------------------------------------------------------------------------------------
  // Reject lab order - write data to the server
  // ------------------------------------------------------------------------------------------------------------------
  reject(labOrder: LabOrderForAccessioningModel, rejectComment: string, mismatchDate: boolean, mismatchDOB: boolean, mismatchName: boolean, mismatchPregnant: boolean, labId: number, physicianHardcopy: boolean, patientHardcopy:boolean)
  {
    var labStatus = new LabOrderStatusModel();
    var validation = new ValidationModel();
    validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
    validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
    validation.token = sessionStorage.getItem('token');
    validation.tranSourceId = this.tranSourceId;
    validation.version = this.version;

    labStatus.validation = validation;
    labStatus.userId_Updated = parseInt(sessionStorage.getItem('userId_Login'));
    labStatus.labOrderId = Number(labOrder.labOrderId);
    labStatus.labOrderSpecimenId = Number(labOrder.labOrderSpecimenId);
    labStatus.labStatusId = Number(labOrder.labStatusId);
    const dt = new Date().toISOString();
    labStatus.statusDate = formatDate(dt,'MM/dd/yyyy HH:mm:ss', 'en');
    labStatus.comment = rejectComment;

    labStatus.mismatchDate = mismatchDate;
    labStatus.mismatchDOB = mismatchDOB;
    labStatus.mismatchName = mismatchName;
    labStatus.mismatchPregnant = mismatchPregnant;
    labStatus.accessioningNote =  labOrder.accessioningNote;
    labStatus.labId = labId;
    labStatus.physicianHardcopy = physicianHardcopy;
    labStatus.patientHardcopy = patientHardcopy;
  
    var url = this.apiRoot + 'api/LabOrder/RejectLabOrder'
    var headers = new HttpHeaders();
    headers = headers.set("Content-Type", "application/json; charset=utf-8");

    return this.httpClient.post(url, labStatus, { headers: headers })
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

  // ------------------------------------------------------------------------------------------------------------------
  // UnAccession - Move lab order from Accessioned status to New Status
  // ------------------------------------------------------------------------------------------------------------------
  unAccession(labOrder: LabOrderModel)
  {
    var validation = new ValidationModel();
    validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
    validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
    validation.token = sessionStorage.getItem('token');
    validation.tranSourceId = this.tranSourceId;
    validation.version = this.version;
    labOrder.validation = validation;
    labOrder.userId_Updated = parseInt(sessionStorage.getItem('userId_Login'));
  
    labOrder.patientId = Number(labOrder.patientId);
    labOrder.userId_Physician = Number(labOrder.userId_Physician);
    labOrder.customerId = Number(labOrder.customerId);
    labOrder.locationId = Number(labOrder.locationId);
    labOrder.labId = Number(labOrder.labId);
    labOrder.billingTypeId = Number(labOrder.billingTypeId);
    labOrder.patientInsuranceId_Primary = Number(labOrder.patientInsuranceId_Primary);
    labOrder.patientInsuranceId_Secondary = Number(labOrder.patientInsuranceId_Secondary);
    labOrder.userSignatureId_Physician = Number(labOrder.userSignatureId_Physician);
    labOrder.patientSignatureId = Number(labOrder.patientSignatureId);
    labOrder.genderId = Number(labOrder.genderId);
    
    labOrder.userId_Updated = Number(labOrder.userId_Updated);

    var url = this.apiRoot + 'api/LabOrder/UnAccessionLabOrder'
    var headers = new HttpHeaders();
    headers = headers.set("Content-Type", "application/json; charset=utf-8");

    return this.httpClient.post(url, labOrder, { headers: headers })
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

  // ------------------------------------------------------------------------------------------------------------------
  // Esign a group lab order - write data to the server
  // ------------------------------------------------------------------------------------------------------------------
  eSign(checkList: Array<CodeItemModel>, signatureId: number)
  {
    var esign = new LabOrderESignModel();
    var validation = new ValidationModel();
    validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
    validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
    validation.token = sessionStorage.getItem('token');
    validation.tranSourceId = this.tranSourceId;
    validation.version = this.version;

    esign.validation = validation;
    esign.userId_Updated = parseInt(sessionStorage.getItem('userId_Login'));
    esign.userSignatureId_Physician = signatureId;
    esign.labOrderId = new Array<number>();
    checkList.forEach( (item) =>{
        esign.labOrderId.push(item.id);
    });
       
    var url = this.apiRoot + 'api/LabOrder/eSignLabOrder'
    var headers = new HttpHeaders();
    headers = headers.set("Content-Type", "application/json; charset=utf-8");

    return this.httpClient.post(url, esign, { headers: headers })
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

  // ------------------------------------------------------------------------------------------------------------------
  // Get for accessioning - return the labOrder based on the specimen barcode  passed in
  // ------------------------------------------------------------------------------------------------------------------
  getLabDemographicsChange(patientId: number )
  {
      var validation = new ValidationModel();
      validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
      validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
      validation.token = sessionStorage.getItem('token');
      validation.tranSourceId = this.tranSourceId;
      validation.version = this.version;

      var url = this.apiRoot + 'api/LabOrder/getLabDemographicsChange' + '?validation=' + JSON.stringify(validation) + '&PatientId=' + patientId;

      return this.httpClient.get(url)
          .pipe(
              map((data: LabOrderListModel) => { 
                  return data;
              }), catchError(error => {
                  return throwError('Something went wrong!');
              })
      )
  }

  // ------------------------------------------------------------------------------------------------------------------
  // Batch update demographics for a group lab order - write data to the server
  // ------------------------------------------------------------------------------------------------------------------
  batchDemographicsUpdate(patientId: number, note: string, checkList: Array<LabOrderBatchDemographicsItemModel>)
  {
    var batch = new LabOrderBatchDemographicsModel();
    var validation = new ValidationModel();
    validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
    validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
    validation.token = sessionStorage.getItem('token');
    validation.tranSourceId = this.tranSourceId;
    validation.version = this.version;

    batch.validation = validation;
    batch.userId_Updated = parseInt(sessionStorage.getItem('userId_Login'));
    batch.patientId = patientId;
    batch.items = new Array<LabOrderBatchDemographicsItemModel>();
    batch.note = note;
    batch.items = checkList;
       
    var url = this.apiRoot + 'api/LabOrder/BatchDemographicsUpdate'
    var headers = new HttpHeaders();
    headers = headers.set("Content-Type", "application/json; charset=utf-8");

    return this.httpClient.post(url, batch, { headers: headers })
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

  // ------------------------------------------------------------------------------------------------------------------
  // Load lab order models from list of test
  // ------------------------------------------------------------------------------------------------------------------

  loadToxData(tests: Array<LabOrderTestItemModel>){
    var tox = new ToxModel();

    if (tests != null){
      tests.forEach( (item) =>{
          switch (item.labTestId)
          {
              case 101: //Full Screen and Confirmation (15)
                  tox.fullScreenAndConfirmation = true;
                  tox.presumptiveTesting15 = true;
              case 102: //Full Screen and Confirmation (13)
                  tox.fullScreenAndConfirmation = true;
                  if (item.labTestId == 102){
                    tox.presumptiveTesting13 = true;
                  }
              case 100:
                  if (item.labTestId == 100){
                    tox.fullConfirmationOnly = true;
                  }
                  tox.alcohol.full = true;
                  tox.alcohol.etg = true;
                  tox.alcohol.ets = true;
                  tox.alcohol.nicotine = true;
                  tox.antidepressants.full = true;
                  tox.antidepressants.amitriptyline = true;
                  tox.antidepressants.doxepin = true;
                  tox.antidepressants.imipramine = true;
                  tox.antidepressants.mirtazapine = true;
                  tox.antidepressants.citalopram = true;
                  tox.antidepressants.duloxetine = true;
                  tox.antidepressants.fluoxetine = true;
                  tox.antidepressants.paroxetine = true;
                  tox.antidepressants.sertraline = true;
                  tox.antidepressants.bupropion = true;
                  tox.antidepressants.trazodone = true;
                  tox.antidepressants.venlafaxine = true;
                  tox.antidepressants.vortioxetine = true;
                  tox.antipsychotics.full = true;
                  tox.antipsychotics.aripiprazole = true;
                  tox.antipsychotics.haloperidol = true;
                  tox.antipsychotics.lurasidone = true;
                  tox.antipsychotics.olanzapine = true;
                  tox.antipsychotics.quetiapine = true;
                  tox.antipsychotics.risperidone = true;
                  tox.antipsychotics.ziprasidone = true;
                  tox.benzodiazepines.full = true;
                  tox.benzodiazepines.alprazolam = true;
                  tox.benzodiazepines.chlordiazepoxide = true;
                  tox.benzodiazepines.clonazepam = true;
                  tox.benzodiazepines.clonazolam = true;
                  tox.benzodiazepines.etizolam = true;
                  tox.benzodiazepines.flualprazolam = true;
                  tox.benzodiazepines.lorazepam = true;
                  tox.benzodiazepines.midazolam = true;
                  tox.benzodiazepines.oxazepam = true;
                  tox.benzodiazepines.temazepam = true;
                  tox.benzodiazepines.triazolam = true;
                  tox.cannabinoids.full = true;
                  tox.cannabinoids.cbd = true;
                  tox.cannabinoids.thc = true;
                  tox.cannabinoidsSynth.full = true;
                  tox.cannabinoidsSynth.adb = true;
                  tox.cannabinoidsSynth.mdmb = true;
                  tox.cannabinoidsSynth.mdmb5f = true;
                  tox.dissociative.full = true;
                  tox.dissociative.ketamine = true;
                  tox.dissociative.pcp = true;
                  tox.gabapentinoids.full = true;
                  tox.gabapentinoids.gabapentin = true;
                  tox.gabapentinoids.pregabalin = true;
                //   tox.hallucinogens.full = true;
                //   tox.hallucinogens.lsd = true;
                //   tox.hallucinogens.psilocybin = true;
                  tox.illicit.full = true;
                  tox.illicit.amphetamine = true;
                  tox.illicit.cocaine = true;
                  tox.illicit.heroin = true;
                  tox.illicit.mdma = true;
                  tox.illicit.methamphetamine = true;
                  //tox.illicit.methamphetaminePosative = true;
                  tox.illicit.pcp = true;
                  tox.kratom = true;
                  tox.opioidAgonists.full = true;
                  tox.opioidAgonists.codeine = true;
                  tox.opioidAgonists.dihydrocodeine = true;
                  tox.opioidAgonists.hydrocodone = true;
                  tox.opioidAgonists.norhydrocodone = true;
                  tox.opioidAgonists.hydromorphone = true;
                  tox.opioidAgonists.morphine = true;
                  tox.opioidAgonists.dextromethorphan = true;
                  tox.opioidAgonists.levorphanol = true;
                  tox.opioidAgonists.meperidine = true;
                  tox.opioidAgonists.oxycodone = true;
                  tox.opioidAgonists.oxymorphone = true;
                  tox.opioidAgonists.noroxycodone = true;
                  tox.opioidAgonists.tramadol = true;
                  tox.opioidAgonists.tapentadol = true;
                  tox.opioidAgonists.fentanyl = true;
                  tox.opioidAgonists.norfentanyl = true;
                  tox.opioidAgonists.acetylfentanyl = true;
                  tox.opioidAgonists.carfentanil = true;
                  tox.opioidAgonists.norcarfentanil = true;
                  tox.opioidAgonists.fluorofentanyl = true;
                  tox.opioidAgonists.buprenorphine = true;
                  tox.opioidAgonists.norbuprenorphine = true;
                  tox.opioidAgonists.methadone = true;
                  tox.opioidAgonists.eddp = true;
                  tox.opioidAgonists.isotonitazene = true;
                  tox.opioidAgonists.tianeptine = true;
                  tox.opioidAntagonists.full = true;
                  tox.opioidAntagonists.naloxone = true;
                  tox.opioidAntagonists.nalmefene = true;
                  tox.opioidAntagonists.naltrexone = true;
                  tox.sedative.full = true;
                  tox.sedative.butalbital = true;
                  tox.sedative.xylazine = true;
                  tox.sedative.zolpidem = true;
                  tox.sedative.zopiclone = true;
                  tox.sedative.phenibut = true;
                  tox.skeletal.full = true;
                  tox.skeletal.baclofen = true;
                  tox.skeletal.carisoprodol = true;
                  tox.skeletal.cyclobenzaprine = true;
                  tox.skeletal.meprobamate = true;
                  tox.skeletal.methocarbamol = true;
                  tox.skeletal.tizanidine = true;
                  tox.stimulants.full = true;
                  tox.stimulants.benzylone = true;
                  tox.stimulants.eutylone = true;
                  tox.stimulants.mda = true;
                  tox.stimulants.methylphenidate = true;
                  tox.stimulants.phentermine = true;
                  tox.thcSource = true;
                  break;
              case 103: //Target Reflex (15)
                  tox.targetReflex = true;
                  tox.presumptiveTesting15 = true;
                  break;
              case 104:  //Target Reflex (13)
                  tox.targetReflex = true;
                  tox.presumptiveTesting13 = true;
                  break;
              case 105:  //Universal Reflex (15)
                  tox.universalReflex = true;
                  tox.presumptiveTesting15 = true;
                  break;
              case 106:  //Universal Reflex (13)
                  tox.universalReflex = true;
                  tox.presumptiveTesting13 = true;
                  break;
              case 107:  //Custom
                  tox.custom = true;
                  break;
              case 110:
                  tox.presumptiveTesting15 = true;
                  break;
              case 130:
                  tox.presumptiveTesting13 = true;
                  break;
              case 200:
                  tox.alcohol.full = true;
                  tox.alcohol.etg = true;
                  tox.alcohol.ets = true;
                  tox.alcohol.nicotine = true;
                  break;
              case 201:
                  tox.alcohol.etg = true;
                  break;
              case 202:
                  tox.alcohol.ets = true;
                  break;
              case 203:
                  tox.alcohol.nicotine = true;
                  break;
              case 300:
                  tox.antidepressants.full = true;
                  tox.antidepressants.amitriptyline = true;
                  tox.antidepressants.doxepin = true;
                  tox.antidepressants.imipramine = true;
                  tox.antidepressants.mirtazapine = true;
                  tox.antidepressants.citalopram = true;
                  tox.antidepressants.duloxetine = true;
                  tox.antidepressants.fluoxetine = true;
                  tox.antidepressants.paroxetine = true;
                  tox.antidepressants.sertraline = true;
                  tox.antidepressants.bupropion = true;
                  tox.antidepressants.trazodone = true;
                  tox.antidepressants.venlafaxine = true;
                  tox.antidepressants.vortioxetine = true;
                  break;
              case 301:
                  tox.antidepressants.amitriptyline = true;
                  break;
              case 302:
                  tox.antidepressants.doxepin = true;
                  break;
              case 303:
                  tox.antidepressants.imipramine = true;
                  break;
              case 304:
                  tox.antidepressants.mirtazapine = true;
                  break;
              case 305:
                  tox.antidepressants.citalopram = true;
                  break;
              case 306:
                  tox.antidepressants.duloxetine = true;
                  break;
              case 307:
                  tox.antidepressants.fluoxetine = true;
                  break;
              case 308:
                  tox.antidepressants.paroxetine = true;
                  break;
              case 309:
                  tox.antidepressants.sertraline = true;
                  break;
              case 310:
                  tox.antidepressants.bupropion = true;
                  break;
              case 311:
                  tox.antidepressants.trazodone = true;
                  break;
              case 312:
                  tox.antidepressants.venlafaxine = true;
                  break;
              case 313: 
                  tox.antidepressants.vortioxetine = true;
              case 400:
                  tox.antipsychotics.full = true;
                  tox.antipsychotics.aripiprazole = true;
                  tox.antipsychotics.haloperidol = true;
                  tox.antipsychotics.lurasidone = true;
                  tox.antipsychotics.olanzapine = true;
                  tox.antipsychotics.quetiapine = true;
                  tox.antipsychotics.risperidone = true;
                  tox.antipsychotics.ziprasidone = true;
                  break;
              case 401:
                  tox.antipsychotics.aripiprazole = true;
                  break;
              case 402:
                  tox.antipsychotics.haloperidol = true;
                  break;
              case 403:
                  tox.antipsychotics.lurasidone = true;
                  break;
              case 404:
                  tox.antipsychotics.olanzapine = true;
                  break;
              case 405:
                  tox.antipsychotics.quetiapine = true;
                  break;
              case 406:
                  tox.antipsychotics.risperidone = true;
                  break;
              case 407:
                  tox.antipsychotics.ziprasidone = true;
                  break;
                 
              case 500:
                  tox.benzodiazepines.full = true;
                  tox.benzodiazepines.alprazolam = true;
                  tox.benzodiazepines.chlordiazepoxide = true;
                  tox.benzodiazepines.clonazepam = true;
                  tox.benzodiazepines.clonazolam = true;
                  tox.benzodiazepines.etizolam = true;
                  tox.benzodiazepines.flualprazolam = true;
                  tox.benzodiazepines.lorazepam = true;
                  tox.benzodiazepines.midazolam = true;
                  tox.benzodiazepines.oxazepam = true;
                  tox.benzodiazepines.temazepam = true;
                  tox.benzodiazepines.triazolam = true;
                  break;
              case 501:
                  tox.benzodiazepines.alprazolam = true;
                  break;
              case 502:
                  tox.benzodiazepines.chlordiazepoxide = true;
                  break;
              case 503:
                  tox.benzodiazepines.clonazepam = true;
                  break;
              case 504:
                  tox.benzodiazepines.clonazolam = true;
                  break;
              case 505:
                  tox.benzodiazepines.etizolam = true;
                  break;
              case 506:
                  tox.benzodiazepines.flualprazolam = true;
                  break;
              case 507:
                  tox.benzodiazepines.lorazepam = true;
                  break;
              case 508:
                  tox.benzodiazepines.midazolam = true;
                  break;
              case 509:
                  tox.benzodiazepines.oxazepam = true;
                  break;
              case 510:
                  tox.benzodiazepines.temazepam = true;
                  break;
              case 511:
                  tox.benzodiazepines.triazolam = true;
                  break;
              case 600:
                  tox.cannabinoids.full = true;
                  tox.cannabinoids.cbd = true;
                  tox.cannabinoids.thc = true;
                  break;
              case 601:
                  tox.cannabinoids.cbd = true;
                  break;
              case 602:
                  tox.cannabinoids.thc = true;
                  break;
              case 1800:
                  tox.cannabinoidsSynth.full = true;
                  tox.cannabinoidsSynth.adb = true;
                  tox.cannabinoidsSynth.mdmb = true;
                  tox.cannabinoidsSynth.mdmb5f = true;
                  break;
              case 1801:
                  tox.cannabinoidsSynth.adb = true;
                  break;
              case 1802:
                  tox.cannabinoidsSynth.mdmb = true;
                  break;
              case 1803:
                  tox.cannabinoidsSynth.mdmb5f = true;
                  break;
              case 700:
                  tox.dissociative.full = true;
                  tox.dissociative.ketamine = true;
                  tox.dissociative.pcp = true;
                  break;
              case 701:
                  tox.dissociative.ketamine = true;
                  break;
              case 702:
                  tox.dissociative.pcp = true;
                  break;
              case 800:
                  tox.gabapentinoids.full = true;
                  tox.gabapentinoids.gabapentin = true;
                  tox.gabapentinoids.pregabalin = true;
                  break;
              case 801:
                  tox.gabapentinoids.gabapentin = true;
                  break;
              case 802:
                  tox.gabapentinoids.pregabalin = true;
                  break;
              case 900:
                  tox.hallucinogens.full = true;
                  tox.hallucinogens.lsd = true;
                //   tox.hallucinogens.psilocybin = true;
                  break;
              case 901:
                  tox.hallucinogens.lsd = true;
                  break;
              case 902:
                //   tox.hallucinogens.psilocybin = true;
                  break;
              case 1000:
                  tox.illicit.full = true;
                  tox.illicit.amphetamine = true;
                  tox.illicit.cocaine = true;
                  tox.illicit.heroin = true;
                  tox.illicit.mdma = true;
                  tox.illicit.methamphetamine = true;
                  //tox.illicit.methamphetaminePosative = true;
                  tox.illicit.pcp = true;
                  break;
              case 1001:
                  tox.illicit.amphetamine = true;
                  break;
              case 1002:
                  tox.illicit.cocaine = true;
                  break;
              case 1003:
                  tox.illicit.heroin = true;
                  break;
              case 1005:
                  tox.illicit.mdma = true;
                  break;
              case 1006:
                  tox.illicit.methamphetamine = true;
                  break;
              case 1007:
                  tox.illicit.methamphetaminePosative = true;
                  break;
              case 1008:
                  tox.illicit.pcp = true;
                  break;
              case 1100:
                  tox.kratom = true;
                  break;
              case 1200:
                  tox.opioidAgonists.full = true;
                  tox.opioidAgonists.codeine = true;
                  tox.opioidAgonists.dihydrocodeine = true;
                  tox.opioidAgonists.hydrocodone = true;
                  tox.opioidAgonists.norhydrocodone = true;
                  tox.opioidAgonists.hydromorphone = true;
                  tox.opioidAgonists.morphine = true;
                  tox.opioidAgonists.dextromethorphan = true;
                  tox.opioidAgonists.levorphanol = true;
                  tox.opioidAgonists.meperidine = true;
                  tox.opioidAgonists.oxycodone = true;
                  tox.opioidAgonists.oxymorphone = true;
                  tox.opioidAgonists.noroxycodone = true;
                  tox.opioidAgonists.tramadol = true;
                  tox.opioidAgonists.tapentadol = true;
                  tox.opioidAgonists.fentanyl = true;
                  tox.opioidAgonists.norfentanyl = true;
                  tox.opioidAgonists.acetylfentanyl = true;
                  tox.opioidAgonists.carfentanil = true;
                  tox.opioidAgonists.norcarfentanil = true;
                  tox.opioidAgonists.fluorofentanyl = true;
                  tox.opioidAgonists.buprenorphine = true;
                  tox.opioidAgonists.norbuprenorphine = true;
                  tox.opioidAgonists.methadone = true;
                  tox.opioidAgonists.eddp = true;
                  tox.opioidAgonists.isotonitazene = true;
                  tox.opioidAgonists.tianeptine = true;
                  break;
              case 1201:
                  tox.opioidAgonists.codeine = true;
                  break;
              case 1202:
                  tox.opioidAgonists.dihydrocodeine = true;
                  break;
              case 1203:
                  tox.opioidAgonists.hydrocodone = true;
                  break;
              case 1204:
                  tox.opioidAgonists.norhydrocodone = true;
                  break;
              case 1205:
                  tox.opioidAgonists.hydromorphone = true;
                  break;
              case 1206:
                  tox.opioidAgonists.morphine = true;
                  break;
              case 1207:
                  tox.opioidAgonists.dextromethorphan = true;
                  break;
              case 1208:
                  tox.opioidAgonists.levorphanol = true;
                  break;
              case 1209:
                  tox.opioidAgonists.meperidine = true;
                  break;
              case 1210:
                  tox.opioidAgonists.oxycodone = true;
                  break;
              case 1211:
                  tox.opioidAgonists.oxymorphone = true;
                  break;
              case 1212:
                  tox.opioidAgonists.noroxycodone = true;
                  break;
              case 1213:
                  tox.opioidAgonists.tramadol = true;
                  break;
              case 1214:
                  tox.opioidAgonists.tapentadol = true;
                  break;
              case 1215:
                  tox.opioidAgonists.fentanyl = true;
                  break;
              case 1216:
                  tox.opioidAgonists.norfentanyl = true;
                  break;
              case 1217:
                  tox.opioidAgonists.acetylfentanyl = true;
                  break;
              case 1218:
                  tox.opioidAgonists.carfentanil = true;
                  break;
              case 1219:
                  tox.opioidAgonists.norcarfentanil = true;
                  break;
              case 1220:
                  tox.opioidAgonists.fluorofentanyl = true;
                  break;
              case 1221:
                  tox.opioidAgonists.buprenorphine = true;
                  break;
              case 1222:
                  tox.opioidAgonists.norbuprenorphine = true;
                  break;
              case 1223:
                  tox.opioidAgonists.methadone = true;
                  break;
              case 1224:
                  tox.opioidAgonists.eddp = true;
                  break;
              case 1225:
                  tox.opioidAgonists.isotonitazene = true;
                  break;
              case 1226:
                  tox.opioidAgonists.tianeptine = true;
                  break;
              case 1300:
                  tox.opioidAntagonists.full = true;
                  tox.opioidAntagonists.naloxone = true;
                  tox.opioidAntagonists.nalmefene = true;
                  tox.opioidAntagonists.naltrexone = true;
                  break;
              case 1301:
                  tox.opioidAntagonists.naloxone = true;
                  break;
              case 1302:
                  tox.opioidAntagonists.nalmefene = true;
                  break;
              case 1303:
                  tox.opioidAntagonists.naltrexone = true;
                  break;
              case 1400:
                  tox.sedative.full = true;
                  tox.sedative.butalbital = true;
                  tox.sedative.xylazine = true;
                  tox.sedative.zolpidem = true;
                  tox.sedative.zopiclone = true;
                  tox.sedative.phenibut = true;
                  break;
              case 1401:
                  tox.sedative.butalbital = true;
                  break;
              case 1402:
                  tox.sedative.xylazine = true;
                  break;
              case 1403:
                  tox.sedative.zolpidem = true;
                  break;
              case 1404:
                  tox.sedative.zopiclone = true;
                  break;
              case 1405:
                  tox.sedative.phenibut = true;
                  break;
              case 1500:
                  tox.skeletal.full = true;
                  tox.skeletal.baclofen = true;
                  tox.skeletal.carisoprodol = true;
                  tox.skeletal.cyclobenzaprine = true;
                  tox.skeletal.meprobamate = true;
                  tox.skeletal.methocarbamol = true;
                  tox.skeletal.tizanidine = true;
                  break;
              case 1501:
                  tox.skeletal.baclofen = true;
                  break;
              case 1502:
                  tox.skeletal.carisoprodol = true;
                  break;
              case 1503:
                  tox.skeletal.cyclobenzaprine = true;
                  break;
              case 1504:
                  tox.skeletal.meprobamate = true;
                  break;
              case 1505:
                  tox.skeletal.methocarbamol = true;
                  break;
              case 1506:
                  tox.skeletal.tizanidine = true;
                  break;
              case 1600:
                  tox.stimulants.full = true;
                  tox.stimulants.benzylone = true;
                  tox.stimulants.eutylone = true;
                  tox.stimulants.mda = true;
                  tox.stimulants.methylphenidate = true;
                  tox.stimulants.phentermine = true;
                  break;
              case 1601:
                  tox.stimulants.benzylone = true;
                  break;
              case 1602:
                  tox.stimulants.eutylone = true;
                  break;
              case 1603:
                  tox.stimulants.mda = true;
                  break;
              case 1604:
                  tox.stimulants.methylphenidate = true;
                  break;
              case 1605:
                  tox.stimulants.phentermine = true;
                  break;
              case 1700:
                  tox.thcSource = true;
                  break;



          }

      });
    }
    return(tox);
  }
  loadToxOralData(tests: Array<LabOrderTestItemModel>){
    var oral = new ToxOralModel();
    if (tests != null){
        tests.forEach( (item) =>{
            switch (item.labTestId)
            {
                case 5000:
                    oral.fullConfirmation = true;
                    oral.illicit.full = true;
                    oral.illicit.mam6 = true;
                    oral.illicit.amphetamine = true;
                    oral.illicit.methamphetamine = true;
                    oral.illicit.benzoylecgonine = true;
                    oral.illicit.mdma = true;
                    oral.illicit.pcp = true;
                    oral.illicit.thc = true;
                    oral.sedative.full = true;
                    oral.sedative.zolpidem = true;
                    oral.sedative.butalbital = true;
                    oral.benzodiazepines.full = true;
                    oral.benzodiazepines.alprazolam = true;
                    oral.benzodiazepines.diazepam = true;
                    oral.benzodiazepines.clonazepam = true;
                    oral.benzodiazepines.aminoclonazepam = true;
                    oral.benzodiazepines.nordiazepam = true;
                    oral.benzodiazepines.lorazepam = true;
                    oral.benzodiazepines.oxazepam = true;
                    oral.benzodiazepines.temazepam = true;
                    oral.muscle.full = true;
                    oral.muscle.baclofen = true;
                    oral.muscle.carisoprodol = true;
                    oral.muscle.cyclobenzaprine = true;
                    oral.muscle.meprobamate = true;
                    oral.muscle.methocarbamol = true;
                    oral.antipsychotics.full = true;
                    oral.antipsychotics.aripiprazole = true;
                    oral.antipsychotics.quetiapine = true;
                    oral.antipsychotics.risperidone = true;
                    oral.antipsychotics.ziprasidone = true;
                    oral.antidepressants.full = true;
                    oral.antidepressants.amitriptyline = true;
                    oral.antidepressants.citalopram = true;
                    oral.antidepressants.fluoxetine = true;
                    oral.antidepressants.nortriptyline = true;
                    oral.antidepressants.paroxetine = true;
                    oral.antidepressants.sertraline = true;
                    oral.antidepressants.venlafaxine = true;
                    oral.antidepressants.desmethylvenlafaxine = true;
                    oral.antidepressants.mirtazapine = true;
                    oral.antidepressants.trazodone = true;
                    oral.stimulants.full = true;
                    oral.stimulants.methylphenidate = true;
                    oral.stimulants.ritalinicAcid = true;
                    oral.stimulants.mda = true;
                    oral.stimulants.phentermine = true;
                    oral.kratom.full = true;
                    oral.kratom.mitragynine = true;
                    oral.nicotine.full = true;
                    oral.nicotine.cotinine = true;
                    oral.opioidAntagonists.full = true;
                    oral.opioidAntagonists.naloxone = true;
                    oral.opioidAntagonists.naltrexone = true;
                    oral.gabapentinoids.full = true;
                    oral.gabapentinoids.gabapentin = true;
                    oral.gabapentinoids.pregabalin = true;
                    oral.dissociative.full = true;
                    oral.dissociative.ketamine = true;
                    oral.dissociative.norketamine = true;
                    oral.opioidAgonists.full = true;
                    oral.opioidAgonists.buprenorphine = true;
                    oral.opioidAgonists.norbuprenorphine = true;
                    oral.opioidAgonists.codeine = true;
                    oral.opioidAgonists.dextromethorphan = true;
                    oral.opioidAgonists.hydrocodone = true;
                    // oral.opioidAgonists.norhydrocodone = true;
                    oral.opioidAgonists.hydromorphone = true;
                    oral.opioidAgonists.fentanyl = true;
                    oral.opioidAgonists.norfentanyl = true;
                    oral.opioidAgonists.methadone = true;
                    oral.opioidAgonists.eddp = true;
                    oral.opioidAgonists.morphine = true;
                    oral.opioidAgonists.oxycodone = true;
                    // oral.opioidAgonists.noroxycodone = true;
                    oral.opioidAgonists.oxymorphone = true;
                    oral.opioidAgonists.tapentadol = true;
                    oral.opioidAgonists.tramadol = true;
                    break;
                case 5100:
                    oral.illicit.full = true;
                    oral.illicit.mam6 = true;
                    oral.illicit.amphetamine = true;
                    oral.illicit.methamphetamine = true;
                    oral.illicit.benzoylecgonine = true;
                    oral.illicit.mdma = true;
                    oral.illicit.pcp = true;
                    oral.illicit.thc = true;
                    break;
                case 5101:
                    oral.illicit.mam6 = true;
                    break;
                case 5102:
                    oral.illicit.amphetamine = true;
                    break;
                case 5103:
                    oral.illicit.methamphetamine = true;
                    break;
                case 5104:
                    oral.illicit.benzoylecgonine = true;
                    break;
                case 5105:
                    oral.illicit.mdma = true;
                    break;
                case 5106:
                    oral.illicit.pcp = true;
                    break;
                case 5107:
                    oral.illicit.thc = true;
                    break;
                case 5200:
                    oral.sedative.full = true;
                    oral.sedative.zolpidem = true;
                    oral.sedative.butalbital = true;
                    break;
                case 5201:
                    oral.sedative.zolpidem = true;
                    break;
                case 5202:
                    oral.sedative.butalbital = true;
                    break;
                case 5300:
                    oral.benzodiazepines.full = true;
                    oral.benzodiazepines.alprazolam = true;
                    oral.benzodiazepines.diazepam = true;
                    oral.benzodiazepines.clonazepam = true;
                    oral.benzodiazepines.aminoclonazepam = true;
                    oral.benzodiazepines.nordiazepam = true;
                    oral.benzodiazepines.lorazepam = true;
                    oral.benzodiazepines.oxazepam = true;
                    oral.benzodiazepines.temazepam = true;
                    break;
                case 5301:
                    oral.benzodiazepines.alprazolam = true;
                    break;
                case 5302:
                    oral.benzodiazepines.diazepam = true;
                    break;
                case 5303:
                    oral.benzodiazepines.clonazepam = true;
                    break;
                case 5304:
                    oral.benzodiazepines.aminoclonazepam = true;
                    break;
                case 5305:
                    oral.benzodiazepines.nordiazepam = true;
                    break;
                case 5306:
                    oral.benzodiazepines.lorazepam = true;
                    break;
                case 5307:
                    oral.benzodiazepines.oxazepam = true;
                    break;
                case 5308:
                    oral.benzodiazepines.temazepam = true;
                    break;
                case 5400:
                    oral.muscle.full = true;
                    oral.muscle.baclofen = true;
                    oral.muscle.carisoprodol = true;
                    oral.muscle.cyclobenzaprine = true;
                    oral.muscle.meprobamate = true;
                    oral.muscle.methocarbamol = true;
                    break;
                case 5401:
                    oral.muscle.baclofen = true;
                    break;
                case 5402:
                    oral.muscle.carisoprodol = true;
                    break;
                case 5403:
                    oral.muscle.cyclobenzaprine = true;
                    break;
                case 5404:
                    oral.muscle.meprobamate = true;
                    break;
                case 5405:
                    oral.muscle.methocarbamol = true;
                    break;
                case 5500:
                    oral.antipsychotics.full = true;
                    oral.antipsychotics.aripiprazole = true;
                    oral.antipsychotics.quetiapine = true;
                    oral.antipsychotics.risperidone = true;
                    oral.antipsychotics.ziprasidone = true;
                    break;
                case 5501:
                    oral.antipsychotics.aripiprazole = true;
                    break;
                case 5502:
                    oral.antipsychotics.quetiapine = true;
                    break;
                case 5503:
                    oral.antipsychotics.risperidone = true;
                    break;
                case 5504:
                    oral.antipsychotics.ziprasidone = true;
                    break;
                case 5600:
                    oral.antidepressants.full = true;
                    oral.antidepressants.amitriptyline = true;
                    oral.antidepressants.citalopram = true;
                    oral.antidepressants.fluoxetine = true;
                    oral.antidepressants.nortriptyline = true;
                    oral.antidepressants.paroxetine = true;
                    oral.antidepressants.sertraline = true;
                    oral.antidepressants.venlafaxine = true;
                    oral.antidepressants.desmethylvenlafaxine = true;
                    oral.antidepressants.mirtazapine = true;
                    oral.antidepressants.trazodone = true;
                    break;
                case 5601:
                    oral.antidepressants.amitriptyline = true;
                    break;
                case 5602:
                    oral.antidepressants.citalopram = true;
                    break;
                case 5603:
                    oral.antidepressants.fluoxetine = true;
                    break;
                case 5604:
                    oral.antidepressants.nortriptyline = true;
                    break;
                case 5605:
                    oral.antidepressants.paroxetine = true;
                    break;
                case 5606:
                    oral.antidepressants.sertraline = true;
                    break;
                case 5607:
                    oral.antidepressants.venlafaxine = true;
                    break;
                case 5608:
                    oral.antidepressants.desmethylvenlafaxine = true;
                    break;
                case 5609:
                    oral.antidepressants.mirtazapine = true;
                    break;
                case 5610:
                    oral.antidepressants.trazodone = true;
                    break;
                case 5700:
                    oral.stimulants.full = true;
                    oral.stimulants.methylphenidate = true;
                    oral.stimulants.ritalinicAcid = true;
                    oral.stimulants.mda = true;
                    oral.stimulants.phentermine = true;
                    break;
                case 5701:
                    oral.stimulants.methylphenidate = true;
                    break;
                case 5702:
                    oral.stimulants.ritalinicAcid = true;
                    break;
                case 5703:
                    oral.stimulants.mda = true;
                    break;
                case 5704:
                    oral.stimulants.phentermine = true;
                    break;
                case 5800:
                    oral.kratom.full = true;
                    oral.kratom.mitragynine = true;
                    break;
                case 5801:
                    oral.kratom.mitragynine = true;
                    break;
                case 5900:
                    oral.nicotine.full = true;
                    oral.nicotine.cotinine = true;
                    break;
                case 5901:
                    oral.nicotine.cotinine = true;
                    break;
                case 6000:
                    oral.opioidAntagonists.full = true;
                    oral.opioidAntagonists.naloxone = true;
                    oral.opioidAntagonists.naltrexone = true;
                    break;
                case 6001:
                    oral.opioidAntagonists.naloxone = true;
                    break;
                case 6002:
                    oral.opioidAntagonists.naltrexone = true;
                    break;
                case 6100:
                    oral.gabapentinoids.full = true;
                    oral.gabapentinoids.gabapentin = true;
                    oral.gabapentinoids.pregabalin = true;
                    break;
                case 6101:
                    oral.gabapentinoids.gabapentin = true;
                    break;
                case 6102:
                    oral.gabapentinoids.pregabalin = true;
                    break;
                case 6200:
                    oral.dissociative.full = true;
                    oral.dissociative.ketamine = true;
                    oral.dissociative.norketamine = true;
                    break;
                case 6201:
                    oral.dissociative.ketamine = true;
                    break;
                case 6202:
                    oral.dissociative.norketamine = true;
                    break; 
                case 6300:
                    oral.opioidAgonists.full = true;
                    oral.opioidAgonists.buprenorphine = true;
                    oral.opioidAgonists.norbuprenorphine = true;
                    oral.opioidAgonists.codeine = true;
                    oral.opioidAgonists.dextromethorphan = true;
                    oral.opioidAgonists.hydrocodone = true;
                    // oral.opioidAgonists.norhydrocodone = true;
                    oral.opioidAgonists.hydromorphone = true;
                    oral.opioidAgonists.fentanyl = true;
                    oral.opioidAgonists.norfentanyl = true;
                    oral.opioidAgonists.methadone = true;
                    oral.opioidAgonists.eddp = true;
                    oral.opioidAgonists.morphine = true;
                    oral.opioidAgonists.oxycodone = true;
                    // oral.opioidAgonists.noroxycodone = true;
                    oral.opioidAgonists.oxymorphone = true;
                    oral.opioidAgonists.tapentadol = true;
                    oral.opioidAgonists.tramadol = true;
                    break;
                case 6301:
                    oral.opioidAgonists.buprenorphine = true;
                    break;
                case 6302:
                    oral.opioidAgonists.norbuprenorphine = true;
                    break;
                case 6303:
                    oral.opioidAgonists.codeine = true;
                    break
                case 6304:
                    oral.opioidAgonists.dextromethorphan = true;
                    break;
                case 6305:
                    oral.opioidAgonists.hydrocodone = true;
                    break;
                // case 6306:
                //     oral.opioidAgonists.norhydrocodone = true;
                //     break;
                case 6307:
                    oral.opioidAgonists.hydromorphone = true;
                    break;
                case 6308:
                    oral.opioidAgonists.fentanyl = true;
                    break;
                case 6309:
                    oral.opioidAgonists.norfentanyl = true;
                    break;
                case 6310:
                    oral.opioidAgonists.methadone = true;
                    break;
                case 6311:
                    oral.opioidAgonists.eddp = true;
                    break;
                case 6312:
                    oral.opioidAgonists.morphine = true;
                    break;
                case 6313:
                    oral.opioidAgonists.oxycodone = true;
                    break;
                // case 6314:
                //     oral.opioidAgonists.noroxycodone = true;
                //     break;
                case 6315:
                    oral.opioidAgonists.oxymorphone = true;
                    break;
                case 6316:
                    oral.opioidAgonists.tapentadol = true;
                    break;
                case 6317:
                    oral.opioidAgonists.tramadol = true;
                    break;                           
            }

        });
    }
        
    return (oral);

  }
  loadGPPData(tests: Array<LabOrderTestItemModel>){
    var gppData = new GPPModel();
    if (tests != null){
      tests.forEach( (item) =>{
        switch (item.labTestId)
        {
            case 2000:
                gppData.gastrointestinal = true;
                break;
            case 2100:
                gppData.helicobacter = true;
                break;

        }
      });
      return (gppData);
    }
  }
  loadUTIData(tests: Array<LabOrderTestItemModel>){
    var utiData = new UTIModel();
    
    if (tests != null){
      tests.forEach( (item) =>{
        switch (item.labTestId)
        {
            case 3000:
                utiData.urine = true;
                utiData.uCommon = true;
                utiData.uEnterococcusFaecalis = true;
                utiData.uEscherichiacoli = true;
                utiData.uKlebsiellaPneumoniae = true;
                utiData.uStaphylococcussaprophyticus = true;
                utiData.uStreptococcusAgalactiae = true;
                break;
            case 3100:
                utiData.urine = true;
                utiData.uUncommon = true;
                utiData.uEnterobacterCloacae = true;
                utiData.uEnterococcusFaecium = true;
                utiData.uGardnerellaVaginalis = true;
                utiData.uKlebsiellaOxytoca = true;
                utiData.uMycoplasmaHominis = true;
                utiData.uProteusMirabilis = true;
                utiData.uPseudomonasAeruginosa = true;
                utiData.uSerratiaMarcescens = true;
                utiData.uStaphylococcusAureus = true;         
                break;
            case 3200:
                utiData.urine = true;
                utiData.uSTILeukorrhea = true;
                utiData.uChlamydiaTrachomatis = true;
                utiData.uSGardnerellaVaginalis = true;
                utiData.uMycoplasmaGenitalium = true;
                utiData.uSMycoplasmaHominis = true;
                utiData.uNeisseriaGonorrhoeae = true;
                utiData.uTrichomonasVaginalis = true;
                utiData.uUreaplasmaUrealyticum = true;
                break;
            case 3300:
                utiData.urine = true;
                utiData.uYeast = true;
                utiData.uCandidaAlbicans = true;
                utiData.uCandidaAuris = true;
                utiData.uCandidaGlabrata = true;
                utiData.uCandidaKrusei = true;
                utiData.uCandidaLusitaniae = true;
                utiData.uCandidaParapsilosis = true;
                utiData.uCandidaTropicalis = true;
                break;
            case 3400:
                utiData.urine = true;
                utiData.uAdditional = true;
                utiData.uAcinetobacterBaumanii = true;
                utiData.uActinotignumSchaalii = true;
                utiData.uAerococcusUrinae = true;
                utiData.uAlloscardoviaOmnicolens = true;
                utiData.uCitrobacterFreundii = true;
                utiData.uCitrobacterKoseri = true;
                utiData.uCorynebacteriumRiegelii = true;
                utiData.uKlebsiellaaerogenes = true;
                utiData.uMorganellaMorganii = true;
                utiData.uPantoeaAgglomerans = true;
                utiData.uProvidenciaStuartii = true;
                utiData.uStaphylococcusEpidermidis = true;
                utiData.uStaphylococcusHaemolyticus = true;
                utiData.uStaphylococcusLugdunensis = true;
                utiData.uStreptococcusAnginosus = true;
                utiData.uStreptococcusOralis = true;
                break;
            case 3500:
                utiData.swab = true;
                utiData.sSTI = true;
                utiData.sChlamydiaTrachomatis = true;
                utiData.sHPV16 = true;
                utiData.sHPV18 = true;
                utiData.sHPV31 = true;
                utiData.sHPV33 = true;
                utiData.sHSV1 = true;
                utiData.sHSV2 = true;
                utiData.sNeisseriaGonorrhoeae = true;
                utiData.sTreponemaPallidum = true;
                break;
            case 3600:
                utiData.swab = true;
                utiData.sBacterialVaginosis = true;
                utiData.sGardnerellaVaginalis = true;
                utiData.sMycoplasmaGenitalium = true;
                utiData.sMycoplasmaHominis = true;
                utiData.sTrichomonasVaginalis = true;
                utiData.sUreaplasmaUrealyticum = true;
                break;
            case 3700:
                utiData.swab = true;
                utiData.sYeast = true;
                utiData.sCandidaAlbicans = true;
                utiData.sCandidaAuris = true;
                utiData.sCandidaGlabrata = true;
                utiData.sCandidaKrusei = true;
                utiData.sCandidaLusitaniae = true;
                utiData.sCandidaParapsilosis = true;
                utiData.sCandidaTropicalis = true;
                break;
            case 3800:
                utiData.swab = true;
                utiData.sEmerging = true;
                utiData.sMpox = true;
                break;
        }
      });
    }

    return(utiData);
  }
  loadRPPData(tests: Array<LabOrderTestItemModel>){
    var rppData = new RPPModel();

    if (tests != null){
      tests.forEach( (item) =>{
        switch (item.labTestId)
        {
          case 4000:
              rppData.fullRespiratory = true;
              rppData.viralTargets = true;
              rppData.influenzaA = true;
              rppData.influenzaB= true;
              rppData.parainfluenza= true;
              rppData.adenovirus= true;
              rppData.bocavirus= true;
              rppData.coronavirus= true;
              rppData.rhinovirus= true;
              rppData.parechovirus= true;
              rppData.respiratorySyncytial= true;
              rppData.metapneumovirus= true;
              rppData.bacterialTargets  = true;
              rppData.mycoplasmaPneumoniae= true;
              rppData.chlamydiaPneumoniae= true;
              rppData.ctreptococcusPneumoniae= true;
              rppData.klebsiellaPneumoniae= true;
              rppData.haemophilusInfluenza= true;
              rppData.legionellaPneumophila= true;
              rppData.moraxellaCatarrhalis= true;
              rppData.bordatellaSpecies= true;
              rppData.staphlococcusAureus= true;
              break;
          case 4100:
              rppData.viralTargets = true;
              rppData.influenzaA = true;
              rppData.influenzaB= true;
              rppData.parainfluenza= true;
              rppData.adenovirus= true;
              rppData.bocavirus= true;
              rppData.coronavirus= true;
              rppData.rhinovirus= true;
              rppData.parechovirus= true;
              rppData.respiratorySyncytial= true;
              rppData.metapneumovirus= true;
              break;
          case 4200:
              rppData.bacterialTargets  = true;
              rppData.mycoplasmaPneumoniae= true;
              rppData.chlamydiaPneumoniae= true;
              rppData.ctreptococcusPneumoniae= true;
              rppData.klebsiellaPneumoniae= true;
              rppData.haemophilusInfluenza= true;
              rppData.legionellaPneumophila= true;
              rppData.moraxellaCatarrhalis= true;
              rppData.bordatellaSpecies= true;
              rppData.staphlococcusAureus= true;
              break;
          case 4300:
              rppData.covidOnly = true;
              break;
          case 4400:
              rppData.covidThenReflux = true;
              rppData.covidParainfluenza= true;
              rppData.covidInfluenzaA= true;
              rppData.covidInfluenzaB= true;
              rppData.covidRespiratory= true;
              rppData.covidRhinovirus= true;
              rppData.covidStreptococcus= true;
              rppData.covidChlamydia= true;
              rppData.covidLegionella= true;
              rppData.covidHaemophilus= true;
              break;
          case 4500:
              rppData.moderateAssessment = true;
              rppData.covidParainfluenza= true;
              rppData.covidInfluenzaA= true;
              rppData.covidInfluenzaB= true;
              rppData.covidRespiratory= true;
              rppData.covidRhinovirus= true;
              rppData.covidStreptococcus= true;
              rppData.covidChlamydia= true;
              rppData.covidLegionella= true;
              rppData.covidHaemophilus= true;
              break;
          case 4600:
              rppData.covidPlusModerate = true;
              rppData.covidParainfluenza= true;
              rppData.covidInfluenzaA= true;
              rppData.covidInfluenzaB= true;
              rppData.covidRespiratory= true;
              rppData.covidRhinovirus= true;
              rppData.covidStreptococcus= true;
              rppData.covidChlamydia= true;
              rppData.covidLegionella= true;
              rppData.covidHaemophilus= true;
              break;

        }
      });
    }
    return(rppData);
  }

  // ------------------------------------------------------------------------------------------------------------------
  // Load tox from test
  // ------------------------------------------------------------------------------------------------------------------

  loadToxFromTest(tox: ToxModel, specimenId: number){

    var tests = new Array<LabOrderTestItemModel>();
    //  Put test into list
    if (tox.fullConfirmationOnly)
    {
        var test = new LabOrderTestItemModel();
        test.labTestId = 100;
        test.labOrderSpecimenId = specimenId;
        tests.push(test);

        if (tox.illicit.methamphetaminePosative)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 1007;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            } 
    }
    else if (tox.fullScreenAndConfirmation && tox.presumptiveTesting15)
    {
        var test = new LabOrderTestItemModel();
        test.labTestId = 101;
        test.labOrderSpecimenId = specimenId;
        tests.push(test);

        if (tox.illicit.methamphetaminePosative)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 1007;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            } 
    }
    else if (tox.fullScreenAndConfirmation)
    {
        var test = new LabOrderTestItemModel();
        test.labTestId = 102;
        test.labOrderSpecimenId = specimenId;
        tests.push(test);

        if (tox.illicit.methamphetaminePosative)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 1007;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            } 
    }
    else
    {
        if (tox.targetReflex && tox.presumptiveTesting15)
        {
            var test = new LabOrderTestItemModel();
            test.labTestId = 103;
            test.labOrderSpecimenId = specimenId;
            tests.push(test);
        }
        if (tox.targetReflex && tox.presumptiveTesting13)
        {
            var test = new LabOrderTestItemModel();
            test.labTestId = 104;
            test.labOrderSpecimenId = specimenId;
            tests.push(test);
        }
        if (tox.universalReflex && tox.presumptiveTesting15)
        {
            var test = new LabOrderTestItemModel();
            test.labTestId = 105;
            test.labOrderSpecimenId = specimenId;
            tests.push(test);
        }
        if (tox.universalReflex && tox.presumptiveTesting13)
        {
            var test = new LabOrderTestItemModel();
            test.labTestId = 106;
            test.labOrderSpecimenId = specimenId;
            tests.push(test);
        }
        if (tox.custom)
        {
            var test = new LabOrderTestItemModel();
            test.labTestId = 107;
            test.labOrderSpecimenId = specimenId;
            tests.push(test);
        }
        if (tox.presumptiveTesting15 && !tox.targetReflex && !tox.universalReflex)
        {
            var test = new LabOrderTestItemModel();
            test.labTestId = 110;
            test.labOrderSpecimenId = specimenId;
            tests.push(test);
        }
        if (tox.presumptiveTesting13 && !tox.targetReflex && !tox.universalReflex)
        {
            var test = new LabOrderTestItemModel();
            test.labTestId = 130;
            test.labOrderSpecimenId = specimenId;
            tests.push(test);
        }
        if (tox.alcohol.full)
        {
            var test = new LabOrderTestItemModel();
            test.labTestId = 200;
            test.labOrderSpecimenId = specimenId;
            tests.push(test);
        }
        else{
            if (tox.alcohol.etg)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 201;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
            if (tox.alcohol.ets)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 202;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
            if (tox.alcohol.nicotine)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 203;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
        }
        if (tox.antidepressants.full)
        {
            var test = new LabOrderTestItemModel();
            test.labTestId = 300;
            test.labOrderSpecimenId = specimenId;
            tests.push(test);
        }
        else{
            if (tox.antidepressants.amitriptyline)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 301;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
            if (tox.antidepressants.doxepin)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 302;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
            if (tox.antidepressants.imipramine)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 303;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
            if (tox.antidepressants.mirtazapine)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 304;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
            if (tox.antidepressants.citalopram)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 305;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
            if (tox.antidepressants.duloxetine)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 306;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
            if (tox.antidepressants.fluoxetine)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 307;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
            if (tox.antidepressants.paroxetine)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 308;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
            if (tox.antidepressants.sertraline)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 309;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
            if (tox.antidepressants.bupropion)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 310;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
            if (tox.antidepressants.trazodone)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 311;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
            if (tox.antidepressants.venlafaxine)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 312;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
            if (tox.antidepressants.vortioxetine)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 313;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
        }
        if (tox.antipsychotics.full)
        {
            var test = new LabOrderTestItemModel();
            test.labTestId = 400;
            test.labOrderSpecimenId = specimenId;
            tests.push(test);
        }
        else{
            if (tox.antipsychotics.aripiprazole)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 401;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
            if (tox.antipsychotics.haloperidol)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 402;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
            if (tox.antipsychotics.lurasidone)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 403;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
            if (tox.antipsychotics.olanzapine)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 404;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
            if (tox.antipsychotics.quetiapine)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 405;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
            if (tox.antipsychotics.risperidone)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 406;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
            if (tox.antipsychotics.ziprasidone)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 407;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
        }
        if (tox.benzodiazepines.full)
        {
            var test = new LabOrderTestItemModel();
            test.labTestId = 500;
            test.labOrderSpecimenId = specimenId;
            tests.push(test);
        }  
        else{
            if (tox.benzodiazepines.alprazolam)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 501;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }  
            if (tox.benzodiazepines.chlordiazepoxide)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 502;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }  
            if (tox.benzodiazepines.clonazepam)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 503;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }  
            if (tox.benzodiazepines.clonazolam)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 504;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }  
            if (tox.benzodiazepines.etizolam)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 505;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }  
            if (tox.benzodiazepines.flualprazolam)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 506;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }  
            if (tox.benzodiazepines.lorazepam)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 507;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }  
            if (tox.benzodiazepines.midazolam)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 508;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }  
            if (tox.benzodiazepines.oxazepam)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 509;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }  
            if (tox.benzodiazepines.temazepam)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 510;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }  
            if (tox.benzodiazepines.triazolam)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 511;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }  
        }
        if (tox.cannabinoids.full)
        {
            var test = new LabOrderTestItemModel();
            test.labTestId = 600;
            test.labOrderSpecimenId = specimenId;
            tests.push(test);
        } 
        else{
            if (tox.cannabinoids.cbd)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 601;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            } 
            if (tox.cannabinoids.thc)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 602;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            } 
        }
        if (tox.cannabinoidsSynth.full)
        {
            var test = new LabOrderTestItemModel();
            test.labTestId = 1800;
            test.labOrderSpecimenId = specimenId;
            tests.push(test);
        } 
        else{
            if (tox.cannabinoidsSynth.adb)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 1801;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            } 
            if (tox.cannabinoidsSynth.mdmb)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 1802;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            } 
            if (tox.cannabinoidsSynth.mdmb5f)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 1803;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
        }
        if (tox.dissociative.full)
        {
            var test = new LabOrderTestItemModel();
            test.labTestId = 700;
            test.labOrderSpecimenId = specimenId;
            tests.push(test);
        } 
        else{
            if (tox.dissociative.ketamine)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 701;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            } 
            if (tox.dissociative.pcp)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 702;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            } 
        }
        if (tox.gabapentinoids.full)
        {
            var test = new LabOrderTestItemModel();
            test.labTestId = 800;
            test.labOrderSpecimenId = specimenId;
            tests.push(test);
        } 
        else{
            if (tox.gabapentinoids.gabapentin)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 801;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            } 
            if (tox.gabapentinoids.pregabalin)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 802;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            } 
        }
        if (tox.hallucinogens.full)
        {
            var test = new LabOrderTestItemModel();
            test.labTestId = 900;
            test.labOrderSpecimenId = specimenId;
            tests.push(test);
        } 
        else{
            if (tox.hallucinogens.lsd)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 901;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            } 
            if (tox.hallucinogens.psilocybin)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 902;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            } 
        }
        if (tox.illicit.full)
        {
            var test = new LabOrderTestItemModel();
            test.labTestId = 1000;
            test.labOrderSpecimenId = specimenId;
            tests.push(test);
        } 
        else{
            if (tox.illicit.amphetamine)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 1001;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            } 
            if (tox.illicit.cocaine)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 1002;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            } 
            if (tox.illicit.heroin)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 1003;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            } 
            if (tox.illicit.mdma)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 1005;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            } 
            if (tox.illicit.methamphetamine)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 1006;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            } 
            if (tox.illicit.methamphetaminePosative)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 1007;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            } 
            if (tox.illicit.pcp)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 1008;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            } 
        }
        if (tox.kratom)
        {
            var test = new LabOrderTestItemModel();
            test.labTestId = 1100;
            test.labOrderSpecimenId = specimenId;
            tests.push(test);
        } 
        if (tox.opioidAgonists.full)
        {
            var test = new LabOrderTestItemModel();
            test.labTestId = 1200;
            test.labOrderSpecimenId = specimenId;
            tests.push(test);
        } 
        else{
            if (tox.opioidAgonists.codeine)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 1201;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            } 
            if (tox.opioidAgonists.dihydrocodeine)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 1202;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            } 
            if (tox.opioidAgonists.hydrocodone)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 1203;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            } 
            if (tox.opioidAgonists.norhydrocodone)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 1204;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            } 
            if (tox.opioidAgonists.hydromorphone)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 1205;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            } 
            if (tox.opioidAgonists.morphine)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 1206;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            } 
            if (tox.opioidAgonists.dextromethorphan)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 1207;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            } 
            if (tox.opioidAgonists.levorphanol)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 1208;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            } 
            if (tox.opioidAgonists.meperidine)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 1209;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            } 
            if (tox.opioidAgonists.oxycodone)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 1210;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            } 
            if (tox.opioidAgonists.oxymorphone)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 1211;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            } 
            if (tox.opioidAgonists.noroxycodone)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 1212;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            } 
            if (tox.opioidAgonists.tramadol)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 1213;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            } 
            if (tox.opioidAgonists.tapentadol)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 1214;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            } 
            if (tox.opioidAgonists.fentanyl)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 1215;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            } 
            if (tox.opioidAgonists.norfentanyl)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 1216;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            } 
            if (tox.opioidAgonists.acetylfentanyl)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 1217;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            } 
            if (tox.opioidAgonists.carfentanil)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 1218;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            } 
            if (tox.opioidAgonists.norcarfentanil)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 1219;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            } 
            if (tox.opioidAgonists.fluorofentanyl)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 1220;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            } 
            if (tox.opioidAgonists.buprenorphine)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 1221;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            } 
            if (tox.opioidAgonists.norbuprenorphine)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 1222;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            } 
            if (tox.opioidAgonists.methadone)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 1223;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            } 
            if (tox.opioidAgonists.eddp)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 1224;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            } 
            if (tox.opioidAgonists.isotonitazene)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 1225;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            } 
            if (tox.opioidAgonists.tianeptine)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 1226;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            } 
        }
        if (tox.opioidAntagonists.full)
        {
            var test = new LabOrderTestItemModel();
            test.labTestId = 1300;
            test.labOrderSpecimenId = specimenId;
            tests.push(test);
        } 
        else{
            if (tox.opioidAntagonists.naloxone)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 1301;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            } 
            if (tox.opioidAntagonists.nalmefene)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 1302;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            } 
            if (tox.opioidAntagonists.naltrexone)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 1303;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            } 
        }
        if (tox.sedative.full)
        {
            var test = new LabOrderTestItemModel();
            test.labTestId = 1400;
            test.labOrderSpecimenId = specimenId;
            tests.push(test);
        } 
        else{
            if (tox.sedative.butalbital)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 1401;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            } 
            if (tox.sedative.xylazine)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 1402;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            } 
            if (tox.sedative.zolpidem)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 1403;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            } 
            if (tox.sedative.zopiclone)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 1404;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            } 
            if (tox.sedative.phenibut)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 1405;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            } 
        }
        if (tox.skeletal.full)
        {
            var test = new LabOrderTestItemModel();
            test.labTestId = 1500;
            test.labOrderSpecimenId = specimenId;
            tests.push(test);
        } 
        else{
            if (tox.skeletal.baclofen)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 1501;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            } 
            if (tox.skeletal.carisoprodol)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 1502;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            } 
            if (tox.skeletal.cyclobenzaprine)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 1503;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            } 
            if (tox.skeletal.meprobamate)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 1504;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            } 
            if (tox.skeletal.methocarbamol)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 1505;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            } 
            if (tox.skeletal.tizanidine)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 1506;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            } 
        }
        if (tox.stimulants.full)
        {
            var test = new LabOrderTestItemModel();
            test.labTestId = 1600;
            test.labOrderSpecimenId = specimenId;
            tests.push(test);
        } 
        else{
            if (tox.stimulants.benzylone)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 1601;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            } 
            if (tox.stimulants.eutylone)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 1602;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            } 
            if (tox.stimulants.mda)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 1603;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            } 
            if (tox.stimulants.methylphenidate)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 1604;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            } 
            if (tox.stimulants.phentermine)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 1605;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            } 
        }
        if (tox.thcSource)
        {
            var test = new LabOrderTestItemModel();
            test.labTestId = 1700;
            test.labOrderSpecimenId = specimenId;
            tests.push(test);
        } 
    }
    return(tests);
  }

  loadToxFromTestPP(tox: ToxModel){

    var tests = new Array<PhysicianPreferenceTestModel>();
    //  Put test into list
    if (tox.targetReflex && tox.presumptiveTesting15)
    {
        var test = new PhysicianPreferenceTestModel();
        test.labTestId = 103;
        tests.push(test);
    }
    if (tox.targetReflex && tox.presumptiveTesting13)
    {
        var test = new PhysicianPreferenceTestModel();
        test.labTestId = 104;
        tests.push(test);
    }
    if (tox.universalReflex && tox.presumptiveTesting15)
    {
        var test = new PhysicianPreferenceTestModel();
        test.labTestId = 105;
        tests.push(test);
    }
    if (tox.universalReflex && tox.presumptiveTesting13)
    {
        var test = new PhysicianPreferenceTestModel();
        test.labTestId = 106;
        tests.push(test);
    }


    if (tox.presumptiveTesting15 && !tox.targetReflex && !tox.universalReflex)
    {
        var test = new PhysicianPreferenceTestModel();
        test.labTestId = 110;
        tests.push(test);
    }
    if (tox.presumptiveTesting13 && !tox.targetReflex && !tox.universalReflex)
    {
        var test = new PhysicianPreferenceTestModel();
        test.labTestId = 130;
        tests.push(test);
    }
    if (tox.alcohol.full)
    {
        var test = new PhysicianPreferenceTestModel();
        test.labTestId = 200;
        tests.push(test);
    }
    else{
        if (tox.alcohol.etg)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 201;
            tests.push(test);
        }
        if (tox.alcohol.ets)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 202;
            tests.push(test);
        }
        if (tox.alcohol.nicotine)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 203;
            tests.push(test);
        }
    }
    if (tox.antidepressants.full)
    {
        var test = new PhysicianPreferenceTestModel();
        test.labTestId = 300;
        tests.push(test);
    }
    else{
        if (tox.antidepressants.amitriptyline)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 301;
            tests.push(test);
        }
        if (tox.antidepressants.doxepin)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 302;
            tests.push(test);
        }
        if (tox.antidepressants.imipramine)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 303;
            tests.push(test);
        }
        if (tox.antidepressants.mirtazapine)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 304;
            tests.push(test);
        }
        if (tox.antidepressants.citalopram)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 305;
            tests.push(test);
        }
        if (tox.antidepressants.duloxetine)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 306;
            tests.push(test);
        }
        if (tox.antidepressants.fluoxetine)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 307;
            tests.push(test);
        }
        if (tox.antidepressants.paroxetine)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 308;
            tests.push(test);
        }
        if (tox.antidepressants.sertraline)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 309;
            tests.push(test);
        }
        if (tox.antidepressants.bupropion)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 310;
            tests.push(test);
        }
        if (tox.antidepressants.trazodone)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 311;
            tests.push(test);
        }
        if (tox.antidepressants.venlafaxine)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 312;
            tests.push(test);
        }
        if (tox.antidepressants.vortioxetine)
            {
                var test = new PhysicianPreferenceTestModel();
                test.labTestId = 313;
                tests.push(test);
            }
    }
    if (tox.antipsychotics.full)
    {
        var test = new PhysicianPreferenceTestModel();
        test.labTestId = 400;
        tests.push(test);
    }
    else{
        if (tox.antipsychotics.aripiprazole)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 401;
            tests.push(test);
        }
        if (tox.antipsychotics.haloperidol)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 402;
            tests.push(test);
        }
        if (tox.antipsychotics.lurasidone)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 403;
            tests.push(test);
        }
        if (tox.antipsychotics.olanzapine)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 404;
            tests.push(test);
        }
        if (tox.antipsychotics.quetiapine)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 405;
            tests.push(test);
        }
        if (tox.antipsychotics.risperidone)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 406;
            tests.push(test);
        }
        if (tox.antipsychotics.ziprasidone)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 407;
            tests.push(test);
        }
    }
    if (tox.benzodiazepines.full)
    {
        var test = new PhysicianPreferenceTestModel();
        test.labTestId = 500;
        tests.push(test);
    }  
    else{
        if (tox.benzodiazepines.alprazolam)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 501;
            tests.push(test);
        }  
        if (tox.benzodiazepines.chlordiazepoxide)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 502;
            tests.push(test);
        }  
        if (tox.benzodiazepines.clonazepam)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 503;
            tests.push(test);
        }  
        if (tox.benzodiazepines.clonazolam)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 504;
            tests.push(test);
        }  
        if (tox.benzodiazepines.etizolam)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 505;
            tests.push(test);
        }  
        if (tox.benzodiazepines.flualprazolam)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 506;
            tests.push(test);
        }  
        if (tox.benzodiazepines.lorazepam)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 507;
            tests.push(test);
        }  
        if (tox.benzodiazepines.midazolam)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 508;
            tests.push(test);
        }  
        if (tox.benzodiazepines.oxazepam)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 509;
            tests.push(test);
        }  
        if (tox.benzodiazepines.temazepam)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 510;
            tests.push(test);
        }  
        if (tox.benzodiazepines.triazolam)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 511;
            tests.push(test);
        }  
    }
    if (tox.cannabinoids.full)
    {
        var test = new PhysicianPreferenceTestModel();
        test.labTestId = 600;
        tests.push(test);
    } 
    else{
        if (tox.cannabinoids.cbd)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 601;
            tests.push(test);
        } 
        if (tox.cannabinoids.thc)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 602;
            tests.push(test);
        } 
    }
    if (tox.cannabinoidsSynth.full)
    {
        var test = new PhysicianPreferenceTestModel();
        test.labTestId = 1800;
        tests.push(test);
    } 
    else{
        if (tox.cannabinoidsSynth.adb)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 1801;
            tests.push(test);
        } 
        if (tox.cannabinoidsSynth.mdmb)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 1802;
            tests.push(test);
        } 
        if (tox.cannabinoidsSynth.mdmb5f)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 1803;
            tests.push(test);
        } 
    }
    if (tox.dissociative.full)
    {
        var test = new PhysicianPreferenceTestModel();
        test.labTestId = 700;
        tests.push(test);
    } 
    else{
        if (tox.dissociative.ketamine)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 701;
            tests.push(test);
        } 
        if (tox.dissociative.pcp)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 702;
            tests.push(test);
        } 
    }
    if (tox.gabapentinoids.full)
    {
        var test = new PhysicianPreferenceTestModel();
        test.labTestId = 800;
        tests.push(test);
    } 
    else{
        if (tox.gabapentinoids.gabapentin)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 801;
            tests.push(test);
        } 
        if (tox.gabapentinoids.pregabalin)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 802;
            tests.push(test);
        } 
    }
    if (tox.hallucinogens.full)
    {
        var test = new PhysicianPreferenceTestModel();
        test.labTestId = 900;
        tests.push(test);
    } 
    else{
        if (tox.hallucinogens.lsd)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 901;
            tests.push(test);
        } 
        if (tox.hallucinogens.psilocybin)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 902;
            tests.push(test);
        } 
    }
    if (tox.illicit.full)
    {
        var test = new PhysicianPreferenceTestModel();
        test.labTestId = 1000;
        tests.push(test);
    } 
    else{
        if (tox.illicit.amphetamine)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 1001;
            tests.push(test);
        } 
        if (tox.illicit.cocaine)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 1002;
            tests.push(test);
        } 
        if (tox.illicit.heroin)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 1003;
            tests.push(test);
        } 
        if (tox.illicit.mdma)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 1005;
            tests.push(test);
        } 
        if (tox.illicit.methamphetamine)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 1006;
            tests.push(test);
        } 
        if (tox.illicit.methamphetaminePosative)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 1007;
            tests.push(test);
        } 
        if (tox.illicit.pcp)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 1008;
            tests.push(test);
        } 
    }
    if (tox.kratom)
    {
        var test = new PhysicianPreferenceTestModel();
        test.labTestId = 1100;
        tests.push(test);
    } 
    if (tox.opioidAgonists.full)
    {
        var test = new PhysicianPreferenceTestModel();
        test.labTestId = 1200;
        tests.push(test);
    } 
    else{
        if (tox.opioidAgonists.codeine)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 1201;
            tests.push(test);
        } 
        if (tox.opioidAgonists.dihydrocodeine)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 1202;
            tests.push(test);
        } 
        if (tox.opioidAgonists.hydrocodone)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 1203;
            tests.push(test);
        } 
        if (tox.opioidAgonists.norhydrocodone)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 1204;
            tests.push(test);
        } 
        if (tox.opioidAgonists.hydromorphone)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 1205;
            tests.push(test);
        } 
        if (tox.opioidAgonists.morphine)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 1206;
            tests.push(test);
        } 
        if (tox.opioidAgonists.dextromethorphan)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 1207;
            tests.push(test);
        } 
        if (tox.opioidAgonists.levorphanol)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 1208;
            tests.push(test);
        } 
        if (tox.opioidAgonists.meperidine)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 1209;
            tests.push(test);
        } 
        if (tox.opioidAgonists.oxycodone)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 1210;
            tests.push(test);
        } 
        if (tox.opioidAgonists.oxymorphone)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 1211;
            tests.push(test);
        } 
        if (tox.opioidAgonists.noroxycodone)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 1212;
            tests.push(test);
        } 
        if (tox.opioidAgonists.tramadol)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 1213;
            tests.push(test);
        } 
        if (tox.opioidAgonists.tapentadol)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 1214;
            tests.push(test);
        } 
        if (tox.opioidAgonists.fentanyl)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 1215;
            tests.push(test);
        } 
        if (tox.opioidAgonists.norfentanyl)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 1216;
            tests.push(test);
        } 
        if (tox.opioidAgonists.acetylfentanyl)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 1217;
            tests.push(test);
        } 
        if (tox.opioidAgonists.carfentanil)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 1218;
            tests.push(test);
        } 
        if (tox.opioidAgonists.norcarfentanil)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 1219;
            tests.push(test);
        } 
        if (tox.opioidAgonists.fluorofentanyl)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 1220;
            tests.push(test);
        } 
        if (tox.opioidAgonists.buprenorphine)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 1221;
            tests.push(test);
        } 
        if (tox.opioidAgonists.norbuprenorphine)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 1222;
            tests.push(test);
        } 
        if (tox.opioidAgonists.methadone)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 1223;
            tests.push(test);
        } 
        if (tox.opioidAgonists.eddp)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 1224;
            tests.push(test);
        } 
        if (tox.opioidAgonists.isotonitazene)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 1225;
            tests.push(test);
        } 
        if (tox.opioidAgonists.tianeptine)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 1226;
            tests.push(test);
        } 
    }
    if (tox.opioidAntagonists.full)
    {
        var test = new PhysicianPreferenceTestModel();
        test.labTestId = 1300;
        tests.push(test);
    } 
    else{
        if (tox.opioidAntagonists.naloxone)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 1301;
            tests.push(test);
        } 
        if (tox.opioidAntagonists.nalmefene)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 1302;
            tests.push(test);
        } 
        if (tox.opioidAntagonists.naltrexone)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 1303;
            tests.push(test);
        } 
    }
    if (tox.sedative.full)
    {
        var test = new PhysicianPreferenceTestModel();
        test.labTestId = 1400;
        tests.push(test);
    } 
    else{
        if (tox.sedative.butalbital)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 1401;
            tests.push(test);
        } 
        if (tox.sedative.xylazine)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 1402;
            tests.push(test);
        } 
        if (tox.sedative.zolpidem)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 1403;
            tests.push(test);
        } 
        if (tox.sedative.zopiclone)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 1404;
            tests.push(test);
        } 
        if (tox.sedative.phenibut)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 1405;
            tests.push(test);
        } 
    }
    if (tox.skeletal.full)
    {
        var test = new PhysicianPreferenceTestModel();
        test.labTestId = 1500;
        tests.push(test);
    } 
    else{
        if (tox.skeletal.baclofen)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 1501;
            tests.push(test);
        } 
        if (tox.skeletal.carisoprodol)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 1502;
            tests.push(test);
        } 
        if (tox.skeletal.cyclobenzaprine)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 1503;
            tests.push(test);
        } 
        if (tox.skeletal.meprobamate)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 1504;
            tests.push(test);
        } 
        if (tox.skeletal.methocarbamol)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 1505;
            tests.push(test);
        } 
        if (tox.skeletal.tizanidine)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 1506;
            tests.push(test);
        } 
    }
    if (tox.stimulants.full)
    {
        var test = new PhysicianPreferenceTestModel();
        test.labTestId = 1600;
        tests.push(test);
    } 
    else{
        if (tox.stimulants.benzylone)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 1601;
            tests.push(test);
        } 
        if (tox.stimulants.eutylone)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 1602;
            tests.push(test);
        } 
        if (tox.stimulants.mda)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 1603;
            tests.push(test);
        } 
        if (tox.stimulants.methylphenidate)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 1604;
            tests.push(test);
        } 
        if (tox.stimulants.phentermine)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 1605;
            tests.push(test);
        } 
    }
    if (tox.thcSource){
        var test = new PhysicianPreferenceTestModel();
        test.labTestId = 1700;
        tests.push(test);
    } 

    return(tests);
  }

  loadToxOralFromTest( oral: ToxOralModel, specimenId: number){
    var tests = new Array<LabOrderTestItemModel>();
    //  Put test into list
    if (oral.fullConfirmation)
    {
        var test = new LabOrderTestItemModel();
        test.labTestId = 5000;
        test.labOrderSpecimenId = specimenId;
        tests.push(test);
    }
    else{
        if (oral.illicit.full)
        {
            var test = new LabOrderTestItemModel();
            test.labTestId = 5100;
            test.labOrderSpecimenId = specimenId;
            tests.push(test);
        }
        else{
            if (oral.illicit.mam6)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 5101;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
            if (oral.illicit.amphetamine)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 5102;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
            if (oral.illicit.methamphetamine)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 5103;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
            if (oral.illicit.benzoylecgonine)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 5104;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
            if (oral.illicit.mdma)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 5105;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
            if (oral.illicit.pcp)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 5106;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
            if (oral.illicit.thc)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 5107;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
        }
        if (oral.sedative.full)
        {
            var test = new LabOrderTestItemModel();
            test.labTestId = 5200;
            test.labOrderSpecimenId = specimenId;
            tests.push(test);
        }
        else{
            if (oral.sedative.zolpidem)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 5201;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
            if (oral.sedative.butalbital)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 5202;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
        }
        if (oral.benzodiazepines.full)
        {
            var test = new LabOrderTestItemModel();
            test.labTestId = 5300;
            test.labOrderSpecimenId = specimenId;
            tests.push(test);
        }
        else{
            if (oral.benzodiazepines.alprazolam)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 5301;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
            if (oral.benzodiazepines.diazepam)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 5302;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
            if (oral.benzodiazepines.clonazepam)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 5303;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
            if (oral.benzodiazepines.aminoclonazepam)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 5304;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
            if (oral.benzodiazepines.nordiazepam)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 5305;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
            if (oral.benzodiazepines.lorazepam)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 5306;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
            if (oral.benzodiazepines.oxazepam)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 5307;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
            if (oral.benzodiazepines.temazepam)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 5308;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
        }
        if (oral.muscle.full)
        {
            var test = new LabOrderTestItemModel();
            test.labTestId = 5400;
            test.labOrderSpecimenId = specimenId;
            tests.push(test);
        }
        else{
            if (oral.muscle.baclofen)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 5401;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
            if (oral.muscle.carisoprodol)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 5402;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
            if (oral.muscle.cyclobenzaprine)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 5403;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
            if (oral.muscle.meprobamate)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 5404;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
            if (oral.muscle.methocarbamol)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 5405;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
        }
        if (oral.antipsychotics.full)
        {
            var test = new LabOrderTestItemModel();
            test.labTestId = 5500;
            test.labOrderSpecimenId = specimenId;
            tests.push(test);
        }
        else{
            if (oral.antipsychotics.aripiprazole)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 5501;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
            if (oral.antipsychotics.quetiapine)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 5502;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
            if (oral.antipsychotics.risperidone)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 5503;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
            if (oral.antipsychotics.ziprasidone)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 5504;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
        }
        if (oral.antidepressants.full)
        {
            var test = new LabOrderTestItemModel();
            test.labTestId = 5600;
            test.labOrderSpecimenId = specimenId;
            tests.push(test);
        }
        else{
            if (oral.antidepressants.amitriptyline)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 5601;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
            if (oral.antidepressants.citalopram)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 5602;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
            if (oral.antidepressants.fluoxetine)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 5603;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
            if (oral.antidepressants.nortriptyline)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 5604;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
            if (oral.antidepressants.paroxetine)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 5605;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
            if (oral.antidepressants.sertraline)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 5606;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
            if (oral.antidepressants.venlafaxine)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 5607;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
            if (oral.antidepressants.desmethylvenlafaxine)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 5608;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
            if (oral.antidepressants.mirtazapine)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 5609;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
            if (oral.antidepressants.trazodone)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 5610;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
        }
        if (oral.stimulants.full)
        {
            var test = new LabOrderTestItemModel();
            test.labTestId = 5700;
            test.labOrderSpecimenId = specimenId;
            tests.push(test);
        }
        else{
            if (oral.stimulants.methylphenidate)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 5701;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
            if (oral.stimulants.ritalinicAcid)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 5702;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
            if (oral.stimulants.mda)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 5703;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
            if (oral.stimulants.phentermine)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 5704;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
        }
        if (oral.kratom.full)
        {
            var test = new LabOrderTestItemModel();
            test.labTestId = 5800;
            test.labOrderSpecimenId = specimenId;
            tests.push(test);
        }
        else{
            if (oral.kratom.mitragynine)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 5801;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
        }
        if (oral.nicotine.full)
        {
            var test = new LabOrderTestItemModel();
            test.labTestId = 5900;
            test.labOrderSpecimenId = specimenId;
            tests.push(test);
        }
        else{
            if (oral.nicotine.cotinine)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 5901;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
        }
        if (oral.opioidAntagonists.full)
        {
            var test = new LabOrderTestItemModel();
            test.labTestId = 6000;
            test.labOrderSpecimenId = specimenId;
            tests.push(test);
        }
        else{
            if (oral.opioidAntagonists.naloxone)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 6001;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
            if (oral.opioidAntagonists.naltrexone)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 6002;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
        }
        if (oral.gabapentinoids.full)
        {
            var test = new LabOrderTestItemModel();
            test.labTestId = 6100;
            test.labOrderSpecimenId = specimenId;
            tests.push(test);
        }
        else{
            if (oral.gabapentinoids.gabapentin)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 6101;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
            if (oral.gabapentinoids.pregabalin)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 6102;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
        }
        if (oral.dissociative.full)
        {
            var test = new LabOrderTestItemModel();
            test.labTestId = 6200;
            test.labOrderSpecimenId = specimenId;
            tests.push(test);
        }
        else{
            if (oral.dissociative.ketamine)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 6201;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
            if (oral.dissociative.norketamine)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 6202;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
        }
        if (oral.opioidAgonists.full)
        {
            var test = new LabOrderTestItemModel();
            test.labTestId = 6300;
            test.labOrderSpecimenId = specimenId;
            tests.push(test);
        }
        else{
            if (oral.opioidAgonists.buprenorphine)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 6301;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
            if (oral.opioidAgonists.norbuprenorphine)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 6302;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
            if (oral.opioidAgonists.codeine)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 6303;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
            if (oral.opioidAgonists.dextromethorphan)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 6304;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
            if (oral.opioidAgonists.hydrocodone)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 6305;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
            // if (oral.opioidAgonists.norhydrocodone)
            // {
            //     var test = new LabOrderTestItemModel();
            //     test.labTestId = 6306;
            //     test.labOrderSpecimenId = specimenId;
            //     tests.push(test);
            //}
            if (oral.opioidAgonists.hydromorphone)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 6307;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
            if (oral.opioidAgonists.fentanyl)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 6308;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
            if (oral.opioidAgonists.norfentanyl)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 6309;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
            if (oral.opioidAgonists.methadone)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 6310;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
            if (oral.opioidAgonists.eddp)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 6311;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
            if (oral.opioidAgonists.morphine)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 6312;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
            if (oral.opioidAgonists.oxycodone)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 6313;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
            // if (oral.opioidAgonists.noroxycodone)
            // {
            //     var test = new LabOrderTestItemModel();
            //     test.labTestId = 6314;
            //     test.labOrderSpecimenId = specimenId;
            //     tests.push(test);
            // }
            if (oral.opioidAgonists.oxymorphone)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 6315;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
            if (oral.opioidAgonists.tapentadol)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 6316;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
            if (oral.opioidAgonists.tramadol)
            {
                var test = new LabOrderTestItemModel();
                test.labTestId = 6317;
                test.labOrderSpecimenId = specimenId;
                tests.push(test);
            }
        }

    }
    return(tests);
  }
  
  loadToxOralFromTestPP(oral: ToxOralModel){
    // Put tests into list
    var tests = new Array<PhysicianPreferenceTestModel>();

    console.log("Oral",oral);

    if (oral.illicit.full)
    {
        var test = new PhysicianPreferenceTestModel();
        test.labTestId = 5100;
        tests.push(test);
    }
    else{
        if (oral.illicit.mam6)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 5101;
            tests.push(test);
        }
        if (oral.illicit.amphetamine)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 5102;
            tests.push(test);
        }
        if (oral.illicit.methamphetamine)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 5103;
            tests.push(test);
        }
        if (oral.illicit.benzoylecgonine)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 5104;
            tests.push(test);
        }
        if (oral.illicit.mdma)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 5105;
            tests.push(test);
        }
        if (oral.illicit.pcp)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 5106;
            tests.push(test);
        }
        if (oral.illicit.thc)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 5107;
            tests.push(test);
        }
    }
    if (oral.sedative.full)
    {
        var test = new PhysicianPreferenceTestModel();
        test.labTestId = 5200;
        tests.push(test);
    }
    else{
        if (oral.sedative.zolpidem)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 5201;
            tests.push(test);
        }
        if (oral.sedative.butalbital)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 5202;
            tests.push(test);
        }
    }
    if (oral.benzodiazepines.full)
    {
        var test = new PhysicianPreferenceTestModel();
        test.labTestId = 5300;
        tests.push(test);
    }
    else{
        if (oral.benzodiazepines.alprazolam)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 5301;
            tests.push(test);
        }
        if (oral.benzodiazepines.diazepam)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 5302;
            tests.push(test);
        }
        if (oral.benzodiazepines.clonazepam)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 5303;
            tests.push(test);
        }
        if (oral.benzodiazepines.aminoclonazepam)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 5304;
            tests.push(test);
        }
        if (oral.benzodiazepines.nordiazepam)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 5305;
            tests.push(test);
        }
        if (oral.benzodiazepines.lorazepam)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 5306;
            tests.push(test);
        }
        if (oral.benzodiazepines.oxazepam)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 5307;
            tests.push(test);
        }
        if (oral.benzodiazepines.temazepam)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 5308;
            tests.push(test);
        }
    }
    if (oral.muscle.full)
    {
        var test = new PhysicianPreferenceTestModel();
        test.labTestId = 5400;
        tests.push(test);
    }
    else{
        if (oral.muscle.baclofen)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 5401;
            tests.push(test);
        }
        if (oral.muscle.carisoprodol)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 5402;
            tests.push(test);
        }
        if (oral.muscle.cyclobenzaprine)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 5403;
            tests.push(test);
        }
        if (oral.muscle.meprobamate)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 5404;
            tests.push(test);
        }
        if (oral.muscle.methocarbamol)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 5405;
            tests.push(test);
        }
    }
    if (oral.antipsychotics.full)
    {
        var test = new PhysicianPreferenceTestModel();
        test.labTestId = 5500;
        tests.push(test);
    }
    else{
        if (oral.antipsychotics.aripiprazole)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 5501;
            tests.push(test);
        }
        if (oral.antipsychotics.quetiapine)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 5502;
            tests.push(test);
        }
        if (oral.antipsychotics.risperidone)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 5503;
            tests.push(test);
        }
        if (oral.antipsychotics.ziprasidone)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 5504;
            tests.push(test);
        }
    }
    if (oral.antidepressants.full)
    {
        var test = new PhysicianPreferenceTestModel();
        test.labTestId = 5600;
        tests.push(test);
    }
    else{
        if (oral.antidepressants.amitriptyline)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 5601;
            tests.push(test);
        }
        if (oral.antidepressants.citalopram)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 5602;
            tests.push(test);
        }
        if (oral.antidepressants.fluoxetine)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 5603;
            tests.push(test);
        }
        if (oral.antidepressants.nortriptyline)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 5604;
            tests.push(test);
        }
        if (oral.antidepressants.paroxetine)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 5605;
            tests.push(test);
        }
        if (oral.antidepressants.sertraline)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 5606;
            tests.push(test);
        }
        if (oral.antidepressants.venlafaxine)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 5607;
            tests.push(test);
        }
        if (oral.antidepressants.desmethylvenlafaxine)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 5608;
            tests.push(test);
        }
        if (oral.antidepressants.mirtazapine)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 5609;
            tests.push(test);
        }
        if (oral.antidepressants.trazodone)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 5610;
            tests.push(test);
        }
    }
    if (oral.stimulants.full)
    {
        var test = new PhysicianPreferenceTestModel();
        test.labTestId = 5700;
        tests.push(test);
    }
    else{
        if (oral.stimulants.methylphenidate)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 5701;
            tests.push(test);
        }
        if (oral.stimulants.ritalinicAcid)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 5702;
            tests.push(test);
        }
        if (oral.stimulants.mda)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 5703;
            tests.push(test);
        }
        if (oral.stimulants.phentermine)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 5704;
            tests.push(test);
        }
    }
    if (oral.kratom.full)
    {
        var test = new PhysicianPreferenceTestModel();
        test.labTestId = 5800;
        tests.push(test);
    }
    else{
        if (oral.kratom.mitragynine)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 5801;
            tests.push(test);
        }
    }
    if (oral.nicotine.full)
    {
        var test = new PhysicianPreferenceTestModel();
        test.labTestId = 5900;
        tests.push(test);
    }
    else{
        if (oral.nicotine.cotinine)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 5901;
            tests.push(test);
        }
    }
    if (oral.opioidAntagonists.full)
    {
        var test = new PhysicianPreferenceTestModel();
        test.labTestId = 6000;
        tests.push(test);
    }
    else{
        if (oral.opioidAntagonists.naloxone)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 6001;
            tests.push(test);
        }
        if (oral.opioidAntagonists.naltrexone)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 6002;
            tests.push(test);
        }
    }
    if (oral.gabapentinoids.full)
    {
        var test = new PhysicianPreferenceTestModel();
        test.labTestId = 6100;
        tests.push(test);
    }
    else{
        if (oral.gabapentinoids.gabapentin)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 6101;
            tests.push(test);
        }
        if (oral.gabapentinoids.pregabalin)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 6102;
            tests.push(test);
        }
    }
    if (oral.dissociative.full)
    {
        var test = new PhysicianPreferenceTestModel();
        test.labTestId = 6200;
        tests.push(test);
    }
    else{
        if (oral.dissociative.ketamine)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 6201;
            tests.push(test);
        }
        if (oral.dissociative.norketamine)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 6202;
            tests.push(test);
        }
    }
    if (oral.opioidAgonists.full)
    {
        var test = new PhysicianPreferenceTestModel();
        test.labTestId = 6300;
        tests.push(test);
    }
    else{
        if (oral.opioidAgonists.buprenorphine)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 6301;
            tests.push(test);
        }
        if (oral.opioidAgonists.norbuprenorphine)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 6302;
            tests.push(test);
        }
        if (oral.opioidAgonists.codeine)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 6303;
            tests.push(test);
        }
        if (oral.opioidAgonists.dextromethorphan)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 6304;
            tests.push(test);
        }
        if (oral.opioidAgonists.hydrocodone)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 6305;
            tests.push(test);
        }
        // if (oral.opioidAgonists.norhydrocodone)
        // {
        //     var test = new PhysicianPreferenceTestModel();
        //     test.labTestId = 6306;
        //     tests.push(test);
        // }
        if (oral.opioidAgonists.hydromorphone)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 6307;
            tests.push(test);
        }
        if (oral.opioidAgonists.fentanyl)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 6308;
            tests.push(test);
        }
        if (oral.opioidAgonists.norfentanyl)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 6309;
            tests.push(test);
        }
        if (oral.opioidAgonists.methadone)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 6310;
            tests.push(test);
        }
        if (oral.opioidAgonists.eddp)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 6311;
            tests.push(test);
        }
        if (oral.opioidAgonists.morphine)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 6312;
            tests.push(test);
        }
        if (oral.opioidAgonists.oxycodone)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 6313;
            tests.push(test);
        }
        // if (oral.opioidAgonists.noroxycodone)
        // {
        //     var test = new PhysicianPreferenceTestModel();
        //     test.labTestId = 6314;
        //     tests.push(test);
        // }
        if (oral.opioidAgonists.oxymorphone)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 6315;
            tests.push(test);
        }
        if (oral.opioidAgonists.tapentadol)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 6316;
            tests.push(test);
        }
        if (oral.opioidAgonists.tramadol)
        {
            var test = new PhysicianPreferenceTestModel();
            test.labTestId = 6317;
            tests.push(test);
        }
    }
     return(tests);
  }

  // ------------------------------------------------------------------------------------------------------------------
  // Save Request Pdf to Server
  // ------------------------------------------------------------------------------------------------------------------
  saveLabOrderRequestPdf(requestPdf: LabOrderPdfModel)
  {
      var validation = new ValidationModel();
      validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
      validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
      validation.token = sessionStorage.getItem('token');
      validation.tranSourceId = this.tranSourceId;
      validation.version = this.version;

      requestPdf.validation = validation;

      requestPdf.specimenId = Number(requestPdf.specimenId);

      var url = this.apiRoot + 'api/LabOrder/SaveRequestPdf'
      var headers = new HttpHeaders();
      headers = headers.set("Content-Type", "application/json; charset=utf-8");

      return this.httpClient.post(url, requestPdf, { headers: headers })
          .pipe(
              map((data: GenericResponseModel) => {
                console.log("Returned Data", data);
                  return data;
              }), catchError(error => {
                  console.log("Error", error)
                  return throwError('Something went wrong!');
              })
            )
  }

  // ------------------------------------------------------------------------------------------------------------------
  // Get Request Pdf from Server
  // ------------------------------------------------------------------------------------------------------------------
  getLabOrderRequestPdf(specimenId: number )
  {
    console.log("SpecimenId", specimenId);
      var validation = new ValidationModel();
      validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
      validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
      validation.token = sessionStorage.getItem('token');
      validation.tranSourceId = this.tranSourceId;
      validation.version = this.version;

      var url = this.apiRoot + 'api/LabOrder/GetRequestPdf' + '?validation=' + JSON.stringify(validation) + '&SpecimenId=' + specimenId + '&b64=true';

      return this.httpClient.get(url)
          .pipe(
              map((data: LabOrderPdfModel) => { 
                  return data;
              }), catchError(error => {
                  return throwError('Something went wrong!');
              })
      )
  }

  // ------------------------------------------------------------------------------------------------------------------
  // Get Result Pdf from Server
  // ------------------------------------------------------------------------------------------------------------------
  getLabOrderResultPdf(specimenId: number )
  {
    console.log("SpecimenId", specimenId);
      var validation = new ValidationModel();
      validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
      validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
      validation.token = sessionStorage.getItem('token');
      validation.tranSourceId = this.tranSourceId;
      validation.version = this.version;

      var url = this.apiRoot + 'api/LabOrder/GetResultPdf' + '?validation=' + JSON.stringify(validation) + '&SpecimenId=' + specimenId + '&b64=true';

      return this.httpClient.get(url)
          .pipe(
              map((data: LabOrderPdfModel) => { 
                  return data;
              }), catchError(error => {
                  return throwError('Something went wrong!');
              })
      )
  }

    // ------------------------------------------------------------------------------------------------------------------
  // Get the user signature form the server
  // ------------------------------------------------------------------------------------------------------------------
  getPatientSignature( patientId: number, laborderId: number ) {

      var validation = new ValidationModel();
      validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
      validation.userId_Login =  parseInt(sessionStorage.getItem('userId_Login'));
      validation.token = sessionStorage.getItem('token');
      validation.tranSourceId = this.tranSourceId;
      validation.version = this.version;

      var url =  this.apiRoot + 'api/LabOrder/GetPatientSignature' + '?validation=' + JSON.stringify(validation) + '&LabOrderId=' + laborderId + "&PatientId=" + patientId + "&b64=true";
    
      return this.httpClient.get(url)
          .pipe(
              map((data: UserSignatureModel) => {
                
                return data;
              }), catchError( error => {
                return throwError( 'Something went wrong!' );
              })
          )
      }
  
  // ------------------------------------------------------------------------------------------------------------------
  // Audit - retrun a list of LabOrders that meet the search criteria
  // ------------------------------------------------------------------------------------------------------------------
  getAuditList(labId: number, dateType: number, startDate: string, endDate: string, labTypeId: number, includeProcessed: boolean, customerId: number ) {

    var validation = new ValidationModel();
    validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
    validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
    validation.token = sessionStorage.getItem('token');
    validation.tranSourceId = this.tranSourceId;
    validation.version = this.version;
    var searchCriteria = new LabOrderAuditSearchModel();
    searchCriteria.labId = labId;
    searchCriteria.dateType = dateType;
    searchCriteria.startDate = startDate;
    searchCriteria.endDate = endDate;
    searchCriteria.includeProcessed = includeProcessed;
    searchCriteria.labTypeId = labTypeId;
    searchCriteria.customerId = customerId;


    var url = this.apiRoot + 'api/LabOrder/GetAuditList' + '?validation=' + JSON.stringify(validation) + '&searchCriteria=' + JSON.stringify(searchCriteria);

    return this.httpClient.get(url)
        .pipe(
             map((data: LabOrderAuditListModel) => {
          return data;
      }), catchError(error => {
          return throwError('Something went wrong!'); 
      })
    )
  } 
  

  // ------------------------------------------------------------------------------------------------------------------
  // Reviewed - save audited item
  // ------------------------------------------------------------------------------------------------------------------
  reviewed(labReview: LabOrderReviewModel ) {
    var validation = new ValidationModel();
    validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
    validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
    validation.token = sessionStorage.getItem('token');
    validation.tranSourceId = this.tranSourceId;
    validation.version = this.version;

    labReview.validation = validation;
    labReview.userId_Reviewed = parseInt(sessionStorage.getItem('userId_Login'));
    labReview.auditSrdTypeId = Number(labReview.auditSrdTypeId);
    labReview.auditIncidentTypeId = Number(labReview.auditIncidentTypeId);
    labReview.auditRejectionTypeId = Number(labReview.auditRejectionTypeId);
    labReview.shippingMethodId = Number(labReview.shippingMethodId);

    console.log ("LabReview",labReview);

    var url = this.apiRoot + 'api/LabOrder/ReviewedLabOrder'
    var headers = new HttpHeaders();
    headers = headers.set("Content-Type", "application/json; charset=utf-8");

    return this.httpClient.post(url, labReview, { headers: headers })
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

  
  // ------------------------------------------------------------------------------------------------------------------
  // Get lab order specimen insurance
  // ------------------------------------------------------------------------------------------------------------------
  getLabOrderSpecimenInsurance(specimenId: number )
  {
      var validation = new ValidationModel();
      validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
      validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
      validation.token = sessionStorage.getItem('token');
      validation.tranSourceId = this.tranSourceId;
      validation.version = this.version;

      var url = this.apiRoot + 'api/LabOrder/GetLabOrderSpecimenInsurance' + '?validation=' + JSON.stringify(validation) + '&labOrderSpecimenId=' + specimenId;

      return this.httpClient.get(url)
          .pipe(
            
              map((data: LabOrderSpecimenInsuranceModel) => { 
                  return data;
              }), catchError(error => {
                  return throwError('Something went wrong!');
              })
      )
  }

  // ------------------------------------------------------------------------------------------------------------------
  // Check if order already exist
  // ------------------------------------------------------------------------------------------------------------------
  checkForDuplicate(patientId: number, labTypeId: number, collectionDate: string ) {
    var validation = new ValidationModel();
    validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
    validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
    validation.token = sessionStorage.getItem('token');
    validation.tranSourceId = this.tranSourceId;
    validation.version = this.version;
    var searchCriteria = new LabOrderSearchModel();
    searchCriteria.customerId = 0;
    searchCriteria.locationId = 0;
    searchCriteria.labStatusId = 0;
    searchCriteria.physicianId = 0;
    searchCriteria.patientId = patientId;
    searchCriteria.patientName = "";
    searchCriteria.specimenBarcode = "";
    searchCriteria.labTypeId = labTypeId;
    searchCriteria.collectionDateStart = collectionDate;
    searchCriteria.collectionDateEnd = collectionDate;

    var url = this.apiRoot + 'api/LabOrder/CheckForExisting' + '?validation=' + JSON.stringify(validation) + '&searchCriteria=' + JSON.stringify(searchCriteria);

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
  // Get lab order specimen status change info for passed in specimen barcode
  // ------------------------------------------------------------------------------------------------------------------
  specimenStatusChange(specimenBarcode: string )
  {
      var validation = new ValidationModel();
      validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
      validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
      validation.token = sessionStorage.getItem('token');
      validation.tranSourceId = this.tranSourceId;
      validation.version = this.version;

      var url = this.apiRoot + 'api/LabOrder/SpecimenStatusChange' + '?validation=' + JSON.stringify(validation) + '&specimenBarcode=' + specimenBarcode;

      return this.httpClient.get(url)
          .pipe(
              map((data: LabOrderSpecimenStatusModel) => { 
                  return data;
              }), catchError(error => {
                  return throwError('Something went wrong!');
              })
      )
  }

  // ------------------------------------------------------------------------------------------------------------------
  // Release Demographics Hold
  // ------------------------------------------------------------------------------------------------------------------
  releaseDemographicsHold( labOrderId: number, note: string)
  {
    var labStatus = new LabOrderStatusModel();
    var validation = new ValidationModel();
    validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
    validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
    validation.token = sessionStorage.getItem('token');
    validation.tranSourceId = this.tranSourceId;
    validation.version = this.version;

    labStatus.validation = validation;
    labStatus.userId_Updated = parseInt(sessionStorage.getItem('userId_Login'));
    labStatus.labOrderId = labOrderId;
    labStatus.labOrderSpecimenId =0;
    labStatus.labStatusId = 0;
    labStatus.comment = note;

    labStatus.mismatchDate = false;
    labStatus.mismatchDOB = false;
    labStatus.mismatchName = false;
    labStatus.mismatchPregnant = false;
    labStatus.accessioningNote =  '';
    labStatus.labId = 0;
  
    var url = this.apiRoot + 'api/LabOrder/ReleaseDemographicsHold'
    var headers = new HttpHeaders();
    headers = headers.set("Content-Type", "application/json; charset=utf-8");

    return this.httpClient.post(url, labStatus, { headers: headers })
        .pipe(
            map((data: GenericResponseModel) => {
                console.log("Datar",data);
                return data;
            }), catchError(error => {
                console.log("Error", error)
                return throwError('Something went wrong!');
            })
        )
  }

  // ------------------------------------------------------------------------------------------------------------------
  // Manifest Search - retrun a list of LabOrders that meet the search criteria
  // ------------------------------------------------------------------------------------------------------------------
  manifestSearch( labTypeId: number, collectionDateStart: string ) {

    var validation = new ValidationModel();
    validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
    validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
    validation.token = sessionStorage.getItem('token');
    validation.tranSourceId = this.tranSourceId;
    validation.version = this.version;
    var searchCriteria = new LabOrderSearchModel();
    searchCriteria.customerId = 0;
    searchCriteria.locationId = 0;
    searchCriteria.labStatusId = 0;
    searchCriteria.physicianId = 0;
    searchCriteria.patientId = 0;
    searchCriteria.patientName = "";
    searchCriteria.specimenBarcode = "";
    searchCriteria.labTypeId = labTypeId;
    searchCriteria.collectionDateStart = collectionDateStart;
    searchCriteria.collectionDateEnd = "";

    var url = this.apiRoot + 'api/LabOrder/GetLabOrderManifestList' + '?validation=' + JSON.stringify(validation) + '&searchCriteria=' + JSON.stringify(searchCriteria);
    return this.httpClient.get(url)
        .pipe(
             map((data: LabOrderListModel) => {
          return data;
      }), catchError(error => {
          return throwError('Something went wrong!'); 
          console.log("Error");
      })
    )
  }

  // ------------------------------------------------------------------------------------------------------------------
  // Accessioned Report
  // ------------------------------------------------------------------------------------------------------------------
  accessionedReport(userId: number, dateStart: string, dateEnd:string ) {

    var validation = new ValidationModel();
    validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
    validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
    validation.token = sessionStorage.getItem('token');
    validation.tranSourceId = this.tranSourceId;
    validation.version = this.version;
    var searchCriteria = new LabOrderSearchModel();
    searchCriteria.customerId = 0;
    searchCriteria.locationId = 0;
    searchCriteria.labStatusId = 0;
    searchCriteria.physicianId = 0;
    searchCriteria.patientId = 0;
    searchCriteria.patientName = '';
    searchCriteria.specimenBarcode = '';
    searchCriteria.labTypeId = 0;
    searchCriteria.userId_Accessioner = userId;
    searchCriteria.collectionDateStart = dateStart;
    searchCriteria.collectionDateEnd = dateEnd;

    var url = this.apiRoot + 'api/LabOrder/AccessionedReport' + '?validation=' + JSON.stringify(validation) + '&searchCriteria=' + JSON.stringify(searchCriteria);
    return this.httpClient.get(url)
        .pipe(
             map((data: AccessionedReportModel) => {
          return data;
      }), catchError(error => {
          return throwError('Something went wrong!'); 
          console.log("Error");
      })
    )

  }

  // ------------------------------------------------------------------------------------------------------------------
  // Sales Report
  // ------------------------------------------------------------------------------------------------------------------
  salesReport(userId: number, dateRangeType: string ) {

    var validation = new ValidationModel();
    validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
    validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
    validation.token = sessionStorage.getItem('token');
    validation.tranSourceId = this.tranSourceId;
    validation.version = this.version;
    var searchCriteria = new LabOrderSearchModel();
    searchCriteria.customerId = 0;
    searchCriteria.locationId = 0;
    searchCriteria.labStatusId = 0;
    searchCriteria.physicianId = 0;
    searchCriteria.patientId = 0;
    searchCriteria.patientName = '';
    searchCriteria.specimenBarcode = '';
    searchCriteria.labTypeId = 0;
    searchCriteria.userId_Accessioner = userId;
    searchCriteria.collectionDateStart = '';
    searchCriteria.collectionDateEnd = '';
    searchCriteria.option = dateRangeType;

    var url = this.apiRoot + 'api/LabOrder/SalesReport' + '?validation=' + JSON.stringify(validation) + '&searchCriteria=' + JSON.stringify(searchCriteria);
    return this.httpClient.get(url)
        .pipe(
             map((data: SalesReportModel) => {
          return data;
      }), catchError(error => {
          return throwError('Something went wrong!'); 
          console.log("Error");
      })
    )

  }

  // ------------------------------------------------------------------------------------------------------------------
  // Sales Report
  // ------------------------------------------------------------------------------------------------------------------
  salesDailyReport(userId: number, reportDate: string ) {

    var validation = new ValidationModel();
    validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
    validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
    validation.token = sessionStorage.getItem('token');
    validation.tranSourceId = this.tranSourceId;
    validation.version = this.version;
    var searchCriteria = new LabOrderSearchModel();
    searchCriteria.customerId = 0;
    searchCriteria.locationId = 0;
    searchCriteria.labStatusId = 0;
    searchCriteria.physicianId = 0;
    searchCriteria.patientId = 0;
    searchCriteria.patientName = '';
    searchCriteria.specimenBarcode = '';
    searchCriteria.labTypeId = 0;
    searchCriteria.userId_Accessioner = userId;
    searchCriteria.collectionDateStart = reportDate;
    searchCriteria.collectionDateEnd = '';

    var url = this.apiRoot + 'api/LabOrder/SalesDailyReport' + '?validation=' + JSON.stringify(validation) + '&searchCriteria=' + JSON.stringify(searchCriteria);
    return this.httpClient.get(url)
        .pipe(
             map((data: SalesReportModel) => {
          return data;
      }), catchError(error => {
          return throwError('Something went wrong!'); 
          console.log("Error");
      })
    )

  }

  // ------------------------------------------------------------------------------------------------------------------
  // CET Issue Report
  // ------------------------------------------------------------------------------------------------------------------
  cetIssueReport() {

    var validation = new ValidationModel();
    validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
    validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
    validation.token = sessionStorage.getItem('token');
    validation.tranSourceId = this.tranSourceId;
    validation.version = this.version;

    var url = this.apiRoot + 'api/LabOrder/CETIssueReport' + '?validation=' + JSON.stringify(validation);
    console.log("URL",url)
    return this.httpClient.get(url)
        .pipe(
             map((data: CETIssueReportModel) => {
          return data;
      }), catchError(error => {
        console.log("Error",error);
          return throwError('Something went wrong!'); 
          
      })
    )

  }

  // ------------------------------------------------------------------------------------------------------------------
  // CET Reject Report
  // ------------------------------------------------------------------------------------------------------------------
  cetRejectReport() {

    var validation = new ValidationModel();
    validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
    validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
    validation.token = sessionStorage.getItem('token');
    validation.tranSourceId = this.tranSourceId;
    validation.version = this.version;

    var url = this.apiRoot + 'api/LabOrder/CETRejectReport' + '?validation=' + JSON.stringify(validation);
    return this.httpClient.get(url)
        .pipe(
             map((data: CETRejectReportModel) => {
          return data;
      }), catchError(error => {
          return throwError('Something went wrong!'); 
          console.log("Error");
      })
    )

  }
}
