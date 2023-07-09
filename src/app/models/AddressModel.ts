// Model Name    : AddressModel
// Date Created  : 8/1/2022
// Written By    : Stephen Farkas
// Description   : Address Model
// MM/DD/YYYY XXX Description
//
//------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------

export class AddressModel {
  valid: boolean = false;
  message: string = '';
  addressId: number = 0;
  street1: string = '';
  street2: string = '';
  city: string = '';
  county: string = '';
  state: string = '';
  postalCode: string = '';
  countryCode: string = '';
  latitude: number = 0;
  longitude: number = 0;
}

