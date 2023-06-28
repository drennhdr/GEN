//Page Name       : Help-Modal
//Date Created    : 2/10/2023
//Written By      : Stephen Farkas
//Description     : Help Modal
//MM/DD/YYYY xxx  Description
//-----------------------------------------------------------------------------
// Data Passing
//-----------------------------------------------------------------------------
import { Component, Input, OnInit  } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { first, throwIfEmpty } from 'rxjs/operators';


@Component({
  selector: 'app-help-modal',
  templateUrl: './help-modal.component.html',
  styleUrls: ['./help-modal.component.css']
})
export class HelpModalComponent implements OnInit {
  initialState: any;

  constructor(

    private modalService: BsModalService,
    public bsModalRef: BsModalRef,
  ) { }

  ngOnInit(): void {

  }


  closeModalButtonClicked(){
    this.bsModalRef.hide();
  }

}
