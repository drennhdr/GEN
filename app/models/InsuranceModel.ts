// Model Name    : InsuranceModel
// Date Created  : 8/1/2022
// Written By    : Stephen Farkas
// Description   : Address Model
// MM/DD/YYYY XXX Description
//
//------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------
import { ValidationModel } from './ValidationModel';

export class InsuranceSearchModel {
    name: string = '';
    active: boolean = false;
    state: string = '';
}

export class InsuranceModel {
    validation: ValidationModel = new ValidationModel;
    valid: boolean = false;
    message: string = '';
    insuranceId: number = 0;
    name: string = '';
    active: boolean = false;
    website: string = ''
    email: string = '';
    phone: string = '';
    street1: string = '';
    street2: string = '';
    city: string = '';
    state: string = '';
    postalCode: string = '';
    countryCode: string = '';
    userId_Updated: number = 0;
    preauthRequired: boolean = false;
  }
  
  export class InsuranceListModel {
    valid: boolean = false;
    message: string = '';
    list: InsuranceListItemModel[] = new Array<InsuranceListItemModel>();
  }

  export class InsuranceListItemModel {
    insuranceId: number = 0;
    name: string = '';
    street1: string = '';
    state: string = '';
  }