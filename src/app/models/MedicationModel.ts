// Model Name    : MedicationModel
// Date Created  : 8/24/2022
// Written By    : Stephen Farkas
// Description   : Medication Model
// MM/DD/YYYY XXX Description
//
//------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------
export class MedicationSearchModel {
    medicationName: string = "";
}

export class MedicationListModel {
    valid: boolean = false;
    message: string = '';
    list: MedicationListItemModel[] = new Array<MedicationListItemModel>();
}

export class MedicationListItemModel {
    medicationId: number = 0;
    description: string = '';
}