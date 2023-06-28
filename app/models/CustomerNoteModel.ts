// Model Name    : CustomerNoteModel
// Date Created  : 8/1/2022
// Written By    : Stephen Farkas
// Description   : CustomerNote Model
// MM/DD/YYYY XXX Description
//
//------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------
import { ValidationModel } from './ValidationModel';

export class CustomerNoteSearchModel {
  customerId: string = '';
}

export class CustomerNoteModel {
  validation: ValidationModel = new ValidationModel;
  valid: boolean = false;
  message: string = '';
  customerNoteId: number = 0;
  customerId: number = 0;
  dateTime: Date;
  subject: string = '';
  note: string = '';
  userId_Created: number = 0;
  createdBy: string = '';
}

export class CustomerNoteListModel {
  valid: boolean = false;
  message: string = '';
  list: CustomerNoteListItemModel[] = new Array<CustomerNoteListItemModel>();
}

export class CustomerNoteListItemModel {
  customerNoteId: number = 0;
  customerId: number = 0;
  dateTime: string = '';
  subject: string = '';
  note: string = '';
}
