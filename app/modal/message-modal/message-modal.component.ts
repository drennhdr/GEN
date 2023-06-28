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
  selector: 'app-message-modal',
  templateUrl: './message-modal.component.html',
  styleUrls: ['./message-modal.component.css']
})
export class MessageModalComponent implements OnInit {
  initialState: any;
  public onClose: Subject<number>;
  message: string;
  button1: string;
  button2: string;
  
  constructor(
    private modalService: BsModalService,
    public bsModalRef: BsModalRef,
    ) {}

  ngOnInit(): void {
    this.message = this.initialState.message;
    this.button1 = this.initialState.button1;
    this.button2 = this.initialState.button2;
    this.onClose = new Subject();
  
    if (this.button1 == ""){
      this.button1 = "Yes";
    }
    if (this.button2 == ""){
      this.button2 = "No";
    }
  }

  yesClicked(){
    this.onClose.next(1);
    this.bsModalRef.hide();
  }

  noClicked(){
    this.onClose.next(0);
    this.bsModalRef.hide();
  }

}
