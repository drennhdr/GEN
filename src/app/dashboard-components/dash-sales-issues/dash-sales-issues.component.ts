
//Page Name       : Dash-Sales-Issues
//Date Created    : 08/23/2022
//Written By      : Stephen Farkas
//Description     : Sales Issues component for dashboard
//MM/DD/YYYY xxx  Description
//07/28/2023 SJF  Added view of orders based on flag on user profile
//08/10/2023 SJF  Added patient and location to lab order list
//08/10/2023 SJF  Added sort to lab order list
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
  selector: 'app-dash-sales-issues',
  templateUrl: './dash-sales-issues.component.html',
  styleUrls: ['./dash-sales-issues.component.css']
})
export class DashSalesIssuesComponent implements OnInit {

    userType: number = 0;
    userId: number = 0;
    locationList: any;
    searchCustomerId: number;
    searchLocationId: number;
    searchStartDate: string;
    searchEndDate: string;
    searchTimeframeId: number;
    searchLabTypeId: number;
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

    salesReport: number;
    pdfData: any;
  
    errorMessage: string = '';
    showError: boolean = false;

    sortProperty: string = 'specimenBarcode';
    sortOrder = 1;
  
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
      this.salesReport = Number(sessionStorage.getItem('salesPatientReport'));

      const today = new Date();
      var endDate = today.setDate(today.getDate());
      this.searchEndDate = formatDate(endDate , 'yyyy-MM-dd', 'en');
      var startDate = today.setDate(today.getDate() - 7);
      this.searchStartDate = formatDate(startDate , 'yyyy-MM-dd', 'en');

      

      this.searchLabTypeId = 99

      this.loadLocationList();
      this.searchLocationId = -1;

      this.labOrderSummaryData = new LabOrderSummaryModel();
      this.labOrderSummaryData.created = 0;
      this.labOrderSummaryData.received = 0;
      this.labOrderSummaryData.processing = 0;
      this.labOrderSummaryData.resulted = 0;
      this.labOrderSummaryData.issue = 0;
      this.labOrderSummaryData.notProcessed = 0;

      if (sessionStorage.getItem('callingScreen') =='dashboard'){
        sessionStorage.setItem('callingScreen','');
        this.searchLocationId = Number(sessionStorage.getItem('searchLocationId'));
        sessionStorage.setItem('searchLocationId','');
        this.searchStartDate = sessionStorage.getItem('searchStartDate');
        sessionStorage.setItem('searchStartDate','');
        this.searchEndDate = sessionStorage.getItem('searchEndDate');
        sessionStorage.setItem('searchEndDate','');
        this.searchLabTypeId = Number(sessionStorage.getItem('searchLabTypeId'));
        sessionStorage.setItem('searchLabTypeId','');

        sessionStorage.setItem('callingFirst','');
        sessionStorage.setItem('searchPatientId','');
        sessionStorage.setItem('searchCustomerId','');
        sessionStorage.setItem('searchOrderId', '');
        this.showLabList = false;
        this.showIssueList = true; 

      }

      this.loadLabSummary();
      this.loadDemoIssues();
      this.loadUnsignedCount();
    }

    locationChanged(){
      this.loadLabSummary();
      this.loadDemoIssues();
      this.loadUnsignedCount();
      this.showLabList = false;
      this.showIssueList = false; 
    }

    loadLabSummary(){
      this.labOrderListData = null;
      this.button = 0;

      this.labOrderService.summary(0, this.searchLocationId, 0, 0, this.searchLabTypeId, this.searchStartDate, this.searchEndDate)
            .pipe(first())
            .subscribe(
            data => {
              if (data.valid)
              {
                this.labOrderSummaryData = data;
                this.holdCount = data.holdTotal;
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
  
    searchButtonClicked(labStatus: number){
        this.button = labStatus;
        this.labOrderService.search(0, this.searchLocationId, labStatus, 0, 0, '', '', this.searchLabTypeId, this.searchStartDate, this.searchEndDate, 1 )
          .pipe(first())
          .subscribe(
          data => {
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
      this.labOrderService.locationUnsignedCount(this.searchLocationId)
            .pipe(first())
            .subscribe(
            data => {
              if (data.valid)
              {
                this.unsignedCount = Number(data.id);
              }
              else {
                this.unsignedCount = 0;
              }
            },
            error => {
              this.errorMessage = error;
            });
    }
  
  
    loadLocationList(){
        // Load Location Data
        this.locationService.getForSalesRep(this.userId)
              .pipe(first())
              .subscribe(
              data => {
                if (data.valid)
                {
                  this.locationList = new Array<LocationListItemModel>();
                  var item = new LocationListItemModel();
                  item.locationId = -1;
                  item.locationName = 'All locations';
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
  
    loadDemoIssues(){
      this.patientService.getPatientsMissingInfo(0, this.searchLocationId)
            .pipe(first())
            .subscribe(
            data => {
              if (data.valid)
              {
                this.issueListData = data.list;
                this.issueCount = this.issueListData.length;
              }
              else{
                this.issueCount = 0;
              }
            },
            error => {
              this.errorMessage = error;
            });
    }

    selectButtonClicked(labOrderId: number, specimenId: number){
      if (this.button == 50){
        this.labOrderService.getLabOrderResultPdf( specimenId)
        .pipe(first())
        .subscribe(
        data => {
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
        sessionStorage.setItem('searchStartDate',String(this.searchStartDate));
        sessionStorage.setItem('searchEndDate',String(this.searchEndDate));
        sessionStorage.setItem('searchLabTypeId',String(Number(this.searchLabTypeId)));
      
        sessionStorage.setItem('searchOrderId',labOrderId.toString());
  
        this.router.navigateByUrl('/lab-order');
      }
    }
  
    signatureButtonClicked(){
      this.button = 3;
      
      this.labOrderService.searchSalesSigMissing(this.searchLocationId)
        .pipe(first())
        .subscribe(
        data => {
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
  
    issueButtonClicked(){
      this.button = 2;
      this.showIssueList = true;
      this.showLabList = false;
    }
  
    holdButtonClicked(){
      this.button = 99;
  
      this.labOrderService.search(0, this.searchLocationId, 1200, 0, 0, '', '', 99, '', '', 1 )
        .pipe(first())
        .subscribe(
        data => {
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

    sortBy(property: string) {
      this.sortOrder = property === this.sortProperty ? (this.sortOrder * -1) : 1;
      this.sortProperty = property;
      this.labOrderListData = [...this.labOrderListData.sort((a: any, b: any) => {
          // sort comparison function
          let result = 0;
          if (a[property] < b[property]) {
              result = -1;
          }
          if (a[property] > b[property]) {
              result = 1;
          }
          return result * this.sortOrder;
      })];
    }
  }
