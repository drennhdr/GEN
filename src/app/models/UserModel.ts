// Model Name    : UserModel
// Date Created  : 8/1/2022
// Written By    : Stephen Farkas
// Description   : User Model
// MM/DD/YYYY XXX Description
// 11/15/2022 SJF Added userLab
//------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------
import { ValidationModel } from './ValidationModel';

export class UserSearchModel {
  customerId: number = 0;
  lastName: string = '';
  firstName: string = '';
  physicianOnly: boolean = false;
  paroleOfficer: boolean = false;
}

export class UserModel {
  validation: ValidationModel = new ValidationModel;
  valid: boolean = false;
  message: string = '';
  userId: number = 0;
  customerId: number = 0;
  userName: string = '';
  password: string = '';
  disabled: boolean = false;
  changePwd: boolean = false;
  userTypeId: number = 0;
  userType: string = '';
  lastName: string = '';
  firstName: string = '';
  prefix: string = '';
  suffix: string = '';
  physician: boolean = false;
  npi: string = '';
  email: string = '';
  phoneWork: string = '';
  phoneWorkExt: string = '';
  phoneCell: string = '';
  userSignatureId: number = 0;
  signature: Uint8Array;
  pecosEnrolled: boolean = false;
  viewEmployeeResults: boolean = false;
  barcodePrinter: string = '';
  barcodeQty: number = 0;
  camera: boolean = false;
  shipLog: boolean = false;
  salesUserEdit: boolean = false;
  salesPatientReport: boolean = false;
  customerName: string = '';
  userId_Updated: number = 0;
  labs: UserLabModel[] = new Array<UserLabModel>
  delegates: UserDelegateItemModel[] = new Array<UserDelegateItemModel>;
  topMessage:string;
  multiLogin: boolean = false;
  accounts: UserAccountListItem[] = new Array<UserAccountListItem>;
}

export class UserAccountListItem{
  userId: number = 0;
  customerId: number = 0;
  customerName: string;
}

export class UserListModel {
  valid: boolean = false;
  message: string = '';
  list: UserListItemModel[] = new Array<UserListItemModel>();
}

export class UserListItemModel {
  userId: number = 0;
  customerId: number = 0;
  userName: string = '';
  disabled: boolean = false;
  enabledYN: string = "";
  userTypeId: number = 0;
  userType: string = '';
  lastName: string = '';
  firstName: string = '';
  physician: boolean = false;
  physicianYN: string = "";
  email: string = '';
  delegate: string = '';
}


// export class UserLocationListModel {
//   list: UserLocationModel[] = new Array<UserLocationModel>();
// }

export class UserLocationModel {
  locationId: number = 0;
  locationName: string = '';
}

export class UserLabModel {
  labId: number = 0;
  labName: string = '';
}

export class UserDelegateModel{
  validation: ValidationModel = new ValidationModel;
  valid: boolean = false;
  message: string = '';
  userId: number = 0;
  delegates: UserDelegateItemModel[] = new Array<UserDelegateItemModel>;
}

export class UserDelegateItemModel{
  userId: number = 0;
  userId_Delegate: number = 0;
}

// export class UserModel2 {
//     validation: ValidationModel = new ValidationModel;
//     valid: boolean = false;
//     message: string = '';
//     userId: number = 0;
//     firstName: string = '';
//     lastName: string = '';
//     email: string = '';
//     password: string = '';
//     userTypeId: number = 0;
//     entityId: number = 0;
//     entityName: string = '';
//     language: string = 'en';
// 	createOrder: number = 0;
// 	processOrder: number = 0;
// 	shipment: number = 0;
// 	entity: number = 0; 
// 	reports: number = 0; 
//     transactionManagement: number = 0; 
//     customerService: number = 0;
//     invoice: number = 0;
//     admin: number = 0;
//     contract: number = 0;
//     ticket: number = 0;
//     leads: number = 0;
//     salesTeam: number = 0;
//     widget1: number = 0;
//     widget2: number = 0;
//     widget3: number = 0;
//     widget4: number = 0;
//     widget5: number = 0;
 
//     userId_Updated: number = 0;
// }

