// Model Name    : LabModel
// Date Created  : 3/17/2023
// Written By    : Stephen Farkas
// Description   : Lab Model
// MM/DD/YYYY XXX Description
//
//------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------
import { ValidationModel } from './ValidationModel';
import { AddressModel } from './AddressModel';

export class LabSearchModel {
  Name: string = '';
}

export class LabModel {
  validation: ValidationModel = new ValidationModel;
  valid: boolean = false;
  message: string = '';
  labId: number = 0;
  name: string = '';
  addressId: number = 0;
  active: boolean = false;
  contactName: string = '';
  contactPhone: string = '';
  contactEmail: string = '';
  service_ToxUrine: boolean = false;
  service_ToxOral: boolean = false;
  service_RPP: boolean = false;
  service_UTISTI: boolean = false;
  service_GPP: boolean = false;
  service_Urinalysis: boolean = false;
  service_Hematology: boolean = false;
  userId_Updated: number = 0;
  address: AddressModel;
}


export class LabListModel {
  valid: boolean = false;
  message: string = '';
  list: LabListItemModel[] = new Array<LabListItemModel>();
}

export class LabListItemModel {
  labId: number = 0;
  name: string = '';
  service_RPP: boolean = false;
  service_UTISTI: boolean = false;
  service_GPP: boolean = false;
  service_Toxicology: boolean = false;
  service_Urinalysis: boolean = false;
  service_Hematology: boolean = false;
}
