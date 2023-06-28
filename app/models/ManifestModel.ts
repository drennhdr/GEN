// Model Name    : ManifestModel
// Date Created  : 9/21/2022
// Written By    : Stephen Farkas
// Description   : Manifest Model
// MM/DD/YYYY XXX Description
//
//------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------
import { ValidationModel } from './ValidationModel';

export class ManifestSearchModel {
  LabId: number = 0;
  StartDate: string = '';
  EndDate: string = '';
}

export class ManifestModel {
  validation: ValidationModel = new ValidationModel;
  valid: boolean = false;
  message: string = '';
  manifestId: number = 0;
  status: number = 0;
  labId: number = 0;
  lab: string = '';
  dateCreated: string = '';
  sequence: number = 0;
  userId_Updated: number = 0;
  trackingNo: string = '';
  specimens: ManifestSpecimenModel[] = new Array<ManifestSpecimenModel>();
}

export class ManifestSpecimenModel {
  manifestSpecimenId: number = 0;
  manifestId: number = 0;
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
  labStatusId: number = 0;
  labStatus: string = "";
  resultPDF: boolean = false;
  checked: boolean = false;
}

export class ManifestListModel {
  valid: boolean = false;
  message: string = '';
  list: ManifestListItemModel[] = new Array<ManifestListItemModel>();
}

export class ManifestListItemModel {
  manifestId: number = 0;
  status: number = 0;
  labId: number = 0;
  lab: string = '';
  dateCreated: string = '';
  sequence: number = 0;
  userId_Updated: number = 0;
}
