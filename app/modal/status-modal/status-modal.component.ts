//Page Name       : Status-Modal
//Date Created    : 12/22/2022
//Written By      : Stephen Farkas
//Description     : Status Modal
//MM/DD/YYYY xxx  Description
//-----------------------------------------------------------------------------
// Data Passing
//-----------------------------------------------------------------------------

import { Component, Input, OnInit  } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { first, throwIfEmpty } from 'rxjs/operators';

import { LabOrderService } from '../../services/labOrder.service';

@Component({
  selector: 'app-status-modal',
  templateUrl: './status-modal.component.html',
  styleUrls: ['./status-modal.component.css']
})
export class StatusModalComponent implements OnInit {
  labOrderStatus: any;

  initialState: any;
  note: string = "";

  constructor(
    private modalService: BsModalService,
    public bsModalRef: BsModalRef,
    public labOrderService: LabOrderService,
  ) { }

  ngOnInit(): void {
    console.log("State", this.initialState);
    var specimenBarcode = this.initialState.specimenBarcode;

    //Call the lab order service to get the data for the selected lab order
    this.labOrderService.specimenStatusChange( specimenBarcode)
            .pipe(first())
            .subscribe(
            data => {
              console.log("Data",data);
              if (data.valid)
              {              
                this.labOrderStatus = data;
              }
              else
              {
                //this.errorMessage = data.message;
              }
            },
            error => {
              // this.errorMessage = error;
              // this.showError = true;
            });
  }


  cancelButtonClicked(){
    this.bsModalRef.hide();
  }
  closeModalButtonClicked(){

  }
}
