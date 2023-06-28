//Page Name       : Barcode-Modal
//Date Created    : 09/26/2022
//Written By      : Stephen Farkas
//Description     : Barcode Print Modal
//MM/DD/YYYY xxx  Description
//-----------------------------------------------------------------------------
// Data Passing
//-----------------------------------------------------------------------------
import { Component, Input, OnInit  } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal'; 
 
import { LabOrderService } from '../../services/labOrder.service';
import { first } from 'rxjs/operators';
// import * as qz from 'qz-tray';
// import { sha256 } from 'js-sha256';
import { ClientPrintJob, InstalledPrinter, JSPrintManager, WSStatus } from 'JSPrintManager';



@Component({
  selector: 'app-barcode-modal',
  templateUrl: './barcode-modal.component.html',
  styleUrls: ['./barcode-modal.component.css']
})
export class BarcodeModalComponent implements OnInit {
  initialState: any;
  
  constructor(
    private modalService: BsModalService,
    public bsModalRef: BsModalRef,
    ) {}

  ngOnInit(): void {
    console.log("State",this.initialState);
    var specimenBarcode = this.initialState.specimenBarcode;
    var firstName = this.initialState.firstName;
    var lastName = this.initialState.lastName;
    var dob = this.initialState.dob;
    var sex = this.initialState.sex;
    var location = this.initialState.location;
    var collectionDate = this.initialState.collectionDate;

    JSPrintManager.auto_reconnect = true;
    JSPrintManager.start();
    JSPrintManager.WS.onStatusChanged = function () {
      console.log("IN FUNCTION");
      console.log("status", JSPrintManager.websocket_status);


      if (JSPrintManager.websocket_status == WSStatus.Open){
        var barcodePrinter: string = sessionStorage.getItem('barcodePrinter');

        //Create a ClientPrintJob
        var cpj = new ClientPrintJob();
        //Set Printer type (Refer to the help, there many of them!)
        console.log("Printer",barcodePrinter);
        cpj.clientPrinter = new InstalledPrinter(barcodePrinter);
        console.log("clientPrinter");
        //Set content to print...
        //Create Zebra EPL commands for sample label

        var cmds =  "^XA";
        cmds += "^FO220,20^BY3^BCN,30,Y,N,N,N^FD" + specimenBarcode + "^FS";
        cmds += "^FO220,90^ADN,18,10^FDFIRST: " + firstName + "^FS";
        cmds += "^FO220,110^ADN,18,10^FD LAST: " + lastName + "^FS";
        cmds += "^FO220,130^ADN,18,10^FD  DOB: " + dob + "     " + sex + "^FS";
        cmds += "^FO220,150^ADN,18,10^FD FROM: " + location + "^FS";
        cmds += "^FO220,170^ADN,18,10^FD  COL: " + collectionDate + "^FS";
        cmds += "^XZ";

        cpj.printerCommands = cmds;
        //Send print job to printer!
        console.log(cmds);
        cpj.sendToClient();

      }
   
      
      else if (JSPrintManager.websocket_status == WSStatus.Closed) {
          console.log('JSPrintManager (JSPM) is not installed or not running! Download JSPM Client App from https://neodynamic.com/downloads/jspm');
      
      }
      else if (JSPrintManager.websocket_status == WSStatus.Blocked) {
          console.log('JSPM has blocked this website!');
      }
      else {
        console.log("Other Status");
      }

    };


    

    //qz.security.setSignatureAlgorithm("SHA512");
    //qz.api.setSha256Type(data => sha256(data));
    // qz.api.setPromiseType(resolver => new Promise(resolver));

    // qz.websocket.connect()
    // .then(qz.printers.getDefault)
    // .then(printer => console.log("The default printer is: " + printer))
    // .then(qz.websocket.disconnect)
    // .catch(err => console.error(err));

    // angular.module('App', [])
    // .controller('CinemaCtrl', ['$scope', function($scope) {
    //   printTheLabel();
    // }]);

    //var collectionDate = this.initialState.collectionDate;
    //var printLPN = [];

    // JSPM.JSPrintManager.auto_reconnect = true;
    // JSPM.JSPrintManager.start();
    // JSPM.JSPrintManager.WS.onStatusChanged = function () {
    //     if (jspmWSStatus()) {
    //         //get client installed printers
    //         JSPM.JSPrintManager.getPrinters().then(function (myPrinters) {
    //             var options = '';
    //             for (var i = 0; i < myPrinters.length; i++) {
		// 		    options += '<option>' + myPrinters[i] + '</option>';
		// 		}
    //             $('#installedPrinterName').html(options);
    //         });
    //     }
    // };

    //qz.api.setSha256Type(data => sha256(data));
    // qz.api.setPromiseType(resolver => new Promise(resolver));
    // this.startConnection();

  }

  closeModalButtonClicked(){
    this.bsModalRef.hide();
  }

}
