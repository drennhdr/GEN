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

import { UserDelegateModel, UserDelegateItemModel, UserListItemModel } from '../../models/UserModel';


@Component({
  selector: 'app-delegates',
  templateUrl: './delegates.component.html',
  styleUrls: ['./delegates.component.css']
})
export class DelegatesComponent implements OnInit {

  userData: any;
  // delegateSelected: any;
  attested: boolean;
  userList: any;
  delegateList: any;
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
          if (data.valid)
          {
            // Remove physician & Duplicates from list
            var holdUserId = 0;
            this.userList = new Array<UserListItemModel>();
            data.list.forEach( (item) =>{
              if (item.userId != userId && item.userId != holdUserId){
                this.userList.push(item);
              }
              holdUserId = item.userId;
            });

            this.delegateList = new Array<UserListItemModel>();
            var delegates = JSON.parse(sessionStorage.getItem('delegate'));

            if (delegates != null){
              delegates.forEach( (item) =>{
                this.userList.forEach( (item2) =>{
                  if (item2.userId == item.userId_Delegate){
                    this.delegateList.push(item2)
                  }
                  index++;
                });
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

    this.delegateList.forEach( (item) =>{
      var item2 = new UserDelegateItemModel
      item2.userId = userId;
      item2.userId_Delegate = item.userId;
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

  newDelegateClick(id: number){
    var found = false;
    // Check if delegate already in lab list
    for (let item of this.delegateList){
      if (item.userId == id){
        found = true;
        break;
      }
    }

    if (!found){
      // Find delegate in list
      for (let item of this.userList){
        if (item.userId == id){
          this.delegateList.push(item)
        }
      }
    }
  }

  currentDelegateClick(id: number){
    var index = 0;
    for (let item of this.delegateList){
      if (item.userId == id){
        this.delegateList.splice(index, 1);
      }
      index++;
    }
  }

}
