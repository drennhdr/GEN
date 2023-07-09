//Page Name       : Audit
//Date Created    : 11/21/2022
//Written By      : Stephen Farkas
//Description     : Accessioning Audit
//MM/DD/YYYY xxx  Description
//03/20/2023 SJF  Added Sort To Table
//-----------------------------------------------------------------------------
// Data Passing
//-----------------------------------------------------------------------------

import { Component, ElementRef, OnInit, ViewChild, HostListener } from '@angular/core';
import { first } from 'rxjs/operators';
import SignaturePad from 'signature_pad';
import {formatDate} from '@angular/common';

import { LabOrderService } from '../../services/labOrder.service';
import { PatientService } from '../../services/patient.service';
import { CustomerService } from '../../services/customer.service';
import { CodeService } from '../../services/code.service';
// import { PdfGPPService } from '../../services/pdfGPP.service';
// import { PdfRPPService } from '../../services/pdfRPP.service';
// import { PdfUTISTIService } from '../../services/pdfUTISTI.service';

// import { LabOrderPdfModel } from '../../models/LabOrderAttachmentModel';
import { LabOrderReviewModel } from '../../models/LabOrderModel';
// import { GPPModel, UTIModel, RPPModel} from '../../models/LabOrderTestModel';
import { Router } from '@angular/router';

import { CodeItemModel } from '../../models/CodeModel';
// import { PatientAttachmentListItemModel } from '../../models/PatientAttachmentModel';

@Component({
  selector: 'app-audit',
  templateUrl: './audit.component.html',
  styleUrls: ['./audit.component.css']
})
export class AuditComponent implements OnInit {

  // Variables to hold screen data
  labId: number = 1;
  labOrderData: any;
  insuranceData: any;
  reviewData: any;
  specimenId: number = 0;
  patientData: any;
  patientId: number;
  attachmentUrl: any;
  collectedDate: string = '';
  accessionedDate: string = '';
  diagnosis: string;
  medications1: string;
  medications2: string;
  allergies: string;
  issueNote: string = '';
  tests: string;
  physicianSig: string = "";
  patientSig: string = "";
  loopFlag: boolean = false;
  loopPosn: number = 0;

  // Search Data
  searchData: any;
  searchStartDate: string;
  searchEndDate: string;
  searchLabTypeId: number;
  searchProcessed: boolean;
  searchDateTypeId: number;
  

   // Variables to control screen display
   showSearch: boolean;
   showSearchList: boolean;
   showAudit: boolean;
   hasIssues: number = 0;

   errorMessage: string = "";
   showError: Boolean = false;

  // Variables for dropdowns
  labTypeList: any;
  dateTypeList: any;
  srdList: any;
  incidentList: any;
  rejectionList: any;
  shippingList: any;

   // Attachments
   attachment1: string = "";
   attachment1Id: number = 0;
   attachment2: string = "";
   attachment2Id: number = 0;
   attachment3: string = "";
   attachment3Id: number = 0;
   attachment4: string = "";
   attachment4Id: number = 0;
   attachment5: string = "";
   attachment5Id: number = 0;
   attachment6: string = "";
   attachment6Id: number = 0;
   attachment7: string = "";
   attachment7Id: number = 0;
   attachment8: string = "";
   attachment8Id: number = 0;

  sortProperty: string = 'id';
  sortOrder = 1;

  constructor(
    private labOrderService: LabOrderService,
    private patientService: PatientService,
    private customerService: CustomerService,
    private codeService: CodeService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    if (sessionStorage.getItem('userId_Login') == ""){
      this.router.navigateByUrl('/login');
    }
    this.showSearch = true;
    this.showSearchList = false;
    this.showAudit = false;
    this.searchStartDate = formatDate(new Date() , 'yyyy-MM-dd', 'en');
    this.searchEndDate = formatDate(new Date() , 'yyyy-MM-dd', 'en');
    this.labId = 1;

    this.loadDropdownLists();

    this.searchLabTypeId = 99;
  }

  @HostListener('document:keyup', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key == 'Enter'){
      if (this.showSearch) {
        this.searchButtonClicked();
      }      
    }
  }

  searchButtonClicked(){
    var customerId: number = Number(sessionStorage.getItem('customerId'));
    this.labOrderService.getAuditList(this.labId, this.searchDateTypeId, this.searchStartDate, this.searchEndDate, this.searchLabTypeId, this.searchProcessed, customerId )
        .pipe(first())
        .subscribe(
        data => {
          console.log(data);
          if (data.valid)
          {
            this.searchData = data.list;
            this.showSearchList = true;
          }
          else if (data.message == 'No records found'){
            this.searchData = null;
            this.showSearchList = true;
          }
          else
          {
            //this.errorMessage = data.message;
          }
        },
        error => {
          console.log("Error ",error);
        });

  }

  selectAllButtonClicked(){
    this.loopFlag = true;
    this.loopPosn = 0;
    if (this.loopPosn < this.searchData.length){
      this.selectButtonClicked(this.searchData[this.loopPosn].labOrderId);
    }
  }

  selectButtonClicked(labOrderId){
    this.labOrderService.get(labOrderId )
    .pipe(first())
    .subscribe(
    data => {
      if (data.valid)
      {
        this.patientId = data.patientId;
        this.labOrderData = data;

        this.reviewData = new LabOrderReviewModel();
        this.reviewData.labOrderId = this.labOrderData.laborderId;
        this.reviewData.labOrderSpecimenId = this.labOrderData.specimens[0].labOrderSpecimenId;
        this.reviewData.incidentDate = new(Date)().toLocaleDateString();

        this.collectedDate = new Date(this.labOrderData.specimens[0].collectedDate).toLocaleString();
        this.accessionedDate = new Date(this.labOrderData.specimens[0].accessionedDate).toLocaleString();

        this.diagnosis = "";
        var cntr = 0;
        if (this.labOrderData.diagnosis != null){
          this.labOrderData.diagnosis.forEach( (item) =>{
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
        if (this.labOrderData.specimens[0].tests != null)
        {
          this.labOrderData.specimens[0].tests.forEach(( item) =>{
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
        var column = 1;
        if (this.labOrderData.medications != null)
        {
          
          this.labOrderData.medications.forEach(( item) =>{
            if (column == 1){
              this.medications1 = this.medications1 + item.description + "\n";
              column = 2;
            }
            else{
              this.medications2 = this.medications2 + item.description + "\n";
              column = 1;
            }
          });
        }

        //Put together a list of allergies
        this.allergies = "";
        cntr = 0;
        if (this.labOrderData.allergies != null)
        {
          this.labOrderData.allergies.forEach(( item) =>{
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
        if (this.labOrderData.patientSignatureId > 0){
          this.patientSig = "Signed by patient";
        }
        else if (this.labOrderData.patientSignatureId == -1){
          this.patientSig = "Signature on hardcopy";
        }
        else if (this.labOrderData.conscentOnFile){
          this.patientSig = "Conscent on file";
        }

        this.physicianSig = "None";
        if (this.labOrderData.userSignatureId_Physician > 0){
          this.physicianSig = "Signed by physician";
        }
        else if (this.labOrderData.userSignatureId_Physician == -1){
          this.physicianSig = "Signature on hardcopy";
        }
        // Get the patient data
        this.patientService.get( this.patientId)
            .pipe(first())
            .subscribe(
            data => {
              if (data.valid){
                this.patientData = data;
                console.log("Patient", this.patientData);
                this.showSearch = false;
                this.showSearchList = false;
                this.showAudit = true;
                this.labOrderService.getLabOrderSpecimenInsurance(this.labOrderData.specimens[0].labOrderSpecimenId)
                    .pipe(first())
                    .subscribe(
                    data => {
                      console.log ("Insurance",data);
                      if (data.valid || data.message == "No records found")
                      {      
                        this.insuranceData = data;
                        this.labOrderService.getLabOrderAttachmentList(this.labOrderData.labOrderId)
                        .pipe(first())
                        .subscribe(
                        data => {
                          if (data.valid)
                          {
                            var cntr = 1;
                            data.list.forEach( (item) =>{
                              if (cntr == 1){
                                this.attachment1 = item.attachmentType;
                                this.attachment1Id = item.labOrderAttachmentId;
                              }
                              else if (cntr == 2){
                                this.attachment2 = item.attachmentType;
                                this.attachment2Id = item.labOrderAttachmentId;
                              }
                              else if (cntr == 3){
                                this.attachment3 = item.attachmentType;
                                this.attachment3Id = item.labOrderAttachmentId;
                              }
                              else if (cntr == 4){
                                this.attachment4 = item.attachmentType;
                                this.attachment4Id = item.labOrderAttachmentId;
                              }
                              cntr++;
                            });
  
                            // this.getOrderPdf(labOrderId);
                            
  
                          }
  
                        });

                      }

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

  attachmentButtonClicked(attachmentId: number){
      this.labOrderService.getLabOrderAttachment( attachmentId)
      .pipe(first())
      .subscribe(
          data => {
            if (data.valid)
            {
              const binaryString = window.atob(data.fileAsBase64);
              const len = binaryString.length;
              const bytes = new Uint8Array(len);
              for (let i = 0; i < len; ++i) {
                bytes[i] = binaryString.charCodeAt(i);
              }
    
              var fileblob = new Blob([bytes], { type: 'application/pdf' });
              var url = window.URL.createObjectURL(fileblob);      
              top.document.getElementById('ifrm').setAttribute("src", url);
                    
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

  backButtonClicked(){
    this.hasIssues = 0;
    this.issueNote = '';
    this.reviewData.auditSrdTypeId = 0;
    this.reviewData.auditIncidentTypeId = 0;
    this.reviewData.shippingMethodId = 0;
    this.reviewData.trackingNo= '';
    this.reviewData.auditRejectionTypeId = 0;
    this.reviewData.zendeskNote = '';
    this.reviewData.internalNote = '';
  }

  cancelButtonClicked(){

    this.showSearch = true;
    this.showSearchList = true;
    this.showAudit = false;
    this.loopFlag = false;
    this.loopPosn = 0;
    this.hasIssues = 0;
    this.issueNote = '';
  }

  VerifiedButtonClicked(){
    this.reviewData.auditStatusTypeId = 1;
    this.labOrderService.reviewed(this.reviewData )
        .pipe(first())
        .subscribe(
        data => {
          //console.log(data);
          if (data.valid)
          {
            this.loopPosn++;
            if (this.loopPosn < this.searchData.length){
              this.selectButtonClicked(this.searchData[this.loopPosn].labOrderId);
            }
            else{
              this.showSearch = true;
              this.showSearchList = true;
              this.showAudit = false;
              this.loopFlag = false;
              this.loopPosn = 0;
              this.searchButtonClicked();
            }
          }
        },
        error => {

        });
    
  }

  IssueSrdButtonClicked(){
    this.hasIssues = 2;

  }

  IssueQaButtonClicked(){
    this.hasIssues = 3;

  }

  IssueAccountButtonClicked(){
    this.hasIssues = 4;

  }

  IssueRejectButtonClicked(){
    this.hasIssues = 5;

  }
  saveIssueButtonClicked(){
    this.reviewData.auditStatusTypeId = this.hasIssues;
    this.labOrderService.reviewed(this.reviewData )
        .pipe(first())
        .subscribe(
        data => {
          //console.log(data);
          if (data.valid)
          {
            this.hasIssues = 0;
            this.issueNote = '';
            this.loopPosn++;
            if (this.loopPosn < this.searchData.length){
              this.selectButtonClicked(this.searchData[this.loopPosn].labOrderId);
            }
            else{
              this.showSearch = true;
              this.showSearchList = true;
              this.showAudit = false;
              this.loopFlag = false;
              this.loopPosn = 0;
              this.searchButtonClicked();
            }
          }
        },
        error => {

        });
    
  }

  sortBy(property: string) {
    this.sortOrder = property === this.sortProperty ? (this.sortOrder * -1) : 1;
    this.sortProperty = property;
    this.searchData = [...this.searchData.sort((a: any, b: any) => {
        // sort comparison function
        let result = 0;
        if (a[property] < b[property]) {
            result = -1;
        }
        if (a[property] > b[property]) {
            result = 1;
        }
        return result * this.sortOrder;
    })];
  }

  getOrderPdf(labOrderId: number){
    // this.pdfData = new LabOrderPdfModel();

    //         this.patientId = this.labOrderData.patientId;

    //         if (this.labOrderData.specimens[0].requestPDF){
  
    //           this.labOrderService.getLabOrderRequestPdf( this.labOrderData.specimens[0].labOrderSpecimenId)
    //             .pipe(first())
    //             .subscribe(
    //             data => {
    //               console.log("Retrieve Image",data);
    //               if (data.valid)
    //               {
    //                 this.pdfData = data;
    //                 const binaryString = window.atob(this.pdfData.fileAsBase64);
    //                 const len = binaryString.length;
    //                 const bytes = new Uint8Array(len);
    //                 for (let i = 0; i < len; ++i) {
    //                   bytes[i] = binaryString.charCodeAt(i);
    //                 }
    //                 var fileblob = new Blob([bytes], { type: 'application/pdf' });
    //                 var url = window.URL.createObjectURL(fileblob);      
    //                 top.document.getElementById('ifrmO').setAttribute("src", url);

    //               }
    //             });
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
    //                   this.userService.getSignature( this.labOrderData.userId_Physician, this.labOrderData.userSignatureId_Physician )
    //                       .pipe(first())
    //                       .subscribe(
    //                       data => {
    //                         var PhysicianSig = data.fileAsBase64;

    //                         this.labOrderService.getPatientSignature( this.labOrderData.patientId, this.labOrderData.labOrderId )

    //                         .pipe(first())
    //                         .subscribe(
    //                         data => {
    //                           var PatientSig = data.fileAsBase64;


    //                           // This is for Pdf generate

    //                           if (this.labOrderData.specimens[0].labTypeId == 1){
    //                             this.loadToxData(this.labOrderData.specimens[0].tests);
    //                           }
    //                           else if (this.labOrderData.specimens[0].labTypeId == 2){
    //                             this.loadToxData(this.labOrderData.specimens[0].tests);
    //                           }
    //                           else if (this.labOrderData.specimens[0].labTypeId == 3){
    //                             this.gppData = new GPPModel();
    //                             this.loadGPPData();
    //                             doc = this.pdfGPPService.generateGPP(this.labOrderData, this.gppData, this.patientData);
    //                           }
    //                           else if (this.labOrderData.specimens[0].labTypeId == 4){
    //                             console.log("Call UTI")
    //                             this.utiData = new UTIModel();
    //                             this.loadUTIData();
    //                             doc = this.pdfUTISTIService.generateUTISTI(this.labOrderData, this.utiData, this.patientData, PhysicianSig, PatientSig);
    //                           }
    //                           else if (this.labOrderData.specimens[0].labTypeId == 5){
    //                             this.rppData = new RPPModel();
    //                             this.loadRPPData();
    //                             doc = this.pdfRPPService.generateRPP(this.labOrderData, this.rppData, this.patientData);
    //                           }

    //                           this.pdfData.specimenId = this.labOrderData.specimens[0].labOrderSpecimenId;

    //                           this.pdfData.fileType = "application/pdf";

    //                           var b64 = doc.output('datauristring'); // base64 string
                        
    //                           this.pdfData.fileType = "application/pdf";
                        
    //                           this.pdfData.fileAsBase64 = b64.replace("data:application/pdf;filename=generated.pdf;base64,", "");
                        
                      
    //                           this.labOrderService.saveLabOrderRequestPdf( this.pdfData)
    //                                 .pipe(first())
    //                                 .subscribe(
    //                                 data => {
    //                                   //console.log("Data",data);
    //                                   if (data.valid) {
                                      
    //                                   }
    //                                   else{
    //                                     this.errorMessage = data.message;
    //                                     this.showError = true;
    //                                   }
    //                                 },
    //                                 error => {
    //                                   this.errorMessage = error;
    //                                   this.showError = true;
    //                                 });

    //                           // Show the document
    //                           const binaryString = window.atob(this.pdfData.fileAsBase64);
    //                           const len = binaryString.length;
    //                           const bytes = new Uint8Array(len);
    //                           for (let i = 0; i < len; ++i) {
    //                             bytes[i] = binaryString.charCodeAt(i);
    //                           }
                      
    //                           var fileblob = new Blob([bytes], { type: 'application/pdf' });
    //                           var url = window.URL.createObjectURL(fileblob);      
    //                           top.document.getElementById('ifrmO').setAttribute("src", url);
                      
    //                         });
    //                       });
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


  }

  loadDropdownLists(){

    this.dateTypeList = new Array<CodeItemModel>();
    var item1 = new CodeItemModel();
    item1.id = 1;
    item1.description = "Date Accessioned";
    this.dateTypeList.push(item1);
    var item2 = new CodeItemModel();
    item2.id = 2;
    item2.description = "Date Received";
    this.dateTypeList.push(item2);
    var item3 = new CodeItemModel();
    item3.id = 3;
    item3.description = "Date Rejected";
    this.dateTypeList.push(item3);
    var item4 = new CodeItemModel();
    item4.id = 4;
    item4.description = "Date On Hold";
    this.dateTypeList.push(item4);

    this.searchDateTypeId = 1;

    this.codeService.getList( 'LabType,AuditSrdType,AuditIncidentType,AuditRejectionType,ShippingMethod' )

    .pipe(first())
    .subscribe(
        data => {
          if (data.valid)
          {
            this.labTypeList = data.list0;
            this.srdList = data.list1;
            this.incidentList = data.list2;
            this.rejectionList = data.list3;
            this.shippingList = data.list4;
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
