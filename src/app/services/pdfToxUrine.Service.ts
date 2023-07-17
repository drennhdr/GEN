// Service Name  : pdfToxUrine.service.ts
// Date Created  : 05/08/2023
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
import { ToxModel } from '../models/LabOrderTestModel';

import { PatientModel } from '../models/PatientModel';

import jsPDF from 'jspdf';
import "jspdf-barcode";

import { ValidationModel } from '../models/ValidationModel';
import { GenericResponseModel} from '../models/GenericResponseModel';


@Injectable({
  providedIn: 'root'
})
export class PdfToxUrineService {
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
  generateToxUrine(labOrder: LabOrderModel, toxData: ToxModel, patientData: PatientModel, physicianNPI: string, PhysicianSig: string, PatientSig: string) {


    var img = new Image();
    img.src = '/assets/pdf/TOX_URINE_2023_05.jpg'

    var img2 = new Image();
    img2.src = '/assets/pdf/TOX_URINE_2023_05_Page2.jpg'

    var imgPat = new Image();
    var imgPhy = new Image();

    var doc = new jsPDF('p', 'pt', 'letter');

    doc.addPage();

    doc.setPage(2);

    doc.addImage(img2, 'JPEG', 0, 0, 612, 792);

    doc.setPage(1);

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
    doc.text(labOrder.locationAddress,470, 44);
    doc.text(labOrder.user_Physician,470, 56);
    doc.text(physicianNPI,470,66);

    doc.text('Created By: ' + labOrder.userCreatedName,232, 100);

    doc.text(labOrder.lastName,95, 139);
    doc.text(labOrder.firstName,300, 139);
    doc.text(patientData.middleName.substring(0,1),500, 139);

    doc.text(patientData.address.street1,95, 160);
    doc.text(patientData.address.city,280, 160);
    doc.text(patientData.address.state,441, 160);
    doc.text(patientData.address.postalCode,520, 160);

    doc.text(patientData.phone,95, 180);
    doc.text(formatDate(labOrder.dob , 'MM/dd/yyyy', 'en'),235, 180);

    // console.log("Patient",patientData);

    if (patientData.genderId == 2){ //Male
        doc.text('x',336, 177);
    }
    if (patientData.genderId == 1){ //Female
        doc.text('x',387, 177);
   }

   if (labOrder.selfPay){
    doc.text('x',232, 214);
    }
    else if (labOrder.contractPay){
        doc.text('x',294, 214);
    }
    else if (labOrder.patientInsuranceId_Primary > -1){
        doc.text('x',34, 214);
    }

    if (labOrder.patientSignatureId == -1)
    {
        doc.text("Signature on Hardcopy",200, 252);
        doc.text(formatDate((labOrder.specimens[0].collectionDate + 'Z').toLocaleString(), 'MM/dd/yyyy', 'en'),480, 252);
    }
    else if (labOrder.patientConsentOnFile){
        doc.text("Patient Conscent On File",200, 252);
    } 
    else if(labOrder.patientSignatureId){
        imgPat.src = 'data:image/*;base64,' + PatientSig;
        doc.addImage(imgPat, 'JPEG', 200, 232, 100, 25);
    }

    if (labOrder.datePatientSignature != null){
        doc.text(formatDate((labOrder.datePatientSignature + 'Z').toLocaleString(), 'MM/dd/yyyy', 'en'),480, 252);
    }
    

    if (labOrder.poct != null)
    {
        // POCT SCreen
        if (labOrder.poct.pocResultId_AMP == 1){
            doc.text('x', 55, 307);
        }
        if (labOrder.poct.pocResultId_AMP == 2){
            doc.text('x', 71, 307);
        }
        if (labOrder.poct.pocResultId_BAR == 1){
            doc.text('x', 55, 322);
        }
        if (labOrder.poct.pocResultId_BAR == 2){
            doc.text('x', 71, 322);
        }
        if (labOrder.poct.pocResultId_BUP == 1){
            doc.text('x', 129, 307);
        }
        if (labOrder.poct.pocResultId_BUP == 2){
            doc.text('x', 142, 307);
        }
        if (labOrder.poct.pocResultId_BZO == 1){
            doc.text('x', 129, 320);
        }
        if (labOrder.poct.pocResultId_BZO == 2){
            doc.text('x', 142, 320);
        }
        if (labOrder.poct.pocResultId_COC == 1){
            doc.text('x', 195, 307);
        }
        if (labOrder.poct.pocResultId_COC == 2){
            doc.text('x', 210, 307);
        }
        if (labOrder.poct.pocResultId_MDMA == 1){
            doc.text('x', 195, 320);
        }
        if (labOrder.poct.pocResultId_MDMA == 2){     
            doc.text('x', 210, 320);
        }
        if (labOrder.poct.pocResultId_MET == 1){
            doc.text('x', 265, 307);
        }
        if (labOrder.poct.pocResultId_MET == 2){
            doc.text('x', 281, 307);
        }
        if (labOrder.poct.pocResultId_MTD == 1){
            doc.text('x', 265, 320);
        }
        if (labOrder.poct.pocResultId_MTD == 2){   
            doc.text('x', 281, 320);
        }
        if (labOrder.poct.pocResultId_OPI == 1){
            doc.text('x', 345, 307);
        }
        if (labOrder.poct.pocResultId_OPI == 2){
            doc.text('x', 361, 307);
        }
        if (labOrder.poct.pocResultId_OXY == 1){
            doc.text('x', 345, 320);
        }
        if (labOrder.poct.pocResultId_OXY == 2){
            doc.text('x', 361, 320);
        }
        if (labOrder.poct.pocResultId_PCP == 1){
            doc.text('x', 422, 307);
        }
        if (labOrder.poct.pocResultId_PCP == 2){
            doc.text('x', 438, 307);
        }
        if (labOrder.poct.pocResultId_TCA == 1){
            doc.text('x', 422, 320);
        }
        if (labOrder.poct.pocResultId_TCA == 2){
            doc.text('x', 438, 320);
        }
        if (labOrder.poct.pocResultId_THC == 1){
            doc.text('x', 499, 307);
        }
        if (labOrder.poct.pocResultId_THC == 2){
            doc.text('x', 514, 307);
        }
        if (labOrder.poct.pocResultId_FEN == 1){
            doc.text('x', 499, 320);
        }
        if (labOrder.poct.pocResultId_FEN == 2){     
            doc.text('x', 514, 320);
        }
    }

    var cntr = 1;
    if (labOrder.diagnosis != null){
        labOrder.diagnosis.forEach( (item) =>{
            if (cntr==1){
                doc.text(item.code, 80, 360);
            }
            else if (cntr==2){
                doc.text(item.code, 210, 360);
            }
            else if (cntr==3){
                doc.text(item.code, 350, 360);
            }
            else if (cntr==4){
                doc.text(item.code, 480, 360);
            }
            cntr++;
        });
    }

    doc.text(formatDate((labOrder.specimens[0].collectionDate + 'Z').toLocaleString(), 'MM/dd/yyyy', 'en'), 298, 400);
    
    var collection = (new Date(labOrder.specimens[0].collectionDate  + 'Z').toLocaleString(undefined, { timeZoneName: 'short' })).toString();
    var posn = collection.indexOf(",") + 1;
    collection = collection.substring(posn + 1, collection.length);
    doc.text(collection, 464, 400);

    // Medications
    if (labOrder.noMeds) { doc.text('x',422,416); }

    var cntr = 1;
    if (labOrder.medications != null){
        labOrder.medications.forEach( (item) =>{
            if (cntr==1){ doc.text(item.description,34, 435); }
            if (cntr==2){ doc.text(item.description,34, 445); }
            if (cntr==3){ doc.text(item.description,34, 455); }
            if (cntr==4){ doc.text(item.description,34, 465); }

            if (cntr==5){ doc.text(item.description,184, 435); }
            if (cntr==6){ doc.text(item.description,184, 445); }
            if (cntr==7){ doc.text(item.description,184, 455); }
            if (cntr==8){ doc.text(item.description,184, 465); }

            if (cntr==9){ doc.text(item.description,334, 435); }
            if (cntr==10){ doc.text(item.description,334, 445); }
            if (cntr==11){ doc.text(item.description,334, 455); }
            if (cntr==12){ doc.text(item.description,334, 465); }

            if (cntr==13){ doc.text(item.description,484, 435); }
            if (cntr==14){ doc.text(item.description,484, 445); }
            if (cntr==15){ doc.text(item.description,484, 455); }
            if (cntr==16){ doc.text(item.description,484, 465); }
            cntr++
        });
    }

    if (toxData.fullScreenAndConfirmation) { doc.text('x', 133, 482); }
    if (toxData.fullConfirmationOnly) { doc.text('x', 242, 482); }
    if (toxData.universalReflex) { doc.text('x', 333, 482); }
    if (toxData.targetReflex) { doc.text('x', 415, 482); }
    if (toxData.custom) { doc.text('x', 502, 482); }

    if (toxData.presumptiveTesting15) { doc.text('x', 34, 666); }
    if (toxData.presumptiveTesting13) { doc.text('x', 34, 701); }

    if (toxData.illicit.full){ doc.text('x',124, 508); }
    if (toxData.illicit.amphetamine){ doc.text('x',124, 517); }
    if (toxData.illicit.cocaine){ doc.text('x',124, 526); }
    if (toxData.illicit.heroin){ doc.text('x',124, 536); }
    if (toxData.illicit.mdma){ doc.text('x',124, 547); }
    if (toxData.illicit.methamphetamine){ doc.text('x',124, 557); }
    if (toxData.illicit.methamphetaminePosative){ doc.text('x',131, 567); }
    if (toxData.illicit.pcp){ doc.text('x',124, 586); }

    if (toxData.cannabinoids.full) { doc.text('x',124, 602); }
    if (toxData.cannabinoids.cbd) { doc.text('x',124, 611); }
    if (toxData.cannabinoids.thc) { doc.text('x',124, 620); }

    if (toxData.cannabinoidsSynth.full) { doc.text('x',124, 639); }
    if (toxData.cannabinoidsSynth.adb) { doc.text('x',124, 649); }
    if (toxData.cannabinoidsSynth.mdmb) { doc.text('x',124, 659); }
    if (toxData.cannabinoidsSynth.mdmb5f) { doc.text('x',124, 669); }

    if (toxData.alcohol.full) { doc.text('x',124, 685); }
    if (toxData.alcohol.etg) { doc.text('x',124, 694); }
    if (toxData.alcohol.ets) { doc.text('x',124, 703); }
    if (toxData.alcohol.nicotine) { doc.text('x',124, 712); }

    if (toxData.dissociative.full) { doc.text('x',124, 728); }
    if (toxData.dissociative.ketamine) { doc.text('x',124, 737); }
    if (toxData.dissociative.pcp) { doc.text('x',124, 746); }


    if (toxData.opioidAgonists.full){ doc.text('x',210, 507); }
    if (toxData.opioidAgonists.buprenorphine){ doc.text('x',210, 516); }
    if (toxData.opioidAgonists.codeine){ doc.text('x',210, 534); }
    if (toxData.opioidAgonists.dextromethorphan){ doc.text('x',210, 543); }
    if (toxData.opioidAgonists.levorphanol){ doc.text('x',210, 552); }
    if (toxData.opioidAgonists.dihydrocodeine){ doc.text('x',210, 561); }
    if (toxData.opioidAgonists.fentanyl){ doc.text('x',210, 570); }
    if (toxData.opioidAgonists.acetylfentanyl){ doc.text('x',210, 589); }
    if (toxData.opioidAgonists.carfentanil){ doc.text('x',210, 598); }
    if (toxData.opioidAgonists.fluorofentanyl){ doc.text('x',210, 616); }
    if (toxData.opioidAgonists.hydrocodone){ doc.text('x',210, 626); }
    if (toxData.opioidAgonists.hydromorphone){ doc.text('x',210, 644); }
    if (toxData.opioidAgonists.isotonitazene){ doc.text('x',210, 653); }
    if (toxData.opioidAgonists.meperidine){ doc.text('x',210, 662); }
    if (toxData.opioidAgonists.methadone){ doc.text('x',210, 671); }
    if (toxData.opioidAgonists.morphine){ doc.text('x',210, 689); }
    if (toxData.opioidAgonists.oxycodone){ doc.text('x',210, 699); }
    if (toxData.opioidAgonists.oxymorphone){ doc.text('x',210, 718); }
    if (toxData.opioidAgonists.tapentadol){ doc.text('x',210, 727); }
    if (toxData.opioidAgonists.tramadol){ doc.text('x',210, 736); }
    if (toxData.opioidAgonists.tianeptine){ doc.text('x',210, 745); }

    if (toxData.opioidAntagonists.full){ doc.text('x',302, 507); }
    if (toxData.opioidAntagonists.naloxone){ doc.text('x',302, 516); }
    if (toxData.opioidAntagonists.nalmefene){ doc.text('x',302, 525); }
    if (toxData.opioidAntagonists.naltrexone){ doc.text('x',302, 534); }

    if (toxData.skeletal.full){ doc.text('x',302, 556); }
    if (toxData.skeletal.baclofen){ doc.text('x',302, 565); }
    if (toxData.skeletal.carisoprodol){ doc.text('x',302, 575); }
    if (toxData.skeletal.cyclobenzaprine){ doc.text('x',302, 585); }
    if (toxData.skeletal.meprobamate){ doc.text('x',302, 595); }
    if (toxData.skeletal.methocarbamol){ doc.text('x',302, 605); }
    if (toxData.skeletal.tizanidine){ doc.text('x',302, 614); }

    if (toxData.gabapentinoids.full){ doc.text('x',302, 633); }
    if (toxData.gabapentinoids.gabapentin){ doc.text('x',302, 643); }
    if (toxData.gabapentinoids.pregabalin){ doc.text('x',302, 652); }
    
    if (toxData.hallucinogens.full){ doc.text('x', 302,677); }
    if (toxData.hallucinogens.lsd){ doc.text('x', 302,692); }

    if (toxData.antipsychotics.full){ doc.text('x',398, 505); }
    if (toxData.antipsychotics.aripiprazole){ doc.text('x',398, 514); }
    if (toxData.antipsychotics.haloperidol){ doc.text('x',398, 523); }
    if (toxData.antipsychotics.lurasidone){ doc.text('x',398, 532); }
    if (toxData.antipsychotics.olanzapine){ doc.text('x',398, 541); }
    if (toxData.antipsychotics.quetiapine){ doc.text('x',398, 550); }
    if (toxData.antipsychotics.risperidone){ doc.text('x',398, 559); }
    if (toxData.antipsychotics.ziprasidone){ doc.text('x',398, 568); }

    if (toxData.benzodiazepines.full){ doc.text('x',398, 578); }
    if (toxData.benzodiazepines.alprazolam){ doc.text('x',398, 588); }
    if (toxData.benzodiazepines.chlordiazepoxide){ doc.text('x',398, 597); }
    if (toxData.benzodiazepines.clonazepam){ doc.text('x',398, 615); }
    if (toxData.benzodiazepines.clonazolam){ doc.text('x',398, 624); }
    if (toxData.benzodiazepines.etizolam){ doc.text('x',398, 633); }
    if (toxData.benzodiazepines.flualprazolam){ doc.text('x',398, 643); }
    if (toxData.benzodiazepines.lorazepam){ doc.text('x',398, 652); }
    if (toxData.benzodiazepines.midazolam){ doc.text('x',398, 661); }
    if (toxData.benzodiazepines.oxazepam){ doc.text('x',398, 671); }
    if (toxData.benzodiazepines.temazepam){ doc.text('x',398, 680); }
    if (toxData.benzodiazepines.triazolam){ doc.text('x',398, 690); }

    if (toxData.sedative.full){ doc.text('x',398, 700); }
    if (toxData.sedative.butalbital){ doc.text('x',398, 709); }
    if (toxData.sedative.phenibut){ doc.text('x',398, 718); }
    if (toxData.sedative.xylazine){ doc.text('x',398, 727); }
    if (toxData.sedative.zolpidem){ doc.text('x',398, 736); }
    if (toxData.sedative.zopiclone){ doc.text('x',398, 745); }


    if (toxData.antidepressants.full){ doc.text('x',491, 505); }
    if (toxData.antidepressants.amitriptyline){ doc.text('x',491, 514); }
    if (toxData.antidepressants.bupropion){ doc.text('x',491, 523); }
    if (toxData.antidepressants.citalopram){ doc.text('x',491, 533); }
    if (toxData.antidepressants.doxepin){ doc.text('x',491, 542); }
    if (toxData.antidepressants.duloxetine){ doc.text('x',491, 551); }
    if (toxData.antidepressants.fluoxetine){ doc.text('x',491, 561); }
    if (toxData.antidepressants.imipramine){ doc.text('x',491, 571); }
    if (toxData.antidepressants.mirtazapine){ doc.text('x',491, 580); }
    if (toxData.antidepressants.paroxetine){ doc.text('x',491, 590); }
    if (toxData.antidepressants.sertraline){ doc.text('x',491, 600); }
    if (toxData.antidepressants.trazodone){ doc.text('x',491, 609); }
    if (toxData.antidepressants.venlafaxine){ doc.text('x',491, 619); }
    if (toxData.antidepressants.vortioxetine){ doc.text('x',491, 629); }
    
    if (toxData.stimulants.full){ doc.text('x',491, 657); }
    if (toxData.stimulants.benzylone){ doc.text('x',491, 667); }
    if (toxData.stimulants.eutylone){ doc.text('x',491, 677); }
    if (toxData.stimulants.mda){ doc.text('x',491, 686); }
    if (toxData.stimulants.methylphenidate){ doc.text('x',491, 695); }
    if (toxData.stimulants.phentermine){ doc.text('x',491, 713); }

    if (toxData.kratom){ doc.text('x',491, 732); }
    if (toxData.kratom){ doc.text('x',491, 741); }

    if (labOrder.userSignatureId_Physician > 0){
        imgPhy.src = 'data:image/*;base64,' + PhysicianSig;
        doc.addImage(imgPhy, 'JPEG', 180, 748, 100, 25);
    }

    if (labOrder.userSignatureId_Physician == -1)
    {
        doc.text("Signature on Hardcopy",200, 773);
        doc.text(formatDate((labOrder.specimens[0].collectionDate + 'Z').toLocaleString(), 'MM/dd/yyyy', 'en'),460, 773);
    }
    else if (labOrder.datePhysicianSignature != null){
        doc.text(labOrder.user_Physician,300, 773);
        doc.text(formatDate((labOrder.datePhysicianSignature + 'Z').toLocaleString(), 'MM/dd/yyyy', 'en'),460, 773);
    }

    return(doc);

  }
}