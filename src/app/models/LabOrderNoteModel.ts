// Model Name    : LabOrderNoteModel
// Date Created  : 9/27/2022
// Written By    : Stephen Farkas
// Description   : LabOrderNote Model
// MM/DD/YYYY XXX Description
//
//------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------
import { ValidationModel } from './ValidationModel';

export class LabOrderNoteSearchModel {
  LabOrderId: number = 0;
}

export class LabOrderNoteModel {
  validation: ValidationModel = new ValidationModel;
  valid: boolean = false;
  message: string = '';
  labOrderNoteId: number = 0;
  labOrderId: number = 0;
  dateTime: string = '';
  note: string = '';
  createdBy: string = '';
  userId_Created: number = 0;
}

export class LabOrderNoteListModel {
  valid: boolean = false;
  message: string = '';
  list: LabOrderNoteListItemModel[] = new Array<LabOrderNoteListItemModel>();
}

export class LabOrderNoteListItemModel {
  labOrderNoteId: number = 0;
  labOrderId: number = 0;
  dateTime: string = '';
  note: string = '';
}
