// Model Name    : PatientAttachmentModel
// Date Created  : 8/5/2022
// Written By    : Stephen Farkas
// Description   : PatientAttachment Model
// MM/DD/YYYY XXX Description
//
//------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------
import { ValidationModel } from './ValidationModel';

export class PatientAttachmentSearchModel {
  PatientId: number = 0;
}

export class PatientAttachmentModel {
  validation: ValidationModel = new ValidationModel;
  valid: boolean = false;
  message: string = '';
  patientAttachmentId: number = 0;
  patientId: number = 0;
  dateCreated: string = '';
  attachmentTypeId: number = 0;
  attachmentType: string = '';
  description: string = '';
  fileType: string = '';
  userId_Created: number = 0;
  createdBy: string = '';
  effectiveDate: string = '';
  expireDate: string = '';
  fileAsBase64: string = '';
}

export class PatientAttachmentListModel {
  valid: boolean = false;
  message: string = '';
  list: PatientAttachmentListItemModel[] = new Array<PatientAttachmentListItemModel>();
}

export class PatientAttachmentListItemModel {
  patientAttachmentId: number = 0;
  patientId: number = 0;
  dateCreated: string = '';
  attachmentTypeId: number = 0;
  attachmentType: string = '';
  description: string = '';
  expireDate: string = '';
}
