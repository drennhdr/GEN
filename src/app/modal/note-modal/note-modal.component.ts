//Page Name       : Note-Modal
//Date Created    : 10/14/2022
//Written By      : Stephen Farkas
//Description     : Note Modal
//MM/DD/YYYY xxx  Description
//-----------------------------------------------------------------------------
// Data Passing
//-----------------------------------------------------------------------------
import { Component, Input, OnInit  } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { first, throwIfEmpty } from 'rxjs/operators';


@Component({
  selector: 'app-note-modal',
  templateUrl: './note-modal.component.html',
  styleUrls: ['./note-modal.component.css']
})
export class NoteModalComponent implements OnInit {
  initialState: any;
  note: string = "";

  constructor(
    private modalService: BsModalService,
    public bsModalRef: BsModalRef,
  ) { }

  ngOnInit(): void {
    this.note = sessionStorage.getItem('note');
  }

  saveButtonClicked(){
    sessionStorage.setItem('note', this.note);
    this.bsModalRef.hide();
  }

  cancelButtonClicked(){
    this.bsModalRef.hide();
  }

}
