// Model Name    : PatientInsuranceModel
// Date Created  : 8/6/2022
// Written By    : Stephen Farkas
// Description   : PatientInsurance Model
// MM/DD/YYYY XXX Description
//
//------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------
import { ValidationModel } from './ValidationModel';

export class PatientInsuranceSearchModel {
  PatientId: number = 0;
}

export class PatientInsuranceModel {
  validation: ValidationModel = new ValidationModel;
  valid: boolean = false;
  message: string = '';
  patientInsuranceId: number = 0;
  patientId: number = 0;
  insuranceId: number = 0;
  insurance: string = '';
  active: boolean = false;
  insuranceTypeId: number = 0;
  insuranceType: string = '';
  memberId: string = '';
  groupNo: string = '';
  effectiveDate: string = '';
  expireDate: string = '';
  sequence: number = 0;
  relationshipId: number = 0;
  relationship: string = '';
  notes: string = '';
  userId_Updated: number = 0;
  subscriberFirstName: string = '';
  subscriberLastName: string = '';
  subsriberDOB: string = '';
  addressId_Subscriber: number = 0;
  street1: string = '';
	street2: string = '';
	city: string = '';
	county: string = '';
	state: string = '';
	postalCode: string = '';
  subsribePhone: string = '';
  subsribeWorkPhone: string = '';
  insuranceName: string = '';
  preAuthRequired: boolean = false;
  preAuthNumber: string = '';
  preAuthEndDate: string = '';
  preAuthMaximum: number = 0;


  // This is used to create zendesk message
  patientName: string = '';
  customerId: number = 0;
  userName: string = ''

}

export class PatientInsuranceListModel {
  valid: boolean = false;
  message: string = '';
  list: PatientInsuranceListItemModel[] = new Array<PatientInsuranceListItemModel>();
}

export class PatientInsuranceListItemModel {
  patientInsuranceId: number = 0;
  patientId: number = 0;
  insuranceId: number = 0;
  insurance: string = '';
  active: boolean = false;
  insuranceTypeId: number = 0;
  insuranceType: string = '';
  memberId: string = '';
  groupNo: string = '';
  effectiveDate: string = '';
  expireDate: string = '';
  sequence: number = 0;
  relationshipId: number = 0;
  relationship: string = '';
  notes: string = '';
}
