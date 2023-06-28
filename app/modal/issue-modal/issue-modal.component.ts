//Page Name       : Issue-Modal
//Date Created    : 09/19/2022
//Written By      : Stephen Farkas
//Description     : Lab Order Issues & Warning Modal
//MM/DD/YYYY xxx  Description
//-----------------------------------------------------------------------------
// Data Passing
//-----------------------------------------------------------------------------
import { Component, Input, OnInit  } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs/Subject';
 
import { LabOrderService } from '../../services/labOrder.service';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-issue-modal',
  templateUrl: './issue-modal.component.html',
  styleUrls: ['./issue-modal.component.css'],
})
export class IssueModalComponent implements OnInit {
  public onClose: Subject<number>;
  labOrderId: number;
  labOrderIssue: any;
  demographicsHold: any;
  releaseHold: string;
  initialState: any;
  note: string; 
  noteEntered: boolean = false;
  
  constructor(
    private modalService: BsModalService,
    public bsModalRef: BsModalRef,
    private labOrderService: LabOrderService,
    ) {}

  ngOnInit(): void {
    this.labOrderId = this.initialState.labOrderId;
    this.demographicsHold = this.initialState.demographicsHold;
    this.onClose = new Subject();

    // Call the lab order service to get the data for the selected lab order
    this.labOrderService.getLabOrderIssueList( this.labOrderId)
            .pipe(first())
            .subscribe(
            data => {
              if (data.valid)
              {              
                this.labOrderIssue = data.issues;
                this.releaseHold = data.releaseHold;
              }
              else
              {
                this.releaseHold = "";
                //this.errorMessage = data.message;
              }
            },
            error => {
              // this.errorMessage = error;
              // this.showError = true;
            });

  }
  userChanged(){
    this.noteEntered = false;
    if (this.note != ''){
      this.noteEntered = true;
    }
  }

  ReleaseHoldButtonClicked(){
    this.labOrderService.releaseDemographicsHold( this.labOrderId, this.note)
          .pipe(first())
          .subscribe(
          data => {
            this.onClose.next(1);
            this.bsModalRef.hide();

          });
  }

  closeModalButtonClicked(){
    this.onClose.next(0);
    this.bsModalRef.hide();
  }

}
