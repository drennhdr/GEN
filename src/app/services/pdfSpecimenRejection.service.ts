// Service Name  : pdfSpecimenRejection.service.ts
// Date Created  : 10/26/2022
// Written By    : Stephen Farkas
// Description   : create Speciment Rejection Letter pdf
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
import { LabOrderForAccessioningModel} from '../models/LabOrderModel';

import { PatientModel } from '../models/PatientModel';

import jsPDF from 'jspdf';


@Injectable({
  providedIn: 'root'
})
export class PdfSpecimentRejectionService {
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
  generateLetter(labOrder: LabOrderForAccessioningModel, patient: PatientModel, rejectionReason: string, rejectionNote: string) {

    console.log('Letter',labOrder);
    console.log('patient',patient);
    var img1 = new Image();
    img1.src = '/assets/img/GenesisLetterLogo.jpg'
    var img2 = new Image();
    img2.src = '/assets/img/GenesisLetterFooter.jpg'

    var doc = new jsPDF('p', 'pt', 'letter');
    doc.setFont('Helvetica');

// 612/792
    doc.addImage(img1, 'JPEG', 20, 20, 330, 109);
    doc.setFontSize(20);
    doc.text('Specimen Rejection',380, 60);
    doc.text('Letter',425, 88);
    doc.line(20,140,740,140,'S');

    doc.setFontSize(11);

    doc.text('Patient: ' + patient.lastName + ', ' + patient.firstName,20, 180);
    doc.text('Specimen Type:  ' + labOrder.labType,200, 180);
    doc.text('Specimen ID:  ' + labOrder.specimenBarcode,400, 180);

    doc.text('Date of Birth: ' + formatDate(patient.dob , 'MM/dd/yyyy', 'en'),20, 200);
    doc.text('Ordering Provider:  ' + labOrder.user_Physician ,200, 200);
    doc.text('Facility Name:  ' + labOrder.customer,400, 200);

    doc.text('Collected: ' + formatDate(labOrder.collectionDate , 'MM/dd/yyyy', 'en'),20, 220);
    doc.text('Received:  ' + formatDate(labOrder.receivedDate , 'MM/dd/yyyy', 'en'),200, 220);

    doc.line(20,250,740,250,'S');

    doc.setFontSize(14);
    
    doc.text('Requested Test(s): ',20, 270);

    doc.text('Reason for Specimen Rejection: ',20, 350);
    doc.text(rejectionReason,20, 370);

    doc.text('Notes: ',20, 430);
    doc.text(rejectionNote,20, 450);

    doc.addImage(img2, 'JPEG', 0, 630, 612, 152);

    // Save the PDF
    doc.save('Rejection.pdf');



  }
}