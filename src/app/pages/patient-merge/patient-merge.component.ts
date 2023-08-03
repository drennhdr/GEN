//Page Name       : PatientMerge
//Date Created    : 07/31/2023
//Written By      : Stephen Farkas
//Description     : Patient Merge
//MM/DD/YYYY xxx  Description
//-----------------------------------------------------------------------------
// Data Passing
//-----------------------------------------------------------------------------

import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import {formatDate} from '@angular/common';

import { PatientService } from '../../services/patient.service';
import { Router, NavigationStart } from '@angular/router';

@Component({
  selector: 'app-patient-merge',
  templateUrl: './patient-merge.component.html',
  styleUrls: ['./patient-merge.component.css']
})
export class PatientMergeComponent implements OnInit {

  // Variables to hold screen data
  customerId: number = 0;
  locationId: number = 0;
  locationName: string = "";
  entityId: number = 0;
  patientId: number = 0;
  patientSearchData: any;
  patientData: any;
  patientMergeId: number = 0;
  patientMergeSearchData: any;
  patientMergeData: any;
  showError: boolean;
  errorMessage: string;

  // Search Variables
  searchFirstName: string;
  searchLastName: string;
  searchDOB: string;
  searchGenderId: number;
  searchMedicalRecordId: string;
  searchActive: boolean;
  searchIsEmployee: boolean;     
  searchIsPatient: boolean;

  // Search Variables
  searchMergeFirstName: string;
  searchMergeLastName: string;
  searchMergeDOB: string;
  searchMergeGenderId: number;
  searchMergeMedicalRecordId: string;
  searchMergeActive: boolean;
  searchMergeIsEmployee: boolean;     
  searchMergeIsPatient: boolean;

  // Variables to control screen display
  showSearch: boolean;
  showSearchList: boolean;
  showPatient: boolean;
  primaryInsurance: string;
  secondaryInsurance: string;

  showMergeSearch: boolean;
  showMergeSearchList: boolean;
  showMergePatient: boolean;
  primmaryMergeInsurance: string;
  secondaryMergeInsurance: string;

  constructor(
    private patientService: PatientService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    if (sessionStorage.getItem('userId_Login') == ""){
      this.router.navigateByUrl('/login');
    }
    if (Number(sessionStorage.getItem('customerId')) == 0 ){
      this.showSearch = false;
      this.errorMessage = "An account has not been selected";
      this.showError = true;
    }
    else{
      this.clearSearchButtonClicked();
      this.clearMergeSearchButtonClicked();
      this.showSearch = true;
    }
  }

  clearSearchButtonClicked(){
    this.searchFirstName = '';
    this.searchLastName = '';
    this.searchMedicalRecordId = '';
    this.searchDOB = null;
    this.searchGenderId = -1;
    this.searchActive = true;
    this.searchIsPatient = true;
    this.searchIsEmployee = false;
  }

  searchButtonClicked(){
    this.showError = false;

    this.locationId = Number(sessionStorage.getItem('locationId'));
    
    var location = sessionStorage.getItem('locationName');
    if (location == 'All Locations'){
      this.locationName = '';
    }
    else{
      this.locationName = "(Location: " + location + ")";
    }

    this.patientService.search(  this.customerId,
                                  this.locationId,
                                  this.searchFirstName,
                                  this.searchLastName,
                                  this.searchDOB,
                                  this.searchGenderId,
                                  this.searchMedicalRecordId,
                                  this.searchActive,
                                  false,
                                  this.searchIsEmployee,
                                  this.searchIsPatient )
        .pipe(first())
        .subscribe(
            data => {
              if (data.valid)
              {
                this.patientSearchData = data.list;
                if(this.patientSearchData.length == 0){
                    this.showSearchList = false;
                    this.showPatient = false;
                    this.showError = true;
                    this.errorMessage = "No records found";
                }
                else{
                    this.showSearchList = true;
                    this.showPatient = false;
                    this.showError = false;
                    this.errorMessage = "";
                }
              }
              else if (data.message == "No records found")
              {
                this.errorMessage = "No records found";
                this.showError = true;
                this.showSearchList = false;
                this.showPatient = false;
              }
              else
              {
                this.errorMessage = data.message;

              }
            },
            error => {
              this.showError = true;
              this.errorMessage = error;
            });
   
  }
  
  selectButtonClicked(patientId: number){

    // Call the patient service to get the data for the selected patient
    
    this.patientService.get( patientId)
            .pipe(first())
            .subscribe(
            data => {
              if (data.valid)
              {
                
                this.patientId = data.patientId;
                this.errorMessage = "";
                this.showError = false;
                this.patientData = data;

                this.showSearch = false;
                this.showSearchList = false;
                this.showPatient = true;
                this.showMergeSearch = true;

                this.patientData.insurances.forEach( (item) =>{
                  if (item.sequence == 1){
                    this.primaryInsurance = item.insurance;
                  }
                  else if(item.sequence == 2){
                    this.secondaryInsurance = item.insurance;
                  }
                });

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

  clearMergeSearchButtonClicked(){
    this.searchMergeFirstName = '';
    this.searchMergeLastName = '';
    this.searchMergeMedicalRecordId = '';
    this.searchMergeDOB = null;
    this.searchMergeGenderId = -1;
    this.searchMergeActive = true;
    this.searchMergeIsPatient = true;
    this.searchMergeIsEmployee = false;
  }

  searchMergeButtonClicked(){
    this.showError = false;

    this.locationId = Number(sessionStorage.getItem('locationId'));
    
    var location = sessionStorage.getItem('locationName');
    if (location == 'All Locations'){
      this.locationName = '';
    }
    else{
      this.locationName = "(Location: " + location + ")";
    }

    this.patientService.search(  this.customerId,
                                  this.locationId,
                                  this.searchMergeFirstName,
                                  this.searchMergeLastName,
                                  this.searchMergeDOB,
                                  this.searchMergeGenderId,
                                  this.searchMergeMedicalRecordId,
                                  this.searchMergeActive,
                                  false,
                                  this.searchMergeIsEmployee,
                                  this.searchMergeIsPatient )
        .pipe(first())
        .subscribe(
            data => {
              if (data.valid)
              {
                let index = data.list.findIndex(d => d.patientId === this.patientId); //find index in your array
                if (index > -1){
                  data.list.splice(index, 1);
                }
                this.patientMergeSearchData = data.list;
                if(this.patientMergeSearchData.length == 0){
                    this.showMergeSearchList = false;
                    this.showMergePatient = false;
                    this.showError = true;
                    this.errorMessage = "No records found";
                }
                else{
                    this.showMergeSearchList = true;
                    this.showMergePatient = false;
                    this.showError = false;
                    this.errorMessage = "";
                }
              }
              else if (data.message == "No records found")
              {
                this.errorMessage = "No records found";
                this.showError = true;
                this.showMergeSearchList = false;
                this.showMergePatient = false;
              }
              else
              {
                this.errorMessage = data.message;

              }
            },
            error => {
              this.showError = true;
              this.errorMessage = error;
            });
   
  }
  
  selectMergeButtonClicked(patientMergeId: number){

    // Call the patient service to get the data for the selected patient
    
    this.patientService.get( patientMergeId)
            .pipe(first())
            .subscribe(
            data => {
              if (data.valid)
              {
                
                this.patientMergeId = data.patientId;
                this.errorMessage = "";
                this.showError = false;
                this.patientMergeData = data;

                this.showMergeSearch = false;
                this.showMergeSearchList = false;
                this.showMergePatient = true;

                this.patientData.insurances.forEach( (item) =>{
                  if (item.sequence == 1){
                    this.primaryInsurance = item.insurance;
                  }
                  else if(item.sequence == 2){
                    this.secondaryInsurance = item.insurance;
                  }
                });

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

  mergeButtonClicked(){
    this.patientService.mergePatient(this.patientId, this.patientMergeId )
        .pipe(first())
        .subscribe(
        data => {
          if (data.valid)
          {

            this.resetData();
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

  cancelButtonClicked(){
    this.resetData();
  }

  resetData(){
    this.patientId = 0;
    this.patientMergeId = 0;
    this.searchFirstName = "";
    this.searchLastName = "";
    this.searchDOB = "";
    this.searchGenderId = 0;
    this.searchMedicalRecordId = "";
    this.searchActive = true;
    this.searchIsEmployee = false;     
    this.searchIsPatient = false; 
    this.searchMergeFirstName = "";
    this.searchMergeLastName = "";
    this.searchMergeDOB = "";
    this.searchMergeGenderId = 0;
    this.searchMergeMedicalRecordId = "";
    this.searchMergeActive = true;
    this.searchMergeIsEmployee = false;     
    this.searchMergeIsPatient = false; 
    this.showError = false;
  
    // Variables to control screen display
    this.showSearch = true;
    this.showSearchList = false;
    this.showPatient = false;
    this.primaryInsurance = "";
    this.secondaryInsurance = "";
  
    this.showMergeSearch = false;
    this.showMergeSearchList = false;
    this.showMergePatient = false;
    this.primmaryMergeInsurance = "";
    this.secondaryMergeInsurance = "";
  
  }
}
