export class CodeListModel {
    valid: boolean = false;
    message: string = '';
    list0: CodeItemModel[] = new Array<CodeItemModel>();
    list1: CodeItemModel[] = new Array<CodeItemModel>();
    list2: CodeItemModel[] = new Array<CodeItemModel>();
    list3: CodeItemModel[] = new Array<CodeItemModel>();
    list4: CodeItemModel[] = new Array<CodeItemModel>();
    list5: CodeItemModel[] = new Array<CodeItemModel>();
    list6: CodeItemModel[] = new Array<CodeItemModel>();
    list7: CodeItemModel[] = new Array<CodeItemModel>();
}
export class CodeItemModel {
    id: number = 0;
    description: string = '';
}

export class CodeAlphaListModel {
    valid: boolean = false;
    message: string = '';
    list0: CodeAlphaItemModel[] = new Array<CodeAlphaItemModel>();
    list1: CodeAlphaItemModel[] = new Array<CodeAlphaItemModel>();
    list2: CodeAlphaItemModel[] = new Array<CodeAlphaItemModel>();
    list3: CodeAlphaItemModel[] = new Array<CodeAlphaItemModel>();
    list4: CodeAlphaItemModel[] = new Array<CodeAlphaItemModel>();
    list5: CodeAlphaItemModel[] = new Array<CodeAlphaItemModel>();
    list6: CodeAlphaItemModel[] = new Array<CodeAlphaItemModel>();
    list7: CodeAlphaItemModel[] = new Array<CodeAlphaItemModel>();
}
export class CodeAlphaItemModel {
    id: string = '';
    description: string = '';
}

export class CountryListModel {
    valid: boolean = false;
    message: string = '';
    list: CountryItemModel[] = new Array<CountryItemModel>();
}
export class CountryItemModel {
    countryCode: string = "";
    countryCode2: string = "";
    name: string = '';
    dialCode: string = "";
    addressFormat: number = 0;
}

export class BillingCodeListModel {
    valid: boolean = false;
    message: string = '';
    list: BillingCodeItemModel[] = new Array<BillingCodeItemModel>();
}
export class BillingCodeItemModel {
    id: string = "";
    description: string = '';
}