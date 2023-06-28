// Service Name  : pdfOrderList.service.ts
// Date Created  : 06/26/2023
// Written By    : Stephen Farkas
// Description   : creat Lab Order List pdf
// MM/DD/YYYY XXX Description
// 
//------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Config } from '../models/Config';
import {formatDate} from '@angular/common';


import { from, Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

// Import data models used by the service
import { LabOrderListModel} from '../models/LabOrderModel';

import jsPDF from 'jspdf';
import "jspdf-barcode";


@Injectable({
  providedIn: 'root'
})
export class PdfOrderListService {
  apiRoot: string = new Config().apiRoot;
  tranSourceId: number = new Config().corpTranSource;
  version: string = new Config().version;
  constructor(private httpClient: HttpClient) {}
  
  public get currentUserActive() {
      var user = sessionStorage.getItem('userId_Login');
      if (user == "undefined")
          return false;
      else
          return true;
      }

  // ------------------------------------------------------------------------------------------------------------------
  // Based on the passed in lab order, generate the GPP pdf
  // ------------------------------------------------------------------------------------------------------------------
  generateReport(labList: LabOrderListModel, corpUser: boolean ) {


    var doc = new jsPDF('p', 'pt', 'letter');


    doc.setFontSize(12);
    doc.text('Lab Order Listing ',20, 60);

    doc.setFontSize(11);

    if (corpUser){
        doc.text('Collected',20, 100);
        doc.text('Received',80, 100);
        doc.text('Accessioned',140, 100);
        doc.text('Resulted',200, 100);
        doc.text('Status',260, 100);
        doc.text('Specimen ID',320, 100);
        doc.text('Patient',400, 100);
        doc.text('Account',460, 100);
        doc.text('Physician',510, 100);
        doc.text('Location',600, 100);
        doc.text('Test Type',660, 100);
    
    }
    else{
        doc.text('Collected',20, 100);
        doc.text('Resulted',200, 100);
        doc.text('Status',20, 100);
        doc.text('Specimen ID',20, 100);
        doc.text('Patient',20, 100);
        doc.text('Account',20, 100);
        doc.text('Physician',20, 100);
        doc.text('Location',20, 100);
        doc.text('Test Type',20, 100);
    }

    var row:number  = 115
console.log("List",labList);
    labList.list.forEach(item => {
        doc.text(item.collectionDate,20, row);
    //     doc.text(item.receivedDate,80, row);
    //     doc.text(item.accessionedDate,140, row);
    //     doc.text(item.resultedDate,200, row);
    //     doc.text(item.status,260, row);
    //     doc.text(item.specimenBarcode,320, row);
    //     doc.text(item.patient,400, row);
    //     doc.text(item.customer,460, row);
    //    // doc.text(item.physician,510, row);
    //     doc.text(item.location,600, row);
    //     doc.text(item.labType,660, row);
        
        row = row + 15;
    });




    return(doc);
  }
}