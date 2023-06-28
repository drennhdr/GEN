//Page Name       : PreAuth
//Date Created    : 03/23/2023
//Written By      : Stephen Farkas
//Description     : PreAuth Entry / Edit
//MM/DD/YYYY xxx  Description
//
//-----------------------------------------------------------------------------
// Data Passing
//-----------------------------------------------------------------------------

import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { first } from 'rxjs/operators';
import {formatDate} from '@angular/common';

import { LabOrderService } from '../../services/labOrder.service';
import { PatientService } from '../../services/patient.service';
import { CodeService } from '../../services/code.service';
import { Router } from '@angular/router';

import { LabOrderPreAuthSearchModel, LabOrderPreAuthListModel } from '../../models/LabOrderModel';
import { CodeItemModel } from '../../models/CodeModel';
import { Observable, ReplaySubject } from 'rxjs';


// import { stringify } from 'querystring';

@Component({
  selector: 'app-preauth',
  templateUrl: './preauth.component.html',
  styleUrls: ['./preauth.component.css']
})
export class PreauthComponent implements OnInit {
  // Variables to hold screen data
  labId: number = 0;
  preAuthSearchData: any;
  patientData: any;
  insuranceData: any;
  showError: boolean;
  errorMessage: string;

  // Search Variables
  searchDateStart: string = '1/1/1900';
  searchDateEnd: string = '12/31/2025';
  searchLabId: number = 0;
  searchLabTypeId: number = 99;
  searchCustomerId: number = 0;


  // Variables to control screen display
  showSearchList: boolean;
  showPreAuth: boolean;
  preAuthSave: boolean;

  labSelected: any;

  // Variables for drop down data
  labTypeList: any;
  labList: any;

 
  constructor(
    private labOrderService: LabOrderService,
    private patientService: PatientService,
    private codeService: CodeService,
    private router: Router,
  ) { 
  }

  ngOnInit(): void {
    if (sessionStorage.getItem('userId_Login') == ""){
      this.router.navigateByUrl('/login');
    }
    // Initialize screen handling variables
    this.searchButtonClicked();
    this.showSearchList = true;
    this.showPreAuth = false;
    this.showError = false;

  }

  searchButtonClicked(){
    this.showError = false;
    this.labOrderService.getMissingPreAuth(this.searchDateStart, this.searchDateEnd, this.searchLabId, this.searchLabTypeId, this.searchCustomerId)
        .pipe(first())
        .subscribe(
            data => {
              if (data.valid)
              {
                this.preAuthSearchData = data.list;
                if(this.preAuthSearchData.length == 0){
                    this.showSearchList = true;
                    this.showPreAuth = false;
                }
                else{
                    this.showSearchList = true;
                    this.showPreAuth = false;
                    this.errorMessage = "";
                }
              }
              else if (data.message == "No records found")
              {
                this.showSearchList = true;
                this.showPreAuth = false;
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

  selectButtonClicked(patientId: number){
    // Call the customer service to get the data for the selected customer
    this.patientService.get( patientId)
            .pipe(first())
            .subscribe(
            data => {
              if (data.valid)
              {
                this.patientData = data;

                this.patientData.insurances.forEach(item => {
                  if (item.sequence == 1){
                    var patientInsuranceId = item.patientInsuranceId;

                    this.patientService.getPatientInsurance( patientInsuranceId)
                    .pipe(first())
                    .subscribe(
                    data => {
                      if (data.valid)
                      {
                        this.insuranceData = data;
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
                });
                
                this.errorMessage = "";
                this.showError = false;

                this.showSearchList = false;
                this.showPreAuth = true;

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

  insuranceChanged(){
    this.preAuthSave = false;
    if (this.insuranceData.preAuthNumber != "" && this.insuranceData.preAuthEndDate != null){
      this.preAuthSave = true;
    }
  }


  saveButtonClicked(){
    this.errorMessage = "";
    this.showError = false;

    this.patientService.savePatientPreAuth( this.insuranceData)
          .pipe(first())
          .subscribe(
          data => {
            if (data.valid){
               this.showPreAuth = false;
               this.showSearchList = true;
               this.searchButtonClicked();

               // Position screen
               var elmnt = document.getElementById("topOfScreen");
               elmnt.scrollIntoView();
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

  backButtonClicked(){

    this.showPreAuth = false;
    this.showSearchList = true;

    // Position screen
    var elmnt = document.getElementById("topOfScreen");
    elmnt.scrollIntoView();
  }

}