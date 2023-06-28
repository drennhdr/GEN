// Model Name    : CustomerAttachmentModel
// Date Created  : 8/1/2022
// Written By    : Stephen Farkas
// Description   : CustomerAttachment Model
// MM/DD/YYYY XXX Description
//
//------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------
import { ValidationModel } from './ValidationModel';

export class CustomerAttachmentSearchModel {
    customerId: string = '';
  }
  
  export class CustomerAttachmentModel {
    validation: ValidationModel = new ValidationModel;
    valid: boolean = false;
    message: string = '';
    customerAttachmentId: number = 0;
    customerId: number = 0;
    dateCreated: string = '';
    title: string = '';
    description: string = '';
    fileType: string;
    userId_Created: number = 0;
    createdBy: string = '';
    fileAsBase64: string = "";
  }
  
  export class CustomerAttachmentListModel {
    valid: boolean = false;
    message: string = '';
    list: CustomerAttachmentListItemModel[] = new Array<CustomerAttachmentListItemModel>();
  }
  
  export class CustomerAttachmentListItemModel {
    customerAttachmentId: number = 0;
    customerId: number = 0;
    dateCreated: string = '';
    title: string = '';
    description: string = '';
  }
