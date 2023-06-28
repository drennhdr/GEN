//Page Name       : Delegate
//Date Created    : 11/23/2022
//Written By      : Stephen Farkas
//Description     : Delegate Edit
//MM/DD/YYYY xxx  Description
//
//-----------------------------------------------------------------------------
// Data Passing
//-----------------------------------------------------------------------------

import { Component, OnInit, AfterViewChecked, ViewChild, ElementRef } from '@angular/core';
import { first } from 'rxjs/operators';

import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';

import { UserDelegateModel, UserDelegateItemModel } from '../../models/UserModel';


@Component({
  selector: 'app-delegates',
  templateUrl: './delegates.component.html',
  styleUrls: ['./delegates.component.css']
})
export class DelegatesComponent implements OnInit {

  userData: any;
  delegateSelected: any;
  attested: boolean;
  userList: any;
  errorMessage: string = '';
  saved: boolean;

  constructor(
    private userService: UserService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    if (sessionStorage.getItem('userId_Login') == ""){
      this.router.navigateByUrl('/login');
    }
    this.loadData();
    this.saved = false;
  }
  loadData(){
    var userId = Number(sessionStorage.getItem('userId_Login'));
    var index = 0;

    this.userService.search(Number(sessionStorage.getItem('entityId_Login')), '','',false, false)
        .pipe(first())
        .subscribe(
        data => {
          // console.log("User",data);
          if (data.valid)
          {
            this.userList = data.list;
            // If physician logged in, default to physician
            this.userList.forEach( (item) =>{
              if (item.userId == userId){
                this.userList.splice(index, 1)
              }
              index++;
            });

            // Set up list of selected delegate.
            this.delegateSelected = [];
            var cntr: number = 0;

            var delegates = JSON.parse(sessionStorage.getItem('delegate'));

            if (delegates != null){
              delegates.forEach( (item) =>{
                this.delegateSelected[cntr] = item.userId_Delegate;
                cntr++;
              });
            }
          }
          else
          {
            
          }
        },
        error => {
          
        });
  }

  saveButtonClicked(){

    var userId = Number(sessionStorage.getItem('userId_Login'));
    var userDelegate = new UserDelegateModel();
    userDelegate.userId = userId;

    this.delegateSelected.forEach( (item) =>{
      var item2 = new UserDelegateItemModel
      item2.userId = userId;
      item2.userId_Delegate = item;
      userDelegate.delegates.push(item2);
    });
  
    
    this.userService.saveDelegates( userDelegate)
          .pipe(first())
          .subscribe(
          data => {
            if (data.valid) {
              this.errorMessage = "Delegates Updated";
              this.saved = true;
              sessionStorage.setItem('delegate',JSON.stringify(userDelegate.delegates));
            }
            else{
              this.errorMessage = data.message;
            }
          },
          error => {
          this.errorMessage = error;
          });
  }

  cancelButtonClicked(){
    this.loadData();
    this.attested = false;

  }
}
