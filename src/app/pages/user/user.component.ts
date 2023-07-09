//Page Name       : User
//Date Created    : 11/15/2022
//Written By      : Stephen Farkas
//Description     : User Entry / Edit
//MM/DD/YYYY xxx  Description
//05/14/2023 SJF  Added resetUserButtonClicked()
//-----------------------------------------------------------------------------
// Data Passing
//-----------------------------------------------------------------------------

import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { first } from 'rxjs/operators';
import {formatDate} from '@angular/common';

import { UserService } from '../../services/user.service';
import { CodeService } from '../../services/code.service';
import { Router } from '@angular/router';

import { UserModel, UserListItemModel, UserListModel, UserLabModel } from '../../models/UserModel';
import { CodeItemModel } from '../../models/CodeModel';
import { Observable, ReplaySubject } from 'rxjs';


// import { stringify } from 'querystring';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  // Variables to hold screen data
  userId: number = 0;
  userSearchData: any;
  userData: any;
  showError: boolean;
  errorMessage: string;

  // Search Variables
  searchFirstName: string;
  searchLastName: string;
  searchActive: boolean;

  // Variables to control screen display
  showSearch: boolean;
  showSearchList: boolean;
  showUser: boolean;

  labSelected: any;
  userSave: boolean;

  // Variables for drop down data
  userTypeList: any;
  labList: any;


  constructor(
    private userService: UserService,
    private codeService: CodeService,
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


    this.loadDropdownLists();

    this.searchFirstName = "";
    this.searchLastName = "";
    this.searchActive = true;


  }

  searchButtonClicked(){

    this.showError = false;
    this.userService.search( 0, this.searchFirstName, this.searchLastName, false, false)
        .pipe(first())
        .subscribe(
            data => {
              if (data.valid)
              {
                
                //this.router.navigate([this.dashboardUrl]);
                this.userSearchData = data.list;
                console.log("Search Data",this.userSearchData);
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

                // Set up list of locations user has access to.
                this.labSelected = [];
                var cntr: number = 0;
                if (this.userData.labs != null){
                  this.userData.labs.forEach( (item) =>{
                    this.labSelected[cntr] = item.labId;
                    cntr++;
                  });
                }

                this.showSearch = false;
                this.showSearchList = false;
                this.showUser = true;
                this.userSave = false;

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
    this.userData.userTypeId = 4;
    this.userSave = false;
    this.labSelected = [];
    this.showSearch = false;
    this.showSearchList = false;
    this.showUser = true;
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

  cancelUserButtonClicked(){

    this.showUser = false;
    this.showSearch = true;
    this.showSearchList = true;

    // Position screen
    var elmnt = document.getElementById("topOfScreen");
    elmnt.scrollIntoView();
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