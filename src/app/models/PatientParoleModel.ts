// Model Name    : PatientParoleModel
// Date Created  : 6/19/2023
// Written By    : Stephen Farkas
// Description   : PatientParole Model
// MM/DD/YYYY XXX Description
//
//------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------
import { ValidationModel } from './ValidationModel';

export class PatientParoleSearchModel {
  UserId: number = 0;
}

export class PatientParoleModel {
  validation: ValidationModel = new ValidationModel;
  valid: boolean = false;
  message: string = '';
  patientParoleId: number = 0;
  patientId: number = 0;
  userId: number = 0;
  firstName: string = '';
  lastName: string = '';
  dob: string = '';
  userId_Updated: number = 0;
}

export class PatientParoleListModel {
  valid: boolean = false;
  message: string = '';
  list: PatientParoleListItemModel[] = new Array<PatientParoleListItemModel>();
}

export class PatientParoleListItemModel {
  patientParoleId: number = 0;
  patientId: number = 0;
  firstName: string = '';
  lastName: string = '';
  dob: string = '';
}
