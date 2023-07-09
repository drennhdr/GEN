// Service Name  : pdfRPP.service.ts
// Date Created  : 11/04/2022
// Written By    : Stephen Farkas
// Description   : creat RPP pdf
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
import { RPPModel } from '../models/LabOrderTestModel';

import { PatientModel } from '../models/PatientModel';

import jsPDF from 'jspdf';
import "jspdf-barcode";

import { ValidationModel } from '../models/ValidationModel';
import { GenericResponseModel} from '../models/GenericResponseModel';


@Injectable({
  providedIn: 'root'
})
export class PdfRPPService {
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
  generateRPP(labOrder: LabOrderModel, rppData: RPPModel, patientData: PatientModel, PhysicianSig: string, PatientSig: string) {

    var img = new Image();
    img.src = '/assets/pdf/RPP_2022_10.jpg'

    var imgPat = new Image();
    var imgPhy = new Image();

    //console.log ("Image", img);

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

        doc.text('Created By: ' + labOrder.userCreatedName,232, 95);
    
        doc.text(labOrder.lastName,95, 132);
        doc.text(labOrder.firstName,300, 132);
        doc.text(patientData.middleName.substring(0,1),535, 132);
    
        doc.text(patientData.address.street1,95, 154);
        doc.text(patientData.address.city,280, 154);
        doc.text(patientData.address.state,445, 154);
        doc.text(patientData.address.postalCode,545, 154);
    
        doc.text(patientData.phone,95, 175);
        doc.text(formatDate(labOrder.dob , 'MM/dd/yyyy', 'en'),235, 175);
    
        if (patientData.genderId == 2){ //Male
            doc.text('x',382, 174);
        }
        if (patientData.genderId == 1){ //Female
            doc.text('x',445, 174);
        }
    
        if (labOrder.selfPay){
            doc.text('x',434, 221);
        }
        if (labOrder.contractPay){
            doc.text('x',503, 221);
        }

        if (labOrder.patientSignatureId == -1)
        {
            doc.text("Signature on Hardcopy",200, 358);
            doc.text(formatDate((labOrder.specimens[0].collectionDate + 'Z').toLocaleString(), 'MM/dd/yyyy', 'en'),480, 358);
        }
        else if (labOrder.patientConsentOnFile){
            doc.text("Patient Conscent On File",200, 358);
        } 
        else if(labOrder.patientSignatureId){
            imgPat.src = 'data:image/*;base64,' + PatientSig;

            doc.addImage(imgPat, 'JPEG', 200, 338, 100, 25);
        }
    
        if (labOrder.datePatientSignature != null){
            doc.text(formatDate((labOrder.datePatientSignature + 'Z').toLocaleString(), 'MM/dd/yyyy', 'en'),485, 358);
        }

    
        var cntr = 1;
        if (labOrder.diagnosis != null){
            labOrder.diagnosis.forEach( (item) =>{
                if (cntr==1){
                    doc.text(item.description, 20, 397);
                }
                else if (cntr==2){
                    doc.text(item.description, 170, 397);
                }
                else if (cntr==3){
                    doc.text(item.description, 320, 397);
                }
                else if (cntr==4){
                    doc.text(item.description, 320, 397);
                }
                else if (cntr==5){
                    doc.text(item.description, 470, 506);
                }
                cntr++;
            });
        }

        doc.text(formatDate((labOrder.specimens[0].collectionDate + 'Z').toLocaleString(), 'MM/dd/yyyy', 'en'), 280, 436);

        var collection = (new Date(labOrder.specimens[0].collectionDate  + 'Z').toLocaleString(undefined, { timeZoneName: 'short' })).toString();
        var posn = collection.indexOf(",") + 1;
        collection = collection.substring(posn + 1, collection.length);
        doc.text(collection, 445, 436);

        if (rppData.swab){
            doc.text('x', 35, 474);
        }
        if (rppData.saliva){
            doc.text('x', 304, 474);
        }
        if (rppData.viralTargets){
            doc.text('x', 27, 516);
        }
        if (rppData.bacterialTargets){
            doc.text('x', 258, 516);
        }
        if (rppData.fullRespiratory){
            doc.text('x', 412, 516);
        }

        if (rppData.covidOnly){
            doc.text('x', 412, 590);
        }

        if (rppData.covidThenReflux){
            doc.text('x', 29, 662);
        }
        if (rppData.covidPlusModerate){
            doc.text('x', 222, 662);
        }
        if (rppData.moderateAssessment){
            doc.text('x', 354, 662);
        }

    if (labOrder.userSignatureId_Physician == -1)
    {
        doc.text("Signature on Hardcopy",100, 768);
        doc.text(formatDate((labOrder.specimens[0].collectionDate + 'Z').toLocaleString(), 'MM/dd/yyyy', 'en'),510, 768);
    }
    else if (labOrder.userSignatureId_Physician > 0){
        console.log ("Sig", PhysicianSig);
        imgPhy.src = 'data:image/*;base64,' + PhysicianSig;
        doc.addImage(imgPhy, 'JPEG', 180, 743, 100, 25);
    }

    
    if (labOrder.datePhysicianSignature != null){
        doc.text(labOrder.user_Physician,300, 768);
        doc.text(formatDate((labOrder.datePhysicianSignature + 'Z').toLocaleString(), 'MM/dd/yyyy', 'en'),510, 768);
    }
    return(doc);

  }
}