//Page Name       : Attachment-Modal
//Date Created    : 09/19/2022
//Written By      : Stephen Farkas
//Description     : Lab Order Attchment Modal
//MM/DD/YYYY xxx  Description
//-----------------------------------------------------------------------------
// Data Passing
//-----------------------------------------------------------------------------
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

import { LabOrderService } from '../../services/labOrder.service';
import { PatientService } from '../../services/patient.service';
import { CodeService } from '../../services/code.service';

import { LabOrderAttachmentModel, LabOrderAttachmentListItemModel } from '../../models/LabOrderAttachmentModel';
import { PatientAttachmentModel, PatientAttachmentListItemModel } from '../../models/PatientAttachmentModel';

import { first } from 'rxjs/operators';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-attachment-modal',
  templateUrl: './attachment-modal.component.html',
  styleUrls: ['./attachment-modal.component.css']
})
export class AttachmentModalComponent implements OnInit {
  labOrderId: number;
  patientId: number;
  labOrderAttachment: any;
  patientAttachment: any;
  initialState: any;
  addAttachment: boolean = false;
  attachmentType: string;
  attachmentTypeList: any;
  attachmentTypeId: number;
  attachmentTitle: string;
  attachmentDescription: string;

  attachmentDisabled: boolean;
  fileUploaded: boolean = false;
  fileScanned: boolean = false;
  attachmentSave: boolean = false;

  // Camera Variables
  picWidth = 480;
  picHeight = 640;

  @ViewChild("video")
  public video: ElementRef;

  @ViewChild("canvas")
  public canvas: ElementRef;


  captures: string[] = [];
  error: any;
  isCaptured: boolean = false;
  cameraOn: boolean;

  attachmentData: any;
  //attachmentDoc: string; // This hold the url passed for the ngx-doc-viewer

  constructor(
    private modalService: BsModalService,
    public bsModalRef: BsModalRef,
    private labOrderService: LabOrderService,
    private patientService: PatientService,
    private codeService: CodeService,
  ) { }

  ngOnInit(): void {
    this.labOrderId = this.initialState.labOrderId;
    // Call the lab order service to get the data for the selected lab order
    this.labOrderService.getLabOrderAttachmentList(this.labOrderId)
      .pipe(first())
      .subscribe(
        data => {
          if (data.valid) {
            this.labOrderAttachment = data.list;
          }
          else {
            //this.errorMessage = data.message;
          }
        },
        error => {
          // this.errorMessage = error;
          // this.showError = true;
        });

    this.patientId = this.initialState.patientId;
    // Call the patient service to get the data for the selected patient
    this.patientService.getPatientAttachmentList(this.patientId)
      .pipe(first())
      .subscribe(
        data => {
          console.log("Issue Data", data);
          if (data.valid) {
            this.patientAttachment = data.list;
          }
          else {
            //this.errorMessage = data.message;
          }
        },
        error => {
          // this.errorMessage = error;
          // this.showError = true;
        });
  }
  closeModalButtonClicked() {
    this.bsModalRef.hide();
  }

  selectLabAttachmentButtonClicked(attachmentId: number) {
    // Call the attachment service to get the data for the selected attachment
    this.labOrderService.getLabOrderAttachment(attachmentId)
      .pipe(first())
      .subscribe(
        data => {
          if (data.valid) {
            this.attachmentData = data;
            const binaryString = window.atob(this.attachmentData.fileAsBase64);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; ++i) {
              bytes[i] = binaryString.charCodeAt(i);
            }


            var fileblob = new Blob([bytes], { type: this.attachmentData.fileType });

            //this.attachmentDoc = window.URL.createObjectURL(fileblob).replace("blob:","data:application/pdf;filename=generated.pdf;base64,");


            var url = window.URL.createObjectURL(fileblob);

            let anchor = document.createElement("a");
            anchor.href = url;
            anchor.target = "_blank"
            anchor.click();

          }
          else {
            //this.errorMessage = data.message;
          }
        },
        error => {
          // this.errorMessage = error;
          // this.showError = true;
        });

  }

  selectPatientAttachmentButtonClicked(attachmentId: number) {
    console.log("AttachmentId", attachmentId);
    // Call the attachment service to get the data for the selected attachment
    this.patientService.getPatientAttachment(attachmentId)
      .pipe(first())
      .subscribe(
        data => {
          if (data.valid) {
            console.log(data);
            this.attachmentData = data;
            const binaryString = window.atob(this.attachmentData.fileAsBase64);
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
          else {
            //this.errorMessage = data.message;
          }
        },
        error => {
          // this.errorMessage = error;
          // this.showError = true;
        });

  }

  addAttachmentButtonClicked(attachmentType: string) {
    this.addAttachment = true;
    this.attachmentType = attachmentType;
    if (attachmentType == 'L') {
      // Load Lab Attachment Type
      this.codeService.getList('LOAttachmentType')

        .pipe(first())
        .subscribe(
          data => {
            if (data.valid) {
              this.attachmentTypeList = data.list0;
            }
          });

    }
    else {
      // Load Lab Attachment Type
      this.codeService.getList('AttachmentType')

        .pipe(first())
        .subscribe(
          data => {
            if (data.valid) {
              this.attachmentTypeList = data.list0;
            }
          });

    }
  }

  attachmentChanged() {
    this.attachmentSave = false;
    if (this.attachmentTypeId > 0 && this.attachmentDescription != ""
      && this.captures.length > 0) {
      this.attachmentSave = true;
    }

  }

  saveAttachmentButtonClicked(){

    if (this.cameraOn){
      this.stopDevice();
    }

    if (this.attachmentType == 'L'){
      this.attachmentData = new LabOrderAttachmentModel();
    }
    else{
      this.attachmentData = new PatientAttachmentModel();
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

    if (this.attachmentType == 'L') {
      this.attachmentData.labOrderId = this.labOrderId;
      this.attachmentData.loAttachmentTypeId = this.attachmentTypeId;
      this.attachmentData.description = this.attachmentDescription;

      this.labOrderService.saveLabOrderAttachment( this.attachmentData)
          .pipe(first())
          .subscribe(
          data => {
            //console.log("Data",data);
            if (data.valid) {
              // Find attachment type in list
              for (let item of this.attachmentTypeList){
                if (item.id == this.attachmentTypeId){
                  this.attachmentData.attachmentType = item.description;
                }
              }

              // Update list
              var item = new LabOrderAttachmentListItemModel();
              item.labOrderAttachmentId = Number(data.id);
              item.labOrderId = this.labOrderId;
              item.dateCreated = this.attachmentData.dateCreated.substring(0,10);
              item.attachmentType = this.attachmentData.attachmentType
              item.description = this.attachmentData.description;
              if (this.labOrderAttachment == null){
                this.labOrderAttachment = new Array<LabOrderAttachmentListItemModel>();
              }
              this.labOrderAttachment.push(item);
              this.addAttachment = false;
              this.captures = new Array<string>();
            }
          });
    }
    else{
      this.attachmentData.patientId = this.patientId;
      this.attachmentData.attachmentTypeId = this.attachmentTypeId;
      this.attachmentData.description = this.attachmentDescription;

      this.patientService.savePatientAttachment( this.attachmentData)
          .pipe(first())
          .subscribe(
          data => {
            if (data.valid) {
              // Find attachment type in list
              for (let item of this.attachmentTypeList){
                if (item.id == this.attachmentTypeId){
                  this.attachmentData.attachmentType = item.description;
                }
              }

              // Update list
              var item = new PatientAttachmentListItemModel();
              item.patientAttachmentId = Number(data.id);
              item.patientId = this.patientId;
              item.dateCreated = this.attachmentData.dateCreated.substring(0,10);
              item.attachmentType = this.attachmentData.attachmentType
              item.description = this.attachmentDescription;
              if (this.patientAttachment == null){
                this.patientAttachment = new Array<PatientAttachmentListItemModel>();
              }
              this.patientAttachment.push(item);
              this.addAttachment = false;
              this.captures = new Array<string>();
            }
          });
    }

  }

  cancelAttachmentButtonClicked(){
    if (this.cameraOn){
      this.stopDevice();
    }
    this.addAttachment = false;
    this.captures = new Array<string>();
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

  async stopDevice() {
    this.video.nativeElement.srcObject.getTracks().forEach(function (track) {
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
}
