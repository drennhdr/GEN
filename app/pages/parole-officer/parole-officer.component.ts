//Page Name       : Parole Officer
//Date Created    : 06/17/2023
//Written By      : Stephen Farkas
//Description     : Parole Officer Entry / Edit
//MM/DD/YYYY xxx  Description
//
//-----------------------------------------------------------------------------
// Data Passing
//-----------------------------------------------------------------------------

import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { first } from 'rxjs/operators';
import {formatDate} from '@angular/common';

import { UserService } from '../../services/user.service';
import { CodeService } from '../../services/code.service';
import { PatientService } from '../../services/patient.service';
import { Router } from '@angular/router';

import { UserModel, UserListItemModel, UserListModel, UserLabModel } from '../../models/UserModel';
import { PatientSearchModel } from '../../models/PatientModel';
import { PatientParoleModel } from '../../models/PatientParoleModel';

@Component({
  selector: 'app-parole-officer',
  templateUrl: './parole-officer.component.html',
  styleUrls: ['./parole-officer.component.css']
})
export class ParoleOfficerComponent implements OnInit {

  // Variables to hold screen data
  userId: number = 0;
  userSearchData: any;
  userData: any;
  patientListData: any;
  showError: boolean;
  errorMessage: string;

  patientSearchData: any;

  // Search Variables
  searchFirstName: string;
  searchLastName: string;
  searchActive: boolean;

  searchPatientFirst: string;
  searchPatientLast: string;
  searchPatientDOB: string;

  // Variables to control screen display
  showSearch: boolean;
  showSearchList: boolean;
  showUser: boolean;
  showPatientList: boolean;
  showPatientSearch: boolean;
  showPatientSearchList: boolean;

  labSelected: any;
  userSave: boolean;
  saveButton: string;

  // Variables for drop down data
  userTypeList: any;
  labList: any;


  constructor(
    private userService: UserService,
    private codeService: CodeService,
    private patientService: PatientService,
    private router: Router,
  ) { 
  }

  ngOnInit(): void {
    if (sessionStorage.getItem('userId_Login') == ""){
      this.router.navigateByUrl('/login');
    }
    // Initialize screen handling variables
    this.showSearch = true;
    this.showSearchList = false;
    this.showUser = false;
    this.showError = false;
    this.showPatientList = false;
    this.showPatientSearch = false;
    this.showPatientSearchList = false;



    this.loadDropdownLists();

    this.searchFirstName = "";
    this.searchLastName = "";
    this.searchActive = true;
    this.saveButton = "Save";


  }

  searchButtonClicked(){

    this.showError = false;
    this.userService.search( 0, this.searchFirstName, this.searchLastName, false, true)
        .pipe(first())
        .subscribe(
            data => {
              if (data.valid)
              {
                
                //this.router.navigate([this.dashboardUrl]);
                this.userSearchData = data.list;
                if(this.userSearchData.length == 0){
                    this.showSearchList = false;
                    this.showUser = false;
                    this.errorMessage = "No records found";
                    this.showError = true;
                }
                else{
                    this.showSearchList = true;
                    this.showUser = false;
                    this.errorMessage = "";
                }
              }
              else if (data.message == "No records found")
              {
                this.errorMessage = "No records found";
                this.showSearchList = false;
                this.showUser = false;
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
    this.searchFirstName = "";
    this.searchLastName = "";
    this.searchActive = true;
  }

  selectButtonClicked(userId: number){
    // Call the user service to get the data for the selected user
    this.userService.get( userId)
            .pipe(first())
            .subscribe(
            data => {
              if (data.valid)
              {
                
                this.userId = data.userId;
                
                this.errorMessage = "";
                this.showError = false;
                this.userData = data;

                this.showSearch = false;
                this.showSearchList = false;
                this.showUser = true;
                this.userSave = false;
                this.showPatientList = true;
                this.saveButton = "Save";

                this.loadPatientList();

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
              console.log("Error1");
              this.errorMessage = error;
              this.showError = true;
            });
  }

  addButtonClicked(){
    this.userData = new UserModel();
    this.userData.customerId = 0;
    this.userData.userId = 0;
    this.userData.userTypeId = 14;
    this.userData.firstName = this.searchFirstName;
    this.userData.lastName = this.searchLastName;
    this.userSave = false;
    this.labSelected = [];
    this.showSearch = false;
    this.showSearchList = false;
    this.showUser = true;
    this.saveButton = "Save & Continue";
    // Position screen
    var elmnt = document.getElementById("topOfScreen");
    elmnt.scrollIntoView();
  }

  resetUserPasswordButtonClicked(){
    this.userService.resetUserPassword( this.userData)
    .pipe(first())
    .subscribe(
    data => {
      if (data.valid){
         this.showUser = false;
         this.showSearch = true;
         this.showSearchList = true;

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

  
  userChanged(){
    this.userSave = false;
    if (this.userData.firstName != "" && this.userData.lastName !=""
      && this.userData.email !=""){
      this.userSave = true;
    }
  }

  saveUserButtonClicked(){
    this.errorMessage = "";
    this.showError = false;

    this.userData.labs = new Array<UserLabModel> 
    var cntr: number = 1;
    if (this.labSelected != null){
      this.labSelected.forEach( (item) =>{
        var item2 = new UserLabModel();
        item2.labId = item;
        this.userData.labs.push(item2);
      });
    }

    this.userService.save( this.userData)
          .pipe(first())
          .subscribe(
          data => {
            if (data.valid){
              if (this.userData.userId == 0){
                this.userData.userId = Number(data.id);
                this.showPatientList = true;
                this.saveButton = "Save";
              }
              else{
               this.showUser = false;
               this.showSearch = true;
               this.showSearchList = true;

               // Position screen
               var elmnt = document.getElementById("topOfScreen");
               elmnt.scrollIntoView();
              }
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

  cancelUserButtonClicked(){

    this.showUser = false;
    this.showPatientList = false;
    this.showSearch = true;
    this.showSearchList = true;

    // Position screen
    var elmnt = document.getElementById("topOfScreen");
    elmnt.scrollIntoView();
  }

  loadPatientList(){
    this.patientService.getPatientParoleList( this.userData.userId )
          .pipe(first())
          .subscribe(
          data => {
            if (data.valid)
            {
              this.patientListData = data.list;

            }
          });
  }

  addPatientButtonClicked(patientId: number){
    this.showUser = false;
    this.showPatientList = false;
    this.showPatientSearch = true;
    this.showPatientSearchList = true;
  }

  cancelPatientButtonClicked(){
    this.showUser = true;
    this.showPatientList = true;
    this.showPatientSearch = false;
    this.showPatientSearchList = false;
  }

  clearPatientSearchButtonClicked(){
    this.searchPatientFirst = "";
    this.searchPatientLast = "";
    this.searchPatientDOB = "";
  }

  searchPatientButtonClicked(){
    this.showError = false;

      this.patientService.searchForParole( 
                                    this.searchPatientFirst,
                                    this.searchPatientLast,
                                    this.searchPatientDOB )
          .pipe(first())
          .subscribe(
              data => {
                if (data.valid)
                {
                  this.patientSearchData = data.list;
                  if(this.patientSearchData.length == 0){
                      this.showPatientSearchList = false;
                      this.showError = true;
                      this.errorMessage = "No records found";
                  }
                  else{
                      this.showPatientSearchList = true;
                      this.showError = false;
                      this.errorMessage = "";
                  }
                }
                else if (data.message == "No records found")
                {
                  this.errorMessage = "No records found";
                  this.showError = true;
                  this.showPatientSearchList = false;
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

  selectPatientButtonClicked(patientId: number){
    this.showError = false;

    var patientParole: PatientParoleModel = new PatientParoleModel();

    patientParole.userId = this.userData.userId;
    patientParole.patientId = patientId;


    this.patientService.savePatientParole (patientParole)
        .pipe(first())
        .subscribe(
            data => {
              if (data.valid)
              {
                  this.loadPatientList();
                  this.showUser = true;
                  this.showPatientList = true;
                  this.showPatientSearch = false;
                  this.showPatientSearchList = false;

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

  removePatientButtonClicked(patientParoleId: number){
    this.showError = false;

    var patientParole: PatientParoleModel = new PatientParoleModel();

    patientParole.patientParoleId = patientParoleId;
    patientParole.userId = this.userData.userId;
    patientParole.patientId = 0;


    this.patientService.removePatientParole (patientParole)
        .pipe(first())
        .subscribe(
            data => {
              if (data.valid)
              {
                  this.loadPatientList();
                  this.showUser = true;
                  this.showPatientList = true;
                  this.showPatientSearch = false;
                  this.showPatientSearchList = false;

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


  loadDropdownLists(){
    this.codeService.getList( 'UserType,Lab' )

    .pipe(first())
    .subscribe(
        data => {
          if (data.valid)
          {
            this.userTypeList = data.list0;

            this.labList = new Array<UserLabModel>;

            for (let item of data.list1){
              var item2 = new UserLabModel();
              item2.labId = item.id;
              item2.labName = item.description;
              this.labList.push(item2); 
            }
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