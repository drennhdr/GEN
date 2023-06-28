//Page Name       : Lab
//Date Created    : 03/18/2023
//Written By      : Stephen Farkas
//Description     : Lab Entry / Edit
//MM/DD/YYYY xxx  Description
//
//-----------------------------------------------------------------------------
// Data Passing
//-----------------------------------------------------------------------------

import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { first } from 'rxjs/operators';
import {formatDate} from '@angular/common';

import { LabService } from '../../services/lab.service';
import { CodeService } from '../../services/code.service';
import { VirtualEarthService } from '../../services/virtualEarth.service';
import { Router } from '@angular/router';

import { LabModel, LabListItemModel, LabListModel } from '../../models/LabModel';
import { CodeItemModel } from '../../models/CodeModel';
import { Observable, ReplaySubject } from 'rxjs';
import { AddressModel } from '../../models/AddressModel';

// import { stringify } from 'querystring';

@Component({
  selector: 'app-lab',
  templateUrl: './lab.component.html',
  styleUrls: ['./lab.component.css']
})
export class LabComponent implements OnInit {
  // Variables to hold screen data
  labId: number = 0;
  labSearchData: any;
  labData: any;
  showError: boolean;
  errorMessage: string;

  // Search Variables
  searchFirstName: string;
  searchLastName: string;
  searchActive: boolean;

  // Variables to control screen display
  showSearchList: boolean;
  showLab: boolean;

  labSelected: any;

  // Variables for drop down data
  labTypeList: any;
  labList: any;

 
  constructor(
    private labService: LabService,
    private codeService: CodeService,
    private virtualEarthService: VirtualEarthService,
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
    this.showLab = false;
    this.showError = false;

  }

  searchButtonClicked(){
    this.showError = false;
    this.labService.search( "")
        .pipe(first())
        .subscribe(
            data => {
              if (data.valid)
              {
                this.labSearchData = data.list;
                if(this.labSearchData.length == 0){
                    this.showSearchList = true;
                    this.showLab = false;
                }
                else{
                    this.showSearchList = true;
                    this.showLab = false;
                    this.errorMessage = "";
                }
              }
              else if (data.message == "No records found")
              {
                this.showSearchList = true;
                this.showLab = false;
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

  selectButtonClicked(labId: number){
    // Call the customer service to get the data for the selected customer
    this.labService.get( labId)
            .pipe(first())
            .subscribe(
            data => {
              if (data.valid)
              {
                this.labData = data;
                this.labId = data.labId;

                console.log(this.labData);
                
                this.errorMessage = "";
                this.showError = false;
                this.labData = data;

                this.showSearchList = false;
                this.showLab = true;

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

  addButtonClicked(){
    this.labData = new LabModel();
    this.labData.address = new AddressModel();
    this.labData.labId = 0;
    this.showSearchList = false;
    this.showLab = true;
    // Position screen
    var elmnt = document.getElementById("topOfScreen");
    elmnt.scrollIntoView();
  }


  saveLabButtonClicked(){
    this.errorMessage = "";
    this.showError = false;

    this.labService.save( this.labData)
          .pipe(first())
          .subscribe(
          data => {
            if (data.valid){
               this.showLab = false;
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

  cancelLabButtonClicked(){

    this.showLab = false;
    this.showSearchList = true;

    // Position screen
    var elmnt = document.getElementById("topOfScreen");
    elmnt.scrollIntoView();
  }

  zipKeypress(event: any){
    if (event.target.value.length == 5){
      this.virtualEarthService.postalCode( event.target.value )
      .pipe(first())
      .subscribe(
          data => {
            console.log("ZIP",data);
            if (data.statusCode == 200)
            {
              this.labData.address.city = data.resourceSets[0].resources[0].address.locality;
              this.labData.address.state = data.resourceSets[0].resources[0].address.adminDistrict;
              this.labData.address.county = data.resourceSets[0].resources[0].address.adminDistrict2;
            }
          });
    }
  }
}