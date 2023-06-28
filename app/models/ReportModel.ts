// Model Name    : ReportModel
// Date Created  : 2/27/2023
// Written By    : Stephen Farkas
// Description   : Report Model
// MM/DD/YYYY XXX Description
//
//------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------
import { ValidationModel } from './ValidationModel';

export class AccessionedReportModel {
    valid: boolean = false;
    message: string = '';
    items: AccessionedReportItemModel[] = new Array<AccessionedReportItemModel>();
}

export class AccessionedReportItemModel {
    userId_Accessioned: number = 0;
    Accessioner: string = "";
    accessionedDate: string = "";
    toxUrine: number = 0;
    toxUrinePaper: number = 0;
    toxOral: number = 0;
    toxOralPaper: number = 0;
    gpp: number = 0;
    gppPaper: number = 0;
    uti: number = 0;
    utiPaper: number = 0;
    rpp: number = 0;
    rppPaper: number = 0;
}

export class SalesReportModel {
    valid: boolean = false;
    message: string = '';
    items: SalesReportItemModel[] = new Array<SalesReportItemModel>();
}

export class SalesReportItemModel {
    customerId: number = 0;
    customer: string = "";
    year: number = 0;
    month: number = 0;
    week: number = 0;
    sunday: string = '';
    toxUrine: number = 0;
    toxOral: number = 0;
    gpp: number = 0;
    uti: number = 0;
    rpp: number = 0;
}

export class CETIssueReportModel {
    valid: boolean = false;
    message: string = '';
    openTickets: number = 0;
    currentTickets: number = 0;
    lastMonthTickets: number = 0;
    secondMonthTickets: number = 0;
    items: CETIssueReportItemModel[] = new Array<CETIssueReportItemModel>();
}

export class CETIssueReportItemModel {
    customerId: number = 0;
    customer: string = '';
    missingName: number = 0;
    mismatchName: number = 0;
    missingAddress: number = 0;
    missingDOB: number = 0;
    mismatchDOB: number = 0;
    mismatchPregnant: number = 0;
    patientSignature: number = 0;
    providerSignature: number = 0;
    mismatchDate: number = 0;
}

export class CETRejectReportModel {
    valid: boolean = false;
    message: string = '';
    currentReject: number = 0;
    lastMonthReject: number = 0;
    secondMonthReject: number = 0;
    items: CETRejectReportItemModel[] = new Array<CETRejectReportItemModel>();
}

export class CETRejectReportItemModel {
    customerId: number = 0;
    customer: string = '';
    stability: number = 0;
    quantity: number = 0;
    identifier: number = 0;
    device: number = 0;
}