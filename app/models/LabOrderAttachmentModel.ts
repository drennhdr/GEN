// Model Name    : LabOrderAttachmentModel
// Date Created  : 9/5/2022
// Written By    : Stephen Farkas
// Description   : LabOrderAttachment Model
// MM/DD/YYYY XXX Description
// 11/02/2022 SJF Added LabOrderPdfModel
//------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------
import { ValidationModel } from './ValidationModel';

export class LabOrderAttachmentSearchModel {
    LabOrderSpecimenId: number = 0;
}

export class LabOrderAttachmentModel {
  validation: ValidationModel = new ValidationModel;
  valid: boolean = false;
  message: string = '';
  labOrderAttachmentId: number = 0;
  labOrderId: number = 0;
  dateCreated: string = '';
  loAttachmentTypeId: number = 0;
  attachmentType: string = '';
  description: string = '';
  fileType: string = '';
  userId_Created: number = 0;
  createdBy: string = '';
  fileAsBase64: string = "";
}

export class LabOrderAttachmentListModel {
  valid: boolean = false;
  message: string = '';
  list: LabOrderAttachmentListItemModel[] = new Array<LabOrderAttachmentListItemModel>();
}

export class LabOrderAttachmentListItemModel {
  labOrderAttachmentId: number = 0;
  labOrderId: number = 0;
  dateCreated: string = '';
  loAttachmentTypeId: number = 0;
  attachmentType: string = '';
  description: string = '';
}

export class LabOrderPdfModel {
  validation: ValidationModel = new ValidationModel;
  valid: boolean = false;
  message: string = '';
  specimenId: number = 0;
  fileAsBase64: string = "";
}
