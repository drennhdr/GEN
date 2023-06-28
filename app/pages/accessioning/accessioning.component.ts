//Page Name       : Accessioning
//Date Created    : 08/17/2022
//Written By      : Stephen Farkas
//Description     : Accessioning
//MM/DD/YYYY xxx  Description
//10/14/2022 SJF  Added note modal popup
//11/02/2022 SJF  Added view order
//02/15/2022 SJF  Added overStability
//03/20/2023 SJF  Added check for lab services offered
//06/03/2023 SJF  Added physician and pateint handcopy
//-----------------------------------------------------------------------------
// Data Passing
//-----------------------------------------------------------------------------

import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { first } from 'rxjs/operators';
import {formatDate} from '@angular/common';

import { LabOrderService } from '../../services/labOrder.service';
import { PatientService } from '../../services/patient.service';
import { CustomerService } from '../../services/customer.service';
import { CodeService } from '../../services/code.service';
import { UserService } from '../../services/user.service';
import { LabService } from '../../services/lab.service';


import jsPDF from 'jspdf';
import { DomSanitizer } from '@angular/platform-browser';

import { LabOrderListItemModel } from '../../models/LabOrderModel';
import { PatientInsuranceModel, PatientInsuranceListItemModel } from '../../models/PatientInsuranceModel';
import { LabOrderAttachmentModel, LabOrderAttachmentListItemModel, LabOrderPdfModel } from '../../models/LabOrderAttachmentModel';
import { ToxModel, ToxOralModel, GPPModel, UTIModel, RPPModel} from '../../models/LabOrderTestModel';
import { NoteModalComponent } from '../../modal/note-modal/note-modal.component';
import { PopupModalComponent } from '../../modal/popup-modal/popup-modal.component';

import { CodeItemModel } from '../../models/CodeModel';
import { async, Observable, ReplaySubject } from 'rxjs';
import { Router } from '@angular/router';
import { ClientPrintJob, InstalledPrinter, JSPrintManager, WSStatus } from 'JSPrintManager';

import { PdfSpecimentRejectionService } from '../../services/pdfSpecimenRejection.service';
import { PdfGPPService } from '../../services/pdfGPP.service';
import { PdfRPPService } from '../../services/pdfRPP.service';
import { PdfUTISTIService } from '../../services/pdfUTISTI.service';
import { PdfToxUrineService } from '../../services/pdfToxUrine.Service';
import { PdfToxOralService } from '../../services/pdfToxOral.service';

import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

@Component({
  selector: 'app-accessioning',
  templateUrl: './accessioning.component.html',
  styleUrls: ['./accessioning.component.css']
})
export class AccessioningComponent implements OnInit {

  @ViewChild('searchField') searchField: ElementRef;

   // Variables to hold screen data
   labOrderData: any;
   labHistoryData: any;
   labOrderId: number = 0;
   labId: number = 0;
   patientId: number = 0;
   patientData: any;
   labData: any;
   insuranceListData: any;
   insuranceData: any;
   insuranceSave: boolean;
   specimenAge: number = 0;
   overStability: boolean = false;
   eligibilityData: any;
   eligibilityListData: any;
   attachmentListData: any;
   attachmentData: any;
   accessionedTime: string;
   accessionedTimeUTC: string;
   receivedDate: string;
   collectionDate: string;
   physicianHardcopy: boolean;
   patientHardcopy: boolean;

   // Details
   detailData: any;
   showDetails: boolean;
   collectedDate: string = '';
   accessionedDate: string = '';
   diagnosis: string;
   medications1: string;
   medications2: string;
   medications3: string;
   allergies: string;
   issueNote: string = '';
   tests: string;
   toxScreen: string;
   physicianSig: string = "";
   patientSig: string = "";
   pregnant: string = "";

  //  noteData: any;
   showError: boolean;
   errorMessage: string;
   pdfData: any;
   gppData: any;
   utiData: any;
   rppData: any;
// Tox Tests
presumptiveTesting15: boolean;
presumptiveTesting13: boolean;
alcohol: any;
antidepressants: any;
antipsychotics: any;
benzodiazepines: any;
cannabinoids: any;
cannabinoidsSynth: any;
dissociative: any;
gabapentinoids: any;
hallucinogens: any;
illicit: any;
kratom:boolean = false;
opioidAgonists: any;
opioidAntagonists: any;
sedative: any;
skeletal: any;
stimulants: any;
thcSource:boolean = false;

toxUrineFullPanel: boolean = false;
toxUrineConfirmationPanel: boolean = false;
toxUrineTargetReflexPanel: boolean = false;
toxUrineUniversalReflexPanel: boolean = false;
toxUrineCustomPanel: boolean = false;

// Tox Oral Tests
oralIllicit: any;
oralSedative: any;
oralBenzodiazepines: any;
oralMuscle: any;
oralAntipsychotics: any;
oralAntidepressants: any;
oralStimulants: any;
oralKratom: any;
oralNicotine: any;
oralOpioidAntagonists: any;
oralGabapentinoids: any;
oralDissociative: any;
oralOpioidAgonists: any;

toxOralFullPanel: boolean = false;

 
   // Search Variables
   searchBarcode: string;

   // Variables for drop down data
   relationshipList: any;
   insuranceList: any;
   insuranceTypeList: any;
   payorList: any;
   sequenceList: any;
   attachmentTypeList: any;
   holdList: any;
   rejectList: any;  
   labList: any;
   detailsButton: string = "Details";
   
   // Variables to control screen display
   userType: number = 0;
   showSearch: boolean;
   showLabOrder: boolean;
   showInsuranceList: boolean;
   showInsuranceEdit: boolean;
   showEligibilityRequest: boolean;
   showEligibilityList: boolean;
   showEligibilityView: boolean;
   showEligibilityMerge: boolean;
   showAttachmentList: boolean;
   showAttachmentEdit: boolean;
   alreadyProcessToday: boolean;
   futureDate: boolean;
   statusStyle: any;
   showHold: boolean;
   showReject: boolean;
   showConfirmation: boolean;
   holdReason: number;
   rejectReason: number;
   holdComment: string;
   rejectComment: string;
   continueHold: boolean;
   continueReject: boolean;

   // Elgibility Request Variables
   eligibilityPayorId: number;
   eligibilityFirstName: string;
   eligibilityLastName: string;
   eligibilityDOB: string;
   eligibilityMemberId: string;
   eligibilityRelationshipId: number;
   eligibilityStart: string;
   eligibilityEnd: string;

   // Attachments
  attachmentDisabled: boolean;
  attachmentSave: boolean;
  attachmentDoc: string; // This hold the url passed for the ngx-doc-viewer
  attachmentViewer: string;

  customerBillingTypeId: number = 0;

  // viewer = 'google';  
  // selectedType = 'docx';   
  // DemoDoc="https://vadimdez.github.io/ng2-pdf-viewer/assets/pdf-test.pdf";

  fileUploaded:boolean = false;
  fileScanned: boolean = false;

  // Camera Variables
  picWidth = 600; //480;
  picHeight = 800;// 640;

  @ViewChild("video")
  public video: ElementRef;

  @ViewChild("canvas")
  public canvas: ElementRef;

  captures: string[] = [];
  error: any;
  isCaptured: boolean = false;
  cameraOn: boolean;

  // Mismatched
  mismatchDate: boolean = false;
  mismatchDOB: boolean = false;
  mismatchName: boolean = false;
  mismatchPregnant: boolean = false;


  // Modal Dialog
  modalRef: BsModalRef;


   constructor(
    private labOrderService: LabOrderService,
    private patientService: PatientService,
    private customerService: CustomerService,
    private codeService: CodeService,
    private userService: UserService,
    private labService: LabService,
    private sanitizer: DomSanitizer,
    private router: Router,
    private modalService: BsModalService,
    private pdfSpecimentRejectionService: PdfSpecimentRejectionService,
    private pdfGPPService: PdfGPPService,
    private pdfRPPService: PdfRPPService,
    private pdfUTISTIService: PdfUTISTIService,
    private pdfToxUrineService: PdfToxUrineService,
    private pdfToxOralService: PdfToxOralService,
  ) { }

  ngOnInit(): void {
    if (sessionStorage.getItem('userId_Login') == ""){
      this.router.navigateByUrl('/login');
    }
    // Initialize screen handling variables
    this.showSearch = true;
    this.showLabOrder = false;
    this.showInsuranceList = false;
    this.showInsuranceEdit = false;
    this.showEligibilityRequest = false;
    this.showEligibilityList = false;
    this.showEligibilityView = false;
    this.showEligibilityMerge = false;
    this.showAttachmentList = false;
    this.showAttachmentEdit = false;
    this.showAttachmentList = false;
   
    this.showError = false;
    this.userType = Number(sessionStorage.getItem('userType'));
    var userId = Number(sessionStorage.getItem('userId_Login'));
    this.loadDropdownLists();
    this.loadLabList(userId);

    this.searchBarcode = sessionStorage.getItem('barcode');
    sessionStorage.setItem('barcode','');
    if (this.searchBarcode != ''){
      this.searchButtonClicked();
    }

  }

  @HostListener('document:keyup', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key == 'Enter'){
      if (this.showSearch) {
        this.searchButtonClicked();
      }
      else if (this.showLabOrder){
        this.continueClicked();
      }
      else if (this.showConfirmation){
        this.processButtonClicked();
      }
      
    }

  }
  
  barcodeKeypress(event: any){
    console.log ("Event",event);
    if (event.key == 'Enter'){
      this.searchButtonClicked();
    }

  }

  labOrderKeypress(event: any){
    console.log ("Event",event);
    // if (event.key == 'Enter'){
    //   this.searchButtonClicked();
    // }

  }

  searchButtonClicked(){
    this.errorMessage = "";
    this.showError = false;

    if (this.searchBarcode != '')
    {
          // Call the labOrder service to get the data for the entered specimen id
      this.labOrderService.getLabOrderForAccessioning(this.searchBarcode)
              .pipe(first())
              .subscribe(
              data => {
                // console.log("Order Data",data);
                if (data.valid)
                {
                  this.labOrderData = data;
                  this.labOrderId = this.labOrderData.labOrderId;
                  this.patientId = data.patientId;
                  var localDate = new Date(this.labOrderData.collectionDate + 'Z');
                  this.collectionDate = formatDate(localDate, 'MM/dd/yyyy hh:mm a', 'en');

                  this.mismatchDate = this.labOrderData.mismatchDate;
                  this.mismatchDOB = this.labOrderData.mismatchDOB;
                  this.mismatchName = this.labOrderData.mismatchName;
                  this.alreadyProcessToday = false;
                  this.futureDate = false;
                  this.physicianHardcopy = false;
                  this.patientHardcopy = false;


                  const today = new Date();
                  var startDate = today.setDate(today.getDate())
                  var startck = new Date(formatDate(startDate , 'MM/dd/yy HH:mm', 'en'));
              
                  // var effectiveck = new Date(formatDate(this.preferenceData.effectiveDate , 'MM/dd/yy', 'en'));
              
                  // if (effectiveck < startck){


                  // console.log("localDate",localDate);
                  // console.log("Now", startck);


                  if (localDate > startck){
                    this.futureDate = true;
                  }
                  console.log("FutureDate",this.futureDate);
                  if (this.labOrderData.alreadyProcessToday > 0){
                    this.alreadyProcessToday = true;
                  }
                  if (this.labOrderData.accessioningNote == null){
                    this.labOrderData.accessioningNote = "";
                  }
                  sessionStorage.setItem('note', this.labOrderData.accessioningNote);

                  this.toxScreen = "";
                  if (this.labOrderData.labTypeId ==1 && this.labOrderData.toxScreen > 0){
                    this.toxScreen = "(S)";
                  }
                  else if (this.labOrderData.labTypeId ==1 && this.labOrderData.toxScreen == 0){
                    this.toxScreen = "(NS)";
                  }

                  if (this.labOrderData.isPregnant == 1){
                    this.pregnant = "Yes";
                  }
                  else if (this.labOrderData.isPregnant == 2){
                    this.pregnant = "No";
                  }
                  else{
                    this.pregnant = "Unknown";
                  }
                  // Get the patient data
                  this.patientService.get(this.patientId)
                        .pipe(first())
                        .subscribe(
                        data => {
                          if (data.valid)
                          {
                              this.patientData = data;
                              // Calculate Age
                              let endDate = new Date( formatDate(new Date(),'yyyy-MM-dd', 'en-US') + " 09:00");

                              let specimenDate = new Date(this.labOrderData.collectionDate);
                              
                              var diff = Math.abs(endDate.getTime() - specimenDate.getTime());
                              this.specimenAge = Math.ceil(diff / (1000 * 3600)); 
                              this.overStability = false;
                              if (this.labOrderData.labTypeId == 1 && this.specimenAge > 168){
                                this.overStability = true;
                              }
                              else if (this.labOrderData.labTypeId == 2 && this.specimenAge > 120){
                                this.overStability = true;
                              }
                              else if (this.labOrderData.labTypeId == 3 && this.specimenAge > 96){
                                this.overStability = true;
                              }
                              else if (this.labOrderData.labTypeId == 4 && this.specimenAge > 56){
                                this.overStability = true;
                              }
                              else if (this.labOrderData.labTypeId == 5 && this.specimenAge > 56){
                                this.overStability = true;
                              }

                              this.eligibilityFirstName = this.patientData.firstName;
                              this.eligibilityLastName = this.patientData.lastName;
                              this.eligibilityDOB = this.patientData.dob;
                              if (this.labOrderData.alreadyProcessToday){
                               
                                this.showInsuranceList = false;
                                this.showEligibilityRequest = false;
                                this.showEligibilityList = false;
                                this.labOrderData.labStatusId = 99;
                              }
                              else if (this.futureDate){
                                this.showLabOrder = false;
                                this.showInsuranceList = false;
                                this.showEligibilityRequest = false;
                                this.showEligibilityList = false;
                                this.showDetails = false;
                                this.showError = true;
                                this.errorMessage = "An order with a future collection date can not be accessioned."
                              }
                              else{
                                // this.insuranceListData = new Array<CodeItemModel>();
                                // if (this.patientData.insurances == null){
                                //   this.patientData.insurances = new Array<PatientInsuranceListItemModel>();
                                // }
                                // this.patientData.insurances.forEach( (item) =>{
                                //   var newItem = new CodeItemModel();
                                //   newItem.id = item.insuranceId;
                                //   newItem.description = item.insurance;
                                //   this.insuranceListData.push(newItem);
                                // });
                                // Call the patient service to get the data for the patient eligibility
                                this.patientService.getPatientEligibilityList(this.patientId)
                                    .pipe(first())
                                    .subscribe(
                                    data => {
                                      if (data.valid)
                                      {
                                        this.eligibilityListData = data.list;

                                        this.labOrderService.getLabOrderAttachmentList(this.labOrderId)
                                            .pipe(first())
                                            .subscribe(
                                            data => {
                                              if (data.valid)
                                              {
                                                this.attachmentListData = data.list;
                                              }
                                              else
                                              {
                                                // No attachments
                                                this.attachmentListData = new Array<LabOrderAttachmentListItemModel>();
                                              }
                                              var startDate: Date = new Date();
                                           
                                              startDate.setDate(new Date().getDate() - 30);
                                              var endDate: Date = new Date();
                                              endDate.setDate(new Date().getDate() + 1);

                                              this.labOrderService.search(0,0,0,0,this.patientId,'','',0,formatDate(startDate , 'MM/dd/yyyy', 'en'),formatDate(endDate , 'MM/dd/yyyy', 'en'),1)
                                                  .pipe(first())
                                                  .subscribe(
                                                  data => {
                                                    if (data.valid)
                                                    {
                                                      this.labHistoryData = data.list;
                                                    }
                                                    else
                                                    {
                                                      // No attachments
                                                      this.labHistoryData = new Array<LabOrderListItemModel>();
                                                    }

                                                    // Get customer Info
                                                    this.customerService.get( this.patientData.customerId)
                                                    .pipe(first())
                                                    .subscribe(
                                                              data => {
                                                                if (data.valid)
                                                                {
                                                                  this.customerBillingTypeId = data.customerBillingTypeId;
                                                                }
                                                                else
                                                                {
                                                                  //this.errorMessage = data.message;
                                                                }
                                                              },
                                                              error => {
                                                                console.log("Error1");
                                                                this.errorMessage = error;
                                                                this.showError = true;
                                                          });

                                                    this.showMainItems();
                                                    
                                                  },
                                                  error => {
                                                    this.errorMessage = error;
                                                    this.showError = true;
                                                  });


                                              
                                            },
                                            error => {
                                              this.errorMessage = error;
                                              this.showError = true;
                                            });
                                      }
                                      else
                                      {
                                        this.errorMessage = data.message;
                                        this.showError = true;
                                      }
                                    },
                                    error => {
                                      this.errorMessage = error;
                                      this.showError = true;
                                    });
                              }
                            }
                            else
                            {
                              this.errorMessage = "Invalid specimen id entered."
                              this.showError = true;
                            }
                          },
                          error => {
                            this.errorMessage = error;
                            this.showError = true;
                          });
              
                  // Get the lab order data
                  this.labOrderService.get(this.labOrderId )
                        .pipe(first())
                        .subscribe(
                        data => {
                          if (data.valid)
                          {
                            this.detailData = data;

                            this.collectedDate = new Date(this.detailData.specimens[0].collectedDate).toLocaleString();
                            this.accessionedDate = new Date(this.detailData.specimens[0].accessionedDate).toLocaleString();

                            // build diagnosis list
                            this.diagnosis = "";
                            var cntr = 0;
                            if (this.detailData.diagnosis != null){
                              this.detailData.diagnosis.forEach( (item) =>{
                                if (cntr == 0){
                                  this.diagnosis = item.code;
                                } 
                                else{
                                  this.diagnosis = this.diagnosis + ", " + item.code;
                                }
                                cntr++;
                              });
                            }
                            //Put together a list of tests
                            this.tests = "";
                            cntr = 0;
                            var groupEnd = 0;
                            if (this.detailData.specimens[0].tests != null)
                            {
                              this.detailData.specimens[0].tests.forEach(( item) =>{
                                if (item.labTestId > groupEnd){
                                  
                                  if (item.group == 1){
                                    if (cntr == 0){
                                      this.tests = item.labTest + '(P)';
                                    }
                                    else{
                                      this.tests = this.tests + ", " + item.labTest + '(P)';
                                    }

                                    groupEnd = item.labTestId + 99;
                                  }
                                  else {
                                    if (cntr == 0){
                                      this.tests = item.labTest;
                                    }
                                    else{
                                      this.tests = this.tests + ", " + item.labTest;
                                    }
                                  }
                                }
                                
                                cntr++;
                              });
                            }

                            //Put together a list of medications
                            this.medications1 = "";
                            this.medications2 = "";
                            this.medications3 = "";
                            var column = 1;;
                            if (this.detailData.medications != null)
                            {
                              
                                this.detailData.medications.forEach(( item) =>{
                                  if (column == 1){
                                    this.medications1 = this.medications1 + item.description + "\n";
                                    column = 2;
                                  }
                                  else if (column == 2){
                                    this.medications2 = this.medications2 + item.description + "\n";
                                    column = 3;
                                  }
                                  else{
                                    this.medications3 = this.medications3 + item.description + "\n";
                                    column = 1;
                                  }
                              });
                            }
                            //Put together a list of allergies
                            this.allergies = "";
                            cntr = 0;
                            if (this.detailData.allergies != null)
                            {
                              this.detailData.allergies.forEach(( item) =>{
                                if (cntr == 0){
                                  this.allergies = item.desciption;
                                }
                                else{
                                  this.allergies = this.allergies + ", " + item.desciption;
                                }
                                cntr++;
                              });
                            }

                            this.patientSig = "None";
                            if (this.detailData.patientSignatureId > 0){
                              this.patientSig = "Signed by patient";
                            }
                            else if (this.detailData.patientSignatureId == -1){
                              this.patientSig = "Signature on hardcopy";
                            }
                            else if (this.detailData.conscentOnFile){
                              this.patientSig = "Conscent on file";
                            }

                            this.physicianSig = "None";
                            if (this.detailData.userSignatureId_Physician > 0){
                              this.physicianSig = "Signed by physician";
                            }
                            else if (this.detailData.userSignatureId_Physician == -1){
                              this.physicianSig = "Signature on hardcopy";
                            }

                            if (!this.alreadyProcessToday){
                              this.showDetails = true;
                              this.detailsButton = "Insurance";
                            }
                          }
                        });
                }
                else
                {
                  this.errorMessage = "Invalid specimen id entered."
                  this.showError = true;
                }
              },
              error => {
                this.errorMessage = error;
                this.showError = true;
              });
    }
  }

  continueClicked(){
    // Lab order data good.  Move on to next step
    // Hide the lab order info and go to attachments
    this.hideMainItems();

    if (sessionStorage.getItem('camera') == 'true'){

      this.showAttachmentList = false;

      this.showAttachmentEdit = true;

      this.continueHold = false;
      this.continueReject = false;

      this.errorMessage = "";
      this.showError = false;

      this.attachmentSave = false;

      this.fileUploaded = false;
      this.fileScanned = false;

      this.attachmentData = new LabOrderAttachmentModel();
      this.attachmentDisabled = false;
      this.showAttachmentEdit = true;
      this.attachmentSave = false;

      this.fileUploaded = false;
      this.fileScanned = false;
      
      this.captures = new Array<string>();

      // Position screen
      var elmnt = document.getElementById("topOfScreen");
      elmnt.scrollIntoView();

      // Turn on the camera
      this.setupDevices();
    }
    else{
      // Go to confirmation Screen
      this.accessionedTime = formatDate(new Date() , 'MM/dd/yyyy HH:mm', 'en');
      this.accessionedTimeUTC = new Date().toISOString();
  
      if (this.labOrderData.receivedDate == null){
        this.labOrderData.receivedDate = this.accessionedTimeUTC;
        this.receivedDate = this.accessionedTime;
      }
      else{
        // Convert to local time
        var dt = new Date(this.labOrderData.receivedDate);
        this.receivedDate = dt.toString();
      }

      // Position screen
      var elmnt = document.getElementById("topOfScreen");
      elmnt.scrollIntoView();
  
      this.showConfirmation = true;
    }

  }

  holdButtonClicked(){
    if (this.labOrderData.labStatusId > 10 && this.labOrderData.labStatusId < 20){
      this.holdReason = this.labOrderData.labStatusId;
    }
    else{
      this.holdReason = 0;
    }
    this.holdComment = this.labOrderData.accessioningComment;
    this.hideMainItems();
    this.showAttachmentList = true;

    this.showHold = true;
    this.continueHold = true;
    this.continueReject = false;
    // Position screen
    var elmnt = document.getElementById("topOfScreen");
    elmnt.scrollIntoView();
  }

  holdProcessButtonClicked(){
    var lab = this.labId;
    if (this.labOrderData.labTypeId == 1 && !this.labData.service_ToxUrine){
      lab = 0
    }
    else if (this.labOrderData.labTypeId == 2 && !this.labData.service_ToxOral){
      lab = 0
    }
    else if (this.labOrderData.labTypeId == 3 && !this.labData.service_GPP){
      lab = 0
    }
    else if (this.labOrderData.labTypeId == 4 && !this.labData.service_ToxUTI){
      lab = 0
    }
    else if (this.labOrderData.labTypeId == 5 && !this.labData.service_RPP){
      lab = 0
    }
    else if (this.labOrderData.labTypeId == 6 && !this.labData.service_Urinalysis){
      lab = 0
    }
    else if (this.labOrderData.labTypeId == 7 && !this.labData.service_Hematology){
      lab = 0
    }


    this.labOrderData.accessioningNote = sessionStorage.getItem('note');
    sessionStorage.removeItem('note');
    this.labOrderData.labStatusId = this.holdReason;
    this.showError = false;
    this.labOrderService.hold( this.labOrderData, this.holdComment, this.mismatchDate, this.mismatchDOB, this.mismatchName, this.mismatchPregnant, lab, this.physicianHardcopy, this.patientHardcopy)
          .pipe(first())
          .subscribe(
          data => {
            // console.log("Data",data);
            if (data.valid) {
              if (data.id > "0"){
                const initialState: ModalOptions = {
                  initialState: {
                    message: "Ticket: " + data.id
                  }
                };
                this.modalRef = this.modalService.show(PopupModalComponent, {
                  initialState 
                });
              }
              // Saved - Go back to accessionning  screen
              this.resetScreen();
              // Position screen
              var elmnt = document.getElementById("topOfScreen");
              elmnt.scrollIntoView();
             
            }
            else{
              this.errorMessage = data.message;
              this.showError = true;
            }
          },
          error => {
            this.errorMessage = error;
            this.showError = true;
          });
  }

  rejectButtonClicked(){
    this.labOrderData.accessioningNote = sessionStorage.getItem('note');
    sessionStorage.removeItem('note');
    if (this.labOrderData.labStatusId > 100){
      this.rejectReason = this.labOrderData.labStatusId;
    }
    else{
      this.rejectReason = 0;
    }
    this.rejectComment = this.labOrderData.accessioningComment;
    this.hideMainItems();
    this.showAttachmentList = true;

    this.showReject = true;
    this.continueHold = false;
    this.continueReject = true;
    // Position screen
    var elmnt = document.getElementById("topOfScreen");
    elmnt.scrollIntoView();
  }

  rejectionLetterClicked(){

    var rejectionReason = "";
    this.rejectList.forEach(item => {
      if (item.id == this.rejectReason){
        rejectionReason = item.description;
      }      
    });

    this.pdfSpecimentRejectionService.generateLetter(this.labOrderData, this.patientData, rejectionReason, this.rejectComment);

  }
  
  rejectProcessButtonClicked(){
    var lab = this.labId;
    if (this.labOrderData.labTypeId == 1 && !this.labData.service_ToxUrine){
      lab = 0
    }
    else if (this.labOrderData.labTypeId == 2 && !this.labData.service_ToxOral){
      lab = 0
    }
    else if (this.labOrderData.labTypeId == 3 && !this.labData.service_GPP){
      lab = 0
    }
    else if (this.labOrderData.labTypeId == 4 && !this.labData.service_ToxUTI){
      lab = 0
    }
    else if (this.labOrderData.labTypeId == 5 && !this.labData.service_RPP){
      lab = 0
    }
    else if (this.labOrderData.labTypeId == 6 && !this.labData.service_Urinalysis){
      lab = 0
    }
    else if (this.labOrderData.labTypeId == 7 && !this.labData.service_Hematology){
      lab = 0
    }
    this.labOrderData.labStatusId = this.rejectReason;
    this.showError = false;
    this.labOrderService.reject( this.labOrderData, this.rejectComment, this.mismatchDate, this.mismatchDOB, this.mismatchName, this.mismatchPregnant, lab, this.physicianHardcopy, this.patientHardcopy)
          .pipe(first())
          .subscribe(
          data => {
            // console.log("Data",data);
            if (data.valid) {
              if (data.id > "0"){
                const initialState: ModalOptions = {
                  initialState: {
                    message: "Ticket: " + data.id
                  }
                };
                this.modalRef = this.modalService.show(PopupModalComponent, {
                  initialState 
                });
              }
              // Saved - Go back to accessionning  screen
              this.resetScreen();
              // Position screen
              var elmnt = document.getElementById("topOfScreen");
              elmnt.scrollIntoView();
             
            }
            else{
              this.errorMessage = data.message;
              this.showError = true;
            }
          },
          error => {
            this.errorMessage = error;
            this.showError = true;
          });
  }

  resetScreen(){
    if (sessionStorage.getItem('callingScreen') == "patient"){
      // go back to patient screen
      this.router.navigateByUrl('/patient');
    } 
    else{
      this.searchBarcode = '';
      this.showSearch = true;
      this.showLabOrder = false;
      this.showInsuranceList = false;
      this.showInsuranceEdit = false;
      this.showEligibilityRequest = false;
      this.showEligibilityList = false;
      this.showEligibilityView = false;
      this.showEligibilityMerge = false;
      this.showHold = false;
      this.showReject = false;
      this.showConfirmation = false;
      this.showAttachmentList = false;
    }
  }

  hideMainItems(){
    this.showLabOrder = false;
    this.showInsuranceList = false;
    this.showInsuranceEdit = false;
    this.showEligibilityRequest = false;
    this.showEligibilityList = false;
    this.showEligibilityView = false;
    this.showEligibilityMerge = false;
    this.showDetails = false;
    this.detailsButton = "Insurance";
  }

  showMainItems(){
    this.showSearch = false;
    this.showLabOrder = true;
    this.showInsuranceList = true;
    this.showInsuranceEdit = false;
    this.showEligibilityRequest = true;
    this.showEligibilityList = true;
    this.showEligibilityView = false;
    this.showEligibilityMerge = false;
  }

  backToBarcodeButtonClicked(){
    this.searchBarcode = '';
    this.showSearch = true;
    this.showLabOrder = false;
    this.showInsuranceList = false;
    this.showInsuranceEdit = false;
    this.showEligibilityRequest = false;
    this.showEligibilityList = false;
    this.showEligibilityView = false;
    this.showEligibilityMerge = false;
    this.showAttachmentList = false;
    this.showDetails = false;
    // Position screen
    var elmnt = document.getElementById("topOfScreen");
    elmnt.scrollIntoView();
  }

  // Insurance

  selectInsuranceButtonClicked(patientInsuranceId: number){
    this.patientService.getPatientInsurance( patientInsuranceId)
            .pipe(first())
            .subscribe(
            data => {
              if (data.valid)
              {
                this.errorMessage = "";
                this.showError = false;
                this.insuranceData = data;
                this.showInsuranceEdit = true;
                this.showInsuranceList = false;
                this.showEligibilityRequest = false;
                this.showEligibilityList = false;
                this.showEligibilityView = false;
                this.showEligibilityMerge = false;
                this.insuranceSave = false;

                // Position screen
                // var elmnt = document.getElementById("insuranceEditCard");
                // elmnt.scrollIntoView();
                     
              }
              else
              {
                //this.errorMessage = data.message;
              }
            },
            error => {
            this.errorMessage = error;
            this.showError = true;
            });

  }

  insuranceChanged(){
    this.insuranceSave = false;
    if (this.insuranceData.insuranceId == 0){
      if (this.insuranceData.insurance != "" && this.insuranceData.memberId !="" && this.insuranceData.insuranceTypeId > 0){
        this.insuranceSave = true;
      }
    }
    else if(this.insuranceData.insuranceId > 0){
      if (this.insuranceData.memberId !="" && this.insuranceData.insuranceTypeId > 0){
        this.insuranceSave = true;
      }
    }
  }

  addInsuranceButtonClicked(){

    var dateStamp  =  formatDate(new Date() , 'yyyy-MM-dd HH:mm:ss', 'en');


    this.errorMessage = "";
    this.showError = false;
    this.insuranceData = new PatientInsuranceModel();
    this.insuranceData.patinetInsuranceId = 0;
    this.insuranceData.patientId = this.patientId
    this.insuranceData.insuranceId = -1;
    this.insuranceData.insuranceTypeId = -1;
    this.insuranceSave = false;

    //console.log(this.noteData);

    this.showInsuranceEdit = true;
    this.showInsuranceList = false;
    this.showEligibilityRequest = false;
    this.showEligibilityList = false;
    this.showEligibilityView = false;
    this.showEligibilityMerge = false;
    // Position screen
    // var elmnt = document.getElementById("insuranceEditCard");
    // elmnt.scrollIntoView();
  }

  saveInsuranceButtonClicked(){
    this.showError = false;
    this.patientService.savePatientInsurance( this.insuranceData)
          .pipe(first())
          .subscribe(
          data => {
            // console.log("Data",data);
            if (data.valid) {
              // Update list - Refresh from database

              // Call the patient service to get the data for the selected patient
              this.patientService.getPatientInsuranceList( this.patientId)
                                .pipe(first())
                                .subscribe(
                                data => {
                                  if (data.valid) {
                                    // Update the list
                                    this.patientData.insurances = data.list;

                                    this.showInsuranceEdit = false;
                                    this.showInsuranceList = true;
                                    this.showEligibilityRequest = true;
                                    this.showEligibilityList = true;
                                    this.showEligibilityView = false;
                                    this.showEligibilityMerge = false;

                                    // Position screen
                                    var elmnt = document.getElementById("insuranceListCard");
                                    elmnt.scrollIntoView();

                                    }
                                    else
                                    {
                                      //this.errorMessage = data.message;
                                    }
                                  },
                                  error => {
                                  this.errorMessage = error;
                                  this.showError = true;
                                  });
            }
            else{
              this.errorMessage = data.message;
              this.showError = true;
            }
          },
          error => {
            this.errorMessage = error;
            this.showError = true;
          });
  }

  cancelInsuranceButtonClicked(){
    this.showInsuranceEdit = false;
    this.showInsuranceList = true;
    this.showEligibilityRequest = true;
    this.showEligibilityList = true;
    this.showEligibilityView = false;
    this.showEligibilityMerge = false;
    // Position screen
    var elmnt = document.getElementById("insuranceListCard");
    elmnt.scrollIntoView();
    
  }  

  eligibilityProcessClicked(){
    // eligibilityPayorId: number;
    // eligibilityFirstName: string;
    // eligibilityLastName: string;
    // eligibilityDOB: string;
    // eligibilityMemberId: string;
    // eligibilityRelationshipId: number;
    // eligibilityStart: string;
    // eligibilityEnd: string;
  }

  elgibilityViewButtonClicked(patientEligibilityId: number){
    this.patientService.getPatientEligibility( patientEligibilityId)
                .pipe(first())
                .subscribe(
                data => {
                  console.log(data);
                  if (data.valid)
                  {
                    this.errorMessage = "";
                    this.showError = false;
                    this.eligibilityData = data;

                    this.showInsuranceList = false;
                    this.showEligibilityRequest = false;
                    this.showEligibilityList = false;
                    this.showEligibilityView = true;

                    // Position screen
                    var elmnt = document.getElementById("eligibilityViewCard");
                    elmnt.scrollIntoView();
                        
                  }
                  else
                  {
                    //this.errorMessage = data.message;
                  }
                },
                error => {
                this.errorMessage = error;
                this.showError = true;
                });
    
    
  }

  elgibilityViewCloseButtonClicked(){
    this.showInsuranceList = true;
    this.showEligibilityRequest = true;
    this.showEligibilityList = true;
    this.showEligibilityView = false;
    // Position screen
    var elmnt = document.getElementById("insuranceListCard");
    elmnt.scrollIntoView();
  }

  elgibilityMergeButtonClicked(patientEligibilityId: number){
    this.patientService.getPatientEligibility( patientEligibilityId)
                .pipe(first())
                .subscribe(
                data => {
                  // console.log(data);
                  if (data.valid)
                  {
                    this.eligibilityData = data;
                    // Get the patient insurance record related to this item.
                    this.patientService.getPatientInsurance( this.eligibilityData.patientInsuranceId)
                        .pipe(first())
                        .subscribe(
                        data => {
                          // console.log(data);
                          if (data.valid)
                          {
                              this.insuranceData = data;

                              this.errorMessage = "";
                              this.showError = false;
                              
                              this.showInsuranceList = false;
                              this.showEligibilityRequest = false;
                              this.showEligibilityList = false;
                              this.showEligibilityMerge = true;

                              // Position screen
                              var elmnt = document.getElementById("eligibilityMergeCard");
                              elmnt.scrollIntoView();
                            }
                            else
                            {
                              //this.errorMessage = data.message;
                            }
                          },
                          error => {
                            this.errorMessage = error;
                            this.showError = true;
                          });
                  }
                  else
                  {
                    //this.errorMessage = data.message;
                  }
                },
                error => {
                  this.errorMessage = error;
                  this.showError = true;
                });

    
  }

  elgibilityMergeCloseButtonClicked(){
    this.showInsuranceList = true;
    this.showEligibilityRequest = true;
    this.showEligibilityList = true;
    this.showEligibilityMerge = false;

    // Position screen
    var elmnt = document.getElementById("insuranceListCard");
    elmnt.scrollIntoView();
  }

  // Attachments

  selectAttachmentButtonClicked(attachmentId: number){
    // Call the attachment service to get the data for the selected attachment
    this.labOrderService.getLabOrderAttachment( attachmentId)
            .pipe(first())
            .subscribe(
            data => {
              if (data.valid)
              {
                this.hideMainItems();

                this.errorMessage = "";
                this.showError = false;
                this.attachmentData = data;
                this.attachmentDisabled = true;
                this.showAttachmentEdit = true;
                this.attachmentSave = false;

                // Position screen
                var elmnt = document.getElementById("topOfScreen");
                elmnt.scrollIntoView();

                console.log ('Attachment data',this.attachmentData);

                const binaryString = window.atob(this.attachmentData.fileAsBase64);
                const len = binaryString.length;
                const bytes = new Uint8Array(len);
                for (let i = 0; i < len; ++i) {
                  bytes[i] = binaryString.charCodeAt(i);
                }

                
                var fileblob = new Blob([bytes], { type: this.attachmentData.fileType });

                this.attachmentDoc = window.URL.createObjectURL(fileblob).replace("blob:","data:application/pdf;filename=generated.pdf;base64,");
                // this.attachmentDoc = "https://vadimdez.github.io/ng2-pdf-viewer/assets/pdf-test.pdf";
                // this.attachmentViewer = 'google';

                // console.log("URL", this.attachmentDoc);

                var url = window.URL.createObjectURL(fileblob); 

                let anchor = document.createElement("a");
                anchor.href = url;
                anchor.target = "_blank"
                anchor.click();
                     
              }
              else
              {
                //this.errorMessage = data.message;
              }
            },
            error => {
              this.errorMessage = error;
              this.showError = true;
            });

  }

  attachmentChanged(){
    this.attachmentSave = false;
    if (this.attachmentData.loAttachmentTypeId > 0  
      && (this.attachmentData.fileType !="" || this.captures.length > 0)){
      this.attachmentSave = true;
    }

  }

  addAttachmentButtonClicked(){
    this.attachmentData = new LabOrderAttachmentModel();

    this.showAttachmentList = false;
    this.showHold = false;
    this.showReject = false;

    this.errorMessage = "";
    this.showError = false;
    this.attachmentDisabled = false;
    this.showAttachmentEdit = true;
    this.attachmentSave = false;

    this.fileUploaded = false;
    this.fileScanned = false;
    
    this.captures = new Array<string>();

    // Position screen
    var elmnt = document.getElementById("topOfScreen");
    elmnt.scrollIntoView();
  }

  saveAttachmentButtonClicked(){
    this.attachmentData.labOrderId = this.labOrderId;
    this.showError = false;

    if (this.cameraOn){
      this.stopDevice();
    }

    if (!this.fileUploaded){
      // Scanned image
      const doc = new jsPDF();
      var width = doc.internal.pageSize.getWidth();
      var height = doc.internal.pageSize.getHeight();

      // Accumulate pages into a pdf document if scanner used
      var firstPage = true;
      this.captures.forEach( (item) =>{
        if (!firstPage) {doc.addPage();}
        doc.addImage(item, 0, 0, width, height);
        firstPage = false;
      });
     
      this.attachmentData.fileType = "application/pdf";

      var b64 = doc.output('datauristring'); // base64 string

      this.attachmentData.fileType = "application/pdf";

      this.attachmentData.fileAsBase64 = b64.replace("data:application/pdf;filename=generated.pdf;base64,", "");

      //console.log ("attachment", this.attachmentData.fileAsBase64);
    }

    this.labOrderService.saveLabOrderAttachment( this.attachmentData)
          .pipe(first())
          .subscribe(
          data => {
            //console.log("Data",data);
            if (data.valid) {
              console.log ("Attachment", this.attachmentData);
              console.log ("list", this.attachmentTypeList);
              // Find attachment type in list
              for (let item of this.attachmentTypeList){
                if (item.id == this.attachmentData.loAttachmentTypeId){
                  this.attachmentData.attachmentType = item.description;
                }
              }

              // Update list
              var item = new LabOrderAttachmentListItemModel();
              item.labOrderAttachmentId = Number(data.id);
              item.labOrderId = this.labOrderId;
              item.dateCreated = this.attachmentData.dateCreated.substring(0,10);
              item.attachmentType = this.attachmentData.attachmentType;
              item.description = this.attachmentData.description;
              if (this.attachmentListData == null){
                this.attachmentListData = new Array<LabOrderAttachmentListItemModel>();
              }
              this.attachmentListData.push(item);

              this.showAttachmentEdit = false;

              this.showAttachmentList = true;
              if (this.continueHold){
                this.showHold = true;
                // Position screen
                var elmnt = document.getElementById("topOfScreen");
                elmnt.scrollIntoView();
              } 
              else if (this.continueReject){
                this.showReject = true;
                // Position screen
                var elmnt = document.getElementById("topOfScreen");
                elmnt.scrollIntoView();
              }
              else {

                this.accessionedTime = formatDate(new Date() , 'MM/dd/yyyy HH:mm', 'en');
                this.accessionedTimeUTC = new Date().toISOString();
            
                if (this.labOrderData.receivedDate == null){
                  this.labOrderData.receivedDate = this.accessionedTimeUTC;
                  this.receivedDate = this.accessionedTime;
                }
                else{
                  // Convert to local time
                  var dt = new Date(this.labOrderData.receivedDate);
                  this.receivedDate = dt.toString();
                }
            
                // Hide the attachment info and go to confirmation
            
                this.showAttachmentList = false;
                this.showAttachmentEdit = false;
            
                this.showConfirmation = true;



              }

              this.captures = new Array<string>();
    
              // Position screen
              var elmnt = document.getElementById("topOfScreen");
              elmnt.scrollIntoView();
            }
            else{
              this.errorMessage = data.message;
              this.showError = true;
            }
          },
          error => {
            this.errorMessage = error;
            this.showError = true;
          });
  }

  saveContinueAttachmentButtonClicked(){
    this.attachmentData.labOrderId = this.labOrderId;
    this.showError = false;

    if (this.cameraOn){
      this.stopDevice();
    }

    if (!this.fileUploaded){
      // Scanned image
      const doc = new jsPDF();
      var width = doc.internal.pageSize.getWidth();
      var height = doc.internal.pageSize.getHeight();

      // Accumulate pages into a pdf document if scanner used
      var firstPage = true;
      this.captures.forEach( (item) =>{
        if (!firstPage) {doc.addPage();}
        doc.addImage(item, 0, 0, width, height);
        firstPage = false;
      });
     
      this.attachmentData.fileType = "application/pdf";

      var b64 = doc.output('datauristring'); // base64 string

      this.attachmentData.fileType = "application/pdf";

      this.attachmentData.fileAsBase64 = b64.replace("data:application/pdf;filename=generated.pdf;base64,", "");

      //console.log ("attachment", this.attachmentData.fileAsBase64);
    }

    this.labOrderService.saveLabOrderAttachment( this.attachmentData)
          .pipe(first())
          .subscribe(
          data => {
            //console.log("Data",data);
            if (data.valid) {
              // Find attachment type in list
              for (let item of this.attachmentTypeList){
                if (item.id == this.attachmentData.loAttachmentTypeId){
                  this.attachmentData.attachmentType = item.description;
                }
              }

              // Update list
              var item = new LabOrderAttachmentListItemModel();
              item.labOrderAttachmentId = Number(data.id);
              item.labOrderId = this.labOrderId;
              item.dateCreated = this.attachmentData.dateCreated.substring(0,10);
              item.attachmentType = this.attachmentData.attachmentType;
              item.description = this.attachmentData.description;
              if (this.attachmentListData == null){
                this.attachmentListData = new Array<LabOrderAttachmentListItemModel>();
              }
              this.attachmentListData.push(item);

              this.attachmentData = new LabOrderAttachmentModel();
              this.captures = new Array<string>();
              this.attachmentSave = false;

              this.attachmentSave = false;

              this.fileUploaded = false;
              this.fileScanned = false;
          

              this.setupDevices();
    
              // Position screen
              // var elmnt = document.getElementById("topOfScreen");
              // elmnt.scrollIntoView();
            }
            else{
              this.errorMessage = data.message;
              this.showError = true;
            }
          },
          error => {
            this.errorMessage = error;
            this.showError = true;
          });
  }


  cancelAttachmentButtonClicked(){
    // this.showAttachmentEdit = false;
    // this.showAttachmentList = true;
    // if (this.cameraOn){
    //   this.stopDevice();
    // }

    // if (this.continueHold){
    //   this.showHold = true;
    // } 
    // if (this.continueReject){
    //   this.showReject = true;
    // }
    
    // // Position screen
    // var elmnt = document.getElementById("topOfScreen");
    // elmnt.scrollIntoView();
    this.accessionedTime = formatDate(new Date() , 'MM/dd/yyyy HH:mm', 'en');
    this.accessionedTimeUTC = new Date().toISOString();

    if (this.labOrderData.receivedDate == null){
      this.labOrderData.receivedDate = this.accessionedTimeUTC;
      this.receivedDate = this.accessionedTime;
    }
    else{
      // Convert to local time
      var dt = new Date(this.labOrderData.receivedDate);
      this.receivedDate = dt.toString();
    }

    // Hide the attachment info and go to confirmation

    this.showAttachmentList = false;
    this.showAttachmentEdit = false;

    this.showConfirmation = true;
  }

  addAttachemtnsButtonClicked(){

  }

  readFile(event: any){
    const target: DataTransfer = <DataTransfer>(event.target);
    if (target.files.length !== 1) {
      throw new Error('Cannot get multiple files');
    }
    else
    {
      //console.log("Targe",target);
      // var temp = target.files[0].name;
      // var posn = temp.indexOf(".",1);
      //this.attachmentData.fileType = temp.substring(posn + 1, temp.length);

      this.fileUploaded = true;
      this.attachmentData.fileType = event.target.files[0].type;
      // Convert file to a pdf
      //var docxConverter = require('docx-pdf');

      // docxConverter(target.files[0].name,'C:/temp/gentemp.pdf',function(err,result){
      //   if(err){
      //     console.log(err);
      //   }
      //   console.log('result'+result);

      //   const reader = new FileReader());
      //   reader.read('C:/temp/gentemp.pdf');
      //   reader.onload = () => {
      //       console.log(reader.result);
      //   };
      // });



      //console.log("File Type:",fileType)
      this.convertFile(event.target.files[0]).subscribe(base64 => {
        this.attachmentData.fileAsBase64 = base64;
        this.attachmentChanged();
      });


    }
  }

  convertFile(file : File) : Observable<string> {
    const result = new ReplaySubject<string>(1);
    const reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = (event) => result.next(btoa(event.target.result.toString()));
    return result;
  }

  attachmentContinueClicked(){
    // Attachment data good.  Move on to next step

    this.accessionedTime = formatDate(new Date() , 'MM/dd/yyyy HH:mm', 'en');
    this.accessionedTimeUTC = new Date().toISOString();

    if (this.labOrderData.receivedDate == null){
      this.labOrderData.receivedDate = this.accessionedTimeUTC;
      this.receivedDate = this.accessionedTime;
    }
    else{
      // Convert to local time
      var dt = new Date(this.labOrderData.receivedDate);
      this.receivedDate = dt.toString();
    }

    // Hide the attachment info and go to confirmation

    this.showAttachmentList = false;
    this.showAttachmentEdit = false;

    this.showConfirmation = true;
  }

  backToLabOrderButtonClicked(){
    this.showLabOrder = true;
    this.showDetails = true;
    this.showInsuranceList = false;
    this.showInsuranceEdit = false;
    this.showEligibilityRequest = false;
    this.showEligibilityList = false;
    this.showEligibilityView = false;
    this.showEligibilityMerge = false;
    this.showAttachmentList = false;

    this.showAttachmentList = false;
    this.showAttachmentEdit = false;
    this.showHold = false;
    this.showReject = false;
    this.showConfirmation = false;
  }

  processButtonClicked(){
    this.labOrderData.accessioningNote = sessionStorage.getItem('note');
    sessionStorage.removeItem('note');
    this.labOrderData.labStatusId = 30;
    this.showError = false;
    var lab = this.labId;

    console.log("Lab Data", this.labData);

    if (this.labOrderData.labTypeId == 1 && !this.labData.service_ToxUrine){
      lab = 0
    }
    else if (this.labOrderData.labTypeId == 2 && !this.labData.service_ToxOral){
      lab = 0
    }
    else if (this.labOrderData.labTypeId == 3 && !this.labData.service_GPP){
      lab = 0
    }
    else if (this.labOrderData.labTypeId == 4 && !this.labData.service_ToxUTI){
      lab = 0
    }
    else if (this.labOrderData.labTypeId == 5 && !this.labData.service_RPP){
      lab = 0
    }
    else if (this.labOrderData.labTypeId == 6 && !this.labData.service_Urinalysis){
      lab = 0
    }
    else if (this.labOrderData.labTypeId == 7 && !this.labData.service_Hematology){
      lab = 0
    }
    
    this.labOrderService.accessioned( this.labOrderData, this.accessionedTimeUTC, this.mismatchDate, this.mismatchDOB, this.mismatchName, this.mismatchPregnant, lab, this.physicianHardcopy, this.patientHardcopy)
          .pipe(first())
          .subscribe(
          data => {

            var barcodePrinter = sessionStorage.getItem('barcodePrinter');
            console.log ("Printer", barcodePrinter,"X");
            if (barcodePrinter.length > 0){
              this.printBarcode();
            }

            if (data.id > "0"){
              const initialState: ModalOptions = {
                initialState: {
                  message: "Ticket: " + data.id
                }
              };
              this.modalRef = this.modalService.show(PopupModalComponent, {
                initialState 
              });
            }

            // console.log("Data",data);
            if (data.valid) {
              if (sessionStorage.getItem('callingScreen') == "patient"){
                // go back to patient screen
                this.router.navigateByUrl('/patient');
              }
              // Saved - Go back to accessionning  screen
              this.resetScreen();
              // Position screen
              var elmnt = document.getElementById("topOfScreen");
              elmnt.scrollIntoView();

              this.searchField.nativeElement.focus();
             
            }
            else{
              this.errorMessage = data.message;
              this.showError = true;
            }
          },
          error => {
            this.errorMessage = error;
            this.showError = true;
          });

    // Make sure that there is a PDF image
    this.orderPdfClicked(false );
  }

  viewButtonClicked(){

    if (!this.showDetails){
      this.showDetails = true;
      this.detailsButton = "Insurance";
    }
    else{
      this.showDetails = false;
      this.detailsButton = "Details";
    }
    

    // Show PDF of Lab Order

    // this.pdfData = new LabOrderPdfModel();

    // // Get the lab order data
    // this.labOrderService.get(this.labOrderId )
    //     .pipe(first())
    //     .subscribe(
    //     data => {
    //       if (data.valid)
    //       {
    //         this.patientId = data.patientId;
    //         this.labOrderData = data;

    //         if (this.labOrderData.specimens[0].requestPDF){
    //           this.orderPdfShow(this.labOrderData.specimens[0].labOrderSpecimenId);
    //         }
    //         else{
              
    //           // Get the patient data
    //           this.patientService.get( this.patientId)
    //               .pipe(first())
    //               .subscribe(
    //               data => {
    //                 if (data.valid){
    //                   var doc;
    //                   this.patientData = data;

    //                   // This is for Pdf generate

    //                   if (this.labOrderData.specimens[0].labTypeId == 1){
    //                     let data = this.labOrderService.loadToxData(this.labOrderData.specimens[0].tests )

    //                     this.presumptiveTesting15 = data.presumptiveTesting15;
    //                     this.presumptiveTesting13 = data.presumptiveTesting13;
    //                     this.alcohol = data.alcohol;
    //                     this.antidepressants = data.antidepressants;
    //                     this.antipsychotics = data.antipsychotics;
    //                     this.benzodiazepines = data.benzodiazepines;
    //                     this.cannabinoids = data.cannabinoids;
    //                     this.dissociative = data.dissociative;
    //                     this.gabapentinoids = data.gabapentinoids;
    //                     this.hallucinogens = data.hallucinogens;
    //                     this.illicit = data.illicit;
    //                     this.krampton = false;
    //                     this.opioidAgonists = data.opioidAgonists;
    //                     this.opioidAntagonists = data.opioidAntagonists;
    //                     this.sedative = data.sedative;
    //                     this.skeletal = data.skeletal;
    //                     this.stimulants = data.stimulants;
    //                     this.thcSource = false;
    //                   }
    //                   else if (this.labOrderData.specimens[0].labTypeId == 2){
    //                     let data = this.labOrderService.loadToxData(this.labOrderData.specimens[0].tests )

    //                     this.presumptiveTesting15 = data.presumptiveTesting15;
    //                     this.presumptiveTesting13 = data.presumptiveTesting13;
    //                     this.alcohol = data.alcohol;
    //                     this.antidepressants = data.antidepressants;
    //                     this.antipsychotics = data.antipsychotics;
    //                     this.benzodiazepines = data.benzodiazepines;
    //                     this.cannabinoids = data.cannabinoids;
    //                     this.dissociative = data.dissociative;
    //                     this.gabapentinoids = data.gabapentinoids;
    //                     this.hallucinogens = data.hallucinogens;
    //                     this.illicit = data.illicit;
    //                     this.krampton = false;
    //                     this.opioidAgonists = data.opioidAgonists;
    //                     this.opioidAntagonists = data.opioidAntagonists;
    //                     this.sedative = data.sedative;
    //                     this.skeletal = data.skeletal;
    //                     this.stimulants = data.stimulants;
    //                     this.thcSource = false;
    //                   }
    //                   else if (this.labOrderData.specimens[0].labTypeId == 3){
    //                     this.gppData = this.labOrderService.loadGPPData(this.labOrderData.specimens[0].tests )
    //                     doc = this.pdfGPPService.generateGPP(this.labOrderData, this.gppData, this.patientData);
    //                   }
    //                   else if (this.labOrderData.specimens[0].labTypeId == 4){
    //                     this.utiData = this.labOrderService.loadUTIData(this.labOrderData.specimens[0].tests )
    //                     this.utiData.isPregnant = this.labOrderData.isPregnant;
    //                   }
    //                   else if (this.labOrderData.specimens[0].labTypeId == 5){
    //                     this.rppData = this.labOrderService.loadRPPData(this.labOrderData.specimens[0].tests )
    //                     if (this.labOrderData.collectionDevice == 1){
    //                       this.rppData.swab = true;
    //                     }
    //                     else{
    //                       this.rppData.saliva = true;
    //                     }
    //                   }

    //                   this.pdfData.specimenId = this.labOrderData.specimens[0].labOrderSpecimenId;

    //                   this.pdfData.fileType = "application/pdf";

    //                   var b64 = doc.output('datauristring'); // base64 string
                
    //                   this.pdfData.fileType = "application/pdf";
                
    //                   this.pdfData.fileAsBase64 = b64.replace("data:application/pdf;filename=generated.pdf;base64,", "");
                
              
    //                   this.labOrderService.saveLabOrderRequestPdf( this.pdfData)
    //                         .pipe(first())
    //                         .subscribe(
    //                         data => {
    //                           //console.log("Data",data);
    //                           if (data.valid) {
    //                           }
    //                           else{
    //                             this.errorMessage = data.message;
    //                             this.showError = true;
    //                           }
    //                         },
    //                         error => {
    //                           this.errorMessage = error;
    //                           this.showError = true;
    //                         });

    //                   // Show the document
    //                   const binaryString = window.atob(this.pdfData.fileAsBase64);
    //                   const len = binaryString.length;
    //                   const bytes = new Uint8Array(len);
    //                   for (let i = 0; i < len; ++i) {
    //                     bytes[i] = binaryString.charCodeAt(i);
    //                   }
              
                      
    //                   var fileblob = new Blob([bytes], { type: this.pdfData.fileType });
              
    //                   //this.pdfDoc = window.URL.createObjectURL(fileblob).replace("blob:","data:application/pdf;filename=generated.pdf;base64,");
              
    //                   var url = window.URL.createObjectURL(fileblob); 
              
    //                   let anchor = document.createElement("a");
    //                   anchor.href = url;
    //                   anchor.target = "_blank"
    //                   anchor.click();

    //                 }
    //                 else
    //                 {
    //                   //this.errorMessage = data.message;
    //                 }
    //               },
    //               error => {
    //                 this.errorMessage = error;
    //                 this.showError = true;
    //               });
    //         }
    //       }
    //       else
    //       {
    //         //this.errorMessage = data.message;
    //       }
    //     },
    //     error => {
    //       this.errorMessage = error;
    //       this.showError = true;
    //     });

  }

  loadDropdownLists(){

    this.codeService.getList( 'Relationship,InsuranceType,LOAttachmentType,Insurance,Sequence,LabStatus' )

    .pipe(first())
    .subscribe(
        data => {
          if (data.valid)
          {
            this.relationshipList = data.list0;
            this.insuranceTypeList = data.list1;
            this.attachmentTypeList = data.list2;
            this.payorList = data.list3;
            this.sequenceList = data.list4;

            var item = new CodeItemModel();
            item.id = -1;
            item.description = "Select";
            this.payorList.splice(0,0,item);
            this.insuranceTypeList.splice(0,0,item);

            this.holdList = new Array<CodeItemModel>();
            this.rejectList = new Array<CodeItemModel>();

            data.list5.forEach(item => {
              var id = Number(item.id);
              if (id > 10 && id < 20){
                var newItem = new CodeItemModel();
                newItem.id = id;
                newItem.description = item.description;
                this.holdList.push(newItem);
              }
              else if (id > 100){
                var newItem = new CodeItemModel();
                newItem.id = id;
                newItem.description = item.description;
                this.rejectList.push(newItem);
              }
            });
          }

          else
          {
            this.errorMessage = data.message;
            this.showError = true;
          }
        },
        error => {
          this.errorMessage = error;
          this.showError = true;
        });
  }

  labChanged(){
    this.labService.get( this.labId)
    .pipe(first())
    .subscribe(
              data => {
                if (data.valid)
                {
                  this.labData = data;
                }
                else
                {
                  //this.errorMessage = data.message;
                }
              },
              error => {
                this.errorMessage = error;
                this.showError = true;
          });

  }


  loadLabList(userId: number){
    this.userService.get( userId)
            .pipe(first())
            .subscribe(
            data => {
              if (data.valid)
              {
                this.labList = data.labs;
                var lab = Number(sessionStorage.getItem('AccessionLab'));
                if (lab > 0){
                  this.labId = lab;
                }
                else if (this.labList != null){
                  this.labId = this.labList[0].labId;
                  sessionStorage.setItem('AccessionLab', this.labId.toString());
                }
                this.labChanged();
              }
              else
              {
                //this.errorMessage = data.message;
              }
            },
            error => {
              this.errorMessage = error;
              this.showError = true;
            });
  }

  // Camera capture code

  async setupDevices() {
    this.fileScanned = true;
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true
        });
        if (stream) {
          this.video.nativeElement.srcObject = stream;
          this.video.nativeElement.play();
          this.error = null;
          this.cameraOn = true;
        } else {
          this.error = "You have no output video device";
        }
      } catch (e) {
        this.error = e;
      }
    }
  }

  async stopDevice(){
    this.video.nativeElement.srcObject.getTracks().forEach(function(track) {
      track.stop();
    });
    this.cameraOn = false;
  }

  capture() {
    this.drawImageToCanvas(this.video.nativeElement);
    this.captures.push(this.canvas.nativeElement.toDataURL("image/png"));   
    this.attachmentChanged();
  }

  drawImageToCanvas(image: any) {
    this.canvas.nativeElement
      .getContext("2d")
      .drawImage(image, 0, 0, this.picWidth, this.picHeight);
  }

  showModal(){
    const initialState: ModalOptions = {
      initialState: {
      }
    };
    this.modalRef = this.modalService.show(NoteModalComponent, {
      initialState 
    });
  }

  printBarcode(){
    var sex  = "";
    if (this.labOrderData.genderId == 1){
      sex = "F";
    }
    else if (this.labOrderData.genderId == 2){
      sex = "M"
    }

    // console.log(this.labOrderData.specimens[0].collectionDate);
    // console.log(formatDate(this.labOrderData.specimens[0].collectionDate,'MM/dd/yyyy','en'));

    var specimenBarcode = this.labOrderData.specimenBarcode;
    var firstName = this.patientData.firstName;
    var lastName = this.patientData.lastName;
    var dob = formatDate(this.patientData.dob,'MM/dd/yyyy','en');
    var location = this.labOrderData.facilityCode;
    var collectionDate = formatDate(this.labOrderData.collectionDate,'MM/dd/yyyy','en');

    JSPrintManager.auto_reconnect = true;
    JSPrintManager.start();
    JSPrintManager.WS.onStatusChanged = function () {

      if (JSPrintManager.websocket_status == WSStatus.Open){
        

        //Create a ClientPrintJob
        var cpj = new ClientPrintJob();
        //Set Printer type (Refer to the help, there many of them!)
        var barcodePrinter = sessionStorage.getItem('barcodePrinter');
        var barcodeQty = Number(sessionStorage.getItem('barcodeQty'));
        cpj.clientPrinter = new InstalledPrinter(barcodePrinter);
        //Set content to print...
        //Create Zebra EPL commands for sample label

        var cmds = "";

        if (barcodePrinter == 'ZDesigner ZD410-203dpi ZPL')
        {
          for (let i = 1;i<=barcodeQty;i++){
          
            cmds += "^XA";
            cmds += "^FO30,20^BY2^BCN,30,Y,N,N,N^FD" + specimenBarcode + "^FS";
            cmds += "^FO30,90^ADN,18,10^FDFIRST: " + firstName + "^FS";
            cmds += "^FO30,110^ADN,18,10^FD LAST: " + lastName + "^FS";
            cmds += "^FO30,130^ADN,18,10^FD  DOB: " + dob + "     " + sex + "^FS";
            cmds += "^FO30,150^ADN,18,10^FD FROM: " + location + "^FS";
            cmds += "^FO30,170^ADN,18,10^FD  COL: " + collectionDate + "^FS";
            cmds += "^XZ";
          }
        }
        else
        {
          for (let i = 1;i<=barcodeQty;i++){
          
            cmds += "^XA";
            cmds += "^FO220,20^BY2^BCN,30,Y,N,N,N^FD" + specimenBarcode + "^FS";
            cmds += "^FO220,90^ADN,18,10^FDFIRST: " + firstName + "^FS";
            cmds += "^FO220,110^ADN,18,10^FD LAST: " + lastName + "^FS";
            cmds += "^FO220,130^ADN,18,10^FD  DOB: " + dob + "     " + sex + "^FS";
            cmds += "^FO220,150^ADN,18,10^FD FROM: " + location + "^FS";
            cmds += "^FO220,170^ADN,18,10^FD  COL: " + collectionDate + "^FS";
            cmds += "^XZ";
          }
        }
        cpj.printerCommands = cmds;
        //Send print job to printer!
        //console.log(cmds);
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
    }

  }

  orderPdfClicked(displayPDF: boolean ){
    this.pdfData = new LabOrderPdfModel();
    // Get the lab order data

    this.labOrderService.get(this.labOrderId )
        .pipe(first())
        .subscribe(
        data => {
          if (data.valid)
          {
            this.patientId = data.patientId;
            var labOrderData = data;
            //console.log("OrderData", labOrderData);
            if (labOrderData.specimens[0].requestPDF){
              if (displayPDF){
                this.orderPdfShow(labOrderData.specimens[0].labOrderSpecimenId);
              }
            }
            else{
              // Get the patient data
              this.patientService.get( this.patientId)
                  .pipe(first())
                  .subscribe(
                  data => {                  
                    if (data.valid){
                      var doc;
                      var patientData = data;
                      //console.log("Phy Sig Ids",labOrderData.userId_Physician, labOrderData.userSignatureId_Physician);
                      this.userService.getSignature( labOrderData.userId_Physician, labOrderData.userSignatureId_Physician )
                          .pipe(first())
                          .subscribe(
                          data => {
                            //console.log("Physician Sig", data);
                            var PhysicianSig = data.fileAsBase64;
                            this.labOrderService.getPatientSignature( labOrderData.patientId, labOrderData.labOrderId )

                            .pipe(first())
                            .subscribe(
                            data => {
                              
                              var PatientSig = data.fileAsBase64;
                              // This is for Pdf generate
                              if (labOrderData.specimens[0].labTypeId == 1){
                                this.loadToxData(labOrderData.specimens[0].tests);
                                var tox = new ToxModel();

                                tox.fullConfirmationOnly = this.toxUrineConfirmationPanel;
                                tox.fullScreenAndConfirmation = this.toxUrineFullPanel;
                                tox.targetReflex = this.toxUrineTargetReflexPanel;
                                tox.universalReflex = this.toxUrineUniversalReflexPanel;
                                tox.custom = this.toxUrineCustomPanel;
                                tox.presumptiveTesting13 = this.presumptiveTesting13;
                                tox.presumptiveTesting15 = this.presumptiveTesting15;
                                tox.alcohol = this.alcohol;
                                tox.antidepressants = this.antidepressants;
                                tox.antipsychotics = this.antipsychotics;
                                tox.benzodiazepines = this.benzodiazepines;
                                tox.cannabinoids = this.cannabinoids;
                                tox.cannabinoidsSynth = this.cannabinoidsSynth;
                                tox.dissociative = this.dissociative;
                                tox.gabapentinoids = this.gabapentinoids;
                                tox.hallucinogens = this.hallucinogens;
                                tox.illicit = this.illicit;
                                tox.kratom = this.kratom;
                                tox.opioidAgonists = this.opioidAgonists;
                                tox.opioidAntagonists = this.opioidAntagonists;
                                tox.sedative = this.sedative;
                                tox.skeletal = this.skeletal;
                                tox.stimulants = this.stimulants;
                                tox.thcSource = this.thcSource;

                                doc = this.pdfToxUrineService.generateToxUrine(labOrderData, tox, patientData, PhysicianSig, PatientSig);
                              }
                              else if (labOrderData.specimens[0].labTypeId == 2){
                                this.loadToxOralData(labOrderData.specimens[0].tests);
                                var toxOral = new ToxOralModel();
                                toxOral.fullConfirmation = this.toxOralFullPanel;
                                toxOral.illicit = this.oralIllicit;
                                toxOral.sedative =  this.oralSedative;
                                toxOral.benzodiazepines = this.oralBenzodiazepines;
                                toxOral.muscle = this.oralMuscle;
                                toxOral.antipsychotics = this.oralAntipsychotics;
                                toxOral.antidepressants = this.oralAntidepressants;
                                toxOral.stimulants = this.oralStimulants;
                                toxOral.kratom = this.oralKratom;
                                toxOral.nicotine = this.oralNicotine;
                                toxOral.opioidAntagonists = this.oralOpioidAntagonists;
                                toxOral.gabapentinoids = this.oralGabapentinoids;
                                toxOral.dissociative = this.oralDissociative;
                                toxOral.opioidAgonists = this.oralOpioidAgonists;
                                doc = this.pdfToxOralService.generateToxOral(labOrderData, toxOral, patientData, PhysicianSig, PatientSig);
                              }
                              else if (labOrderData.specimens[0].labTypeId == 3){
                                this.gppData = new GPPModel();
                                this.loadGPPData(labOrderData);
                                doc = this.pdfGPPService.generateGPP(labOrderData, this.gppData, patientData, PhysicianSig, PatientSig);
                              }
                              else if (labOrderData.specimens[0].labTypeId == 4){
                                this.utiData = new UTIModel();
                                this.loadUTIData(labOrderData);
                                doc = this.pdfUTISTIService.generateUTISTI(labOrderData, this.utiData, patientData, PhysicianSig, PatientSig);
                              }
                              else if (labOrderData.specimens[0].labTypeId == 5){
                                this.rppData = new RPPModel();
                                this.loadRPPData(labOrderData);
                                doc = this.pdfRPPService.generateRPP(labOrderData, this.rppData, patientData, PhysicianSig, PatientSig);
                              }

                              this.pdfData.specimenId = labOrderData.specimens[0].labOrderSpecimenId;

                              this.pdfData.fileType = "application/pdf";

                              var b64 = doc.output('datauristring'); // base64 string
                        
                              this.pdfData.fileType = "application/pdf";
                        
                              this.pdfData.fileAsBase64 = b64.replace("data:application/pdf;filename=generated.pdf;base64,", "");
                      
                              this.labOrderService.saveLabOrderRequestPdf( this.pdfData)
                                    .pipe(first())
                                    .subscribe(
                                    data => {
                                      if (data.valid) {
                                      }
                                      else{
                                        this.errorMessage = data.message;
                                        this.showError = true;
                                      }
                                    },
                                    error => {
                                      this.errorMessage = error;
                                      this.showError = true;
                                    });

                              // Show the document
                              if (displayPDF){
                                const binaryString = window.atob(this.pdfData.fileAsBase64);
                                const len = binaryString.length;
                                const bytes = new Uint8Array(len);
                                for (let i = 0; i < len; ++i) {
                                  bytes[i] = binaryString.charCodeAt(i);
                                }
                        
                                
                                var fileblob = new Blob([bytes], { type: this.pdfData.fileType });
                        
                                //this.pdfDoc = window.URL.createObjectURL(fileblob).replace("blob:","data:application/pdf;filename=generated.pdf;base64,");
                        
                                var url = window.URL.createObjectURL(fileblob); 
                        
                                let anchor = document.createElement("a");
                                anchor.href = url;
                                anchor.target = "_blank"
                                anchor.click();
                              }
                            });
                          });
                    }
                    else
                    {
                      //this.errorMessage = data.message;
                    }
                  },
                  error => {
                    this.errorMessage = error;
                    this.showError = true;
                  });
            }
          }
          else
          {
            //this.errorMessage = data.message;
          }
        },
        error => {
          this.errorMessage = error;
          this.showError = true;
        });

  }
  orderPdfShow(specimenId: number){
    this.labOrderService.getLabOrderRequestPdf( specimenId)
    .pipe(first())
    .subscribe(
    data => {
      if (data.valid)
      {
        this.pdfData = data;


        const binaryString = window.atob(this.pdfData.fileAsBase64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; ++i) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        
        var fileblob = new Blob([bytes], { type: 'application/pdf' });

        var url = window.URL.createObjectURL(fileblob); 
      
        let anchor = document.createElement("a");
        anchor.href = url;
        anchor.target = "_blank"
        anchor.click();             
      }
      else
      {
        //this.errorMessage = data.message;
      }
    },
    error => {
      this.errorMessage = error;
      this.showError = true;
    });
  }

  loadToxData(tests: any){

    let data = this.labOrderService.loadToxData(tests );
    this.toxUrineConfirmationPanel = data.fullConfirmationOnly;
    this.toxUrineFullPanel = data.fullScreenAndConfirmation;
    this.toxUrineTargetReflexPanel = data.targetReflex;
    this.toxUrineUniversalReflexPanel = data.universalReflex;
    this.toxUrineCustomPanel = data.custom;
    this.presumptiveTesting13 = data.presumptiveTesting13;
    this.presumptiveTesting15 = data.presumptiveTesting15;
    this.alcohol = data.alcohol;
    this.antidepressants = data.antidepressants;
    this.antipsychotics = data.antipsychotics;
    this.benzodiazepines = data.benzodiazepines;
    this.cannabinoids = data.cannabinoids;
    this.cannabinoidsSynth = data.cannabinoidsSynth;
    this.dissociative = data.dissociative;
    this.gabapentinoids = data.gabapentinoids;
    this.hallucinogens = data.hallucinogens;
    this.illicit = data.illicit;
    this.kratom = data.kratom;
    this.opioidAgonists = data.opioidAgonists;
    this.opioidAntagonists = data.opioidAntagonists;
    this.sedative = data.sedative;
    this.skeletal = data.skeletal;
    this.stimulants = data.stimulants;
    this.thcSource = data.thcSource;
  }

  loadToxOralData(tests: any){

    let data = this.labOrderService.loadToxOralData(tests );
    this.toxOralFullPanel = data.fullConfirmation;
    this.oralIllicit = data.illicit;
    this.oralSedative = data.sedative;
    this.oralBenzodiazepines = data.benzodiazepines;
    this.oralMuscle = data.muscle;
    this.oralAntipsychotics = data.antipsychotics;
    this.oralAntidepressants = data.antidepressants;
    this.oralStimulants = data.stimulants;
    this.oralKratom = data.kratom;
    this.oralNicotine = data.nicotine;
    this.oralOpioidAntagonists = data.opioidAntagonists;
    this.oralGabapentinoids = data.gabapentinoids;
    this.oralDissociative = data.dissociative;
    this.oralOpioidAgonists = data.opioidAgonists;
  }

  loadGPPData(labOrderData: any){
    let data = this.labOrderService.loadGPPData(labOrderData.specimens[0].tests )
    this.gppData = data; 

  }

  loadUTIData(labOrderData: any){
    let data = this.labOrderService.loadUTIData(labOrderData.specimens[0].tests )
    this.utiData = data; 
  }

  loadRPPData(labOrderData: any){
    let data = this.labOrderService.loadRPPData(labOrderData.specimens[0].tests )
    this.rppData = data; 

    //if (this.labOrderData.collectionDevice == 3){
    if (labOrderData.specimens[0].collectionDeviceId == 3){
      this.rppData.swab = true;
    }
    else{
      this.rppData.saliva = true;
    }
  }

}