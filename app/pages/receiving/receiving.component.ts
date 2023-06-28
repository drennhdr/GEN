//Page Name       : Receiving
//Date Created    : 02/03/2023
//Written By      : Stephen Farkas
//Description     : Receive Ship Log
//MM/DD/YYYY xxx  Description
//03/17/2023 SJF  Changed from Receive Manifest to Receive ShipLog
//-----------------------------------------------------------------------------
// Data Passing
//-----------------------------------------------------------------------------

import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { first } from 'rxjs/operators';

import { ShipLogService } from '../../services/shipLog.service';
import { LabOrderService } from '../../services/labOrder.service';
import { Router } from '@angular/router';
import { ShipLogListItemModel, ShipLogModel, ShipLogSpecimenModel } from '../../models/ShipLogModel';

@Component({
  selector: 'app-receiving',
  templateUrl: './receiving.component.html',
  styleUrls: ['./receiving.component.css']
})
export class ReceivingComponent implements OnInit {

  // Variables to hold screen data
  shipLogData: any;
  customerId: number;
  locationId: number;
  shipLogKey: string;
  searchShipLogBarcode: string = '';
  searchBarcode: string = '';
  errorMessage: string = '';
  showSearch: boolean = true;
  showError: boolean = false;
  showShipLog: boolean = true;
  editMode: boolean = false;

  userId: number;

  constructor(
    private shipLogService: ShipLogService,
    private labOrderService: LabOrderService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    if (sessionStorage.getItem('userId_Login') == ""){
      this.router.navigateByUrl('/login');
    }
    this.showSearch = true;
    this.showShipLog = false;
    this.userId = Number(sessionStorage.getItem('userId_Login'));
    
  }


  shipLogSearchButtonClicked(){
    this.errorMessage = "";
    this.showError = false;

    var shipLogId = Number(this.searchShipLogBarcode.slice(-9)) // Remove GRL
    // Call the labOrder service to get the data for the entered specimen id
    this.shipLogService.get(shipLogId)
            .pipe(first())
            .subscribe(
            data => {
              if (data.valid)
              {
                console.log("ShipLog",data);
                this.shipLogData = data;
                this.showShipLog = true;
                this.showSearch = false;
                if (this.shipLogData.dateReceived == null){
                  this.editMode = true;
                }
                else{
                  this.editMode = false;
                }

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
                  console.log("Specimen",data);
                  
               
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
                  item.checked = true;
                  this.shipLogData.specimens.push(item);
                  this.searchBarcode = "";
                }
              },
              error => {
                this.errorMessage = error;
              });
    }
    this.searchBarcode = "";
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
  }

  saveButtonClicked(){
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
    this.shipLogService.received(this.shipLogData )
    .pipe(first())
    .subscribe(
    data => {
      if (data.valid)
      {
        this.shipLogData = new ShipLogModel();
        this.shipLogData.specimens = new Array<ShipLogListItemModel>();
        this.showSearch = true;
        this.showShipLog = false;
        this.editMode = false;
        this.searchShipLogBarcode = "";

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
    this.showSearch = true;
    this.showShipLog = false;
    this.editMode = false;
    this.searchShipLogBarcode = "";
  }
}


