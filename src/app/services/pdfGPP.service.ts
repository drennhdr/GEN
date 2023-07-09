// Service Name  : pdfGPP.service.ts
// Date Created  : 10/26/2022
// Written By    : Stephen Farkas
// Description   : creat GPP pdf
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
import { LabOrderModel} from '../models/LabOrderModel';
import { GPPModel } from '../models/LabOrderTestModel';

import { PatientModel } from '../models/PatientModel';

import jsPDF from 'jspdf';
import "jspdf-barcode";

import { ValidationModel } from '../models/ValidationModel';
import { GenericResponseModel} from '../models/GenericResponseModel';


@Injectable({
  providedIn: 'root'
})
export class PdfGPPService {
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
  generateGPP(labOrder: LabOrderModel, gppData: GPPModel, patientData: PatientModel, PhysicianSig: string, PatientSig: string) {

    var img = new Image();
    img.src = '/assets/pdf/GPP_2022_10.jpg'

    var imgPat = new Image();
    var imgPhy = new Image();

    var doc = new jsPDF('p', 'pt', 'letter');

    // "C:\Development\AngularPortal2\src\assets\pdf\GPP_2022_10.pdf"
    doc.addImage(img, 'JPEG', 0, 0, 612, 792);
        doc.setFontSize(10);


        doc.text(labOrder.specimens[0].specimenBarcode,270,32);

        doc.barcode(labOrder.specimens[0].specimenBarcode, {
            fontSize: 24,
            textColor: "#000000",
            x: 260,
            y: 60
          })
    
        doc.setFont("Helvetica"); // reset font to your font
        doc.setFontSize(10);

        doc.text(labOrder.location,470, 32);
        doc.text(labOrder.locationAddress,465, 44);
        doc.text(labOrder.user_Physician,470, 56);

        doc.text('Created By: ' + labOrder.userCreatedName,232, 100);

        doc.text(labOrder.lastName,95, 145);
        doc.text(labOrder.firstName,300, 145);
        doc.text(patientData.middleName.substring(0,1),535, 145);

        doc.text(patientData.address.street1,95, 167);
        doc.text(patientData.address.city,280, 167);
        doc.text(patientData.address.state,445, 167);
        doc.text(patientData.address.postalCode,545, 167);

        doc.text(patientData.phone,95, 189);
        doc.text(formatDate(labOrder.dob , 'MM/dd/yyyy', 'en'),235, 189);

        if (patientData.genderId == 2){ //Male
            doc.text('x',382, 188);
        }
        if (patientData.genderId == 1){ //Female
            doc.text('x',445, 188);
        }

        if (labOrder.selfPay){
            doc.text('x',442, 240);
        }
        if (labOrder.contractPay){
            doc.text('x',505, 240);
        }

        if (labOrder.patientSignatureId == -1)
        {
            doc.text("Signature on Hardcopy",200, 407);
            doc.text(formatDate((labOrder.specimens[0].collectionDate + 'Z').toLocaleString(), 'MM/dd/yyyy', 'en'),480, 407);
        }
        else if (labOrder.patientConsentOnFile){
            doc.text("Patient Conscent On File",200, 407);
        } 
        else if(labOrder.patientSignatureId){
            imgPat.src = 'data:image/*;base64,' + PatientSig;

            doc.addImage(imgPat, 'JPEG', 200, 387, 100, 25);
        }
    
        if (labOrder.datePatientSignature != null){
            doc.text(formatDate((labOrder.datePatientSignature + 'Z').toLocaleString(), 'MM/dd/yyyy', 'en'),480, 407);
        }

        var cntr = 1;
        if (labOrder.diagnosis != null){
            labOrder.diagnosis.forEach( (item) =>{
                if (cntr==1){
                    doc.text(item.description, 40, 462);
                }
                else if (cntr==2){
                    doc.text(item.description, 320, 462);
                }
                else if (cntr==3){
                    doc.text(item.description, 40, 484);
                }
                else if (cntr==4){
                    doc.text(item.description, 320, 484);
                }
                else if (cntr==5){
                    doc.text(item.description, 40, 506);
                }
                else if (cntr==6){
                    doc.text(item.description, 320, 506);
                }
                cntr++;
            });
        }

        doc.text(formatDate((labOrder.specimens[0].collectionDate + 'Z').toLocaleString(), 'MM/dd/yyyy', 'en'), 280, 530);

        var collection = (new Date(labOrder.specimens[0].collectionDate + 'Z').toLocaleString(undefined, { timeZoneName: 'short' })).toString();

        var posn = collection.indexOf(",") + 1;
        collection = collection.substring(posn + 1, collection.length);
        doc.text(collection, 445, 530);

        if (gppData.gastrointestinal){
            doc.text('x',38, 580);
        }
        if (gppData.helicobacter){
            doc.text('x',38, 640);
        }

        if (labOrder.userSignatureId_Physician == -1)
        {
            doc.text("Signature on Hardcopy",200, 720);
            doc.text(formatDate((labOrder.specimens[0].collectionDate + 'Z').toLocaleString(), 'MM/dd/yyyy', 'en'),510, 720);
        }
        else if (labOrder.userSignatureId_Physician > 0){
            console.log ("Sig", PhysicianSig);
            imgPhy.src = 'data:image/*;base64,' + PhysicianSig;
            doc.addImage(imgPhy, 'JPEG', 180, 700, 100, 25);
        }
         
        if (labOrder.datePhysicianSignature != null){
            doc.text(labOrder.user_Physician,290, 720);
            doc.text(formatDate((labOrder.datePhysicianSignature + 'Z').toLocaleString(), 'MM/dd/yyyy', 'en'),510, 720);
        }

        return(doc);

  }
}