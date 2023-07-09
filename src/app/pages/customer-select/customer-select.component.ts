//Page Name       : CustomerSelect
//Date Created    : 06/27/2023
//Written By      : Stephen Farkas
//Description     : Customer Select
//MM/DD/YYYY xxx  Description
//-----------------------------------------------------------------------------
// Data Passing
//-----------------------------------------------------------------------------

import { Component, OnInit, AfterViewChecked, HostListener } from '@angular/core';
import { first } from 'rxjs/operators';
import {formatDate} from '@angular/common';

import { Router } from '@angular/router';

import { UserService } from '../../services/user.service';
import { LocationService } from '../../services/location.service';

import { DataShareService } from '../../services/data-share.service';

@Component({
  selector: 'app-customer-select',
  templateUrl: './customer-select.component.html',
  styleUrls: ['./customer-select.component.css']
})
export class CustomerSelectComponent implements OnInit {

  accountListData: any;

  constructor(
    private userService: UserService,
    private locationService: LocationService,
    private router: Router,
  ) { }

  ngOnInit(): void {

    if (sessionStorage.getItem('userId_Login') == ""){
      this.router.navigateByUrl('/login');
    }

    this.accountListData = JSON.parse(sessionStorage.getItem('userAccounts'));
  

  }
  selectButtonClicked(userId){
    this.userService.switchCustomer( userId)
            .pipe(first())
            .subscribe(
            data => {
              if (data.valid)
              {
                sessionStorage.setItem('entityId_Login',String(data.customerId));
                sessionStorage.setItem('userId_Login',String(data.userId));
                sessionStorage.setItem('userName',String(data.firstName + " " + data.lastName));
                sessionStorage.setItem('token',data.validation.token);
                sessionStorage.setItem('signatureId',String(data.userSignatureId));
                sessionStorage.setItem('userType',String(data.userTypeId));
                sessionStorage.setItem('physician',String(data.physician));
                sessionStorage.setItem('barcodePrinter',String(data.barcodePrinter));
                sessionStorage.setItem('barcodeQty',data.barcodeQty.toString());
                sessionStorage.setItem('camera',data.camera.toString());
                sessionStorage.setItem('delegate',JSON.stringify(data.delegates));
                sessionStorage.setItem('shipLog',JSON.stringify(data.shipLog));
                sessionStorage.setItem('locationId','');
                sessionStorage.setItem('locationName','');
                sessionStorage.setItem('customerName',data.customerName);

                this.locationService.search(userId)
                        .pipe(first())
                        .subscribe(
                        data => {
                          console.log("Location Data",data);
                          if (data.valid)
                          {
                            sessionStorage.setItem('locationId',data.list[0].locationId.toString());
                            sessionStorage.setItem('locationName',data.list[0].locationName);
                            this.router.navigateByUrl('/dashboard');
                          }
                        },
                        error => {
                          //
                        });

                
              }
            },
            error => {

            });
  }
}
