// Model Name    : UserSignatureModel
// Date Created  : 9/22/2022
// Written By    : Stephen Farkas
// Description   : User SignatureModel
// MM/DD/YYYY XXX Description
//
//------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------
import { ValidationModel } from './ValidationModel';

export class UserSignatureModel {
    validation: ValidationModel = new ValidationModel;
    valid: boolean = false;
    message: string = '';
    userSignatureId: number = 0;
    userId: number = 0;
    dateCreated: string = '';
    fileType: string;
    fileAsBase64: string = "";
}