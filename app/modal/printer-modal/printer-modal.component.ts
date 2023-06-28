//Page Name       : Printer-Modal
//Date Created    : 10/10/2022
//Written By      : Stephen Farkas
//Description     : Lab Order Issues & Warning Modal
//MM/DD/YYYY xxx  Description
//-----------------------------------------------------------------------------
// Data Passing
//-----------------------------------------------------------------------------
import { Component, Input, OnInit  } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { first, throwIfEmpty } from 'rxjs/operators';

import { UserService } from '../../services/user.service';


@Component({
  selector: 'app-printer-modal',
  templateUrl: './printer-modal.component.html',
  styleUrls: ['./printer-modal.component.css']
})
export class PrinterModalComponent implements OnInit {
  initialState: any;
  printer: string = "";
  quantity: number = 0;
  camera: boolean = false;
  constructor(
    private userService: UserService,
    private modalService: BsModalService,
    public bsModalRef: BsModalRef,
  ) { }

  ngOnInit(): void {
    this.printer = sessionStorage.getItem('barcodePrinter');
    this.quantity = Number(sessionStorage.getItem('barcodeQty'));
    console.log("TCam 0",sessionStorage.getItem('camera'));
    if (sessionStorage.getItem('camera') == 'true'){
      this.camera = true;
    }
    else {
      this.camera = false;
    }
  }

  savePrinterButtonClicked(){
    this.userService.savePrinter(this.printer, this.quantity, this.camera)
                          .pipe(first())
                          .subscribe(
                          data => {
                            if (data.valid)
                            {
                              this.bsModalRef.hide();   
                            }

                          },
                          error => {

                          });
    sessionStorage.setItem('barcodePrinter',this.printer);
    sessionStorage.setItem('barcodeQty',this.quantity.toString());
    sessionStorage.setItem('camera',this.camera.toString());

  }

  closeModalButtonClicked(){
    this.bsModalRef.hide();
  }

}
