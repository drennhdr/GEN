//Page Name       : Location-Modal
//Date Created    : 4/17/2023
//Written By      : Stephen Farkas
//Description     : Location Modal
//MM/DD/YYYY xxx  Description
//-----------------------------------------------------------------------------
// Data Passing
//-----------------------------------------------------------------------------
import { Component, Input, OnInit  } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { first } from 'rxjs/operators';

import { CustomerService } from '../../services/customer.service';
import { LocationService } from '../../services/location.service';

@Component({
  selector: 'app-location-modal',
  templateUrl: './location-modal.component.html',
  styleUrls: ['./location-modal.component.css']
})
export class LocationModalComponent implements OnInit {

  constructor(
    private modalService: BsModalService,
    public bsModalRef: BsModalRef,
    private customerService: CustomerService,
    private locationService: LocationService,
  ) { }

  initialState: any;
  locationId: number;
  locationList: any;

  ngOnInit(): void {
    this.loadLocations();
  }


  locationChanged(){
    sessionStorage.setItem('locationId',this.locationId.toString());
    for (let item of this.locationList){
      if (item.locationId == this.locationId){
        sessionStorage.setItem('locationName',item.locationName);
        break;
      }
    }
  }


  loadLocations() {
    var customerIdLogin = Number(sessionStorage.getItem('entityId_Login'));
    var customerId = Number(sessionStorage.getItem('customerId'));

    console.log("customerIdLogin",customerIdLogin);
    console.log("customerId",customerId);
    
    if (customerIdLogin > 0) {
      var userId = Number(sessionStorage.getItem('userId_Login'));
      this.locationService.search(userId)
            .pipe(first())
            .subscribe(
            data => {
              if (data.valid)
              {
                this.locationList = data.list;
                this.locationId = Number(sessionStorage.getItem('locationId'));
              }
            },
            error => {
              //
            });
    
    }
    else{
      this.locationService.getForCustomer(customerId)
            .pipe(first())
            .subscribe(
            data => {
              if (data.valid)
              {
                this.locationList = data.list;
                this.locationId = Number(sessionStorage.getItem('locationId'));
              }
            },
            error => {
              //
            });

    }

  }
  closeModalButtonClicked(){
    this.bsModalRef.hide();
  }
}
