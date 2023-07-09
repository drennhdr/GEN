// Model Name    : VirtualEarthModel
// Date Created  : 10/24/2022
// Written By    : Stephen Farkas
// Description   : VirtualEarthModel Model
// MM/DD/YYYY XXX Description
//
//------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------

import { AddressModel } from "./AddressModel";

export class VirtualEartTrafficModel {
    resourceSets: ResourceSetModel[] = new Array<ResourceSetModel>();
    statusCode: number;
}

export class ResourceSetModel{
    resources: ResourcesModel[] = new Array<ResourcesModel>();
}

export class ResourcesModel{
    address: ResourceAddressModel;
}

export class ResourceAddressModel{
    locality: string = '';
    adminDistrict: string = '';
    adminDistrict2: string = '';
}
  
  