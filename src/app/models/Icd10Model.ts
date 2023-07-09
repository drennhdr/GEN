// Model Name    : Icd10Model
// Date Created  : 8/25/2022
// Written By    : Stephen Farkas
// Description   : Icd10 Model
// MM/DD/YYYY XXX Description
//
//------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------
export class Icd10SearchModel {
    description: string = "";
}

export class Icd10ListModel {
    valid: boolean = false;
    message: string = '';
    list: Icd10ListItemModel[] = new Array<Icd10ListItemModel>();
}

export class Icd10ListItemModel {
    icD10Code: string = "";
    description: string = '';
}