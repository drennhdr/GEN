
//Page Name       : Dash-Customer
//Date Created    : 08/23/2022
//Written By      : Stephen Farkas
//Description     : Customer component for dashboard
//MM/DD/YYYY xxx  Description
//02/10/2022 SJF  Added missing signature count
//03/24/2023 SJF  Added check for demographics issues.
//07/05/2023 SJF  Changed button on results to show result PDF.
//-----------------------------------------------------------------------------
// Data Passing
//-----------------------------------------------------------------------------
import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { LabOrderService } from '../../services/labOrder.service';
import { UserService } from '../../services/user.service';
import { PatientService } from '../../services/patient.service';
import { LocationService } from '../../services/location.service';
import { CodeService } from '../../services/code.service';
import {formatDate} from '@angular/common';

import { Router } from '@angular/router';

import { LabOrderListItemModel, LabOrderModel, LabOrderSummaryModel } from '../../models/LabOrderModel';
import { LocationListItemModel } from '../../models/LocationModel';


@Component({
  selector: 'app-dash-customer',
  templateUrl: './dash-customer.component.html',
  styleUrls: ['./dash-customer.component.css']
})
export class DashCustomerComponent implements OnInit {
  userType: number = 0;
  userId: number = 0;
  locationList: any;
  searchCustomerId: number;
  searchLocationId: number;
  searchTimeframeId: number;
  searchLabTypeId: number;
  searchStartDate: string;
  searchEndDate: string;
  customerId: number;
  startDate: string = '';
  endDate: string = '';
  unsignedCount: number = 0;
  issueCount: number = 0;
  holdCount: number = 0;

  showLabList: any;
  showIssueList: any;

  labOrderSummaryData: any;
  labOrderListData: any;
  issueListData: any;
  button: number;

  pdfData: any;

  errorMessage: string = '';
  showError: boolean = false;

  constructor(
    private labOrderService: LabOrderService,
    private userService: UserService,
    private locationService: LocationService,
    private codeService: CodeService,
    private patientService: PatientService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.userId = Number(sessionStorage.getItem('userId_Login'));
    this.userType = Number(sessionStorage.getItem('userType'));

    const today = new Date();
    var endDate = today.setDate(today.getDate());
    this.searchEndDate = formatDate(endDate , 'yyyy-MM-dd', 'en');
    var startDate = today.setDate(today.getDate() - 7);
    this.searchStartDate = formatDate(startDate , 'yyyy-MM-dd', 'en');

    if (sessionStorage.getItem('physician') == 'true'){
      this.loadUnsignedCount();
    }
    this.loadDemoIssues();

       

    this.labOrderSummaryData = new LabOrderSummaryModel();
    this.labOrderSummaryData.created = 0;
    this.labOrderSummaryData.received = 0;
    this.labOrderSummaryData.processing = 0;
    this.labOrderSummaryData.resulted = 0;
    this.labOrderSummaryData.issue = 0;
    this.labOrderSummaryData.notProcessed = 0;

    this.labOrderListData = new Array<LabOrderListItemModel>();
    if ((this.userType == 12 || this.userType == 13) && Number(sessionStorage.getItem('customerId')) == 0){
      this.showError = true;
      //this.errorMessage = "An account has not been selected";
      this.router.navigateByUrl('/customer-filter');
    }
    else{
      if (this.userType == 12 || this.userType == 13){
        this.customerId = Number(sessionStorage.getItem('customerId'));
        this.searchCustomerId = this.customerId;
        this.userId = 0;
      }
      else{
        //this.searchCustomerId = 0;
        this.customerId = Number(sessionStorage.getItem('entityId_Login'));
        this.searchCustomerId = this.customerId;
      }

      this.loadDemoIssues();
      
      this.loadLocationList();

      if (sessionStorage.getItem('callingScreen') =='dashboard'){
        sessionStorage.setItem('callingScreen','');
        this.searchLocationId = Number(sessionStorage.getItem('searchLocationId'));
        sessionStorage.setItem('searchLocationId','');
        this.searchTimeframeId = Number(sessionStorage.getItem('searchTimeframeId'));
        sessionStorage.setItem('searchTimeframeId','');
        this.searchLabTypeId = Number(sessionStorage.getItem('searchLabTypeId'));
        sessionStorage.setItem('searchLabTypeId','');

        sessionStorage.setItem('callingFirst','');
        sessionStorage.setItem('searchPatientId','');
        sessionStorage.setItem('searchCustomerId','');
        sessionStorage.setItem('searchOrderId', '');
        this.loadLabSummary();
        this.showLabList = false;
        this.showIssueList = true; 
      }
      else{
        this.showLabList = true;
        this.showIssueList = false; 
        this.searchLocationId = 0;
        this.searchTimeframeId = 1;
        this.searchLabTypeId = 99;
  
        this.loadLabSummary();
        this.searchButtonClicked(1);
      }

      // var today = new Date();
      // var tomorrow = new Date (today.getTime () + (24 * 60 * 60 * 1000));
      // this.endDate =   formatDate(tomorrow , 'yyyy-MM-dd', 'en');
      // this.startDate = formatDate(new Date(today.setDate(today.getDate() - today.getDay())), 'yyyy-MM-dd','en');
      
    }
  
  }

  searchButtonClicked(labStatus: number){
      this.button = labStatus;
      this.labOrderService.search(this.customerId, this.searchLocationId, labStatus, 0, 0, '', '', this.searchLabTypeId, this.searchStartDate, this.searchEndDate, 1 )
        .pipe(first())
        .subscribe(
        data => {
          console.log(data);
          if (data.valid)
          {
            this.labOrderListData = data.list;
          }
          else
          {
            this.labOrderListData = null;
          }
        },
        error => {
          this.errorMessage = error;
          this.showError = true;
        });
        this.showLabList = true;
        this.showIssueList = false; 
  }

  loadUnsignedCount(){
    this.labOrderService.signatureCount(this.userId)
          .pipe(first())
          .subscribe(
          data => {
            if (data.valid)
            {
              this.unsignedCount = Number(data.id);
            }
          },
          error => {
            this.errorMessage = error;
          });
  }

  loadLabSummary(){
    // var today = new Date();
    // var tomorrow = new Date (today.getTime () + (24 * 60 * 60 * 1000));
    // this.endDate =   formatDate(tomorrow , 'yyyy-MM-dd', 'en');

    // if (this.searchTimeframeId == 1){
    //   // Current Week
    //   this.startDate = formatDate(new Date(today.setDate(today.getDate() - today.getDay())), 'yyyy-MM-dd','en');
    // }
    // else if (this.searchTimeframeId == 2){
    //   // Current Month
    //   this.startDate = formatDate(new Date(), 'yyyy-MM-01','en');
    // }
    // else if (this.searchTimeframeId == 2){
    //   // Current Year
    //   this.startDate = formatDate(new Date(), 'yyyy-01-01','en');
    // }
    // else {
    //   // All
    //   this.startDate = '2020-01-01';
    // }

console.log("Start", this.searchStartDate);
console.log("End", this.searchEndDate);


    this.labOrderService.summary(this.searchCustomerId, this.searchLocationId, this.userId, 0, this.searchLabTypeId, this.searchStartDate, this.searchEndDate)
          .pipe(first())
          .subscribe(
          data => {
            if (data.valid)
            {
              this.labOrderSummaryData = data;
              this.holdCount = data.holdTotal;
              console.log("Lab Summary", this.labOrderSummaryData);
              console.log("Button",this.button);
              if (this.button > 0){
                this.searchButtonClicked(this.button);
              }
            }
            else
            {
              this.labOrderSummaryData = new LabOrderSummaryModel();
              this.errorMessage = data.message;
              this.holdCount = 0;
            }
          },
          error => {
            this.errorMessage = error;
          });
  }

  loadLocationList(){
    if (this.userType == 12 || this.userType == 13){
      // Load Location Data
      this.locationService.getForCustomer(this.customerId)
            .pipe(first())
            .subscribe(
            data => {
              if (data.valid)
              {
                this.locationList = new Array<LocationListItemModel>();
                var item = new LocationListItemModel();
                item.locationId = 0;
                item.locationName = 'All Locations';
                this.locationList.push(item);

                data.list.forEach( (location) =>{
                  this.locationList.push(location);
                });
              }
              else
              {
                this.errorMessage = data.message;
              }
            },
            error => {
              this.errorMessage = error;
            });
    }
    else {
      // Load Location Data
      this.locationService.search(this.userId)
            .pipe(first())
            .subscribe(
            data => {
              if (data.valid)
              {
                this.locationList = new Array<LocationListItemModel>();
                var item = new LocationListItemModel();
                item.locationId = 0;
                item.locationName = 'All Locations';
                this.locationList.push(item);


                data.list.forEach( (location) =>{
                  this.locationList.push(location);
                });
              }
              else
              {
                this.errorMessage = data.message;
              }
            },
            error => {
              this.errorMessage = error;
            });
    }
  }

  loadDemoIssues(){
    this.patientService.getPatientsMissingInfo(this.customerId,0)
          .pipe(first())
          .subscribe(
          data => {
            if (data.valid)
            {
              this.issueListData = data.list;
              this.issueCount = this.issueListData.length;
            }
          },
          error => {
            this.errorMessage = error;
          });
  }

  loadDropdownLists(){

    // this.codeService.getList( 'POCCStatus,LabStatus,LabType' )

    // .pipe(first())
    // .subscribe(
    //     data => {
    //       if (data.valid)
    //       {
    //         this.locationList = data.list0;
    //       }

    //       else
    //       {
    //         this.errorMessage = data.message;
    //         this.showError = true;
    //       }
    //     },
    //     error => {
    //       this.errorMessage = error;
    //       this.showError = true;
    //     });
  }

  selectButtonClicked(labOrderId: number, specimenId: number){
    if (this.button == 50){
      this.labOrderService.getLabOrderResultPdf( specimenId)
      .pipe(first())
      .subscribe(
      data => {
        console.log("Data",data);
        if (data.valid)
        {
          this.pdfData = data;
  
  
          const binaryString = window.atob(this.pdfData.fileAsBase64);
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
    else
    {
      // Set variables to pass in
      sessionStorage.setItem('callingScreen','dashboard');
      sessionStorage.setItem('callingFirst','True');
      sessionStorage.setItem('searchPatientId','0');
      sessionStorage.setItem('searchLocationId',String(this.searchLocationId));
      sessionStorage.setItem('searchTimeframeId',String(Number(this.searchTimeframeId)));
      sessionStorage.setItem('searchLabTypeId',String(Number(this.searchLabTypeId)));
    
      sessionStorage.setItem('searchOrderId',labOrderId.toString());

      this.router.navigateByUrl('/lab-order');
    }
  }

  signatureButtonClicked(){
    this.button = 3;
    sessionStorage.setItem('unsigned', "true");
    this.router.navigateByUrl('/lab-order');
  }

  issueButtonClicked(){
    this.button = 2;
    this.showIssueList = true;
    this.showLabList = false;
  }

  holdButtonClicked(){
    this.button = 99;

    this.labOrderService.search(this.customerId, 0, 1200, 0, 0, '', '', 99, '', '', 1 )
      .pipe(first())
      .subscribe(
      data => {
        console.log(data);
        if (data.valid)
        {
          this.labOrderListData = data.list;
        }
        else
        {
          this.labOrderListData = null;
        }
      },
      error => {
        this.errorMessage = error;
        this.showError = true;
      });
      this.showLabList = true;
      this.showIssueList = false; 

  }

  patientButtonClicked(patientId: number, missing: string){
    // Set variables to pass in
    sessionStorage.setItem('callingScreen','dashboard');
    sessionStorage.setItem('callingFirst','True');
    sessionStorage.setItem('searchPatientId',patientId.toString());
    sessionStorage.setItem('searchCustomerId','0');
    sessionStorage.setItem('searchOrderId', '0');
    sessionStorage.setItem('searchLocationId', this.searchLocationId.toString());
    sessionStorage.setItem('searchTimeframeId', this.searchTimeframeId.toString());
    sessionStorage.setItem('searchLabTypeId', this.searchLabTypeId.toString());


    // Check to see what is missing
    if (missing.indexOf("Insurance") > 0){
      sessionStorage.setItem('searchItem','Insurance');
    }
    else {
      sessionStorage.setItem('searchItem','Name');
    }


    this.router.navigateByUrl('/patient');
  }
}
