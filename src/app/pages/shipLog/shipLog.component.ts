//Page Name       : ShipLog
//Date Created    : 02/10/2023
//Written By      : Stephen Farkas
//Description     : Create ShipLog
//MM/DD/YYYY xxx  Description
//06/07/2023 SJF  Made tracking number required for LCS.
//-----------------------------------------------------------------------------
// Data Passing
//-----------------------------------------------------------------------------

import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { first } from 'rxjs/operators';
import {formatDate} from '@angular/common';

import { ShipLogService } from '../../services/shipLog.service';
import { LabOrderService } from '../../services/labOrder.service';
import { LocationService } from '../../services/location.service';
import { Router } from '@angular/router';
import { ShipLogListItemModel, ShipLogModel, ShipLogSpecimenModel } from '../../models/ShipLogModel';
import { CodeItemModel } from '../../models/CodeModel';
import { PdfShipLogService } from '../../services/pdfShipLog.service';


@Component({
  selector: 'app-shipLog',
  templateUrl: './shipLog.component.html',
  styleUrls: ['./shipLog.component.css']
})
export class ShipLogComponent implements OnInit {

  // Variables to hold screen data
  shipLogHistoryData: any;
  shipLogData: any;
  labOrderData: any;
  locationList: any;
  customerId: number;
  locationId: number;
  userId: number;
  shipLogKey: string;
  searchBarcode: string = '';
  errorMessage: string = '';
  showError: boolean = false;
  showShipLog: boolean = true;
  editMode: boolean = false;
  checkList: any;
  searchStartDate: string;
  userType: number;
  logSave: boolean;

  constructor(
    private labOrderService: LabOrderService,
    private shipLogService: ShipLogService,
    private locationService: LocationService,
    private pdfShipLogService: PdfShipLogService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    if (sessionStorage.getItem('userId_Login') == ""){
      this.router.navigateByUrl('/login');
    }
    this.userType = Number(sessionStorage.getItem('userType'));
    if (Number(sessionStorage.getItem('customerId')) == 0 && (this.userType == 12 || this.userType == 13)){
      this.showShipLog = false;
      this.errorMessage = "An account has not been selected";
      this.showError = true;
    }
    this.userId = Number(sessionStorage.getItem('userId_Login'));
    if (Number(sessionStorage.getItem('userType')) == 12){
      this.customerId = Number(sessionStorage.getItem('customerId'));
      this.shipLogData = new ShipLogModel();
      this.shipLogData.specimens = new Array<ShipLogListItemModel>();
      this.checkList = new Array<CodeItemModel>();
      this.loadLocationsCustomer();
      
    }
    else{
      this.customerId = Number(sessionStorage.getItem('entityId_Login'));
      this.shipLogData = new ShipLogModel();
      this.shipLogData.specimens = new Array<ShipLogListItemModel>();
      this.checkList = new Array<CodeItemModel>();
      this.loadLocations();
    }
    
  }

  locationChange(){
    var startDate = new Date();
    startDate.setDate(startDate.getDate() -30);
    var endDate = new Date();
    endDate.setDate(endDate.getDate() +1);
    this.shipLogService.search(this.customerId, this.locationId, formatDate(startDate , 'yyyy-MM-dd', 'en'), formatDate(endDate, 'yyyy-MM-dd', 'en') )
          .pipe(first())
          .subscribe(
          data => {
            if (data.valid)
            {
              this.shipLogHistoryData = data.list;

            }
            else
            {
              // No data
              this.shipLogHistoryData = new Array<ShipLogListItemModel>();
            }
            this.shipLogData = new ShipLogModel();
            this.shipLogData.specimens = new Array<ShipLogSpecimenModel>();
          },
          error => {
            this.errorMessage = error;
          });
  }

  selectButtonClicked(shipLogId: number){
    this.shipLogService.get(shipLogId )
          .pipe(first())
          .subscribe(
          data => {
            if (data.valid)
            {
              this.shipLogData = data;
              this.shipLogKey = this.shipLogData.dateCreated;
              
              for (let item of this.shipLogData.specimens){
                item.checked = true;
              }

              if (this.shipLogData.dateReceived == null){
                this.editMode = true;
              }
              else{
                this.editMode = false;
              }
              this.fieldChanged();
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

  newShipLogButtonClicked(){
    this.shipLogData = new ShipLogModel();
    this.shipLogData.shipLogId = 0;
    this.shipLogData.customerId = this.customerId;
    this.shipLogData.locationId = this.locationId;
    this.shipLogData.dateCreated = formatDate(new Date() , 'MM/dd/yyyy HH:mm:ss', 'en');
    this.shipLogData.trackingNo = "";
    this.shipLogData.specimens = new Array<ShipLogSpecimenModel>();
    this.shipLogKey = this.shipLogData.dateCreated;
    this.editMode = true;
    this.checkList = new Array<CodeItemModel>();
    const ckDate = new Date();
    
    this.searchStartDate = formatDate(ckDate.setDate(ckDate.getDate() -7),'yyyy-MM-dd', 'en');
    this.dateChanged();
  }


  searchButtonClicked(){
    this.errorMessage = "";
    var found = false;
    this.shipLogData.specimens.forEach( (item) =>{
      if (item.specimenBarcode == this.searchBarcode){
        item.checked = true;
        found = true;
      }
    });

    if (!found){

      // Call the labOrder service to get the data for the entered specimen id
      this.labOrderService.getLabOrderForShipLog(this.searchBarcode)
              .pipe(first())
              .subscribe(
              data => {
                if (data.valid)
                {    
                  var item = new ShipLogSpecimenModel();
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
                  this.shipLogData.specimens.push(item);
                  this.searchBarcode = "";
                }
              },
              error => {
                this.errorMessage = error;
              });
    }
  }

  allSelectChange(isChecked: boolean){

    if (isChecked){
      for (let item of this.shipLogData.specimens){
        item.checked = true;
      }
    }
    else{
      for (let item of this.shipLogData.specimens){
        item.checked = false;
      }
    }
    this.fieldChanged();
  }


  dateChanged(){
      this.labOrderService.search(this.customerId, this.locationId, 1, 0, 0, '', '', 99, this.searchStartDate, '', 1 )
        .pipe(first())
        .subscribe(
        data => {
          if (data.valid)
          {
            // Remove Unchecked Items
            var i:number;
            var itemCount: number = this.shipLogData.specimens.length;
            if (itemCount > 0){
              itemCount = itemCount - 1
              for(i = itemCount;i >= 0;i--){
                var item = this.shipLogData.specimens[i];

                if (!item.checked){
                  this.shipLogData.specimens.splice(i,1);
                }
              }
            }
            // Loop through new list of orders
            data.list.forEach(order => {
              // See if item already in list
              var found = false;
              this.shipLogData.specimens.forEach( (item) =>{
                if (item.labOrderSpecimenId == order.specimenBarcode){
                  found = true;
                }
              });
  
              if (!found){
                var item = new ShipLogSpecimenModel();
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
                this.shipLogData.specimens.push(item);
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
        this.fieldChanged();
   
  }

  saveButtonClicked(print: boolean){
    // Remove Unchecked Items
    var i:number;
    var itemCount: number = this.shipLogData.specimens.length;
    if (itemCount > 0){
      itemCount = itemCount - 1
      for(i = itemCount;i >= 0;i--){
        var item = this.shipLogData.specimens[i];

        if (!item.checked){
          this.shipLogData.specimens.splice(i,1);
        }
      }
    }

    this.errorMessage = "";
    var oldId = this.shipLogData.shipLogId;
    this.shipLogService.save(this.shipLogData )
    .pipe(first())
    .subscribe(
    data => {
      if (data.valid)
      {
        if (print){
          var locationName = "";
          this.locationList.forEach( (item) =>{
            if (item.locationId == this.shipLogData.locationId){
              locationName = item.locationName;
            }
          });
          //var barcode = "GRL" + data.id.padStart(9,"0");
          var barcode = "GRL" + ("000000000" + data.id).slice(-9);
          this.pdfShipLogService.generateShipLog(this.shipLogData, locationName, this.shipLogData.trackingNo, barcode);
        }

        this.shipLogData = new ShipLogModel();
        this.shipLogData.specimens = new Array<ShipLogListItemModel>();
        this.shipLogKey = this.shipLogData.dateCreated;
        this.editMode = false;

        if (oldId == 0){
          this.locationChange();
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

  backButtonClicked(){
    this.shipLogData = new ShipLogModel();
    this.shipLogData.specimens = new Array<ShipLogListItemModel>();
    this.shipLogKey = this.shipLogData.dateCreated;
    this.editMode = false;
  }

  loadLocations(){
    this.locationService.search(this.userId)
    .pipe(first())
    .subscribe(
    data => {
      if (data.valid)
      {
        this.locationList = data.list;
        this.locationId = this.locationList[0].locationId;

        this.locationChange();
      }
    });
  }

  loadLocationsCustomer(){
    this.locationService.getForCustomer(this.customerId)
    .pipe(first())
    .subscribe(
    data => {
      if (data.valid)
      {
        this.locationList = data.list;
        this.locationId = this.locationList[0].locationId
        this.locationChange();
      }
    });
  }

  fieldChanged(){
    this.logSave = false;
    if (this.userType == 12 || this.userType == 13){
      if (this.shipLogData.trackingNo != '')
      {
        this.logSave = true;
      }
    }
    else{
      this.logSave = true;
    }
  }
}
