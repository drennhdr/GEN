//Page Name       : Inbox
//Date Created    : 10/20/2022
//Written By      : Stephen Farkas
//Description     : Inbox
//MM/DD/YYYY xxx  Description
//-----------------------------------------------------------------------------
// Data Passing
//-----------------------------------------------------------------------------
import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import {formatDate} from '@angular/common';

import { InboxService } from '../../services/inbox.service';

import { InboxModel } from '../../models/InboxModel';
import { Observable, ReplaySubject } from 'rxjs';

import { Router } from '@angular/router';

@Component({
  selector: 'app-inbox',
  templateUrl: './inbox.component.html',
  styleUrls: ['./inbox.component.css']
})
export class InboxComponent implements OnInit {
  customerId: number = 0;
  inboxId: number = 0;
  inboxListData: any;
  inboxData: any;
  showError: boolean = false;
  errorMessage: string = "";
  showInbox: boolean = false;
  buttonOn: boolean = false;

  constructor(
    private inboxService: InboxService,
    private router: Router,
  ) {  }

  ngOnInit(): void {
    if (sessionStorage.getItem('userId_Login') == ""){
      this.router.navigateByUrl('/login');
    }
    if (sessionStorage.getItem('callingScreen') == "inbox"){
      sessionStorage.setItem('callingScreen','');
      sessionStorage.setItem('callingFirst','');
      sessionStorage.setItem('searchPatientId','');
      sessionStorage.setItem('searchCustomerId','');
      sessionStorage.setItem('searchOrderId', '');
    }

    if (Number(sessionStorage.getItem('customerId')) == 0 && Number(sessionStorage.getItem('userType')) == 12){
      this.showInbox = false;
      this.errorMessage = "An account has not been selected";
      this.showError = true;
    }
    else{
      this.inboxData = new InboxModel();
      if (Number(sessionStorage.getItem('userType')) == 12){
        this.customerId = Number(sessionStorage.getItem('customerId'))
      }
      else{
        this.customerId = Number(sessionStorage.getItem('entityId_Login'));
      }
      this.showError = false;
      this.inboxService.search( this.customerId )
          .pipe(first())
          .subscribe(
              data => {
                if (data.valid)
                {
                  this.inboxListData = data.list;

                  //console.log("List",this.inboxListData);
                  
                  if(this.inboxListData.length == 0){
                      this.showInbox = false;
                      this.errorMessage = "No records found";
                      this.showError = true;
                  }
                  else{
                      this.showInbox = true;
                      this.showError = false;
                      this.errorMessage = "";
                  }
                }
                else if (data.message == "No records found")
                {
                  this.showInbox = false;
                  this.showError = true;
                  this.errorMessage = "No records found";
                }
                else
                {
                  this.errorMessage = data.message;
                  this.showInbox = false;
                  this.showError = true;
                }
              },
              error => {
                this.errorMessage = error;
                this.showInbox = false;
                this.showError = true;
              });
    }

  }

  selectButtonClicked(inboxId: number){
    this.inboxId = inboxId;
      // Call the inbox service to get the data for the selected item
      this.inboxService.get( this.inboxId)
        .pipe(first())
        .subscribe(
        data => {
          if (data.valid)
          {
            this.errorMessage = "";
            this.showError = false;
            this.inboxData = data;
            this.inboxData.iMessage = this.inboxData.iMessage.replaceAll('<br>','\r');
            this.buttonOn = true;
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

  patientButtonClicked(){
    // Set variables to pass in
    sessionStorage.setItem('callingScreen','inbox');
    sessionStorage.setItem('callingFirst','True');
    sessionStorage.setItem('searchPatientId',this.inboxData.patientId);
    sessionStorage.setItem('searchCustomerId','0');
    sessionStorage.setItem('searchOrderId', '0');

    // Check to see what is missing
    if (this.inboxData.iMessage.indexOf("Insurance") > 0){
      sessionStorage.setItem('searchItem','Insurance');
    }
    else if (this.inboxData.iMessage.indexOf("Patient Name") > 0){
      sessionStorage.setItem('searchItem','Name');
    }
    else {
      sessionStorage.setItem('searchItem','');
    }

    this.router.navigateByUrl('/patient');
  }

  orderButtonClicked(){
    // Set variables to pass in
    sessionStorage.setItem('callingScreen','inbox');
    sessionStorage.setItem('callingFirst','True');
    sessionStorage.setItem('searchPatientId','0');
    sessionStorage.setItem('searchCustomerId','0');
    sessionStorage.setItem('searchOrderId', this.inboxData.labOrderId);

    this.router.navigateByUrl('/lab-order');
  }
}
