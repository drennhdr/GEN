//Page Name       : Customer-Modal
//Date Created    : 2/15/2023
//Written By      : Stephen Farkas
//Description     : Customer Modal
//MM/DD/YYYY xxx  Description
//-----------------------------------------------------------------------------
// Data Passing
//-----------------------------------------------------------------------------
import { Component, Input, OnInit  } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { first } from 'rxjs/operators';

import { CustomerService } from '../../services/customer.service';

@Component({
  selector: 'app-customer-modal',
  templateUrl: './customer-modal.component.html',
  styleUrls: ['./customer-modal.component.css']
})
export class CustomerModalComponent implements OnInit {
  initialState: any;
  customerData: any;

  constructor(
    private modalService: BsModalService,
    public bsModalRef: BsModalRef,
    private customerService: CustomerService,

  ) { }

  ngOnInit(): void {
    this.loadCustomer();
  }


  loadCustomer() {
    var customerId = Number(sessionStorage.getItem('customerId'));

    this.customerService.get( customerId)
          .pipe(first())
          .subscribe(
          data => {
            if (data.valid)
            {
              this.customerData = data;
            }
            else
            {
              //this.errorMessage = data.message;
            }
          });
  }
  closeModalButtonClicked(){
    this.bsModalRef.hide();
  }
}
