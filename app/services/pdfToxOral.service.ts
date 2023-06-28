// Service Name  : pdfToxOral.service.ts
// Date Created  : 05/02/2023
// Written By    : Stephen Farkas
// Description   : creat Tox Oral pdf
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
import { ToxOralModel } from '../models/LabOrderTestModel';

import { PatientModel } from '../models/PatientModel';

import jsPDF from 'jspdf';
import "jspdf-barcode";

import { ValidationModel } from '../models/ValidationModel';
import { GenericResponseModel} from '../models/GenericResponseModel';


@Injectable({
  providedIn: 'root'
})
export class PdfToxOralService {
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
  generateToxOral(labOrder: LabOrderModel, toxData: ToxOralModel, patientData: PatientModel, PhysicianSig: string, PatientSig: string) {

    var img = new Image();
    img.src = '/assets/pdf/TOX_ORAL_2023_05.jpg'

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

    // barcode
    doc.barcode.arguments

    doc.text(labOrder.location,470, 32);
    doc.text(labOrder.locationAddress,470, 44);
    doc.text(labOrder.user_Physician,470, 56);

    doc.text('Created By: ' + labOrder.userCreatedName,232, 100);

    doc.text(labOrder.lastName,95, 141);
    doc.text(labOrder.firstName,300, 141);
    doc.text(patientData.middleName.substring(0,1),535, 141);

    doc.text(patientData.address.street1,95, 162);
    doc.text(patientData.address.city,280, 162);
    doc.text(patientData.address.state,441, 162);
    doc.text(patientData.address.postalCode,545, 162);

    doc.text(patientData.phone,95, 183);
    doc.text(formatDate(labOrder.dob , 'MM/dd/yyyy', 'en'),235, 183);


    if (patientData.genderId == 2){ //Male
        doc.text('x',336, 180);
    }
    if (patientData.genderId == 1){ //Female
        doc.text('x',375, 180);
    }

    if (labOrder.patientInsuranceId_Primary > -1){
        doc.text('x',34, 219);
    }

    if (labOrder.selfPay){
        doc.text('x',232, 219);
    }
    if (labOrder.contractPay){
        doc.text('x',320, 219);
    }


    if (labOrder.patientSignatureId == -1)
    {
        doc.text("Signature on Hardcopy",200, 434);
        doc.text(formatDate(labOrder.specimens[0].collectionDate, 'MM/dd/yyyy', 'en'),480, 434);
    }
    else if (labOrder.patientConsentOnFile){
        doc.text("Patient Conscent On File",200, 434);
    } 
    else if(labOrder.patientSignatureId){
        imgPat.src = 'data:image/*;base64,' + PatientSig;
        doc.addImage(imgPat, 'JPEG', 200, 422, 100, 25);
    }


    if (labOrder.datePatientSignature != null){
        doc.text(formatDate(labOrder.datePatientSignature, 'MM/dd/yyyy', 'en'),480, 434);
    }

    var cntr = 1;
    if (labOrder.diagnosis != null){
        labOrder.diagnosis.forEach( (item) =>{
            if (cntr==1){
                doc.text(item.code, 110, 482);
            }
            else if (cntr==2){
                doc.text(item.code, 230, 482);
            }
            else if (cntr==3){
                doc.text(item.code, 360, 482);
            }
            else if (cntr==4){
                doc.text(item.code, 490, 482);
            }
            cntr++;
        });
    }

    doc.text(formatDate(labOrder.specimens[0].collectionDate, 'MM/dd/yyyy', 'en'), 290, 522);
    var collection = (new Date(labOrder.specimens[0].collectionDate  + 'Z').toLocaleString(undefined, { timeZoneName: 'short' })).toString();
    var posn = collection.indexOf(",") + 1;
    collection = collection.substring(posn + 1, collection.length);
    doc.text(collection, 460, 522);

    // Medications
    if (labOrder.noMeds) { doc.text('x',423, 544); }

    var cntr = 1;
    if (labOrder.medications != null){
        labOrder.medications.forEach( (item) =>{
            if (cntr==1){ doc.text(item.description,34, 560); }
            if (cntr==2){ doc.text(item.description,34, 570); }
            if (cntr==3){ doc.text(item.description,34, 580); }
            if (cntr==4){ doc.text(item.description,34, 590); }

            if (cntr==5){ doc.text(item.description,184, 560); }
            if (cntr==6){ doc.text(item.description,184, 570); }
            if (cntr==7){ doc.text(item.description,184, 580); }
            if (cntr==8){ doc.text(item.description,184, 590); }

            if (cntr==9){ doc.text(item.description,334, 560); }
            if (cntr==10){ doc.text(item.description,334, 570); }
            if (cntr==11){ doc.text(item.description,334, 580); }
            if (cntr==12){ doc.text(item.description,334, 590); }

            if (cntr==13){ doc.text(item.description,484, 560); }
            if (cntr==14){ doc.text(item.description,484, 570); }
            if (cntr==15){ doc.text(item.description,484, 580); }
            if (cntr==16){ doc.text(item.description,484, 590); }
            cntr++
        });
    }

    if (toxData.fullConfirmation) { doc.text('x', 154, 620); }

    if (toxData.illicit.full){ doc.text('x',34, 640); }
    if (toxData.illicit.mam6){ doc.text('x',34, 649); }
    if (toxData.illicit.amphetamine){ doc.text('x',34, 658); }
    if (toxData.illicit.methamphetamine){ doc.text('x',34, 667); }
    if (toxData.illicit.benzoylecgonine){ doc.text('x',34, 676); }
    if (toxData.illicit.mdma){ doc.text('x',34, 694); }
    if (toxData.illicit.pcp){ doc.text('x',34, 703); }
    if (toxData.illicit.thc){ doc.text('x',34, 712); }
    
    if (toxData.sedative.full){ doc.text('x',34, 722); }
    if (toxData.sedative.zolpidem){ doc.text('x',34, 731); }
    if (toxData.sedative.butalbital){ doc.text('x',34, 740); }

    if (toxData.benzodiazepines.full){ doc.text('x',111, 638); }
    if (toxData.benzodiazepines.alprazolam){ doc.text('x',111, 647); }
    if (toxData.benzodiazepines.diazepam){ doc.text('x',111, 656); }
    if (toxData.benzodiazepines.clonazepam){ doc.text('x',111, 664); }
    if (toxData.benzodiazepines.nordiazepam){ doc.text('x',111, 682); }
    if (toxData.benzodiazepines.lorazepam){ doc.text('x',111, 691); }
    if (toxData.benzodiazepines.oxazepam){ doc.text('x',111, 700); }
    if (toxData.benzodiazepines.temazepam){ doc.text('x',111, 709); }

    if (toxData.muscle.full){ doc.text('x',188, 638); }
    if (toxData.muscle.baclofen){ doc.text('x',188, 647); }
    if (toxData.muscle.carisoprodol){ doc.text('x',188, 656); }
    if (toxData.muscle.cyclobenzaprine){ doc.text('x',188, 664); }
    if (toxData.muscle.meprobamate){ doc.text('x',188, 673); }
    if (toxData.muscle.methocarbamol){ doc.text('x',188, 682); }

    if (toxData.antipsychotics.full){ doc.text('x',188, 700); }
    if (toxData.antipsychotics.aripiprazole){ doc.text('x',188, 708); }
    if (toxData.antipsychotics.quetiapine){ doc.text('x',188, 716); }
    if (toxData.antipsychotics.risperidone){ doc.text('x',188, 724); }
    if (toxData.antipsychotics.ziprasidone){ doc.text('x',188, 732); }

    if (toxData.antidepressants.full){ doc.text('x',254, 638); }
    if (toxData.antidepressants.amitriptyline){ doc.text('x',254, 647); }
    if (toxData.antidepressants.citalopram){ doc.text('x',254, 655); }
    if (toxData.antidepressants.fluoxetine){ doc.text('x',254, 664); }
    if (toxData.antidepressants.nortriptyline){ doc.text('x',254, 673); }
    if (toxData.antidepressants.paroxetine){ doc.text('x',254, 682); }
    if (toxData.antidepressants.sertraline){ doc.text('x',254, 690); }
    if (toxData.antidepressants.venlafaxine){ doc.text('x',254, 698); }
    if (toxData.antidepressants.desmethylvenlafaxine){ doc.text('x',254, 706); }
    if (toxData.antidepressants.mirtazapine){ doc.text('x',254, 714); }
    if (toxData.antidepressants.trazodone){ doc.text('x',254, 722); }

    if (toxData.stimulants.full){ doc.text('x',325, 638); }
    if (toxData.stimulants.methylphenidate){ doc.text('x',325, 647); }
    if (toxData.stimulants.ritalinicAcid){ doc.text('x',325, 656); }
    if (toxData.stimulants.mda){ doc.text('x',325, 664); }
    if (toxData.stimulants.phentermine){ doc.text('x',325, 672); }

    if (toxData.kratom.full){ doc.text('x',325, 690); }
    if (toxData.kratom.mitragynine){ doc.text('x',325, 698); }

    if (toxData.nicotine.full){ doc.text('x',325, 721); }
    if (toxData.nicotine.cotinine){ doc.text('x',325, 731); }

    if (toxData.opioidAntagonists.full){ doc.text('x',387, 638); }
    if (toxData.opioidAntagonists.naloxone){ doc.text('x',387, 647); }
    if (toxData.opioidAntagonists.naltrexone){ doc.text('x',387, 656); }

    if (toxData.gabapentinoids.full){ doc.text('x',387, 672); }
    if (toxData.gabapentinoids.gabapentin){ doc.text('x',387, 681); }
    if (toxData.gabapentinoids.pregabalin){ doc.text('x',387, 690); }

    if (toxData.dissociative.full){ doc.text('x',387, 708); }
    if (toxData.dissociative.ketamine){ doc.text('x',387, 716); }

    if (toxData.opioidAgonists.full){ doc.text('x',464, 638); }
    if (toxData.opioidAgonists.buprenorphine){ doc.text('x',464, 647); }
    if (toxData.opioidAgonists.codeine){ doc.text('x',464, 665); }
    if (toxData.opioidAgonists.dextromethorphan){ doc.text('x',464, 674); }
    if (toxData.opioidAgonists.hydrocodone){ doc.text('x',464, 683); }
    if (toxData.opioidAgonists.hydromorphone){ doc.text('x',464, 702); }
    if (toxData.opioidAgonists.norfentanyl){ doc.text('x',464, 711); }

    if (toxData.opioidAgonists.methadone){ doc.text('x',529, 647); }
    if (toxData.opioidAgonists.morphine){ doc.text('x',529, 665); }
    if (toxData.opioidAgonists.oxycodone){ doc.text('x',529, 674); }
    if (toxData.opioidAgonists.oxymorphone){ doc.text('x',529, 693); }
    if (toxData.opioidAgonists.tapentadol){ doc.text('x',529, 703); }
    if (toxData.opioidAgonists.tramadol){ doc.text('x',529, 712); }
    

    if (labOrder.userSignatureId_Physician == -1)
    {
        doc.text("Signature on Hardcopy",200, 773);
        doc.text(formatDate(labOrder.specimens[0].collectionDate, 'MM/dd/yyyy', 'en'),470, 773);
    }
    else if (labOrder.userSignatureId_Physician > 0){
        console.log ("Sig", PhysicianSig);
        imgPhy.src = 'data:image/*;base64,' + PhysicianSig;
        doc.addImage(imgPhy, 'JPEG', 180, 748, 100, 25);
    }

    
    if (labOrder.datePhysicianSignature != null){
        doc.text(labOrder.user_Physician,300, 773);
        doc.text(formatDate(labOrder.datePhysicianSignature, 'MM/dd/yyyy', 'en'),470, 773);
    }

    

    return(doc);

  }
}