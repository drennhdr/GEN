// Model Name    : CustomerModel
// Date Created  : 8/1/2022
// Written By    : Stephen Farkas
// Description   : Customer Model
// MM/DD/YYYY XXX Description
// 01/08/2023 SJF Added allowSelfPay, requireInsurance
// 01/20/2022 SJF Added CustomerLcsModel
// 02/10/2023 SJF Added ShipLog
// 04/17/2023 SJF Added SharePatients
// 06/14/2023 SJF Added Multiple_Tox, Multiple_RPP, Multiple_UTISTI, & Multiple_GPP
// 06/15/2023 SJF Added AlternateLoginId
//------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------
import { ValidationModel } from './ValidationModel';
import { CustomerAttachmentListItemModel } from './CustomerAttachmentModel';
import { CustomerNoteListItemModel } from './CustomerNoteModel';
import { UserListItemModel } from './UserModel';
import { PhysicianPreferenceListModel } from './PhysicianPreferenceModel'

export class CustomerSearchModel {
  name: string = '';
  active: number = 0;
  city: string = '';
  state: string = '';
  facilityCode: string = '';
  regionId: number = 0;
  userId_AM: number = 0;
  userId_TM: number = 0;
  userId_RM: number = 0;
  userId_LCS: number = 0;
}

export class CustomerModel {
  validation: ValidationModel = new ValidationModel;
  valid: boolean = false;
  message: string = '';
  customerId: number = 0;
  active: boolean = false;
  accountTypeId: number = 0;
  name: string = '';
  facilityCode: string = '';
  contactName: string = '';
  contactPosition: string = '';
  contactEmail: string = '';
  regionId: number = 0;
  region: string = "";
  userId_AM: number = 0;
  name_AM: string = "";
  userId_TM: number = 0;
  name_TM: string = "";
  userId_RM: number = 0;
  name_RM: string = "";
  customerBillingTypeId: number = 0;
  customerBillingType: string= "";
  allowSelfPay: boolean = false;
  requireInsurance: boolean = false;
  shipLog: boolean = false;
  service_ToxUrine: boolean = false;
  service_ToxOral: boolean = false;
  service_RPP: boolean = false;
  service_UTISTI: boolean = false;
  service_GPP: boolean = false;
  service_Urinalysis: boolean = false;
  service_Hematology: boolean = false;
  lab_ToxUrine: number = 0;
  lab_ToxOral: number = 0;
  lab_RPP: number = 0;
  lab_UTISTI: number = 0;
  lab_GPP: number = 0;
  lab_Urinalysis: number = 0;
  lab_Hematology: number = 0;
  multiple_Tox: boolean = false;
  multiple_RPP: boolean = false;
  multiple_UTISTI: boolean = false;
  multiple_GPP: boolean = false;
  pct_Commercial: number = 0;
  pct_SelfPay: number = 0;
  pct_Medicare: number = 0;
  pct_Medicaid: number = 0;
  primaryName: string = "";
  residentialFacility: boolean = false;
  autoSignature: boolean = false;
  phone: string= "";
  fax: string= "";
  timeZone: string= "";
  specialty: string= "";
  userId_Updated: number = 0;
  userId_Reviewed: number = 0;
  parolOfficer: boolean = false;
  taxId: string = '';
  pecosEnrolled: boolean = false;
  sharePatients: boolean = false;
  alternateLoginId: boolean = false;
  facesheetAddress: boolean = false;
  dateReviewed: string = '';
  locations: LocationModel[] = new Array<LocationModel>();
  users: UserListItemModel[] = new Array<UserListItemModel>();
  attachments: CustomerAttachmentListItemModel[] = new Array<CustomerAttachmentListItemModel>();
  notes: CustomerNoteListItemModel[] = new Array<CustomerNoteListItemModel>();
  preferences: PhysicianPreferenceListModel[] = new Array<PhysicianPreferenceListModel>();
  lcs: CustomerLcsModel[] = new Array<CustomerLcsModel>();
}

export class CustomerSaveModel {
  validation: ValidationModel = new ValidationModel;
  valid: boolean = false;
  message: string = '';
  customerId: number = 0;
  active: boolean = false;
  accountTypeId: number = 0;
  name: string = '';
  facilityCode: string = '';
  contactName: string = '';
  contactPosition: string = '';
  contactEmail: string = '';
  regionId: number = 0;
  userId_AM: number = 0;
  userId_TM: number = 0;
  userId_RM: number = 0;
  customerBillingTypeId: number = 0;
  service_ToxUrine: boolean = false;
  service_ToxOral: boolean = false;
  service_RPP: boolean = false;
  service_UTISTI: boolean = false;
  service_GPP: boolean = false;
  service_Urinalysis: boolean = false;
  service_Hematology: boolean = false;
  lab_ToxUrine: number = 0;
  lab_ToxOral: number = 0;
  lab_RPP: number = 0;
  lab_UTISTI: number = 0;
  lab_GPP: number = 0;
  lab_Urinalysis: number = 0;
  lab_Hematology: number = 0;
  multiple_Tox: boolean = false;
  multiple_RPP: boolean = false;
  multiple_UTISTI: boolean = false;
  multiple_GPP: boolean = false;
  pct_Commercial: number = 0;
  pct_SelfPay: number = 0;
  pct_Medicare: number = 0;
  pct_Medicaid: number = 0;
  userId_Updated: number = 0;
  allowSelfPay: boolean = false;
  requireInsurance: boolean = false;
  shipLog: boolean = false;
  parolOfficer: boolean = false;
  taxId: string = '';
  pecosEnrolled: boolean = false;
  sharePatients: boolean = false;
  alternateLoginId: boolean = false;
  facesheetAddress: boolean = false;
  lcs: CustomerLcsModel[] = new Array<CustomerLcsModel>();
}

export class LocationModel {
  locationId: number = 0;
  primary: boolean = false;
  customerId: number = 0;
  locationName: string = '';
  specialtyId: number = 0;
  residentialFacility: boolean = false;
  autoSignature: boolean = false;
  contract: boolean = false;
  addressId: number = 0;
  phone: string = '';
  fax: string = '';
  email: string = '';
  timeZoneId: number = 0;
  sendFax: boolean = false;
  faxStartDate: string = '';
  faxBatch: boolean = false;
  sendEmail: boolean = false;
  pickupDay: string = '';
  shipingMethodId_Preferred: number = 0;
  nPI: string = '';
  clinicHours: string = '';
  resultCoverOnly: boolean = false;
}

export class CustomerListModel {
  valid: boolean = false;
  message: string = '';
  list: CustomerListItemModel[] = new Array<CustomerListItemModel>();
}

export class CustomerListItemModel {
  customerId: number = 0;
  active: boolean = false;
  accountTypeId: number = 0;
  name: string = '';
  facilityCode: string = '';
  sharePatients: boolean = false;
  contactName: string = '';
  contactPosition: string = '';
  contactEmail: string = '';
  regionId: number = 0;
  customerBillingTypeId: number = 0;
  userId_Updated: number = 0;
  service_RPP: boolean = false;
  service_UTISTI: boolean = false;
  service_GPP: boolean = false;
  service_CGX: boolean = false;
  service_Toxicology: boolean = false;
  pCT_Commercial: number = 0;
  pCT_SelfPay: number = 0;
  pCT_Medicare: number = 0;
  pCT_Medicaid: number = 0;
  userId_AM: number = 0;
  userId_TM: number = 0;
  userId_RM: number = 0;
  dateReviewed: string = '';
  userId_Reviewed: number = 0;
}

export class CustomerLcsModel {
  userId: number = 0;
  userName: string = '';
}

export class CustomerIncidentModel{
  validation: ValidationModel = new ValidationModel;
  valid: boolean = false;
  customerId: number = 0;
  userId_Reviewed: number = 0;
  auditIncidentTypeId: number = 0;
  auditRejectionTypeId: number = 0;
  IncidentDate: string = '';
  shippingMethodId: number = 0;
  trackingNo: string = '';
  zendeskNote: string = '';
}