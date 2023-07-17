// Service Name  : pdfTUISTI.service.ts
// Date Created  : 11/04/2022
// Written By    : Stephen Farkas
// Description   : creat UTI/STI pdf
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
import { UTIModel } from '../models/LabOrderTestModel';

import { PatientModel } from '../models/PatientModel';

import jsPDF from 'jspdf';
import "jspdf-barcode";

import { ValidationModel } from '../models/ValidationModel';
import { GenericResponseModel} from '../models/GenericResponseModel';


@Injectable({
  providedIn: 'root'
})
export class PdfUTISTIService {
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
  generateUTISTI(labOrder: LabOrderModel, utiData: UTIModel, patientData: PatientModel, physicianNPI: string, PhysicianSig: string, PatientSig: string) {

    console.log ("ORder",labOrder);
    var img = new Image();
    img.src = '/assets/pdf/UTI_STI_2023.jpg'

    var imgPat = new Image();
    var imgPhy = new Image();

    var doc = new jsPDF('p', 'pt', 'letter');

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

    doc.text(labOrder.location,470, 20);
    doc.text(labOrder.locationAddress,465, 32);
    doc.text(labOrder.user_Physician,470, 44);
    doc.text(physicianNPI,470,54);

    doc.text('Created By: ' + labOrder.userCreatedName,232, 100);

    doc.text(labOrder.lastName,95, 142);
    doc.text(labOrder.firstName,300, 142);
    doc.text(patientData.middleName.substring(0,1),535, 142);

    doc.text(patientData.address.street1,95, 164);
    doc.text(patientData.address.city,280, 164);
    doc.text(patientData.address.state,445, 164);
    doc.text(patientData.address.postalCode,545, 164);

    doc.text(patientData.phone,95, 185);
    doc.text(formatDate(labOrder.dob , 'MM/dd/yyyy', 'en'),235, 185);

    console.log("Patient",patientData);

    if (patientData.genderId == 2){ //Male
        doc.text('x',382, 184);
    }
    if (patientData.genderId == 1){ //Female
        doc.text('x',445, 184);
    }

    if (labOrder.selfPay){
        doc.text('x',434, 231);
    }
    if (labOrder.contractPay){
        doc.text('x',503, 231);
    }

    if (labOrder.patientSignatureId == -1)
    {
        doc.text("Signature on Hardcopy",200, 368);
        doc.text(formatDate((labOrder.specimens[0].collectionDate + 'Z').toLocaleString(), 'MM/dd/yyyy', 'en'),480, 368);
    }
    else if (labOrder.patientConsentOnFile){
        doc.text("Patient Conscent On File",200, 368);
    } 
    else if(labOrder.patientSignatureId){
        imgPat.src = 'data:image/*;base64,' + PatientSig;

        doc.addImage(imgPat, 'JPEG', 200, 352, 100, 25);
    }


    if (labOrder.datePatientSignature != null){
        doc.text(formatDate((labOrder.datePatientSignature + 'Z').toLocaleString(), 'MM/dd/yyyy', 'en'),485, 368);
    }

    var cntr = 1;
    if (labOrder.diagnosis != null){
        labOrder.diagnosis.forEach( (item) =>{
            if (cntr==1){
                doc.text(item.code, 40, 422);
            }
            else if (cntr==2){
                doc.text(item.code, 110, 422);
            }
            else if (cntr==3){
                doc.text(item.code, 40, 444);
            }
            else if (cntr==4){
                doc.text(item.code, 110, 444);
            }
            cntr++;
        });
    }

    if (labOrder.isPregnant == 1){
        doc.text('x', 202, 420);
    }
    if (labOrder.isPregnant == 2){
        doc.text('x', 202, 440);
    }
    cntr = 1;
    if (labOrder.allergies != null){
        labOrder.allergies.forEach( (item) =>{
            if (cntr==1){
                doc.text(item.description, 320, 422);
            }
            else if (cntr==2){
                doc.text(item.description, 470, 422);
            }
            else if (cntr==3){
                doc.text(item.description, 320, 444);
            }
            else if (cntr==4){
                doc.text(item.description, 470, 444);
            }
            cntr++;
        });
    }

    doc.text(formatDate(labOrder.specimens[0].collectionDate, 'MM/dd/yyyy', 'en'), 280, 488);
    
    var collection = (new Date(labOrder.specimens[0].collectionDate  + 'Z').toLocaleString(undefined, { timeZoneName: 'short' })).toString();
    var posn = collection.indexOf(",") + 1;
    collection = collection.substring(posn + 1, collection.length);
    doc.text(collection, 445, 488);

    if (utiData.urine){
        doc.text('x',28, 542);
    }
    if (utiData.uCommon){
        doc.text('x',29, 562);
    }
    if (utiData.uUncommon){
        doc.text('x',29, 623);
    }
    if (utiData.uSTILeukorrhea){
        doc.text('x',153, 562);
    }
    if (utiData.uYeast){
        doc.text('x',153, 642);
    }
    if (utiData.uAdditional){
        doc.text('x',249, 562);
    }

    if (utiData.swab){
        doc.text('x',420, 542);
        doc.text(labOrder.specimens[0].swabLocation,500,542);
    }
    if (utiData.sSTI){
        doc.text('x',421, 562);
    }
    if (utiData.sBacterialVaginosis){
        doc.text('x',421, 661);
    }
    if (utiData.sYeast){
        doc.text('x',519, 562);
    }
    if (utiData.sEmerging){
        doc.text('x',519, 642);
    }

    if (labOrder.userSignatureId_Physician > 0){
        console.log ("Sig", PhysicianSig);
        imgPhy.src = 'data:image/*;base64,' + PhysicianSig;
        doc.addImage(imgPhy, 'JPEG', 100, 748, 100, 25);
    }

    if (labOrder.userSignatureId_Physician == -1)
    {
        doc.text("Signature on Hardcopy",100, 773);
        doc.text(formatDate((labOrder.specimens[0].collectionDate + 'Z').toLocaleString(), 'MM/dd/yyyy', 'en'),510, 768);
    }
    else if (labOrder.datePhysicianSignature != null){
        doc.text(labOrder.user_Physician,300, 768);
        doc.text(formatDate((labOrder.datePhysicianSignature + 'Z').toLocaleString(), 'MM/dd/yyyy', 'en'),510, 768);
    }


    return(doc);

  }
}