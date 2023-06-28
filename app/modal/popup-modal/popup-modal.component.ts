//Page Name       : Message-Modal
//Date Created    : 02/13/2023
//Written By      : Stephen Farkas
//Description     : Message Modal
//MM/DD/YYYY xxx  Description
//-----------------------------------------------------------------------------
// Data Passing
//-----------------------------------------------------------------------------
import { Component, Input, OnInit  } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'app-popup-modal',
  templateUrl: './popup-modal.component.html',
  styleUrls: ['./popup-modal.component.css']
})
export class PopupModalComponent implements OnInit {
  initialState: any;
  message: string;

 
  constructor(
    private modalService: BsModalService,
    public bsModalRef: BsModalRef,
    ) {}

  ngOnInit(): void {
    this.message = this.initialState.message;

  }

  closeClicked(){
    this.bsModalRef.hide();
  }

}
