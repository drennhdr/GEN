// Model Name    : LabOrderModel
// Date Created  : 8/12/2022
// Written By    : Stephen Farkas
// Description   : LabOrder Model
// MM/DD/YYYY XXX Description
// 09/14/2022 SJF Added LabOrderESignModel
// 09/19/2022 SJF Added LabOrderIssueModel
// 09/20/2022 SJF Added LabOrderForManifestModel
// 09/27/2022 SJF Added BatchDemographicsModel
// 11/22/2022 SJF Added LabOrderAuditSearchModel and LabOrderAuditModel
// 12/02/2022 SJF Added LabOrderSpecimenInsuranceModel
// 01/17/2023 SJF Added LabOrderSpecimenStatusModel
// 02/10/2023 SJF Added LabOrderForShipLogModel
//------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------
import { ValidationModel } from './ValidationModel';
import { LabOrderNoteListModel } from './LabOrderNoteModel';

export class LabOrderSearchModel {
  customerId: number = 0;
  locationId: number = 0;
  labStatusId: number = 0;
  physicianId: number = 0;
  patientId: number = 0;
  patientName: string = '';
  specimenBarcode: string = '';
  labTypeId: number = 0;
  collectionDateStart: string = '';
  collectionDateEnd: string = '';
  labId: number = 0;
  userId_Accessioner: number = 0;
  option: string = '';
  dateType: number = 1;
}

export class LabOrderModel {
  validation: ValidationModel = new ValidationModel;
  valid: boolean = false;
  message: string = '';
  labOrderId: number = 0;
  patientId: number = 0;
  userId_Physician: number = 0;
  user_Physician: string = '';
  npi: string = '';
  customerId: number = 0;
  customer: string = '';
  facilityCode: string = '';
  locationId: number = 0;
  location: string = '';
  locationAddress: string = '';
  labId: number = 0;
  billingTypeId: number = 0;
  selfPay: boolean = false;
  contractPay: boolean = false;
  patientInsuranceId_Primary: number = 0;
  primaryInsurance: string = '';
  patientInsuranceId_Secondary: number = 0;
  secondaryInsurance: string = '';
  poctScreen: boolean = false;
  noMeds: boolean = false;
  medicationNotProvided: boolean = false;
  noAllergy: boolean = false;
  isPregnant: number = 0;
  shippedOnIce: boolean = false;
  receivedOnIce: boolean = false;
  userId_Created: number = 0;
  userId_Updated: number = 0;
  userCreatedName: string = '';
  userId_Delegate: number = 0;
  userSignatureId_Physician: number = 0;
  datePhysicianSignature: string = '';
  fileAsBase64_Physician: string = "";
  fileType_Physician: string;
  patientSignatureId: number = 0;
  datePatientSignature: string = '';
  fileAsBase64_Patient: string = '';
  fileType_Patient: string;
  patientConsentOnFile: boolean = false;
  firstName: string = '';
  lastName: string = '';
  dob: string = '';
  genderId: Number = 0;
  demographisHold: boolean = false;
  collectionDevice: number = 0;
  ticketId: number = 0;

  specimens: LabOrderSpecmenItemModel[] = new Array<LabOrderSpecmenItemModel>();
  medications: LabOrderMedicationItemModel[] = new Array<LabOrderMedicationItemModel>();
  diagnosis: LabOrderDiagnosisItemModel[] = new Array<LabOrderDiagnosisItemModel>();
  allergies: LabOrderAllergyItemModel[] = new Array<LabOrderAllergyItemModel>();
  poct: LabOrderPOCTModel = new LabOrderPOCTModel();
  notes: LabOrderNoteListModel[] = new Array<LabOrderNoteListModel>();
}

export class LabOrderSpecmenItemModel {
  labOrderSpecimenId: number = 0;
  labOrderId: number = 0;
  labStatusId: number = 0;
  labStatus: string = '';
  labTypeId: number = 0;
  labType: string = '';
  specimenBarcode: string = '';
  resultedPosative: boolean = false;
  onHold: boolean = false;
  holdReleaseReason: string = '';
  collectionDate: string = '';
  noCollectionTime: boolean = false;
  receivedDate: string = '';
  accessionedDate: string = '';
  userId_Accessioned: number = 0;
  accessioner: string = '';
  labSystemDate: string = '';
  resultedDate: string = '';
  reviewedDate: string = '';
  cancelledDate: string = '';
  comment: string = '';
  requestPDF: boolean = false;
  resultPDF: boolean = false;
  missingSelection: boolean = false;
  accessioningNote: string = "";
  userId_Audited: number = 0;
  auditDate: string = '';
  version:  string = '';
  userId_Reviewed: number = 0;
  collectionDeviceId: number = 0;
  resultStausId: number = 0;
  swabLocationId: number = 0;
  swabLocation: string = '';
  tests: LabOrderTestItemModel[] = new Array<LabOrderTestItemModel>();
}

export class LabOrderTestItemModel {
  labOrderTestId: number = 0;
  labOrderSpecimenId: number = 0;
  labTestId: number = 0;
}

export class LabOrderMedicationItemModel {
  labOrderMedicationId: number = 0;
  labOrderId: number = 0;
  medicationId: number = 0;
  medicationId_Generic: number = 0;
  description: string = ''; 
}

export class LabOrderDiagnosisItemModel {
  labOrderDianosisId: number = 0;
  labOrderId: number = 0;
  icd_Version: number = 0;
  code: string = '';
  description: string = '';
}

export class LabOrderAllergyItemModel {
  labOrderAllergyId: number = 0;
  labOrderId: number = 0;
  allergyId: number = 0;
  description: string = '';
}

export class LabOrderPOCTModel {
  pocResultId_AMP: number = 0;
  pocResultId_BAR: number = 0;
  pocResultId_BUP: number = 0;
  pocResultId_BZO: number = 0;
  pocResultId_COC: number = 0;
  pocResultId_MDMA: number = 0;
  pocResultId_MET: number = 0;
  pocResultId_MTD: number = 0;
  pocResultId_OPI: number = 0;
  pocResultId_OXY: number = 0;
  pocResultId_PCP: number = 0;
  pocResultId_TCA: number = 0;
  pocResultId_THC: number = 0;
  pocResultId_FEN: number = 0;
}

export class LabOrderStatusModel{
  validation: ValidationModel = new ValidationModel;
  valid: boolean = false;
  message: string = '';
  labOrderId: number = 0;
  labOrderSpecimenId: number = 0;
  labStatusId: number = 0;
  statusDate: string = '';
  userId_Updated: number = 0;
  comment: string = '';
  mismatchDate: boolean = false;
  mismatchDOB: boolean = false;
  mismatchName: boolean = false;
  mismatchPregnant: boolean = false;
  accessioningNote: string = "";
  labId: number = 0;
  physicianHardcopy: boolean = false;
  patientHardcopy: boolean = false;
}

export class LabOrderListModel {
  valid: boolean = false;
  message: string = '';
  list: LabOrderListItemModel[] = new Array<LabOrderListItemModel>();
}

export class LabOrderListItemModel {
  labOrderId: number = 0;
  labOrderSpecimenId: number = 0;
  specimenBarcode: string = '';
  labStatusId: number = 0;
  labStatus: string = '';
  patientId: number = 0;
  patient: string = '';
  userId_Physician: number = 0;
  user_Physician: string = '';
  customerId: number = 0;
  customer: string = '';
  locationId: number = 0;
  location: string = '';
  labId: number = 0;
  lab: string = '';
  resultedPosative: boolean = false;
  onHold: boolean = false;
  collectionDate: string = '';
  receivedDate: string = '';
  accessionedDate: string = '';
  resultedDate: string = '';
  reviewedDate: string = '';
  pending: number = 0;
  turnaround: number = 0;
  labTypeId: number = 0;
  labType: string = '';
  physicianSignatureId: string = '';
  patientSignatureId: string = '';
  patientConsentOnFile: boolean = false;
  waring: number = 0;
  issue: number = 0;
  status: string = "";
  demographicsHold: boolean = false;
  checked: boolean = false;
}

export class LabOrderForAccessioningModel {
  valid: boolean = false;
  message: string = '';
  labOrderId: number = 0;
  labOrderSpecimenId: number = 0;
  specimenBarcode: string = '';
  collectionDate: string = '';
  receivedDate: string = '';
  labStatusId: number = 0;
  labStatus: string = '';
  labTypeId: number = 0;
  labType: string = "";
  patientId: number = 0;
  customerId: number = 0;
  customer: string = '';
  facilityCode: string = '';
  user_Physician: string = '';
  accessioningComment: string = '';
  isPregnant: number = 0;
  mismatchDate: boolean = false;
  mismatchDOB: boolean = false;
  mismatchName: boolean = false;
  mismatchPregnant: boolean = false;
  alreadyProcessToday: number = 0;
  toxScreen: number = 0;
  accessioningNote: string = "";
}

export class LabOrderForManifestModel {
  valid: boolean = false;
  message: string = '';
  labOrderId: number = 0;
  labId: number = 0;
  labStatusId: number;
  status: string = '';
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
  manifestSpecimenId: number = 0;

}

export class LabOrderForShipLogModel {
  valid: boolean = false;
  message: string = '';
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

}

export class LabOrderIssueModel{
  valid: boolean = false;
  message: string = '';
  releaseHold: string = '';
  issues: LabOrderIssueItemModel[] = new Array<LabOrderIssueItemModel>();
}

export class LabOrderIssueItemModel {
  labOrderIssueId: number = 0;
  labOrderId: number = 0;
  orderIssueId: number = 0;
  issue: string = "";
  policy: string = "";
}

export class LabOrderSummarySearchModel {
  customerId: number = 0;
  locationId: number = 0;
  userId: number = 0;
  labStatusId: number = 0;
  labTypeId: number = 0;
  collectionDateStart: string = '';
  collectionDateEnd: string = '';
}

export class LabOrderSummaryModel {
  valid: boolean = false;
  message: string = '';
  created: number = 0;
  received: number = 0;
  processing: number = 0;
  resulted: number = 0;
  notProcessed: number = 0;
  issue: number = 0;
  holdTotal: number = 0;
}

export class LabOrderESignModel {
  validation: ValidationModel = new ValidationModel;
  valid: boolean = false;
  message: string = '';
  labOrderId: number[] = new Array<number>();
  userSignatureId_Physician: number = 0;
  userId_Updated: number = 0;
}

export class LabOrderBatchDemographicsModel {
  validation: ValidationModel = new ValidationModel;
  valid: boolean = false;
  message: string = '';
  items: LabOrderBatchDemographicsItemModel[] = new Array<LabOrderBatchDemographicsItemModel>();
  patientId: number = 0;
  note: string = "";
  userId_Updated: number = 0;
}

export class LabOrderBatchDemographicsItemModel{
  labOrderId: number;
  description: string;
}

export class SpecimenTestModel {
  valid: boolean = false;
  message: string = '';
  tests: LabOrderTestItemModel[] = new Array<LabOrderTestItemModel>();
}

export class LabOrderAuditSearchModel {
  labId: number = 0;
  dateType: number = 0;
  startDate: string = '';
  endDate: string = '';
  labTypeId: number = 0;
  includeProcessed: boolean = false;
  customerId: number = 0;
}

export class LabOrderAuditListModel {
  valid: boolean = false;
  message: string = '';
  list: LabOrderAuditListItemModel[] = new Array<LabOrderAuditListItemModel>();
}

export class LabOrderAuditListItemModel {
  labOrderId: number = 0;
  labOrderSpecimenId: number = 0;
  specimenBarcode: string = '';
  patient: string = '';
  customer: string = '';
  status: string = '';
  lab: string = '';
  collectionDate: string = '';
  receivedDate: string = '';
  accessionedDate: string = '';
  labType: string = '';
}

export class LabOrderSpecimenInsuranceModel {
  validation: ValidationModel = new ValidationModel;
  valid: boolean = false;
  message: string = '';
  labOrderSpecimenId: number = 0;
  billingTypeId: number = 0;
  billingType: string = '';
  insuranceId_1: number = 0;
  insurance_1: string = '';
  insuranceTypeId_1: number = 0;
  insuranceType_1: string = '';
  memberId_1: string = '';
  groupNo_1: string = '';
  effectiveDate_1: string = '';
  expireDate_1: string = '';
  relationshipId_1: number = 0;
  relationship_1: string = '';
  insuranceId_2: number = 0;
  insurance_2: string = '';
  insuranceTypeId_2: number = 0;
  insuranceType_2: string = '';
  memberId_2: string = '';
  groupNo_2: string = '';
  effectiveDate_2: string = '';
  expireDate_2: string = '';
  relationshipId_2: number = 0;
  relationship_2: string = '';
}

export class LabOrderReviewModel{
  validation: ValidationModel = new ValidationModel;
  valid: boolean = false;
  labOrderId: number = 0;
  labOrderSpecimenId: number = 0;
  userId_Reviewed: number = 0;
  reviewDate: string = '';
  auditStatusTypeId: number = 0;
  auditSrdTypeId: number = 0;
  auditIncidentTypeId: number = 0;
  auditRejectionTypeId: number = 0;
  IncidentDate: string = '';
  shippingMethodId: number = 0;
  trackingNo: string = '';
  zendeskNote: string = '';
  internalNote: string = '';

}

export class LabOrderSpecimenStatusModel{
  valid: boolean = false;
  message: string = '';
  specimenBarcode: string = '';
  comment: string = '';
  statusChanges: LabOrderSpecimenStatusChangeModel[] = new Array<LabOrderSpecimenStatusChangeModel>();
}

export class LabOrderSpecimenStatusChangeModel{
  status: string = '';
  statusDate: string = '';
  user: string = '';
}

export class LabOrderPreAuthSearchModel{
  collectionDateStart: string = '';
  collectionDateEnd: string = '';
  labId: number = 0;
  labTypeId: number = 0;
  customerId: number = 0;
}
export class LabOrderPreAuthListModel {
  valid: boolean = false;
  message: string = '';
  list: LabOrderPreAuthListItemModel[] = new Array<LabOrderPreAuthListItemModel>();
}

export class LabOrderPreAuthListItemModel{
  patientId: number = 0;
  patientName: string = '';
  labOrderId: number = 0;
  collectionDate: string = '';
  specimenBarcode: string = '';
}