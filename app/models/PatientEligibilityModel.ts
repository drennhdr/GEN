// Model Name    : PatientEligibilityModel
// Date Created  : 8/1/2022
// Written By    : Stephen Farkas
// Description   : PatientEligibility Model
// MM/DD/YYYY XXX Description
//
//------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------
import { ValidationModel } from './ValidationModel';

export class PatientEligibilitySearchModel {
  patientId: number = 0;
}

export class PatientEligibilityModel {
  validation: ValidationModel = new ValidationModel;
  valid: boolean = false;
  message: string = '';
  patientEligibilityId: number = 0;
  patientId: number = 0;
  patientInsuranceId: number = 0;
  requestDate: string = '';
  effectiveDate: string = '';
  endDate: string = '';
  status: string = '';
  firstName: string = '';
  lastName: string = '';
  middleName: string = '';
  prefix: string = '';
  suffix: string = '';
  dob: string = '';
  genderId: number = 0;
  ethnicityId: number = 0;
  ssn: string = '';
  driversLicense: string = '';
  driversLicenseState: string = '';
  payer: string = '';
  memberId: string = '';
  groupNo: string = '';
  street1: string = '';
  street2: string = '';
  city: string = '';
  state: string = '';
  postalCode: string = '';
  phone: string = '';
  phoneWork: string = '';
  email: string = '';
  userId_Updated: number = 0;
}

export class PatientEligibilityListModel {
  valid: boolean = false;
  message: string = '';
  list: PatientEligibilityListItemModel[] = new Array<PatientEligibilityListItemModel>();
}

export class PatientEligibilityListItemModel {
  patientEligibilityId: number = 0;
  requestDate: string = '';
  effectiveDate: string = '';
  status: string = '';
  payer: string = '';
}
