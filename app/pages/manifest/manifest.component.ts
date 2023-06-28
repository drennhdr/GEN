//Page Name       : Manifest
//Date Created    : 09/20/2022
//Written By      : Stephen Farkas
//Description     : Create Manifest
//MM/DD/YYYY xxx  Description
//01/18/2023 SJF  Added checkboxs to list
//03/28/2023 SJF  Added search by specimen
//-----------------------------------------------------------------------------
// Data Passing
//-----------------------------------------------------------------------------

import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { first } from 'rxjs/operators';
import {formatDate} from '@angular/common';

import { ManifestService } from '../../services/manifest.service';
import { LabOrderService } from '../../services/labOrder.service';
import { LabService } from '../../services/lab.service';
import { ManifestListItemModel, ManifestModel, ManifestSpecimenModel } from '../../models/ManifestModel';
import { PdfManifestService } from '../../services/pdfManifest.service';

import { CodeItemModel } from '../../models/CodeModel';
import { MessageModalComponent } from '../../modal/message-modal/message-modal.component';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-manifest',
  templateUrl: './manifest.component.html',
  styleUrls: ['./manifest.component.css']
})
export class ManifestComponent implements OnInit {

  // Variables to hold screen data
  manifestHistoryData: any;
  manifestData: any;
  labOrderData: any;
  labList: any;
  labTypeList: any;
  labTypeId: number = 0;

  labId: number;
  userId: number;
  manifestKey: string;
  searchBarcode: string = '';
  errorMessage: string = '';
  showError: boolean = false;
  showManifest: boolean = true;
  editMode: boolean = false;
  searchStartDate: string;
  searchSpecimenBarcode: string;
  checkCnt: number = 0;

  // Modal Dialog
  modalRef: BsModalRef;


  constructor(
    private labOrderService: LabOrderService,
    private manifestService: ManifestService,
    private pdfManifestService: PdfManifestService,
    private labService: LabService,
    private modalService: BsModalService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    if (sessionStorage.getItem('userId_Login') == ""){
      this.router.navigateByUrl('/login');
    }
    if (Number(sessionStorage.getItem('customerId')) == 0 && Number(sessionStorage.getItem('userType')) == 12){
      this.showManifest = false;
      this.errorMessage = "An account has not been selected";
      this.showError = true;
    }
    this.userId = Number(sessionStorage.getItem('userId_Login'));
    this.manifestData = new ManifestModel();
    this.manifestData.specimens = new Array<ManifestSpecimenModel>();
    this.loadLabs();
    
  }

  labChange(){
    this.labTypeList = new Array<CodeItemModel>;
    this.labList.forEach( (item) =>{
      if (item.labId == this.labId){
        if (item.service_ToxUrine){
          var item2 = new CodeItemModel();
          item2.id = 1;
          item2.description = "Toxicology Urine";
          this.labTypeList.push(item2);
        }
        if (item.service_ToxOral){
          var item2 = new CodeItemModel();
          item2.id = 2;
          item2.description = "Toxicology Oral";
          this.labTypeList.push(item2);
        }
        if (item.service_GPP){
          var item2 = new CodeItemModel();
          item2.id = 3;
          item2.description = "GPP";
          this.labTypeList.push(item2);
        }
        if (item.service_UTI){
          var item2 = new CodeItemModel();
          item2.id = 4;
          item2.description = "UTI/STI";
          this.labTypeList.push(item2);
        }
        if (item.service_RPP){
          var item2 = new CodeItemModel();
          item2.id = 5;
          item2.description = "RPP";
          this.labTypeList.push(item2);
        }
        if (item.service_Urinalysis){
          var item2 = new CodeItemModel();
          item2.id = 6;
          item2.description = "Urinalysis";
          this.labTypeList.push(item2);
        }
        if (item.service_Hematology){
          var item2 = new CodeItemModel();
          item2.id = 7;
          item2.description = "Hematology";
          this.labTypeList.push(item2);
        }
        this.labTypeId = this.labTypeList[0].id;
      }
    });


    var startDate = new Date();
    startDate.setDate(startDate.getDate() -30);
    var endDate = new Date();
    endDate.setDate(endDate.getDate() +1);
    this.manifestService.search(this.labId, formatDate(startDate , 'yyyy-MM-dd', 'en'), formatDate(endDate, 'yyyy-MM-dd', 'en') )
          .pipe(first())
          .subscribe(
          data => {
            if (data.valid)
            {
              this.manifestHistoryData = data.list;
            }
            else
            {
              // No data
              this.manifestHistoryData = new Array<ManifestListItemModel>();
            }
            this.manifestData = new ManifestModel();
            this.manifestData.specimens = new Array<ManifestSpecimenModel>();
          },
          error => {
            this.errorMessage = error;
          });
  }

  manifestSearchButtonClicked(){
    this.manifestService.getForSpecimenBarcode(this.searchSpecimenBarcode )
          .pipe(first())
          .subscribe(
          data => {
            if (data.valid)
            {
              this.errorMessage = "";
              this.manifestData = data;
              this.manifestKey = formatDate(this.manifestData.dateCreated,'yyyy-MM-dd', 'en') + " (" + this.manifestData.sequence + ")";
              
              for (let item of this.manifestData.specimens){
                item.checked = true;
              }

              if (this.manifestData.status == 0){
                this.editMode = true;
              }
              else{
                this.editMode = false;
              }
              
            }
            else
            {
              this.errorMessage = data.message;
            }
          },
          error => {
            this.errorMessage = error;
          });
  }

  selectButtonClicked(manifestId: number){
    this.checkCnt = 0;
    this.manifestService.get(manifestId )
          .pipe(first())
          .subscribe(
          data => {
            if (data.valid)
            {
              this.errorMessage = "";
              this.manifestData = data;
              this.manifestKey = formatDate(this.manifestData.dateCreated,'yyyy-MM-dd', 'en') + " (" + this.manifestData.sequence + ")";
              
              for (let item of this.manifestData.specimens){
                item.checked = true;
                this.checkCnt++;
              }

              if (this.manifestData.status == 0){
                this.editMode = true;
              }
              else{
                this.editMode = false;
              }
              
            }
            else
            {
              this.errorMessage = data.message;
            }
          },
          error => {
            this.errorMessage = error;
          });


  }

  newManifestButtonClicked(){
    this.checkCnt = 0;
    this.manifestData = new ManifestModel();
    this.manifestData.manifestId = 0;
    this.manifestData.labId = this.labId;
    this.manifestData.dateCreated = formatDate(new Date() , 'MM/dd/yyyy', 'en');
    this.manifestData.sequence = 0;
    this.manifestData.trackingNo = "";
    this.manifestData.specimens = new Array<ManifestSpecimenModel>();
    this.manifestKey = formatDate(this.manifestData.dateCreated,'yyyy-MM-dd', 'en');
    this.editMode = true;
    const ckDate = new Date();
    
    this.searchStartDate = formatDate(ckDate.setDate(ckDate.getDate() -7),'yyyy-MM-dd', 'en');
    this.dateChanged();
  }

  checkChange(){
    this.checkCnt = 0;
    for (let item of this.manifestData.specimens){
      if (item.checked){
        this.checkCnt++;
      }
    }
  }
  
  searchButtonClicked(){
    this.errorMessage = "";
    var found = false;
    this.manifestData.specimens.forEach( (item) =>{
      if (item.specimenBarcode == this.searchBarcode){
        item.checked = true;
        found = true;
      }
    });

    if (!found){



      // Call the labOrder service to get the data for the entered specimen id
      this.labOrderService.getLabOrderForManifest(this.searchBarcode)
              .pipe(first())
              .subscribe(
              data => {
                {
                  if (data.labTypeId != this.labTypeId){
                    this.errorMessage = "Wrong lab type";
                  }
                  else if (data.labId == 0){
                    this.errorMessage = "Already assigned to another lab";
                  }
                  else if (data.labStatusId == 30){
                    this.errorMessage = "Order has not been accessioned";
                  }
                  else if (data.manifestSpecimenId > 0){
                    this.errorMessage = "Already attached to another manifest";
                  }
                  else {
                    var item = new ManifestSpecimenModel();
                    item.labOrderId = data.labOrderId;
                    item.labOrderSpecimenId = data.labOrderSpecimenId;
                    item.specimenBarcode = data.specimenBarcode;
                    item.collectionDate = data.collectionDate;
                    item.labTypeId = data.labTypeId;
                    item.labType = data.labType;
                    item.patientId = data.patientId;
                    item.patientName = data.patientName;
                    item.patientDOB = data.patientDOB;
                    item.patientGenderId = data.patientGenderId;
                    item.patientGender = data.patientGender;
                    item.labStatus = data.status;
                    this.manifestData.specimens.push(item);
                    this.searchBarcode = "";
                  }
                  // if (error != ""){
                  //   const initialState: ModalOptions = {
                  //     initialState: {
                  //       message: error,
                  //       yesNo: false,
                  //     }
                  //   };
                    
                
                  //   this.modalRef = this.modalService.show(MessageModalComponent, {
                  //     initialState 
                  //   });

                  // }
                }
              },
              error => {
                this.errorMessage = error;
              });
    }
  }

  allSelectChange(isChecked: boolean){
    this.checkCnt = 0;
    if (isChecked){
      for (let item of this.manifestData.specimens){
        item.checked = true;
        this.checkCnt++;
      }
    }
    else{
      for (let item of this.manifestData.specimens){
        item.checked = false;
      }
    }
  }


  dateChanged(){
      this.labOrderService.manifestSearch( this.labTypeId, this.searchStartDate)
        .pipe(first())
        .subscribe(
        data => {
          if (data.valid)
          {
            console.log("List",data);
            // Remove Unchecked Items
            var i:number;
            var itemCount: number = this.manifestData.specimens.length;
            if (itemCount > 0){
              itemCount = itemCount - 1
              for(i = itemCount;i >= 0;i--){
                var item = this.manifestData.specimens[i];

                if (!item.checked){
                  this.manifestData.specimens.splice(i,1);
                }
              }
            }
            // Loop through new list of orders
            data.list.forEach(order => {
              // See if item already in list
              var found = false;
              this.manifestData.specimens.forEach( (item) =>{
                if (item.labOrderSpecimenId == order.specimenBarcode){
                  found = true;
                }
              });
  
              if (!found){
                var item = new ManifestSpecimenModel();
                item.labOrderId = order.labOrderId;
                item.labOrderSpecimenId = order.labOrderSpecimenId;
                item.specimenBarcode = order.specimenBarcode;
                item.collectionDate = formatDate(order.collectionDate,'yyyy-MM-dd', 'en');
                item.labTypeId = order.labTypeId;
                item.labType = order.labType;
                item.patientId = order.patientId;
                item.patientName = order.patient;
                item.labStatus = order.status;
                // item.patientDOB = order.patientDOB;
                // item.patientGenderId = order.patientGenderId;
                // item.patientGender = order.patientGender;
                this.manifestData.specimens.push(item);
                this.searchBarcode = "";
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
        });
   
  }

  labTypeChange(){
    this.labOrderService.manifestSearch( this.labTypeId, this.searchStartDate)
    .pipe(first())
    .subscribe(
    data => {
      if (data.valid)
      {
        // Remove Unchecked Items
        var i:number;
        var itemCount: number = this.manifestData.specimens.length;
        if (itemCount > 0){
          itemCount = itemCount - 1
          for(i = itemCount;i >= 0;i--){
            var item = this.manifestData.specimens[i];

            if (!item.checked){
              this.manifestData.specimens.splice(i,1);
            }
          }
        }
        // Loop through new list of orders
        data.list.forEach(order => {
          // See if item already in list
          var found = false;
          this.manifestData.specimens.forEach( (item) =>{
            if (item.labOrderSpecimenId == order.specimenBarcode){
              found = true;
            }
          });

          if (!found){
            var item = new ManifestSpecimenModel();
            item.labOrderId = order.labOrderId;
            item.labOrderSpecimenId = order.labOrderSpecimenId;
            item.specimenBarcode = order.specimenBarcode;
            item.collectionDate = formatDate(order.collectionDate,'yyyy-MM-dd', 'en');
            item.labTypeId = order.labTypeId;
            item.labType = order.labType;
            item.patientId = order.patientId;
            item.patientName = order.patient;
            // item.patientDOB = order.patientDOB;
            // item.patientGenderId = order.patientGenderId;
            // item.patientGender = order.patientGender;
            this.manifestData.specimens.push(item);
            this.searchBarcode = "";
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
    });
  }

  saveButtonClicked(){
    // Remove Unchecked Items
    var i:number;
    var itemCount: number = this.manifestData.specimens.length;
    if (itemCount > 0){
      itemCount = itemCount - 1
      for(i = itemCount;i >= 0;i--){
        var item = this.manifestData.specimens[i];

        if (!item.checked){
          this.manifestData.specimens.splice(i,1);
        }
      }
    }  

    this.errorMessage = "";
    var oldId = this.manifestData.manifestId;
    this.manifestService.save(this.manifestData )
    .pipe(first())
    .subscribe(
    data => {
      if (data.valid)
      {
        this.manifestData = new ManifestModel();
        this.manifestData.specimens = new Array<ManifestListItemModel>();
        this.manifestKey = formatDate(this.manifestData.dateCreated,'yyyy-MM-dd', 'en')  + " (" + this.manifestData.sequence + ")";
        this.editMode = false;
        this.checkCnt = 0;

        if (oldId == 0){
          this.labChange();
        }
      }
      else
      {
        this.errorMessage = data.message;
      }
    },
    error => {
      this.errorMessage = error;
    });
  }

  finalizeButtonClicked(){
    var i:number;
    var itemCount: number = this.manifestData.specimens.length;
    if (itemCount > 0){
      itemCount = itemCount - 1
      for(i = itemCount;i >= 0;i--){
        var item = this.manifestData.specimens[i];

        if (!item.checked){
          this.manifestData.specimens.splice(i,1);
        }
      }
    }

    this.errorMessage = "";
    var oldId = this.manifestData.manifestId;
    this.manifestData.status = 1;
    this.manifestService.save(this.manifestData )
    .pipe(first())
    .subscribe(
    data => {
      if (data.valid)
      {
        var labName = "";
        this.labList.forEach( (item) =>{
          if (item.labId == this.manifestData.labId){
            labName = item.name;
          }
        });
        //var barcode = "GRL" + data.id.padStart(9,"0");
        var barcode = "GRL" + ("000000000" + data.id).slice(-9);
        this.pdfManifestService.generateManifest(this.manifestData, labName, this.manifestData.trackingNo, barcode);

        this.manifestData = new ManifestModel();
        this.manifestData.specimens = new Array<ManifestListItemModel>();
        this.manifestKey = ""
        this.editMode = false;

        this.labChange();
      }
      else
      {
        this.errorMessage = data.message;
      }
    },
    error => {
      this.errorMessage = error;
    });
  }

  printButtonClicked(){
    var labName = "";
    this.labList.forEach( (item) =>{
      if (item.labId == this.manifestData.labId){
        labName = item.name;
      }
    });
    //var barcode = "GRL" + data.id.padStart(9,"0");
    var barcode = "GRL" + ("000000000" + this.manifestData.manifestId);
    this.pdfManifestService.generateManifest(this.manifestData, labName, this.manifestData.trackingNo, barcode);

  }

  backButtonClicked(){
    this.manifestData = new ManifestModel();
    this.manifestData.specimens = new Array<ManifestListItemModel>();
    this.manifestKey = "";
    this.editMode = false;
    this.checkCnt = 0;
  }

  loadLabs(){
    this.labService.search("")
    .pipe(first())
    .subscribe(
    data => {
      if (data.valid)
      {
        this.labList = data.list;

        this.labId = this.labList[0].labId;

        this.labChange();
      }
    });
  }


}
