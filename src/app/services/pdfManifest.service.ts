// Service Name  : pdfManifest.service.ts
// Date Created  : 2/3/2023
// Written By    : Stephen Farkas
// Description   : create Manifest pdf
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
import { ManifestListItemModel, ManifestModel, ManifestSpecimenModel } from '../models/ManifestModel';

import { PatientModel } from '../models/PatientModel';

import jsPDF from 'jspdf';
import "jspdf-barcode";


@Injectable({
  providedIn: 'root'
})
export class PdfManifestService {
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
  generateManifest(manifestData: ManifestModel, locationName: string, trackingNo: string, barcode: string) {

    var img1 = new Image();
    img1.src = '/assets/img/GenesisLetterLogo.jpg'
    var img2 = new Image();
    img2.src = '/assets/img/GenesisLetterFooter.jpg'

    var doc = new jsPDF('p', 'pt', 'letter');
    doc.setFont('Helvetica');


    doc.addImage(img1, 'JPEG', 20, 20, 330, 109);

    // Print the manifest id
    doc.setFontSize(11);
    doc.text(barcode,380, 78);

    doc.setFontSize(20);
    doc.text('Manifest',425, 110);
    doc.line(20,140,740,140,'S');

    doc.setFontSize(11);

    doc.text('Location: ' + locationName,20, 160);
    doc.text('Tracking #: ' + trackingNo,240, 160);
    doc.text('Specimen Count: ' + manifestData.specimens.length, 440,160)  

    doc.text('Specimen',20, 195);
    doc.text('Collection Date',140, 195);
    doc.text('LabType',260, 195);
    doc.text('Patient',400, 195);

    doc.line(20,200,740,200,'S');

    var row: number = 210;
    if (manifestData.specimens.length > 0){
        manifestData.specimens.forEach( (item) =>{

            doc.text(item.specimenBarcode,20, row);
            doc.text(item.collectionDate,140, row);
            doc.text(item.labType,260, row);
            doc.text(item.patientName,400, row);
            row = row + 20
        });
    }

    // print the barcode on top
    doc.barcode(barcode, {
        fontSize: 20,
        textColor: "#000000",
        x: 380,
        y: 60
      })

    doc.addImage(img2, 'JPEG', 0, 630, 612, 152);

    // Save the PDF
    doc.save('Manifest.pdf');



  }
}