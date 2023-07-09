// Model Name    : LocationModel
// Date Created  : 8/1/2022
// Written By    : Stephen Farkas
// Description   : Location Model
// MM/DD/YYYY XXX Description
//
//------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------
import { AddressModel } from './AddressModel';
import { ValidationModel } from './ValidationModel';

export class LocationSearchModel {
  CustomerId: number = 0;
}

export class LocationModel {
  validation: ValidationModel = new ValidationModel;
  valid: boolean = false;
  message: string = '';
  locationId: number = 0;
  primary: boolean = false;
  customerId: number = 0;
  locationName: string = '';
  specialtyId: number = 0;
  residentialFacility: boolean = false;
  address: AddressModel = new AddressModel;
  phone: string = '';
  fax: string = '';
  email: string = '';
  timeZoneId: number = 0;
  sendFax: boolean = false;
  faxStartDate: string = '';
  faxBatch: boolean = false;
  sendEmail: boolean = false;
  pickupDay: string = '';
  shipingMethodId_Preferred: number = 0;
  npi: string = '';
  clinicHoursMonday: string = '';
  clinicHoursTuesday: string = '';
  clinicHoursWednesday: string = '';
  clinicHoursThursday: string = '';
  clinicHoursFriday: string = '';
  clinicHoursSaturday: string = '';
  userId_Updated: number = 0;
  notificationEmailSend: boolean = false;
  notificationEmail: string = '';
  notificationTextSend: boolean = false;
  notificationText: string = '';

  pickupMonday: boolean = false;
  pickupTuesday: boolean = false;
  pickupWednesday: boolean = false;
  pickupThursday: boolean = false;
  pickupFriday: boolean = false;
  pickupSaturday: boolean = false;
}

export class LocationListModel {
  valid: boolean = false;
  message: string = '';
  list: LocationListItemModel[] = new Array<LocationListItemModel>();
}

export class LocationListItemModel {
  locationId: number = 0;
  locationName: string = '';
  area: string = '';
  phone: string = '';
  email: string = '';
}
