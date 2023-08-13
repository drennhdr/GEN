// Model Name    : PatientModel
// Date Created  : 8/5/2022
// Written By    : Stephen Farkas
// Description   : Patient Model
// MM/DD/YYYY XXX Description
// 09/22/2022 SJF PatientForLabOrderModel
// 02/15/2023 SJF Added userId_ParolOfficer
// 03/24/2023 SJF Added PatientMissingListModel
// 04/17/2023 SJF Added LocationId
//------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------
import { ValidationModel } from './ValidationModel';
import { PatientNoteListItemModel } from './PatientNoteModel'
import { PatientAttachmentListItemModel } from './PatientAttachmentModel'
import { PatientInsuranceListItemModel } from './PatientInsuranceModel'
import { AddressModel } from './AddressModel';
import { MedicationListItemModel } from './MedicationModel';
import { Icd10ListItemModel } from './Icd10Model';
import { AllergyListItemModel } from './AllergyModel';

export class PatientSearchModel {
  customerId: number = 0;
  locationId: number = 0;
  firstName: string = '';
  lastName: string = '';
  DOB: string = '';
  genderId: number = 0;
  medicalRecordId: string = '';
  active: boolean = false;
  priority: boolean = false;
  isPatient: boolean = false;
  isEmployee: boolean = false;
  userId: number = 0;
}

export class PatientModel {
  validation: ValidationModel = new ValidationModel;
  valid: boolean = false;
  message: string = '';
  patientId: number = 0;
  customerId: number = 0;
  locationId: number = 0;
  active: boolean = false;
  priority: boolean = false;
  firstName: string = '';
  firstNameMissing: boolean = false;
  middleName: string = '';
  lastName: string = '';
  lastNameMissing: boolean = false;
  dob: string = '';
  dobMissing: boolean = false;
  genderId: number = 0;
  genderMissing: boolean = false;
  gender: string = '';
  ethnicityId: number = 0;
  ethnicity: string = '';
  prefix: string = '';
  suffix: string = '';
  email: string = '';
  medicalRecordId: string = '';
  userId: number = 0;
  isEmployee: boolean = false;
  billingTypeId: number = 0;
  addressId: number = 0;
  addressMissing: boolean = false;
  phone: string = '';
  phoneCell: string = '';
  phoneWork: string = '';
  ssn: string = '';
  driversLicense: string = '';
  driversLicenseState: string = '';
  selfPay: boolean = false;
  contractPay: boolean = false;
  hardship: boolean = false;
  scholarship: boolean = false;
  userId_ParolOfficer: number = 0;
  userId_Updated: number = 0;
  stamp: string = '';
  address: AddressModel;
  insurances: PatientInsuranceListItemModel[] = new Array<PatientInsuranceListItemModel>();
  attachments: PatientAttachmentListItemModel[] = new Array<PatientAttachmentListItemModel>();
  notes: PatientNoteListItemModel[] = new Array<PatientNoteListItemModel>();
  medications: MedicationListItemModel[] = new Array<MedicationListItemModel>();
  diagnosis: Icd10ListItemModel[] = new Array<Icd10ListItemModel>();
  allergies: AllergyListItemModel[] = new Array<AllergyListItemModel>();
}

export class PatientForLabOrderModel {
  valid: boolean = false;
  message: string = '';
  patientId: number = 0;
  firstName: string = '';
  lastName: string = '';
  billingTypeId: number = 0;
  selfPay: boolean = false;
  contractPay: boolean = false;
  hardship: boolean = false;
  scholarship: boolean = false;
  customerId: number = 0;
  DOB: string = '';
  genderId: number = 0;
  labOrderSpecimenId_ToxUrine: number = 0;
  labOrderSpecimenId_ToxOral: number = 0;
  labOrderSpecimenId_GPP: number = 0;
  labOrderSpecimenId_UTISTI: number = 0;
  labOrderSpecimenId_RPP: number = 0;
  conscentOnFile: number = 0;
  address: AddressModel;
  insurances: PatientInsuranceListItemModel[] = new Array<PatientInsuranceListItemModel>();
}

export class PatientListModel {
  valid: boolean = false;
  message: string = '';
  list: PatientListItemModel[] = new Array<PatientListItemModel>();
}

export class PatientListItemModel {
  patientId: number = 0;
  name: string = '';
  DOB: string = '';
  gender: string = '';
  medicalRecordId: string = '';
  phone: string = '';
  facilityCode: string = '';
  roiExpireDate: string = ''
}

export class PatientMedicationModel {
  validation: ValidationModel = new ValidationModel;
  valid: boolean = false;
  message: string = '';
  patientMedicationId: number = 0;
  patientId: number = 0;
  medicationId: number = 0;
  medicationId_Generic: number = 0;
  freeformDesc: string = '';
}

export class PatientIcd10Model {
  validation: ValidationModel = new ValidationModel;
  valid: boolean = false;
  message: string = '';
  patientIcd10Id: number = 0;
  patientId: number = 0;
  icd10Code: string = "";
}

export class PatientAllergyModel {
  validation: ValidationModel = new ValidationModel;
  valid: boolean = false;
  message: string = '';
  patientAllergyId: number = 0;
  patientId: number = 0;
  allergyId: number = 0;
  freeformDesc: string = '';
}

export class PatientMissingListModel {
  valid: boolean = false;
  message: string = '';
  list: PatientMissingListItemModel[] = new Array<PatientMissingListItemModel>();
}

export class PatientMissingListItemModel {
  patientId: number = 0;
  name: string = '';
  locationName: string = '';
  missing: string = '';
}

