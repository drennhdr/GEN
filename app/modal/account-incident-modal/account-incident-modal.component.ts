//Page Name       : Account-Incident-Modal
//Date Created    : 03/30/2023
//Written By      : Stephen Farkas
//Description     : Account Incident Modal
//MM/DD/YYYY xxx  Description
//-----------------------------------------------------------------------------
// Data Passing
//-----------------------------------------------------------------------------
import { Component, Input, OnInit  } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs/Subject';
 
import { CodeService } from '../../services/code.service';
import { LabOrderService } from '../../services/labOrder.service';
import { CustomerIncidentModel } from '../../models/CustomerModel';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-account-incident-modal',
  templateUrl: './account-incident-modal.component.html',
  styleUrls: ['./account-incident-modal.component.css']
})
export class AccountIncidentModalComponent implements OnInit {

  public onClose: Subject<number>;
  initialState: any;
  customerId: number;
  incidentList: any;
  reviewData: any;

  constructor(
    private modalService: BsModalService,
    public bsModalRef: BsModalRef,
    private labOrderService: LabOrderService,
    private codeService: CodeService,
    ) {}

  ngOnInit(): void {
    this.customerId = this.initialState.customerId;
    this.onClose = new Subject();

    this.reviewData = new CustomerIncidentModel();
    this.reviewData.labOrderId = 0;
    this.reviewData.labOrderSpecimenId = 0;
    this.reviewData.incidentDate = new(Date)().toLocaleDateString();
    this.reviewData.auditIncidentTypeId

    // Get the drop down data;
    this.codeService.getList( 'AuditIncidentType' )

    .pipe(first())
    .subscribe(
        data => {
          if (data.valid)
          {
            this.incidentList = data.list0;
          }
        });
  }


  SaveButtonClicked(){
    this.reviewData.auditStatusTypeId = 4;
    this.labOrderService.reviewed(this.reviewData )
        .pipe(first())
        .subscribe(
        data => {
          //console.log(data);
          if (data.valid)
          {
            this.onClose.next(0);
            this.bsModalRef.hide();
          }
        },
        error => {

        });
  }

  closeModalButtonClicked(){
    this.onClose.next(0);
    this.bsModalRef.hide();
  }

}
