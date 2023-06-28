// Model Name    : PhysicianPreferenceModel
// Date Created  : 8/3/2022
// Written By    : Stephen Farkas
// Description   : PhysicianPreference Model
// MM/DD/YYYY XXX Description
//
//------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------
import { ValidationModel } from './ValidationModel';

export class PhysicianPreferenceSearchModel {
  userId: number = 0;
  customerId: number = 0;
  labTypeId: number = 0;
}

export class PhysicianPreferenceModel {
  validation: ValidationModel = new ValidationModel;
  valid: boolean = false;
  message: string = '';
  physicianPreferenceId: number = 0;
  userId: number = 0;
  customerId: number = 0;
  active: boolean = false;
  labTypeId: number = 0;
  labType: string = '';
  availableForAll: boolean = false;
  name: string = '';
  effectiveDate: string = '';
  userId_Updated: number = 0;
  sunsetDate: string = '';
  version:  string = '';
  tests: PhysicianPreferenceTestModel[] = new Array<PhysicianPreferenceTestModel>();
}

export class PhysicianPreferenceTestModel {
  physicianPreferenceTestId: number = 0;
  physicianPreferenceId: number = 0;
  labTestId: number = 0;
}

export class PhysicianPreferenceListModel {
  valid: boolean = false;
  message: string = '';
  list: PhysicianPreferenceListItemModel[] = new Array<PhysicianPreferenceListItemModel>();
}

export class PhysicianPreferenceListItemModel {
  physicianPreferenceId: number = 0;
  active: boolean = false;
  userId: number = 0;
  physician: string = '';
  labTypeId: number = 0;
  labType: string = '';
  availableForAll: boolean = false;
  availableForAllYN: string = "";
  name: string = '';
  effectiveDate: string = '';
}
