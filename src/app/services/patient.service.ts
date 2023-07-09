// Service Name  : patient.service.ts
// Date Created  : 8/5/2022
// Written By    : Stephen Farkas
// Description   : Interface to patient api
// MM/DD/YYYY XXX Description
// 08/17/2022 SJF Added getPatientEligibilityList, getPatientEligibility
// 08/25/2022 SJF Added getPatientMedicationList, getPatientIcd10List
// 08/29/2022 SJF Added getPatientAllergyList
// 09/16/2022 SJF Added getAddress
// 09/20/2022 SJF Added getPatientAttachmentList
// 02/22/2023 SJF Added getForPO
// 03/24/2023 SJF Added getPatientsMissingInfo
// 04/10/2023 SJF Added deletedPatientAttachment
// 06/18/2023 SJF Added searchForParole
// 06/19/2023 SJF Added getPatientParoleList & savePatientParole
//------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Config } from '../models/Config';
import {formatDate} from '@angular/common';

import { from, Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

// Import data models used by the service
import { PatientModel, PatientSearchModel, PatientListModel, PatientMedicationModel, PatientIcd10Model, PatientAllergyModel, PatientForLabOrderModel, PatientMissingListModel} from '../models/PatientModel';
import { PatientAttachmentModel, PatientAttachmentSearchModel, PatientAttachmentListModel} from '../models/PatientAttachmentModel';
import { PatientNoteModel, } from '../models/PatientNoteModel';
import { PatientInsuranceModel, PatientInsuranceListModel } from '../models/PatientInsuranceModel';
import { PatientEligibilityModel, PatientEligibilitySearchModel } from '../models/PatientEligibilityModel';
import { MedicationListModel } from '../models/MedicationModel';
import { Icd10ListModel } from '../models/Icd10Model';
import { AllergyListModel } from '../models/AllergyModel';
import { AddressModel } from '../models/AddressModel';
import { PatientParoleModel, PatientParoleListModel, PatientParoleSearchModel } from '../models/PatientParoleModel';

import { ValidationModel } from '../models/ValidationModel';
import { GenericResponseModel} from '../models/GenericResponseModel';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
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
  // Search - retrun a list of Patient that meet the search criteria
  // ------------------------------------------------------------------------------------------------------------------
  search(customerId: number, locationId: number, firstName: string, lastName: string, DOB: string, genderId: number, medicalRecordId: string, active: boolean, priority: boolean, isEmployee: boolean, isPatient: boolean ) {

    var validation = new ValidationModel();
    validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
    validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
    validation.token = sessionStorage.getItem('token');
    validation.tranSourceId = this.tranSourceId;
    validation.version = this.version;
    var searchCriteria = new PatientSearchModel();
    searchCriteria.customerId = customerId;
    searchCriteria.locationId = locationId;
    searchCriteria.firstName = firstName;
    searchCriteria.lastName = lastName;
    searchCriteria.DOB = DOB;
    searchCriteria.genderId = genderId;
    searchCriteria.medicalRecordId = medicalRecordId;
    searchCriteria.active = active;
    searchCriteria.priority = priority;
    searchCriteria.isEmployee = isEmployee;
    searchCriteria.isPatient = isPatient;

    var url = this.apiRoot + 'api/Patient/GetPatientList' + '?validation=' + JSON.stringify(validation) + '&searchCriteria=' + JSON.stringify(searchCriteria);

    return this.httpClient.get(url)
        .pipe(
            map((data: PatientListModel) => {
        return data;
            }), catchError(error => {
                return throwError('Something went wrong!'); 
            })
        )
  }

  // ------------------------------------------------------------------------------------------------------------------
  // Get - return the patient based on the id passed in
  // ------------------------------------------------------------------------------------------------------------------
  get(patientId: number )
  {
      var validation = new ValidationModel();
      validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
      validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
      validation.token = sessionStorage.getItem('token');
      validation.tranSourceId = this.tranSourceId;
      validation.version = this.version;

      var url = this.apiRoot + 'api/Patient/GetPatient' + '?validation=' + JSON.stringify(validation) + '&patientId=' + patientId;

      return this.httpClient.get(url)
          .pipe(
              map((data: PatientModel) => { 
                  return data;
              }), catchError(error => {
                  return throwError('Something went wrong!');
              })
      )
  }

  // ------------------------------------------------------------------------------------------------------------------
  // Get - return the patient based on the id passed in
  // ------------------------------------------------------------------------------------------------------------------
  getForLabOrder(patientId: number )
  {
      var validation = new ValidationModel();
      validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
      validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
      validation.token = sessionStorage.getItem('token');
      validation.tranSourceId = this.tranSourceId;
      validation.version = this.version;

      var url = this.apiRoot + 'api/Patient/GetForLabOrder' + '?validation=' + JSON.stringify(validation) + '&patientId=' + patientId;

      return this.httpClient.get(url)
          .pipe(
              map((data: PatientForLabOrderModel) => { 
                  return data;
              }), catchError(error => {
                  return throwError('Something went wrong!');
              })
      )
  }

  // ------------------------------------------------------------------------------------------------------------------
  // Save - Write the updated patient data to the server
  // ------------------------------------------------------------------------------------------------------------------
  save(patient: PatientModel)
  {

      var validation = new ValidationModel();
      validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
      validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
      validation.token = sessionStorage.getItem('token');
      validation.tranSourceId = this.tranSourceId;
      validation.version = this.version;

      patient.validation = validation;
      patient.userId_Updated = parseInt(sessionStorage.getItem('userId_Login'));

      patient.customerId = Number(patient.customerId);
      patient.genderId = Number(patient.genderId);
      patient.ethnicityId = Number(patient.ethnicityId);
      patient.userId = Number(patient.userId);
      patient.billingTypeId = Number(patient.billingTypeId);
      patient.addressId = Number(patient.addressId);
      patient.userId_Updated = Number(patient.userId_Updated);

      var url = this.apiRoot + 'api/Patient/SavePatient'
      var headers = new HttpHeaders();
      headers = headers.set("Content-Type", "application/json; charset=utf-8");

      return this.httpClient.post(url, patient, { headers: headers })
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
  // Get - return the patientInsurance based on the id passed in
  // ------------------------------------------------------------------------------------------------------------------
  getPatientInsurance(patientInsuranceId: number )
  {
      var validation = new ValidationModel();
      validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
      validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
      validation.token = sessionStorage.getItem('token');
      validation.tranSourceId = this.tranSourceId;
      validation.version = this.version;

      var url = this.apiRoot + 'api/Patient/GetPatientInsurance' + '?validation=' + JSON.stringify(validation) + '&patientInsuranceId=' + patientInsuranceId;

      return this.httpClient.get(url)
          .pipe(
              map((data: PatientInsuranceModel) => { 
                  return data;
              }), catchError(error => {
                  return throwError('Something went wrong!');
              })
      )
  }

  // ------------------------------------------------------------------------------------------------------------------
  // Search - return a list of Patient Insurance
  // ------------------------------------------------------------------------------------------------------------------
  getPatientInsuranceList(patientId: number ) {

    var validation = new ValidationModel();
    validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
    validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
    validation.token = sessionStorage.getItem('token');
    validation.tranSourceId = this.tranSourceId;
    validation.version = this.version;
    
    var url = this.apiRoot + 'api/Patient/GetPatientInsuranceList' + '?validation=' + JSON.stringify(validation) + '&PatientId=' + patientId;

    return this.httpClient.get(url)
        .pipe(
            map((data: PatientInsuranceListModel) => {
        return data;
            }), catchError(error => {
                return throwError('Something went wrong!'); 
            })
        )
  }

  // ------------------------------------------------------------------------------------------------------------------
  // Save - Write the updated patientInsurance data to the server
  // ------------------------------------------------------------------------------------------------------------------
  savePatientInsurance(patientInsurance: PatientInsuranceModel)
  {

      var validation = new ValidationModel();
      validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
      validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
      validation.token = sessionStorage.getItem('token');
      validation.tranSourceId = this.tranSourceId;
      validation.version = this.version;

      patientInsurance.validation = validation;
      patientInsurance.userId_Updated = parseInt(sessionStorage.getItem('userId_Login'));

      patientInsurance.patientId = Number(patientInsurance.patientId);
      patientInsurance.insuranceId = Number(patientInsurance.insuranceId);
      patientInsurance.insuranceTypeId = Number(patientInsurance.insuranceTypeId);
      patientInsurance.sequence = Number(patientInsurance.sequence);
      patientInsurance.relationshipId = Number(patientInsurance.relationshipId);
      patientInsurance.userId_Updated = Number(patientInsurance.userId_Updated);

      var url = this.apiRoot + 'api/Patient/SavePatientInsurance'
      var headers = new HttpHeaders();
      headers = headers.set("Content-Type", "application/json; charset=utf-8");

      return this.httpClient.post(url, patientInsurance, { headers: headers })
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
  // Save - Write the updated patientInsurance PreAuthorization data to the server
  // ------------------------------------------------------------------------------------------------------------------
  savePatientPreAuth(patientInsurance: PatientInsuranceModel)
  {

      var validation = new ValidationModel();
      validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
      validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
      validation.token = sessionStorage.getItem('token');
      validation.tranSourceId = this.tranSourceId;
      validation.version = this.version;

      patientInsurance.validation = validation;
      patientInsurance.userId_Updated = parseInt(sessionStorage.getItem('userId_Login'));

      patientInsurance.patientId = Number(patientInsurance.patientId);
      patientInsurance.insuranceId = Number(patientInsurance.insuranceId);
      patientInsurance.insuranceTypeId = Number(patientInsurance.insuranceTypeId);
      patientInsurance.sequence = Number(patientInsurance.sequence);
      patientInsurance.relationshipId = Number(patientInsurance.relationshipId);
      patientInsurance.userId_Updated = Number(patientInsurance.userId_Updated);

      var url = this.apiRoot + 'api/Patient/SavePatientPreAuth'
      var headers = new HttpHeaders();
      headers = headers.set("Content-Type", "application/json; charset=utf-8");

      return this.httpClient.post(url, patientInsurance, { headers: headers })
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
  // Get - return the patientAttachment based on the id passed in
  // ------------------------------------------------------------------------------------------------------------------
  getPatientAttachment(patientAttachmentId: number )
  {
      var validation = new ValidationModel();
      validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
      validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
      validation.token = sessionStorage.getItem('token');
      validation.tranSourceId = this.tranSourceId;
      validation.version = this.version;

      var url = this.apiRoot + 'api/Patient/GetPatientAttachment' + '?validation=' + JSON.stringify(validation) + '&PatientAttachmentId=' + patientAttachmentId + '&b64=true';

      return this.httpClient.get(url)
          .pipe(
              map((data: PatientAttachmentModel) => { 
                  return data;
              }), catchError(error => {
                  return throwError('Something went wrong!');
              })
      )
  }

  // ------------------------------------------------------------------------------------------------------------------
  // Get - return a list of patient attachments based on the id passed in
  // ------------------------------------------------------------------------------------------------------------------
  getPatientAttachmentList(patientId: number )
  {
      var validation = new ValidationModel();
      validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
      validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
      validation.token = sessionStorage.getItem('token');
      validation.tranSourceId = this.tranSourceId;
      validation.version = this.version;

      var url = this.apiRoot + 'api/Patient/GetPatientAttachmentList' + '?validation=' + JSON.stringify(validation) + '&PatientId=' + patientId;

      return this.httpClient.get(url)
          .pipe(
              map((data: PatientAttachmentListModel) => { 
                  return data;
              }), catchError(error => {
                  return throwError('Something went wrong!');
              })
      )
  }

  // ------------------------------------------------------------------------------------------------------------------
  // Save - Write the updated patientAttachment data to the server
  // ------------------------------------------------------------------------------------------------------------------
  savePatientAttachment(patientAttachment: PatientAttachmentModel)
  {
      var validation = new ValidationModel();
      validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
      validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
      validation.token = sessionStorage.getItem('token');
      validation.tranSourceId = this.tranSourceId;
      validation.version = this.version;

      patientAttachment.validation = validation;
      patientAttachment.userId_Created = parseInt(sessionStorage.getItem('userId_Login'));

      const dt = new Date().toISOString();
      patientAttachment.dateCreated = formatDate(dt,'MM/dd/yyyy HH:mm:ss', 'en');

      patientAttachment.patientId = Number(patientAttachment.patientId);
      patientAttachment.attachmentTypeId = Number(patientAttachment.attachmentTypeId);

      var url = this.apiRoot + 'api/Patient/SavePatientAttachment'
      var headers = new HttpHeaders();
      headers = headers.set("Content-Type", "application/json; charset=utf-8");

      return this.httpClient.post(url, patientAttachment, { headers: headers })
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
  // Deleted - mark patientAttachment deleted based on the id passed in
  // ------------------------------------------------------------------------------------------------------------------
  deletedPatientAttachment(patientAttachmentId: number )
  {
      var validation = new ValidationModel();
      validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
      validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
      validation.token = sessionStorage.getItem('token');
      validation.tranSourceId = this.tranSourceId;
      validation.version = this.version;

      var url = this.apiRoot + 'api/Patient/DeletedPatientAttachment' + '?validation=' + JSON.stringify(validation) + '&PatientAttachmentId=' + patientAttachmentId + '&b64=true';

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
  // Get - return the patientNote based on the id passed in
  // ------------------------------------------------------------------------------------------------------------------
  getPatientNote(patientNoteId: number )
  {
      var validation = new ValidationModel();
      validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
      validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
      validation.token = sessionStorage.getItem('token');
      validation.tranSourceId = this.tranSourceId;
      validation.version = this.version;

      var url = this.apiRoot + 'api/Patient/GetPatientNote' + '?validation=' + JSON.stringify(validation) + '&patientNoteId=' + patientNoteId;

      return this.httpClient.get(url)
          .pipe(
              map((data: PatientNoteModel) => { 
                  return data;
              }), catchError(error => {
                  return throwError('Something went wrong!');
              })
      )
  }

  // ------------------------------------------------------------------------------------------------------------------
  // Save - Write the updated patientNote data to the server
  // ------------------------------------------------------------------------------------------------------------------
  savePatientNote(patientNote: PatientNoteModel)
  {

      var validation = new ValidationModel();
      validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
      validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
      validation.token = sessionStorage.getItem('token');
      validation.tranSourceId = this.tranSourceId;
      validation.version = this.version;

      patientNote.validation = validation;
      patientNote.userId_Created = parseInt(sessionStorage.getItem('userId_Login'));

      patientNote.patientId = Number(patientNote.patientId);


      var url = this.apiRoot + 'api/Patient/SavePatientNote'
      var headers = new HttpHeaders();
      headers = headers.set("Content-Type", "application/json; charset=utf-8");

      return this.httpClient.post(url, patientNote, { headers: headers })
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
  // Search - return a list of Patient Insurance
  // ------------------------------------------------------------------------------------------------------------------
  getPatientEligibilityList(patientId: number ) {

    var validation = new ValidationModel();
    validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
    validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
    validation.token = sessionStorage.getItem('token');
    validation.tranSourceId = this.tranSourceId;
    validation.version = this.version;

    var searchCriteria = new PatientEligibilitySearchModel();
    searchCriteria.patientId = patientId;
    
    var url = this.apiRoot + 'api/Patient/GetPatientEligibilityList' + '?validation=' + JSON.stringify(validation) + '&searchCriteria=' + JSON.stringify(searchCriteria);

    return this.httpClient.get(url)
        .pipe(
            map((data: PatientInsuranceListModel) => {
        return data;
            }), catchError(error => {
                return throwError('Something went wrong!'); 
            })
        )
  }

  // ------------------------------------------------------------------------------------------------------------------
  // Get - return the patientEligibility based on the id passed in
  // ------------------------------------------------------------------------------------------------------------------
  getPatientEligibility(patientEligibilityId: number )
  {
      var validation = new ValidationModel();
      validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
      validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
      validation.token = sessionStorage.getItem('token');
      validation.tranSourceId = this.tranSourceId;
      validation.version = this.version;

      var url = this.apiRoot + 'api/Patient/GetPatientEligibility' + '?validation=' + JSON.stringify(validation) + '&patientEligibilityId=' + patientEligibilityId;

      return this.httpClient.get(url)
          .pipe(
              map((data: PatientEligibilityModel) => { 
                  return data;
              }), catchError(error => {
                  return throwError('Something went wrong!');
              })
      )
  }

  // ------------------------------------------------------------------------------------------------------------------
  // Get - return the patientMedication list based on the id passed in
  // ------------------------------------------------------------------------------------------------------------------
  getPatientMedicationList( patientId: number ) {

    var validation = new ValidationModel();
    validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
    validation.userId_Login =  parseInt(sessionStorage.getItem('userId_Login'));
    validation.token = sessionStorage.getItem('token');
    validation.tranSourceId = this.tranSourceId;
    validation.version = this.version;
    validation.tranSourceId = this.tranSourceId;
    validation.version = this.version;

    var url =  this.apiRoot + 'api/Patient/GetMedicationList' + '?validation=' + JSON.stringify(validation) + '&PatientId=' + patientId;

    return this.httpClient.get(url)
        .pipe(
           map((data: MedicationListModel) => {
             return data;
           }), catchError( error => {
             return throwError(  error );//'Something went wrong!' );
           })
        )
    }

  // ------------------------------------------------------------------------------------------------------------------
  // Get - return the patientMedication list based on the id passed in
  // ------------------------------------------------------------------------------------------------------------------
  getPatientIcd10List( patientId: number ) {

    var validation = new ValidationModel();
    validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
    validation.userId_Login =  parseInt(sessionStorage.getItem('userId_Login'));
    validation.token = sessionStorage.getItem('token');
    validation.tranSourceId = this.tranSourceId;
    validation.version = this.version;
    validation.tranSourceId = this.tranSourceId;
    validation.version = this.version;

    var url =  this.apiRoot + 'api/Patient/GetICD10List' + '?validation=' + JSON.stringify(validation) + '&PatientId=' + patientId;

    return this.httpClient.get(url)
        .pipe(
           map((data: Icd10ListModel) => {
             return data;
           }), catchError( error => {
             return throwError(  error );//'Something went wrong!' );
           })
        )
    }

  // ------------------------------------------------------------------------------------------------------------------
  // Get - return the patientAllergy list based on the id passed in
  // ------------------------------------------------------------------------------------------------------------------
  getPatientAllergyList( patientId: number ) {

    var validation = new ValidationModel();
    validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
    validation.userId_Login =  parseInt(sessionStorage.getItem('userId_Login'));
    validation.token = sessionStorage.getItem('token');
    validation.tranSourceId = this.tranSourceId;
    validation.version = this.version;
    validation.tranSourceId = this.tranSourceId;
    validation.version = this.version;

    var url =  this.apiRoot + 'api/Patient/GetAllergyList' + '?validation=' + JSON.stringify(validation) + '&PatientId=' + patientId;

    return this.httpClient.get(url)
        .pipe(
           map((data: AllergyListModel) => {
             return data;
           }), catchError( error => {
             return throwError(  error );//'Something went wrong!' );
           })
        )
    }

  // ------------------------------------------------------------------------------------------------------------------
  // Save Patient Medication
  // ------------------------------------------------------------------------------------------------------------------
  savePatientMedication( patientId: number, medicationId: number ) {

    var validation = new ValidationModel();
    validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
    validation.userId_Login =  parseInt(sessionStorage.getItem('userId_Login'));
    validation.token = sessionStorage.getItem('token');
    validation.tranSourceId = this.tranSourceId;
    validation.version = this.version;
    validation.tranSourceId = this.tranSourceId;
    validation.version = this.version;

    var patientMedicaiton = new PatientMedicationModel;

    patientMedicaiton.validation = validation;
    patientMedicaiton.patientId = patientId;
    patientMedicaiton.medicationId = Number(medicationId);
    patientMedicaiton.medicationId_Generic = 0;

    var url = this.apiRoot + 'api/Patient/SavePatientMedication'
    var headers = new HttpHeaders();
    headers = headers.set("Content-Type", "application/json; charset=utf-8");

    return this.httpClient.post(url, patientMedicaiton, { headers: headers })
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
  // Save Patient Icd10
  // ------------------------------------------------------------------------------------------------------------------
  savePatientIcd10( patientId: number, icd10Code: string ) {

    var validation = new ValidationModel();
    validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
    validation.userId_Login =  parseInt(sessionStorage.getItem('userId_Login'));
    validation.token = sessionStorage.getItem('token');
    validation.tranSourceId = this.tranSourceId;
    validation.version = this.version;
    validation.tranSourceId = this.tranSourceId;
    validation.version = this.version;

    var patientIcd10 = new PatientIcd10Model;

    patientIcd10.validation = validation;
    patientIcd10.patientId = patientId;
    patientIcd10.icd10Code = icd10Code;

    var url = this.apiRoot + 'api/Patient/SavePatientICD10'
    var headers = new HttpHeaders();
    headers = headers.set("Content-Type", "application/json; charset=utf-8");

    return this.httpClient.post(url, patientIcd10, { headers: headers })
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
  // Save Patient Allergy
  // ------------------------------------------------------------------------------------------------------------------
  savePatientAllergy( patientId: number, allergyId: number ) {

    var validation = new ValidationModel();
    validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
    validation.userId_Login =  parseInt(sessionStorage.getItem('userId_Login'));
    validation.token = sessionStorage.getItem('token');
    validation.tranSourceId = this.tranSourceId;
    validation.version = this.version;
    validation.tranSourceId = this.tranSourceId;
    validation.version = this.version;

    var patientAllergy = new PatientAllergyModel;

    patientAllergy.validation = validation;
    patientAllergy.patientId = patientId;
    patientAllergy.allergyId = Number(allergyId);

    var url = this.apiRoot + 'api/Patient/SavePatientAllergy'
    var headers = new HttpHeaders();
    headers = headers.set("Content-Type", "application/json; charset=utf-8");

    return this.httpClient.post(url, patientAllergy, { headers: headers })
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
  // Delete Patient Medication
  // ------------------------------------------------------------------------------------------------------------------
  deletePatientMedication( patientId: number, medicationId: number ) {

    var validation = new ValidationModel();
    validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
    validation.userId_Login =  parseInt(sessionStorage.getItem('userId_Login'));
    validation.token = sessionStorage.getItem('token');
    validation.tranSourceId = this.tranSourceId;
    validation.version = this.version;
    validation.tranSourceId = this.tranSourceId;
    validation.version = this.version;

    var patientMedicaiton = new PatientMedicationModel;

    patientMedicaiton.validation = validation;
    patientMedicaiton.patientId = patientId;
    patientMedicaiton.medicationId = Number(medicationId);
    patientMedicaiton.medicationId_Generic = 0;

    var url = this.apiRoot + 'api/Patient/DeletePatientMedication'
    var headers = new HttpHeaders();
    headers = headers.set("Content-Type", "application/json; charset=utf-8");

    return this.httpClient.post(url, patientMedicaiton, { headers: headers })
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
  // Delete Patient Icd10
  // ------------------------------------------------------------------------------------------------------------------
  deletePatientIcd10( patientId: number, icd10Code: string ) {

    var validation = new ValidationModel();
    validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
    validation.userId_Login =  parseInt(sessionStorage.getItem('userId_Login'));
    validation.token = sessionStorage.getItem('token');
    validation.tranSourceId = this.tranSourceId;
    validation.version = this.version;
    validation.tranSourceId = this.tranSourceId;
    validation.version = this.version;

    var patientIcd10 = new PatientIcd10Model;

    patientIcd10.validation = validation;
    patientIcd10.patientId = patientId;
    patientIcd10.icd10Code = icd10Code;

    console.log('ICD',patientIcd10)

    var url = this.apiRoot + 'api/Patient/DeletePatientICD10'
    var headers = new HttpHeaders();
    headers = headers.set("Content-Type", "application/json; charset=utf-8");

    return this.httpClient.post(url, patientIcd10, { headers: headers })
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
  // Delete Patient Allergy
  // ------------------------------------------------------------------------------------------------------------------
  deletePatientAllergy( patientId: number, allergyId: number ) {

    var validation = new ValidationModel();
    validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
    validation.userId_Login =  parseInt(sessionStorage.getItem('userId_Login'));
    validation.token = sessionStorage.getItem('token');
    validation.tranSourceId = this.tranSourceId;
    validation.version = this.version;
    validation.tranSourceId = this.tranSourceId;
    validation.version = this.version;

    var patientAllergy = new PatientAllergyModel;

    patientAllergy.validation = validation;
    patientAllergy.patientId = patientId;
    patientAllergy.allergyId = Number(allergyId);

    var url = this.apiRoot + 'api/Patient/DeletePatientAllergy'
    var headers = new HttpHeaders();
    headers = headers.set("Content-Type", "application/json; charset=utf-8");

    return this.httpClient.post(url, patientAllergy, { headers: headers })
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
  // Get Address - return address data based on the id passed in
  // ------------------------------------------------------------------------------------------------------------------
  getAddress(addressId: number )
  {
      var validation = new ValidationModel();
      validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
      validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
      validation.token = sessionStorage.getItem('token');
      validation.tranSourceId = this.tranSourceId;
      validation.version = this.version;

      var url = this.apiRoot + 'api/Patient/GetAddress' + '?validation=' + JSON.stringify(validation) + '&AddressId=' + addressId;

      return this.httpClient.get(url)
          .pipe(
              map((data: AddressModel) => { 
                  return data;
              }), catchError(error => {
                  return throwError('Something went wrong!');
              })
      )
  }

  // ------------------------------------------------------------------------------------------------------------------
  // GetForPO - retrun a list of Patient for a Parol Officer
  // ------------------------------------------------------------------------------------------------------------------
  getForPO(userId: number, firstName: string, lastName: string, DOB: string, genderId: number, medicalRecordId: string, active: boolean ) {

    var validation = new ValidationModel();
    validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
    validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
    validation.token = sessionStorage.getItem('token');
    validation.tranSourceId = this.tranSourceId;
    validation.version = this.version;
    var searchCriteria = new PatientSearchModel();
    searchCriteria.customerId = 0;
    searchCriteria.userId = userId;
    searchCriteria.firstName = firstName;
    searchCriteria.lastName = lastName;
    searchCriteria.DOB = DOB;
    searchCriteria.genderId = genderId;
    searchCriteria.medicalRecordId = medicalRecordId;
    searchCriteria.active = active;
    searchCriteria.priority = false;
    searchCriteria.isEmployee = false;
    searchCriteria.isPatient = false;

    var url = this.apiRoot + 'api/Patient/GetForPO' + '?validation=' + JSON.stringify(validation) + '&searchCriteria=' + JSON.stringify(searchCriteria);

    return this.httpClient.get(url)
        .pipe(
            map((data: PatientListModel) => {
        return data;
            }), catchError(error => {
                return throwError('Something went wrong!'); 
            })
        )
  }


    // ------------------------------------------------------------------------------------------------------------------
  // Search - retrun a list of Patient that meet the search criteria
  // ------------------------------------------------------------------------------------------------------------------
  searchForParole(firstName: string, lastName: string, DOB: string ) {

    var validation = new ValidationModel();
    validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
    validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
    validation.token = sessionStorage.getItem('token');
    validation.tranSourceId = this.tranSourceId;
    validation.version = this.version;
    var searchCriteria = new PatientSearchModel();
    searchCriteria.customerId = 0;
    searchCriteria.locationId = 0;
    searchCriteria.firstName = firstName;
    searchCriteria.lastName = lastName;
    searchCriteria.DOB = DOB;
    searchCriteria.genderId = 0;
    searchCriteria.medicalRecordId = '';
    searchCriteria.active = true;
    searchCriteria.priority = true;
    searchCriteria.isEmployee = true;
    searchCriteria.isPatient = true;

    var url = this.apiRoot + 'api/Patient/GetListForParole' + '?validation=' + JSON.stringify(validation) + '&searchCriteria=' + JSON.stringify(searchCriteria);

    return this.httpClient.get(url)
        .pipe(
            map((data: PatientListModel) => {
        return data;
            }), catchError(error => {
                return throwError('Something went wrong!'); 
            })
        )
  }
  // ------------------------------------------------------------------------------------------------------------------
  // Get a list of patients that are missing info.
  // ------------------------------------------------------------------------------------------------------------------
  getPatientsMissingInfo(customerId: number, locationId: number) {

    var validation = new ValidationModel();
    validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
    validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
    validation.token = sessionStorage.getItem('token');
    validation.tranSourceId = this.tranSourceId;
    validation.version = this.version;


    var url = this.apiRoot + 'api/Patient/GetPatientsMissingInfo' + '?validation=' + JSON.stringify(validation) + '&CustomerId=' + customerId + '&LocationId=' + locationId;

    return this.httpClient.get(url)
        .pipe(
           map((data: PatientMissingListModel) => {
        return data;
    }), catchError(error => {
        return throwError('Something went wrong!'); 
    })
  )
  }

  // ------------------------------------------------------------------------------------------------------------------
  // Get Parole List - retrun a list of PatientParole that meet the search criteria
  // ------------------------------------------------------------------------------------------------------------------
  getPatientParoleList(UserId: number ) {

    var validation = new ValidationModel();
    validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
    validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
    validation.token = sessionStorage.getItem('token');
    validation.tranSourceId = this.tranSourceId;
    validation.version = this.version;
    var searchCriteria = new PatientParoleSearchModel();
    searchCriteria.UserId = UserId;

    var url = this.apiRoot + 'api/Patient/GetPatientParoleList' + '?validation=' + JSON.stringify(validation) + '&searchCriteria=' + JSON.stringify(searchCriteria);

    return this.httpClient.get(url)
        .pipe(
           map((data: PatientParoleListModel) => {
        return data;
        }), catchError(error => {
            return throwError('Something went wrong!'); 
        })
    )
  }

  // ------------------------------------------------------------------------------------------------------------------
  // Save - Write the updated patientParole data to the server
  // ------------------------------------------------------------------------------------------------------------------
  savePatientParole(patientParole: PatientParoleModel)
  {
    var validation = new ValidationModel();
    validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
    validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
    validation.token = sessionStorage.getItem('token');
    validation.tranSourceId = this.tranSourceId;
    validation.version = this.version;

    patientParole.validation = validation;
    patientParole.userId_Updated = parseInt(sessionStorage.getItem('userId_Login'));

    patientParole.patientId = Number(patientParole.patientId);
    patientParole.userId = Number(patientParole.userId);

    var url = this.apiRoot + 'api/Patient/SavePatientParole'
    var headers = new HttpHeaders();
    headers = headers.set("Content-Type", "application/json; charset=utf-8");

    return this.httpClient.post(url, patientParole, { headers: headers })
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
  // Remove - Mark the updated patientParole data as removed to the server
  // ------------------------------------------------------------------------------------------------------------------
  removePatientParole(patientParole: PatientParoleModel)
  {
    var validation = new ValidationModel();
    validation.entityId_Login = parseInt(sessionStorage.getItem('entityId_Login'));
    validation.userId_Login = parseInt(sessionStorage.getItem('userId_Login'));
    validation.token = sessionStorage.getItem('token');
    validation.tranSourceId = this.tranSourceId;
    validation.version = this.version;

    patientParole.validation = validation;
    patientParole.userId_Updated = parseInt(sessionStorage.getItem('userId_Login'));

    patientParole.patientId = Number(patientParole.patientId);
    patientParole.userId = Number(patientParole.userId);

    var url = this.apiRoot + 'api/Patient/RemovePatientParole'
    var headers = new HttpHeaders();
    headers = headers.set("Content-Type", "application/json; charset=utf-8");

    return this.httpClient.post(url, patientParole, { headers: headers })
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
