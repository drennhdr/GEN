// Model Name    : AllergyModel
// Date Created  : 8/29/2022
// Written By    : Stephen Farkas
// Description   : Allergy Model
// MM/DD/YYYY XXX Description
//
//------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------
export class AllergySearchModel {
    description: string = "";
}

export class AllergyListModel {
    valid: boolean = false;
    message: string = '';
    list: AllergyListItemModel[] = new Array<AllergyListItemModel>();
}

export class AllergyListItemModel {
    allergyId: number = 0;
    description: string = '';
}