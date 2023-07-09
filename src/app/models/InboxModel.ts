// Model Name    : InboxModel
// Date Created  : 10/20/2022
// Written By    : Stephen Farkas
// Description   : Inbox Model
// MM/DD/YYYY XXX Description
//
//------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------
import { ValidationModel } from './ValidationModel';

export class InboxSearchModel {
  CustomerId: number = 0;
}

export class InboxModel {
  validation: ValidationModel = new ValidationModel;
  valid: boolean = false;
  message: string = '';
  inboxId: number = 0;
  customerId: number = 0;
  customer: string = "";
  locationId: number = 0;
  location: string = "";
  patientId: number = 0;
  patient: string = '';
  labOrderId: number = 0;
  specimenBarcode: string = '';
  subject: string = '';
  iMessage: string = '';
  dateResolved: string = '';
}

export class InboxListModel {
  valid: boolean = false;
  message: string = '';
  list: InboxListItemModel[] = new Array<InboxListItemModel>();
}

export class InboxListItemModel {
  inboxId: number = 0;
  customerId: number = 0;
  locationId: number = 0;
  patientId: number = 0;
  patient: string = '';
  labOrderId: number = 0;
  specimenBarcode: string = '';
  subject: string = '';
}
