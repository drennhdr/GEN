// Model Name    : PatientNoteModel
// Date Created  : 8/5/2022
// Written By    : Stephen Farkas
// Description   : PatientNote Model
// MM/DD/YYYY XXX Description
//
//------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------
import { ValidationModel } from './ValidationModel';

export class PatientNoteSearchModel {
  PatientId: number = 0;
}

export class PatientNoteModel {
  validation: ValidationModel = new ValidationModel;
  valid: boolean = false;
  message: string = '';
  patientNoteId: number = 0;
  patientId: number = 0;
  dateTime: string = '';
  subject: string = '';
  note: string = '';
  createdBy: string = '';
  userId_Created: number = 0;
}

export class PatientNoteListModel {
  valid: boolean = false;
  message: string = '';
  list: PatientNoteListItemModel[] = new Array<PatientNoteListItemModel>();
}

export class PatientNoteListItemModel {
  patientNoteId: number = 0;
  patientId: number = 0;
  dateTime: string = '';
  subject: string = '';
  note: string = '';
}
