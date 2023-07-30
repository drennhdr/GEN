//Page Name       : Customer
//Date Created    : 08/02/2022
//Written By      : Stephen Farkas
//Description     : Customer Entry / Edit
//MM/DD/YYYY xxx  Description
//11/10/2022 SJF  Added physician preference detail
//01/08/2023 SJF Added allowSelfPay, requireInsurance
//02/15/2023 SJF Added Facility Code to search
//03/30/2023 SJF Added AccountIncidentButton
//04/06/2023 SJF Added DataShareService & check for data change on cancel/exit
//04/10/2023 SJF Added DeleteAttachment
//05/01/2023 SJF  Changed to new oral tox method
//07/06/2023 SJF Added upload physician signature
//07/12/2023 SJF Added delegate setup to users
//07/15/2023 SJF Added alternate login id option
//07/20/2023 SJF Added Setting a temporary user password
//07/24/2023 SJF Added email check
//07/28/2023 SJF Added sales edit users based on flag on user 
//-----------------------------------------------------------------------------
// Data Passing
//-----------------------------------------------------------------------------
import { Component, OnInit, AfterViewChecked, ViewChild, ElementRef, HostListener } from '@angular/core';
import { first } from 'rxjs/operators';
import {formatDate} from '@angular/common';

import { CustomerService } from '../../services/customer.service';
import { CodeService } from '../../services/code.service';
import { LocationService } from '../../services/location.service';
import { UserService } from '../../services/user.service';
import { VirtualEarthService } from '../../services/virtualEarth.service';
import { PhysicianPreferenceService } from '../../services/physicianPreference.service';
import { LabOrderService } from '../../services/labOrder.service';
import jsPDF from 'jspdf';

import { CustomerModel, CustomerLcsModel } from '../../models/CustomerModel';
import { LocationModel, LocationListItemModel } from '../../models/LocationModel';
import { CustomerAttachmentModel, CustomerAttachmentListItemModel} from '../../models/CustomerAttachmentModel';
import { CustomerNoteListModel, CustomerNoteListItemModel, CustomerNoteModel} from '../../models/CustomerNoteModel';
import { UserModel, UserListItemModel, UserListModel, UserLocationModel, UserDelegateModel, UserDelegateItemModel } from '../../models/UserModel';
import { CodeItemModel } from '../../models/CodeModel';
import { UserSignatureModel } from '../../models/UserSignatureModel';
import { Observable, ReplaySubject } from 'rxjs';
import { Router } from '@angular/router';
import { DataShareService } from '../../services/data-share.service';

// import { stringify } from 'querystring';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.css']
})
export class CustomerComponent implements OnInit, AfterViewChecked {
  // Variable to control access level - View
  accessLevel: number = 0;
  salesFlag: boolean = false;
  // Variables to hold screen data
  customerId: number = 0;
  customerSearchData: any;
  customerData: any;
  locationData: any;
  userData: any;
  attachmentData: any;
  physicianSignatureData: any;
  noteData: any;
  preferenceData: any;
  showError: boolean;
  errorMessage: string;

  // Search Variables
  searchName: string;
  searchCity: string;
  searchState: string;
  searchCode: string;
  searchActive: number;
  searchRegion: number;
  searchAM: number;
  searchTM: number;
  searchRM: number;
  searchLCS: number;
  userType: number;


  // Variables to control screen display
  showSearch: boolean;
  showSearchList: boolean;
  showCustomer: boolean;
  showLocationList: boolean;
  showLocationEdit: boolean;
  showUserList: boolean;
  showUserEdit: boolean;
  showAttachmentList: boolean;
  showAttachmentEdit: boolean;
  showNoteList: boolean;
  showNoteEdit: boolean;
  showPreferenceList: boolean;
  showToxUrine: boolean;
  showToxOral: boolean;
  location: string = '';
  invalidEmail: boolean = false;

  acctachmentDisabled: boolean;
  customerSave: boolean;
  customerSaveButton: string = "Save";
  locationSave: boolean;
  userSave: boolean;
  attachmentSave: boolean;
  attachmentDisabled: boolean;
  noteSave: boolean;
  noteDisabled: boolean;

  // Variables for drop down data
  activeSearchList: any;
  regionSearchList: any;
  amSearchList: any;
  tmSearchList: any;
  rmSearchList: any;
  attachmentTypeList: any;

  locationSelected: any;
  lcsSelected: any;
  lcsList: any;

  userList: any;
  delegateList: any;

  accountTypeList: any;
  billingTypeList: any;
  specialtyList: any;
  timeZoneList: any;
  shippingMethodList: any;
  regionList: any;
  amList: any;
  tmList: any;
  rmList: any;
  labRPPList: any;
  labUTIList: any;
  labGPPList: any;
  labToxUrineList: any;
  labToxOralList: any;
  labUrinalysisList: any;
  labHematologyList: any;
  userSiteAdmin: boolean;
  delegateAdd: boolean;

  fileUploaded:boolean = false;
  fileScanned: boolean = false;

  // Physician Preferrence - Urine
  presumptiveTesting15: boolean;
  presumptiveTesting13: boolean;
  alcohol: any;
  antidepressants: any;
  antipsychotics: any;
  benzodiazepines: any;
  cannabinoids: any;
  cannabinoidsSynth: any;
  dissociative: any;
  gabapentinoids: any;
  hallucinogens: any;
  illicit: any;
  kratom:boolean = false;
  opioidAgonists: any;
  opioidAntagonists: any;
  sedative: any;
  skeletal: any;
  stimulants: any;
  thcSource:boolean = false;

  // Physician Preferences - Oral
  oralIllicit: any;
  oralSedative: any;
  oralBenzodiazepines: any;
  oralMuscle: any;
  oralAntipsychotics: any;
  oralAntidepressants: any;
  oralStimulants: any;
  oralKratom: any;
  oralNicotine: any;
  oralOpioidAntagonists: any;
  oralGabapentinoids: any;
  oralDissociative: any;
  oralOpioidAgonists: any;

  signatureMessage: string;

  // Camera Variables
  picWidth = 600; //480;
  picHeight = 800;// 640;

  @ViewChild("video")
  public video: ElementRef;

  @ViewChild("canvas")
  public canvas: ElementRef;

  captures: string[] = [];
  error: any;
  isCaptured: boolean = false;
  cameraOn: boolean;

  // Temporary Pwd
  tempPwd: string = "";
  tempPwdFlag: boolean = false;
  pwdError: string = "";

  salesEdit: number = 0;

  constructor(
    private customerService: CustomerService,
    private codeService: CodeService,
    private locationService: LocationService,
    private userService: UserService,
    private virtualEarthService: VirtualEarthService,
    private physicianPreferenceService: PhysicianPreferenceService,
    private labOrderService: LabOrderService,
    private router: Router,
    private dataShareService: DataShareService,
  ) { 
  }

  ngOnInit(): void {   
    this.dataShareService.changeUnsaved(false);

    if (sessionStorage.getItem('userId_Login') == ""){
      this.router.navigateByUrl('/login');
    }

    // Initialize screen handling variables
    this.showSearch = true;
    this.showSearchList = false;
    this.showCustomer = false;
    this.showLocationList = false;
    this.showError = false;
    this.delegateAdd = false;


    this.userType = Number(sessionStorage.getItem('userType'));
    var userId = Number(sessionStorage.getItem('userId_Login'));
    this.salesEdit = Number(sessionStorage.getItem('salesUserEdit'));

    if (this.userType == 1){
      // Admin
      this.accessLevel = 1; // full
      this.salesFlag = false;
    }
    else if (this.userType == 3){
      // Customer Admin
      this.accessLevel = 3; // view only my location - customer admin
      this.salesFlag = false;
    }
    else if (this.userType == 4){
      // Corp Exec
      this.accessLevel = 2; // view only
      this.salesFlag = false;
    }
    else if (this.userType == 7){
      // CET
      this.accessLevel = 1; // full
      this.salesFlag = false;
    }
    else if (this.userType == 8){
      // CET Admin
      this.accessLevel = 1; // full
      this.salesFlag = false;
    }
    else if (this.userType == 9){
      // AM
      this.accessLevel = 2; // view only
      this.searchAM = userId;
      this.salesFlag = true;
    }
    else if (this.userType == 10){
      // TM
      this.accessLevel = 2; // view only
      this.searchTM = userId;
      this.salesFlag = true;
    }
    else if (this.userType == 11){
      // RM
      this.accessLevel = 4; // Update
      this.searchRM = userId;
      this.salesFlag = true;
    }
    else if (this.userType == 12 || this.userType == 13){
      // LCS
      this.accessLevel = 2; // Update
      this.searchLCS = userId;
      this.salesFlag = true;
    }
    else{
      this.accessLevel = 2; // view only
      this.salesFlag = true;
    }

    this.loadSearchDropdownLists();
    this.loadDropdownLists();

    if (this.accessLevel == 3){
      var customerId = Number(sessionStorage.getItem('entityId_Login'));
      this.selectButtonClicked(customerId);
    }
    else{
      this.searchName = "";
      this.searchActive = 1;
      this.searchCity = "";
      this.searchState = "";
      this.searchRegion = 0;
    }
    if (!this.salesFlag){
      this.searchAM = 0;
      this.searchTM = 0;
      this.searchRM = 0;
    }

  }

  @HostListener('document:keyup', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key == 'Enter'){
      if (this.showSearch) {
        this.searchButtonClicked();
      }      
    }
  }

  ngAfterViewChecked(){
    if (this.location == ""){
    }
    else if (this.location == "locationList"){
      var elmnt = document.getElementById("locationListCard");
      elmnt.scrollIntoView();
    }
    else if (this.location == "noteList"){
      const elmnt = document.getElementById("noteListCard");
      elmnt.scrollIntoView();
    }
    else if (this.location == "attachmentList"){
      const elmnt = document.getElementById("attachmentListCard");
      elmnt.scrollIntoView();
    }
    else if (this.location == "userList"){
      var elmnt = document.getElementById("userListCard");
      elmnt.scrollIntoView(false);
    }
    else if (this.location == "preferenceList"){
      var elmnt = document.getElementById("preferenceListCard");
      elmnt.scrollIntoView(false);
    }
    this.location = '';
  }
  

  searchButtonClicked(){
    this.showError = false;
    this.customerService.search(  this.searchName,
                                  this.searchActive,
                                  this.searchCity,
                                  this.searchState,
                                  this.searchCode,
                                  this.searchRegion,
                                  this.searchAM,
                                  this.searchTM,
                                  this.searchRM,
                                  this.searchLCS )
        .pipe(first())
        .subscribe(
            data => {
              if (data.valid)
              {
                // console.log("Customer Search Data",this.customerSearchData);
                //this.router.navigate([this.dashboardUrl]);
                this.customerSearchData = data.list;
                if(this.customerSearchData.length == 0){
                    this.showSearchList = false;
                    this.showCustomer = false;
                    this.errorMessage = "No records found";
                    this.showError = true;
                }
                else{
                    this.showSearchList = true;
                    this.showCustomer = false;
                    this.errorMessage = "";
                }
              }
              else if (data.message == "No records found")
              {
                this.errorMessage = "No records found";
                this.showSearchList = false;
                this.showCustomer = false;
                this.showError = true;
              }
              else
              {
                this.errorMessage = data.message;

              }
            },
            error => {
              this.errorMessage = error;
              this.showError = true;
            });
  }

  clearSearchButtonClicked(){
    this.searchName = "";
    this.searchActive = 1;
    this.searchCity = "";
    this.searchState = "";
    this.searchCode = "";
    this.searchRegion = 0;
    if (!this.salesFlag){
      this.searchAM = 0;
      this.searchTM = 0;
      this.searchRM = 0;
    }
    
  }

  selectButtonClicked(customerId: number){

    // Call the customer service to get the data for the selected customer
    this.customerService.get( customerId)
            .pipe(first())
            .subscribe(
            data => {
              if (data.valid)
              {
                
                this.customerId = data.customerId;

                this.errorMessage = "";
                this.showError = false;
                this.customerData = data;

                // Set up list of lcs for customer.
                var cntr: number = 1;
                this.lcsSelected = [];
                if (this.customerData.lcs != null){
                  this.customerData.lcs.forEach( (item) =>{
                    this.lcsSelected[cntr] = item.userId;
                    cntr++;
                  });
                }
                this.showSearch = false;
                this.showSearchList = false;
                this.showCustomer = true;
                this.showLocationList = true;
                this.showUserList = true;
                this.showAttachmentList = true;
                this.showNoteList = true;
                this.showPreferenceList = true;

                this.customerSave = false;
                this.customerSaveButton = "Save";
                this.locationSave = false;
                this.userSave = false;
              }
              else
              {
                //this.errorMessage = data.message;
              }
            },
            error => {
              this.errorMessage = error;
              this.showError = true;
            });
  }

  customerChanged(){
    this.customerSave = false;
    if (this.customerData.name != "" 
      && this.customerData.contactName !="" && this.customerData.contactPosition !=""
      && this.customerData.contactEmail !=""){
      this.customerSave = true;
    }

    this.dataShareService.changeUnsaved(true);
  }

  addButtonClicked(){
    // Initialze data to a blank record
    this.customerData = new CustomerModel();
    this.customerData.contractId = 0;
    this.customerData.locations = new Array<LocationListItemModel>();
    
    // Set screen handling variables
    this.showSearch = false;
    this.showSearchList = false;
    this.showCustomer = true;
    this.customerSave = false;
    this.locationSave = false;
    this.userSave = false;
    
    this.errorMessage = "";
    this.showError = false;
    this.customerSaveButton = "Save & Continue";
                
  }

  saveButtonClicked() {
    this.customerData.lcs = new Array<CustomerLcsModel> 
    var cntr: number = 1;
    // console.log ("LCS Selected",this.lcsSelected);
    if (this.lcsSelected != null){
      this.lcsSelected.forEach( (item) =>{
        var item2 = new CustomerLcsModel();
        item2.userId = item;
        this.customerData.lcs.push(item2);
      });
    }

    this.customerSave = false;
    this.showError = false;
    
    this.customerService.save( this.customerData)
          .pipe(first())
          .subscribe(
          data => {
            if (data.valid) {
              if (this.customerId == 0){
                // New Customer
                this.customerId = Number(data.id);
                this.customerData.customerId = this.customerId;
                this.customerSaveButton = "Save";
                this.showSummaryItems();
              }
              else{
                // Existing Customer
                this.showSearch = true;
                this.showSearchList = true;
                this.hideSummaryItems();
                
                // Update list
                this.searchButtonClicked();

                this.dataShareService.changeUnsaved(false);
                var cng = false;
                this.dataShareService.unsaved.subscribe(data=>{
                  cng = data;
                });
              }
            }
            else{
              this.errorMessage = data.message;
              this.showError = true;
              this.customerSave = true;
            }
          },
          error => {
            this.errorMessage = error;
            this.showError = true;
            this.customerSave = true;
          });
  }

  reviewedButtonClicked(){
    this.showError = false;
    this.customerService.reviewed( this.customerData)
          .pipe(first())
          .subscribe(
          data => {
            if (data.valid) {
              this.customerData.userId_Reviewed = sessionStorage.getItem('userId_Login');
              this.customerData.stamp = this.customerData.stamp.replace('Reviewed: 01-01-00 12:00 -', 'Reviewed: ' + formatDate(new Date() , 'MM-dd-yyyy HH:mm', 'en'));
            }
            else{
              this.errorMessage = data.message;
              this.showError = true;
            }
          },
          error => {
          this.errorMessage = error;
          this.showError = true;
          });
  }

  backButtonClicked() {
    var cng = false;
    this.dataShareService.unsaved.subscribe(data=>{
      cng = data;
    });
    if (cng){
      if (confirm("WARNING: You have unsaved changes. Press Cancel to go back and save these changes, or OK to lose these changes."  )){
        cng = false;
      }
    }
    if (!cng){
        this.showSearch = true;
        this.showSearchList = true;
        this.showCustomer = false;
        this.showLocationList = false;
        this.showLocationEdit = false;
        this.showUserList = false;
        this.showUserEdit = false;
        this.showAttachmentList = false;
        this.showAttachmentEdit = false;
        this.showNoteList = false;
        this.showNoteEdit = false;
        this.showPreferenceList = false;
        this.showToxUrine = false;
        this.showToxOral = false;

        this.dataShareService.changeUnsaved(false);
      
    }
  }

  hideSummaryItems(){
    // Hide summary items
    this.showCustomer = false;
    this.showLocationList = false;
    this.showUserList = false;
    this.showAttachmentList = false;
    this.showNoteList = false;
    this.showPreferenceList = false;
  }

  showSummaryItems(){
    // Show summary items
    this.showCustomer = true;
    this.showLocationList = true;
    this.showUserList = true;
    this.showAttachmentList = true;
    this.showNoteList = true;
    this.showPreferenceList = true;
  }

  // Locations

  selectLocationButtonClicked(locationId: number){
    // Call the location service to get the data for the selected location
    this.locationService.get( locationId)
            .pipe(first())
            .subscribe(
            data => {
              if (data.valid)
              {
                this.errorMessage = "";
                this.showError = false;
                this.locationSave = false;
                this.locationData = data;

                this.hideSummaryItems();

                this.showLocationEdit = true;

                // Set pickup day checkboxes

                this.locationData.pickupMonday = Number(data.pickupDay.substring(0,1));
                this.locationData.pickupTuesday = Number(data.pickupDay.substring(1,2));
                this.locationData.pickupWednesday = Number(data.pickupDay.substring(2,3));
                this.locationData.pickupThursday = Number(data.pickupDay.substring(3,4));
                this.locationData.pickupFriday = Number(data.pickupDay.substring(4,5));
                this.locationData.pickupSaturday = Number(data.pickupDay.substring(5,6));

                // Position screen
                var elmnt = document.getElementById("topOfScreen");
                elmnt.scrollIntoView();
                     
              }
              else
              {
                //this.errorMessage = data.message;
              }
            },
            error => {
              this.errorMessage = error;
              this.showError = true;
            });

  }

  addLocationButtonClicked(){
    this.locationData = new LocationModel();
    this.locationData.customerId = this.customerId;
    this.locationData.locationId = 0;
    this.locationSave = false;
    this.hideSummaryItems();

    this.showLocationEdit = true;
    // Position screen
    var elmnt = document.getElementById("topOfScreen");
    elmnt.scrollIntoView();
  }

  locationChanged(){
    this.locationSave = false;
    if (this.locationData.locationName != "" && this.locationData.phone !=""
      && this.locationData.address.street1 !="" && this.locationData.address.postalCode !=""
      && this.locationData.address.city !=""){
      this.locationSave = true;
    }
    this.dataShareService.changeUnsaved(true);
  }

  saveLocationButtonClicked(){
    // Put dates back into string
    this.errorMessage = "";
    this.showError = false;
    this.locationSave = false;
    if (this.locationData.pickupMonday) {
      this.locationData.pickupDay = "1";  
    }
    else{
      this.locationData.pickupDay = "0";  
    }
    if (this.locationData.pickupTuesday) {
      this.locationData.pickupDay = this.locationData.pickupDay + "1";  
    }
    else{
      this.locationData.pickupDay = this.locationData.pickupDay + "0"; 
    }
    if (this.locationData.pickupWednesday) {
      this.locationData.pickupDay = this.locationData.pickupDay + "1";  
    }
    else{
      this.locationData.pickupDay = this.locationData.pickupDay + "0";  
    }
    if (this.locationData.pickupThursday) {
      this.locationData.pickupDay = this.locationData.pickupDay + "1";   
    }
    else{
      this.locationData.pickupDay = this.locationData.pickupDay + "0"; 
    }
    if (this.locationData.pickupFriday) {
      this.locationData.pickupDay = this.locationData.pickupDay + "1";  
    }
    else{
      this.locationData.pickupDay = this.locationData.pickupDay + "0";  
    }
    if (this.locationData.pickupSaturday) {
      this.locationData.pickupDay = this.locationData.pickupDay + "1";  
    }
    else{
      this.locationData.pickupDay = this.locationData.pickupDay + "0";  
    }

    this.locationData.pickupDay = this.locationData.pickupDay + "0";  
    this.locationService.save( this.locationData)
    .pipe(first())
    .subscribe(
    data => {
      if (data.valid) {
        // Update list
        if (this.locationData.locationId == 0){
          // This is a new location
          var item = new LocationListItemModel();
          item.locationId = parseInt(data.id);
          item.locationName = this.locationData.locationName;
          item.area = this.locationData.address.city + ' ' + this.locationData.address.state;
          item.phone = this.locationData.phone;
          item.email = this.locationData.email;

          if (this.customerData.locations == null){
            this.customerData.locations = new Array<LocationListItemModel>();
          }
          this.customerData.locations.push(item);
          
        }
        else {
          // Find in list and change
          for (let item of this.customerData.locations){
            if (item.locationId == this.locationData.locationId){
              item.locationName = this.locationData.locationName;
              item.area = this.locationData.address.city + ' ' + this.locationData.address.state;
              item.phone = this.locationData.phone;
              item.email = this.locationData.email;
            }
          }
        }

        this.showLocationEdit = false;
        this.dataShareService.changeUnsaved(false);
        this.showSummaryItems();
        // Position screen
        this.location="locationList";
      }
      else{
        this.errorMessage = data.message;
        this.showError = true;
        this.locationSave = true;
      }
    },
    error => {
      this.errorMessage = error;
      this.showError = true;
      this.locationSave = true;
    });
  }

  cancelLocationButtonClicked(){
    var cng = false;
    this.dataShareService.unsaved.subscribe(data=>{
      cng = data;
    });
    if (cng){
      if (confirm("WARNING: You have unsaved changes. Press Cancel to go back and save these changes, or OK to lose these changes."  )){
        cng = false;
      }
    }
    if (!cng){
      this.showLocationEdit = false;
      this.showSummaryItems();
      // Position screen
      this.location="locationList";
    }
  }

  zipKeypress(event: any){
    if (event.target.value.length == 5){
      this.virtualEarthService.postalCode( event.target.value )
      .pipe(first())
      .subscribe(
          data => {
            if (data.statusCode == 200)
            {
              this.locationData.address.city = data.resourceSets[0].resources[0].address.locality;
              this.locationData.address.state = data.resourceSets[0].resources[0].address.adminDistrict;
              this.locationData.address.county = data.resourceSets[0].resources[0].address.adminDistrict2;
              this.locationChanged();
            }
          });
    }
  }

  // Users

  selectUserButtonClicked(userId: number){
    this.tempPwd = "";
    this.tempPwdFlag = false;
    // Call the user service to get the data for the selected user
    this.physicianSignatureData = new UserSignatureModel();
    this.userService.get( userId)
            .pipe(first())
            .subscribe(
            data => {
              if (data.valid)
              {
                this.errorMessage = "";
                this.showError = false;
                this.userData = data;
                this.userSiteAdmin = false;
                this.userSave = false;
                this.delegateAdd = false;
                if (data.userTypeId == 3){
                  this.userSiteAdmin = true;
                }

                // Set up list of locations user has access to.
                var cntr: number = 1;
                this.locationSelected = [];
                if (this.userData.locations != null){
                  this.userData.locations.forEach( (item) =>{
                    this.locationSelected[cntr] = item.locationId;
                    cntr++;
                  });
                }
                this.hideSummaryItems();

                this.showUserEdit = true;
                this.signatureMessage = "";

                this.emailChanged();

                // Position screen
                var elmnt = document.getElementById("topOfScreen");
                elmnt.scrollIntoView();
                      
              }
              else
              {
                //this.errorMessage = data.message;
              }
            },
            error => {
              this.errorMessage = error;
              this.showError = true;
            });
  
  }

  addUserButtonClicked(){
    this.invalidEmail = false;
    this.tempPwd = "";
    this.tempPwdFlag = false;
    this.physicianSignatureData = new UserSignatureModel()
    this.userData = new UserModel();
    this.userData.customerId = this.customerId;
    this.userData.userId = 0;
    this.userData.userSiteAdmin = false;
    this.userSave = false;
    this.delegateAdd = false;
    this.userData.email = "";

    this.hideSummaryItems();

    this.showUserEdit = true;
    // Position screen
    var elmnt = document.getElementById("topOfScreen");
    elmnt.scrollIntoView();
  }

  userChanged(){
    this.userSave = false;
    if (this.userData.firstName != "" && this.userData.lastName !=""
      && this.userData.email !="" && !this.invalidEmail &&
      (this.userData.physician == false || this.userData.npi !="")
      ){
      this.userSave = true;
    }
    this.dataShareService.changeUnsaved(true);
    if (this.userData.userId == 0){
      var lname = this.userData.lastName;
      if (lname.indexOf(" ") > 0){
        lname = lname.substring(0,lname.indexOf(" "));
      }
      if (lname.indexOf("-") > 0){
        lname = lname.substring(0,lname.indexOf("-"));
      }

      this.userData.userName = this.userData.firstName.substring(0,1) + lname + this.customerData.facilityCode;
    }
  }

  emailChanged(){
    console.log("Email",this.userData.email);
    this.userData.email = this.userData.email.replace(/\s/g, "");
    if (this.userData.email != ""){
      const expression: RegExp = /^(?=.{1,254}$)(?=.{1,64}@)[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+(\.[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+)*@[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$/;
      this.invalidEmail = !expression.test(this.userData.email);
    }
    else{
      this.invalidEmail = false;
    }
    this.userChanged();

    console.log("InvalidEmail",this.invalidEmail);
  }

  saveUserButtonClicked(){
    // Set user type string from userSiteAdmin
    this.userSave = false;
    if (this.userSiteAdmin) {
      this.userData.userTypeId = 3;
      this.userData.userType = "EHR Admin";
    }
    else{
      this.userData.userTypeId = 2;
      this.userData.userType = "EHR User";
    }

    this.userData.email = this.userData.email.replace(/\s/g, "");
    this.userData.locations = new Array<UserLocationModel> 
    var cntr: number = 1;
    if (this.locationSelected != null){
      this.locationSelected.forEach( (item) =>{
        var item2 = new UserLocationModel();
        item2.locationId = item;
        this.userData.locations.push(item2);
      });
    }

    this.errorMessage = "";
    this.showError = false;
    // console.log("User",this.userData);
    this.userService.save( this.userData)
          .pipe(first())
          .subscribe(
          data => {
            if (data.valid) {
              // Update list
              if (this.userData.userId == 0){
                // This is a new user
                var item = new UserListItemModel();
                item.customerId = this.customerId;
                item.userId = Number(data.id);
                item.userName = this.userData.userName;
                item.firstName = this.userData.firstName;
                item.lastName = this.userData.lastName;
                item.userType = this.userData.userType;
                item.userTypeId = this.userData.userTypeId;
                item.physician = this.userData.physician;
                if (this.userData.physician == 1){  
                  item.physicianYN = 'Yes';
                } else{
                  item.physicianYN = 'No';
                }
                item.disabled = this.userData.disabled;
                if (this.userData.disabled == 0){  
                  item.enabledYN = 'Yes';
                } else{
                  item.enabledYN = 'No';
                }
                item.email = this.userData.email;
                if (this.customerData.users == null){
                  this.customerData.users = new Array<UserListItemModel>();
                }
                item.delegate = "";
                this.customerData.users.push(item);
              }
              else {
                // Find in list and change
                for (let item of this.customerData.users){
                  if (item.userId == this.userData.userId){
                    item.userName = this.userData.userName;
                    item.firstName = this.userData.firstName;
                    item.lastName = this.userData.lastName;
                    item.userType = this.userData.userType;
                    item.userTypeId = this.userData.userTypeId;
                    item.physician = this.userData.physician;
                    if (this.userData.physician == 1){  
                      item.physicianYN = 'Yes';
                    } else{
                      item.physicianYN = 'No';
                    }
                    item.disabled = this.userData.disabled;
                    if (this.userData.disabled == 0){  
                      item.enabledYN = 'Yes';
                    } else{
                      item.enabledYN = 'No';
                    }
                    item.email = this.userData.email;
                  }
                }
              }

              this.showUserEdit = false;
              this.dataShareService.changeUnsaved(false);

              this.showSummaryItems();
              // Position screen
              this.location="userList";
            }
            else{
              this.errorMessage = data.message;
              this.showError = true;
              this.userSave = true;
            }
          },
          error => {
          this.errorMessage = error;
          this.showError = true;
          this.userSave = true;
          });
  }

  cancelUserButtonClicked(){
    var cng = false;
    this.dataShareService.unsaved.subscribe(data=>{
      cng = data;
    });
    if (cng){
      if (confirm("WARNING: You have unsaved changes. Press Cancel to go back and save these changes, or OK to lose these changes."  )){
        cng = false;
      }
    }
    if (!cng){
      this.showUserEdit = false;
      this.showSummaryItems();
      // Position screen
      this.location="userList";
    }
  }

  resetUserPasswordButtonClicked(){
    this.userService.resetUserPassword( this.userData)
    .pipe(first())
    .subscribe(
    data => {
      if (data.valid){
        this.errorMessage = "Password reset and sent to user.";
        this.showError = true;
        }
        else{
          this.errorMessage = data.message;
          this.showError = true;
        }
      },
      error => {
        this.errorMessage = error;
        this.showError = true;
      });
  }

  delegateClicked(){
    this.delegateAdd = true;
    var userId = this.userData.userId;
    var index = 0;

    this.userService.search(this.customerId, '','',false, false)
        .pipe(first())
        .subscribe(
        data => {
          if (data.valid)
          {
            // Remove physician & Duplicates from list
            var holdUserId = 0;
            this.userList = new Array<UserListItemModel>();
            data.list.forEach( (item) =>{
              if (item.userId != userId && item.userId != holdUserId){
                this.userList.push(item);
              }
              holdUserId = item.userId;
            });

            this.delegateList = new Array<UserListItemModel>();
            
            this.userService.getDelegateList(userId)
                .pipe(first())
                .subscribe(
                data => {
                  if (data.valid)
                  {                    
                    if (data.valid){
                      data.delegates.forEach( (item) =>{
                        this.userList.forEach( (item2) =>{
                          if (item2.userId == item.userId_Delegate){
                            this.delegateList.push(item2)
                          }
                          index++;
                        });
                      });
                    }
                  }
                  else
                  {
                    
                  }
                },
                error => {
                  console.log("Get Delegates Error");
                });
          }
          else
          {
            
          }
        },
        error => {
          
        });
  }

  newDelegateClick(id: number){
    var found = false;
    // Check if delegate already in lab list
    for (let item of this.delegateList){
      if (item.userId == id){
        found = true;
        break;
      }
    }

    if (!found){
      // Find delegate in list
      for (let item of this.userList){
        if (item.userId == id){
          this.delegateList.push(item)
        }
      }
    }
  }

  currentDelegateClick(id: number){
    var index = 0;
    for (let item of this.delegateList){
      if (item.userId == id){
        this.delegateList.splice(index, 1);
      }
      index++;
    }
  }


  saveDelegateButtonClicked(){
    var userId = this.userData.userId;
    var userDelegate = new UserDelegateModel();
    userDelegate.userId = userId;

    this.delegateList.forEach( (item) =>{
      var item2 = new UserDelegateItemModel
      item2.userId = userId;
      item2.userId_Delegate = item.userId;
      userDelegate.delegates.push(item2);
    });
  
    
    this.userService.saveDelegates( userDelegate)
          .pipe(first())
          .subscribe(
          data => {
            if (data.valid) {
              this.delegateAdd = false;
              sessionStorage.setItem('delegate',JSON.stringify(userDelegate.delegates));
            }
            else{
              this.errorMessage = data.message;
            }
          },
          error => {
          this.errorMessage = error;
          });

  }

  cancelDelegateButtonClicked(){
    this.delegateAdd = false;
  }

  tempPwdButtonClicked(){
    this.tempPwd = "";
    this.tempPwdFlag = true;
  }

  tempPwdSetButtonClicked(){

    var valid = false;
    var number = 0;
    var upper = 0;
    var lower = 0;
    var special = 0;
    var bad = 0;
    for (var i=0;i<this.tempPwd.length;i++){
      var c = this.tempPwd.charCodeAt(i);
      if (c >= 48 && c <= 57){
        number++;
      }
      else if (c >= 65 && c <= 90){
        upper++;
      }
      else if (c >= 97 && c <= 122){
        lower++;
      }
      else if (c == 33 || c == 36 || c == 42 || c == 64){  //!$*!
        special++;
      }
      else {
        bad++;
      }
    }

    if (bad > 0){
      this.pwdError = "Invalid character in password";
    }
    else if (this.tempPwd.length >= 10 && number >= 1 && upper >= 1 && lower >= 1 && special >= 1){
      valid = true;
    }
    else {
      this.pwdError = "Password did not meet minimum requirements";
    }

    if (valid){

      var email = this.userData.email;
      if (this.customerData.alternateLoginId){
        email = this.userData.userName;
      }

      this.userService.setTempPassword(email, this.tempPwd)
        .pipe(first())
        .subscribe(
          data => {
            if (data.valid) {
              this.tempPwd = "";
              this.tempPwdFlag = false;
            }
            else {
              this.pwdError = data.message;
            }
          },
          error => {
            this.pwdError = error;
          });
    }

    
  }
  
  tempPwdCancelButtonClicked(){
    this.tempPwd = "";
    this.tempPwdFlag = false;
  }


  // Attachments

  selectAttachmentButtonClicked(attachmentId: number){
    // Call the attachment service to get the data for the selected attachment
    this.customerService.getCustomerAttachment( attachmentId)
            .pipe(first())
            .subscribe(
            data => {
              if (data.valid)
              {
                this.errorMessage = "";
                this.showError = false;
                this.attachmentData = data;
                // this.attachmentDisabled = true;
                // this.showAttachmentEdit = true;
                // this.attachmentSave = false;

                // this.hideSummaryItems();

                // // Position screen
                // var elmnt = document.getElementById("topOfScreen");
                // elmnt.scrollIntoView();

                const binaryString = window.atob(this.attachmentData.fileAsBase64);
                const len = binaryString.length;
                const bytes = new Uint8Array(len);
                for (let i = 0; i < len; ++i) {
                  bytes[i] = binaryString.charCodeAt(i);
                }
                
                var fileblob = new Blob([bytes], { type: 'application/pdf' });

                var url = window.URL.createObjectURL(fileblob); 
              
                let anchor = document.createElement("a");
                anchor.href = url;
                anchor.target = "_blank"
                anchor.click();                    
              }
              else
              {
                //this.errorMessage = data.message;
              }
            },
            error => {
              this.errorMessage = error;
              this.showError = true;
            });

  }

  attachmentChanged(){
    this.attachmentSave = false;
    if (this.attachmentData.title != "" && this.attachmentData.description != "" && this.attachmentData.fileType !=""){
      this.attachmentSave = true;
    }
    this.dataShareService.changeUnsaved(true);
  }

  addAttachmentButtonClicked(){
    this.attachmentData = new CustomerAttachmentModel();

    this.errorMessage = "";
    this.showError = false;
    this.attachmentDisabled = false;
    this.showAttachmentEdit = true;
    this.attachmentSave = false;

    this.fileUploaded = false;
    this.fileScanned = false;
    
    this.captures = new Array<string>();

    this.hideSummaryItems();

    // Position screen
    var elmnt = document.getElementById("topOfScreen");
    elmnt.scrollIntoView();

  }

  saveAttachmentButtonClicked(){
    this.attachmentData.customerId = this.customerId;
    this.showError = false;
    
    if (this.cameraOn){
      this.stopDevice();
    }

    console.log("FileUpload",this.fileUploaded);
    if (!this.fileUploaded){
      console.log("Scanned");
      // Scanned image
      const doc = new jsPDF();
      var width = doc.internal.pageSize.getWidth();
      var height = doc.internal.pageSize.getHeight();

      // Accumulate pages into a pdf document if scanner used
      var firstPage = true;
      this.captures.forEach( (item) =>{
        if (!firstPage) {doc.addPage();}
        doc.addImage(item, 0, 0, width, height);
        firstPage = false;
      });
     
      this.attachmentData.fileType = "application/pdf";

      var b64 = doc.output('datauristring'); // base64 string

      this.attachmentData.fileType = "application/pdf";

      this.attachmentData.fileAsBase64 = b64.replace("data:application/pdf;filename=generated.pdf;base64,", "");
    }

    console.log("B64",this.attachmentData.fileAsBase64);


    this.customerService.saveCustomerAttachment( this.attachmentData)
          .pipe(first())
          .subscribe(
          data => {
            if (data.valid) {
              // Update list
              var item = new CustomerAttachmentListItemModel();
              item.customerAttachmentId = Number(data.id);
              item.customerId = this.customerId;
              item.dateCreated = this.attachmentData.dateCreated.substring(0,10);
              item.title = this.attachmentData.title;
              item.description = this.attachmentData.description;
              if (this.customerData.attachments == null){
                this.customerData.attachments = new Array<CustomerAttachmentListItemModel>();
              }
              this.customerData.attachments.push(item);

              this.showAttachmentEdit = false;
              this.dataShareService.changeUnsaved(false);

              this.showSummaryItems();
    
              // Position screen
              this.location="attachmentList";
            }
            else{
              this.errorMessage = data.message;
              this.showError = true;
            }
          },
          error => {
            this.errorMessage = error;
            this.showError = true;
          });
  }

  cancelAttachmentButtonClicked(){
    if (this.cameraOn){
      this.stopDevice();
    }
    var cng = false;
    this.dataShareService.unsaved.subscribe(data=>{
      cng = data;
    });
    if (cng){
      if (confirm("WARNING: You have unsaved changes. Press Cancel to go back and save these changes, or OK to lose these changes."  )){
        cng = false;
      }
    }
    if (!cng){
      this.showAttachmentEdit = false;
      this.showSummaryItems();
      
      // Position screen
      this.location="attachmentList";
    }
  }

  deleteAttachmentButtonClicked(attachmentId: number){
    this.customerService.deletedCustomerAttachment( attachmentId)
            .pipe(first())
            .subscribe(
            data => {
              if (data.valid)
              {
                this.errorMessage = "";
                this.showError = false;

                let index = this.customerData.attachments.findIndex(d => d.customerAttachmentId === attachmentId); //find index in your array
                this.customerData.attachments.splice(index, 1);//remove element from array    
              }
              else
              {
                //this.errorMessage = data.message;
              }
            },
            error => {
              this.errorMessage = error;
              this.showError = true;
            });
  }

  readFile(event: any){
    const target: DataTransfer = <DataTransfer>(event.target);
    if (target.files.length !== 1) {
      throw new Error('Cannot get multiple files');
    }
    else
    {
      var temp = target.files[0].name;

      this.attachmentData.fileType = event.target.files[0].type;
      //console.log("File Type:",fileType)
      this.convertFile(event.target.files[0]).subscribe(base64 => {
        this.attachmentData.fileAsBase64 = base64;
        this.attachmentChanged();
      });

      this.fileUploaded = true;
      console.log("File",this.attachmentData.fileAsBase64);

    }
  }

  convertFile(file : File) : Observable<string> {
    const result = new ReplaySubject<string>(1);
    const reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = (event) => result.next(btoa(event.target.result.toString()));
    return result;
  }

  readSignatureFile(event: any){
    const target: DataTransfer = <DataTransfer>(event.target);
    if (target.files.length !== 1) {
      throw new Error('Cannot get multiple files');
    }
    else
    {
      var temp = target.files[0].name;
 
      this.physicianSignatureData.userSignatureId = 0;
      this.physicianSignatureData.userId = this.userData.userId;
      this.physicianSignatureData.dateCreated = formatDate(new Date() , 'MM-dd-yyyy HH:mm', 'en');
      this.physicianSignatureData.fileType = event.target.files[0].type;

      this.convertFile(event.target.files[0]).subscribe(base64 => {
        this.physicianSignatureData.fileAsBase64 = base64;
      });


    }
  }

  saveSignatureClicked(){
    // Save the image to the server

    this.userService.saveSignature( this.physicianSignatureData )
          .pipe(first())
          .subscribe(
          data => {
            if (data.valid) {
              this.signatureMessage = "Your signature has been updated."
            }
            else{
              this.errorMessage = data.message;
            }
          },
          error => {
            this.errorMessage = error;
          });

  }
  // Notes

  selectNoteButtonClicked(noteId: number){
    this.customerService.getCustomerNote( noteId)
            .pipe(first())
            .subscribe(
            data => {
              if (data.valid)
              {
                this.errorMessage = "";
                this.showError = false;
                this.noteData = data;
                this.noteDisabled = true;
                this.showNoteEdit = true;
                this.noteSave = false;

                this.hideSummaryItems();

                // Position screen
                var elmnt = document.getElementById("topOfScreen");
                elmnt.scrollIntoView();
                     
              }
              else
              {
                //this.errorMessage = data.message;
              }
            },
            error => {
              this.errorMessage = error;
              this.showError = true;
            });

  }

  noteChanged(){
    this.noteSave = false;
    if (this.noteData.subject != "" && this.noteData.note !=""){
      this.noteSave = true;
    }
    this.dataShareService.changeUnsaved(true);
  }

  addNoteButtonClicked(){

    var dateStamp  =  formatDate(new Date() , 'yyyy-MM-dd HH:mm:ss', 'en');

    this.hideSummaryItems();

    this.errorMessage = "";
    this.showError = false;
    this.noteData = new CustomerNoteModel();
    this.noteData.customerNoteId = 0;
    this.noteData.customerId = this.customerId
    this.noteData.dateTime = formatDate(new Date() , 'MM/dd/yyyy HH:mm:ss', 'en');
    this.noteSave = false;

    //console.log(this.noteData);

    this.noteDisabled = false;
    this.showNoteEdit = true;
    // Position screen
    var elmnt = document.getElementById("topOfScreen");
    elmnt.scrollIntoView();
  }

  saveNoteButtonClicked(){
    this.customerService.saveCustomerNote( this.noteData)
          .pipe(first())
          .subscribe(
          data => {
            if (data.valid) {
              // Update list
              var item = new CustomerNoteListItemModel();
              item.customerNoteId = Number(data.id);
              item.customerId = this.customerId;
              item.dateTime = this.noteData.dateTime.substring(0,10);;
              item.subject = this.noteData.subject;
              item.note = this.noteData.note;
              if (this.customerData.notes == null){
                this.customerData.notes = new Array<CustomerNoteListItemModel>();
              }
              this.customerData.notes.push(item);

              this.showNoteEdit = false;
              this.dataShareService.changeUnsaved(false);

              this.showSummaryItems();
    
              // Position screen
              this.location="noteList";
            }
            else{
              this.errorMessage = data.message;
              this.showError = true;
            }
          },
          error => {
            this.errorMessage = error;
            this.showError = true;
          });
  }

  cancelNoteButtonClicked(){
    var cng = false;
    this.dataShareService.unsaved.subscribe(data=>{
      cng = data;
    });
    if (cng){
      if (confirm("WARNING: You have unsaved changes. Press Cancel to go back and save these changes, or OK to lose these changes."  )){
        cng = false;
      }
    }
    if (!cng){
      this.showNoteEdit = false;
      this.showSummaryItems();
      
      // Position screen
      this.location="noteList";
    }
  }

  // Physician Preference

  selectPreferenceButtonClicked(preferenceId: number){
    //Call the preference service to get the data for the selected physician preference
    this.physicianPreferenceService.get( preferenceId)
            .pipe(first())
            .subscribe(
            data => {
              if (data.valid)
              {
                this.errorMessage = "";
                this.showError = false;
                this.preferenceData = data;

                this.hideSummaryItems();

                console.log("LoadTest");

                if (this.preferenceData.labTypeId == 1){
                  this.loadTestsFromPreference();
                  this.showToxUrine = true;
                }
                else{
                  this.showToxOral = true;
                  this.loadOralTestsFromPreference();
                  this.showToxOral = true;
                }

                // Position screen
                console.log("Set Position");
                var elmnt = document.getElementById("topOfScreen");
                elmnt.scrollIntoView();
                console.log("Set Position 2");
              }
              else
              {
                //this.errorMessage = data.message;
              }
            },
            error => {
            this.errorMessage = error;
            this.showError = true;
            });

  }

  loadTestsFromPreference(){

    let data = this.labOrderService.loadToxData(this.preferenceData.tests )

    this.presumptiveTesting13 = data.presumptiveTesting13;
    this.presumptiveTesting15 = data.presumptiveTesting15;
    this.alcohol = data.alcohol;
    this.antidepressants = data.antidepressants;
    this.antipsychotics = data.antipsychotics;
    this.benzodiazepines = data.benzodiazepines;
    this.cannabinoids = data.cannabinoids;
    this.cannabinoidsSynth = data.cannabinoidsSynth
    this.dissociative = data.dissociative;
    this.gabapentinoids = data.gabapentinoids;
    this.hallucinogens = data.hallucinogens;
    this.illicit = data.illicit;
    this.kratom = data.kratom;
    this.opioidAgonists = data.opioidAgonists;
    this.opioidAntagonists = data.opioidAntagonists;
    this.sedative = data.sedative;
    this.skeletal = data.skeletal;
    this.stimulants = data.stimulants;
    this.thcSource = data.thcSource;
  
  }

  loadOralTestsFromPreference(){

    let data = this.labOrderService.loadToxOralData(this.preferenceData.tests )

    this.oralIllicit = data.illicit;
    this.oralSedative = data.sedative;
    this.oralBenzodiazepines = data.benzodiazepines;
    this.oralMuscle = data.muscle;
    this.oralAntipsychotics = data.antipsychotics;
    this.oralAntidepressants = data.antidepressants;
    this.oralStimulants = data.stimulants;
    this.oralKratom = data.kratom;
    this.oralNicotine = data.nicotine;
    this.oralOpioidAntagonists = data.opioidAntagonists;
    this.oralGabapentinoids = data.gabapentinoids;
    this.oralDissociative = data.dissociative;
    this.oralOpioidAgonists = data.opioidAgonists;
  
  }

  closePreferenceClicked(){
    // Show summary items
    this.showCustomer = true;
    this.showLocationList = true;
    this.showUserList = true;
    this.showAttachmentList = true;
    this.showNoteList = true;
    this.showPreferenceList = true;
    this.showToxUrine = false;
    this.showToxOral = false;
  }
  

  loadSearchDropdownLists(){

    this.activeSearchList = new Array<CodeItemModel>();
    var item1 = new CodeItemModel();
    item1.id = 1;
    item1.description = "Active";
    this.activeSearchList.push(item1);
    var item2 = new CodeItemModel();
    item2.id = 2;
    item2.description = "Inactive";
    this.activeSearchList.push(item2);
    var item3 = new CodeItemModel();
    item3.id = 3;
    item3.description = "All";
    this.activeSearchList.push(item3);
    this.searchActive = 1;

    this.codeService.getList( 'Region,AM,TM,RM,LCS')

    .pipe(first())
    .subscribe(
        data => {
          if (data.valid)
          {
            this.regionSearchList = data.list0;
            this.regionList = data.list0;
            this.amSearchList = data.list1;
            this.amList = data.list1;
            this.tmSearchList = data.list2;
            this.tmList = data.list2;
            this.rmSearchList = data.list3;
            this.rmList = data.list3;
            this.lcsList = data.list4;
            var item = new CodeItemModel();
            item.id = 0;
            item.description = "Select";
            this.regionSearchList.splice(0,0,item);
            this.amSearchList.splice(0,0,item);
            this.tmSearchList.splice(0,0,item);
            this.rmSearchList.splice(0,0,item);
          }
          else
          {
            this.errorMessage = data.message;
            this.showError = true;
          }
        },
        error => {
          this.errorMessage = error;
          this.showError = true;
        });
  }

  loadDropdownLists(){
    this.codeService.getList( 'AccountType,CustomerBillingType,Specialty,TimeZone,ShippingMethod,Region,Lab' )

    .pipe(first())
    .subscribe(
        data => {
          if (data.valid)
          {
            this.accountTypeList = data.list0;
            this.billingTypeList = data.list1;
            this.specialtyList = data.list2;
            this.timeZoneList = data.list3;
            this.shippingMethodList = data.list4;
            this.regionList = data.list5
            this.labRPPList = data.list6;
            this.labUTIList = data.list6;
            this.labGPPList = data.list6;
            this.labToxUrineList = data.list6;
            this.labToxOralList = data.list6;
            this.labUrinalysisList = data.list6;
            this.labHematologyList = data.list6;
          }
          else
          {
            this.errorMessage = data.message;
            this.showError = true;
          }
        },
        error => {
          this.errorMessage = error;
          this.showError = true;
        });
  }

  // Camera capture code

  async setupDevices() {
    this.fileScanned = true;
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true
        });
        if (stream) {
          this.video.nativeElement.srcObject = stream;
          this.video.nativeElement.play();
          this.error = null;
          this.cameraOn = true;
        } else {
          this.error = "You have no output video device";
        }
      } catch (e) {
        this.error = e;
      }
    }
  }

  async stopDevice(){
    this.video.nativeElement.srcObject.getTracks().forEach(function(track) {
      track.stop();
    });
    this.cameraOn = false;
  }

  capture() {
    this.drawImageToCanvas(this.video.nativeElement);
    this.captures.push(this.canvas.nativeElement.toDataURL("image/png"));   
    this.attachmentChanged();
  }

  drawImageToCanvas(image: any) {
    this.canvas.nativeElement
      .getContext("2d")
      .drawImage(image, 0, 0, this.picWidth, this.picHeight);
  }
}

