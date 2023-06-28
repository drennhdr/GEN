//Page Name       : Insurance
//Date Created    : 02/24/2023
//Written By      : Stephen Farkas
//Description     : Insurance Entry / Edit
//MM/DD/YYYY xxx  Description
//
//-----------------------------------------------------------------------------
// Data Passing
//-----------------------------------------------------------------------------

import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import {formatDate} from '@angular/common';

import { InsuranceService } from '../../services/insurance.service';
import { VirtualEarthService } from '../../services/virtualEarth.service';
import { InsuranceModel } from '../../models/InsuranceModel';

import { Router } from '@angular/router';

@Component({
  selector: 'app-insurance',
  templateUrl: './insurance.component.html',
  styleUrls: ['./insurance.component.css']
})
export class InsuranceComponent implements OnInit {

  insuranceId: number = 0;
  insuranceSearchData: any;Insurance
  insuranceData: any;
  showError: boolean;
  errorMessage: string;

  // Search Variables
  searchName: string;
  searchState: string;

  // Variables to control screen display
  showSearch: boolean;
  showSearchList: boolean;
  showInsurance: boolean;
  saveInsurance: boolean;


  constructor(
    private insuranceService: InsuranceService,
    private virtualEarthService: VirtualEarthService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    if (sessionStorage.getItem('userId_Login') == ""){
      this.router.navigateByUrl('/login');
    }
    // Initialize screen handling variables
    this.showSearch = true;
    this.showSearchList = false;
    this.showInsurance = false;


    this.searchName = "";
    this.searchState = "";
  }
  searchButtonClicked(){
    this.showError = false;
    this.insuranceService.search(  this.searchName,
                                  this.searchState )
        .pipe(first())
        .subscribe(
            data => {
              if (data.valid)
              {
                // console.log("Customer Search Data",this.insuranceSearchData);
                //this.router.navigate([this.dashboardUrl]);
                this.insuranceSearchData = data.list;
                if(this.insuranceSearchData.length == 0){
                    this.showSearchList = false;
                    this.showInsurance = false;
                    this.errorMessage = "No records found";
                    this.showError = true;
                }
                else{
                    this.showSearchList = true;
                    this.showInsurance = false;
                    this.errorMessage = "";
                }
              }
              else if (data.message == "No records found")
              {
                this.errorMessage = "No records found";
                this.showSearchList = false;
                this.showInsurance = false;
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
    this.searchState = "";    
  }

  selectButtonClicked(insuranceId: number){
    // Call the nsurance service to get the data for the selected insurance
    this.insuranceService.get( insuranceId)
            .pipe(first())
            .subscribe(
            data => {
              if (data.valid)
              {
                
                this.insuranceId = data.insuranceId;

                this.errorMessage = "";
                this.showError = false;
                this.insuranceData = data;

                this.showSearch = false;
                this.showSearchList = false;
                this.showInsurance = true;

                this.saveInsurance = false;
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

            // Position screen
            var elmnt = document.getElementById("topOfScreen");
            elmnt.scrollIntoView();
  }

  insuranceChanged(){
    this.saveInsurance = false;
    if (this.insuranceData.name != '' 
      && this.insuranceData.phone != ''
      && this.insuranceData.street1 != ''
      && this.insuranceData.city != ''
      && this.insuranceData.state != ''
      && this.insuranceData.postalCode != ''){
        this.saveInsurance = true;
      }

  }

  addButtonClicked(){
    // Initialze data to a blank record
    this.insuranceData = new InsuranceModel();


    // Set screen handling variables
    this.showSearch = false;
    this.showSearchList = false;
    this.showInsurance = true;
    this.saveInsurance = false;
    
    this.errorMessage = "";
    this.showError = false;   
    
    // Position screen
    var elmnt = document.getElementById("topOfScreen");
    elmnt.scrollIntoView();
  }

  saveButtonClicked() {

    this.showError = false;
    this.insuranceService.save( this.insuranceData)
          .pipe(first())
          .subscribe(
          data => {
            if (data.valid) {
              
              this.showSearch = true;
              this.showSearchList = true;
              this.showInsurance = false;

              // Update list
              this.searchButtonClicked();
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
    this.showSearch = true;
    this.showSearchList = true;
    this.showInsurance = false;
  }

  zipKeypress(event: any){
    if (event.target.value.length == 5){
      this.virtualEarthService.postalCode( event.target.value )
      .pipe(first())
      .subscribe(
          data => {
            if (data.statusCode == 200)
            {
              this.insuranceData.city = data.resourceSets[0].resources[0].address.locality;
              this.insuranceData.state = data.resourceSets[0].resources[0].address.adminDistrict;
              this.insuranceData.county = data.resourceSets[0].resources[0].address.adminDistrict2;

              this.insuranceChanged();
            }
          });
    }
  }
}
