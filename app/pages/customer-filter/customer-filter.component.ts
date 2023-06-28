//Page Name       : CustomerFilter
//Date Created    : 09/09/2022
//Written By      : Stephen Farkas
//Description     : Customer Filter
//MM/DD/YYYY xxx  Description
//-----------------------------------------------------------------------------
// Data Passing
//-----------------------------------------------------------------------------

import { Component, OnInit, AfterViewChecked, HostListener } from '@angular/core';
import { first } from 'rxjs/operators';
import {formatDate} from '@angular/common';

import { Router } from '@angular/router';

import { CustomerService } from '../../services/customer.service';
import { CodeService } from '../../services/code.service';
import { LocationService } from '../../services/location.service';
import { UserService } from '../../services/user.service';
import { CodeItemModel } from '../../models/CodeModel';

// import { CustomerModel } from '../../models/CustomerModel';
// import { LocationModel, LocationListItemModel } from '../../models/LocationModel';

// import { Observable, ReplaySubject } from 'rxjs';

import { DataShareService } from '../../services/data-share.service';

// import { stringify } from 'querystring';

@Component({
  selector: 'app-customer',
  templateUrl: './customer-filter.component.html',
  styleUrls: ['./customer-filter.component.css']
})
export class CutomerFilterComponent implements OnInit {
  // Variable to control access level - View
  salesFlag: boolean = false;
  // Variables to hold screen data
  customerId: number = 0;
  customerSearchData: any;
  customerData: any;
  userType: number = 0;

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

  // Variables to control screen display
  showSearch: boolean;
  showSearchList: boolean;
  showCustomer: boolean;



  // Variables for drop down data
  activeSearchList: any;
  regionSearchList: any;
  amSearchList: any;
  tmSearchList: any;
  rmSearchList: any;

  constructor(
    private customerService: CustomerService,
    private codeService: CodeService,
    private locationService: LocationService,
    private userService: UserService,
    private router: Router,
    private dataShareService: DataShareService,
  ) { 
  }

  ngOnInit(): void {

    var cng = false;
    this.dataShareService.changeUnsaved(false);

    this.dataShareService.unsaved.subscribe(data=>{
      cng = data;
    });

    console.log ('1',cng);

    if (sessionStorage.getItem('userId_Login') == ""){
      this.router.navigateByUrl('/login');
    }
    // Initialize screen handling variables
    this.showSearch = true;
    this.showSearchList = false;
    this.showCustomer = false;
    this.showError = false;


    this.userType = Number(sessionStorage.getItem('userType'));
    var userId = Number(sessionStorage.getItem('userId_Login'));
    if (this.userType == 9){
      // AM
      this.searchAM = userId;
      this.salesFlag = true;
      this.searchButtonClicked();
    }
    else if (this.userType == 10){
      // TM
      this.searchTM = userId;
      this.salesFlag = true;
      this.searchButtonClicked();
    }
    else if (this.userType == 11){
      // RM
      this.searchRM = userId;
      this.salesFlag = true;
      this.searchButtonClicked();
    }
    else if (this.userType == 12 || this.userType == 13){
      // LCS
      this.searchLCS = userId;
      this.salesFlag = true;
      this.searchButtonClicked();
    }
    else {
      this.salesFlag = false;
    }


    this.loadSearchDropdownLists();
  
    this.searchName = "";
    this.searchActive = 1;
    this.searchCity = "";
    this.searchState = "";
    this.searchCode = "";
    this.searchRegion = 0;


  }

  @HostListener('document:keyup', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key == 'Enter'){
      if (this.showSearch) {
        this.searchButtonClicked();
      }      
    }
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
                this.showError = true;
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

  clearButtonClicked(){
    sessionStorage.setItem('customerId','0');
    sessionStorage.setItem('customerName','Genesis Reference Labs');
    sessionStorage.setItem('locationId','0');
    sessionStorage.setItem('locationName','');

    console.log("Clicked Genesis");
  }

  selectButtonClicked(customerId: number){
    

    this.customerSearchData.forEach( (item) =>{
      if (item.customerId == customerId){
        //console.log ("item",item);
        
        sessionStorage.setItem('customerId',customerId.toString());
        sessionStorage.setItem('customerName',item.name);

        this.locationService.getForCustomer(customerId)
            .pipe(first())
            .subscribe(
            data => {
              if (data.valid)
              {
                if (item.sharePatients){
                  sessionStorage.setItem('locationId',data.list[0].locationId.toString());
                  sessionStorage.setItem('locationName','All Locations');
                }
                else{
                  sessionStorage.setItem('locationId',data.list[0].locationId.toString());
                  sessionStorage.setItem('locationName',data.list[0].locationName);  
                }
                
                this.router.navigateByUrl('/patient');
              }
              else
              {
                //
              }
            },
            error => {
              //
            });

      }
    });
      
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

    this.codeService.getList( 'Region,AM,TM,RM')

    .pipe(first())
    .subscribe(
        data => {
          if (data.valid)
          {
            this.regionSearchList = data.list0;
            this.amSearchList = data.list1;
            this.tmSearchList = data.list2;
            this.rmSearchList = data.list3;
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

}

