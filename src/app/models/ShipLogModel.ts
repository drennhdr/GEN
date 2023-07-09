// Model Name    : ShipLogModel
// Date Created  : 9/21/2022
// Written By    : Stephen Farkas
// Description   : ShipLog Model
// MM/DD/YYYY XXX Description
//
//------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------
import { ValidationModel } from './ValidationModel';

export class ShipLogSearchModel {
  CustomerId: number = 0;
  LocationId: number = 0;
  StartDate: string = '';
  EndDate: string = '';
}

export class ShipLogModel {
  validation: ValidationModel = new ValidationModel;
  valid: boolean = false;
  message: string = '';
  shipLogId: number = 0;
  customerId: number = 0;
  customer: string = '';
  locationId: number = 0;
  location: string = '';
  dateCreated: string = '';
  dateReceived: string = '';
  userId_Updated: number = 0;
  trackingNo: string = '';
  specimens: ShipLogSpecimenModel[] = new Array<ShipLogSpecimenModel>();
}

export class ShipLogSpecimenModel {
  shipLogSpecimenId: number = 0;
  shipLogId: number = 0;
  labOrderId: number = 0;
  labOrderSpecimenId: number = 0;
  specimenBarcode: string = '';
  collectionDate: string = '';
  labTypeId: number = 0;
  labType: string = "";
  patientId: number = 0;
  patientName: string = "";
  patientDOB: string = "";
  patientGenderId: number = 0;
  patientGender: string = "";
  checked: boolean = false;
}

export class ShipLogListModel {
  valid: boolean = false;
  message: string = '';
  list: ShipLogListItemModel[] = new Array<ShipLogListItemModel>();
}

export class ShipLogListItemModel {
  shipLogId: number = 0;
  customerId: number = 0;
  customer: string = '';
  locationId: number = 0;
  location: string = '';
  dateCreated: string = '';
  dateReceived: string = '';
  userId_Updated: number = 0;
  status: string = '';
}
