//Page Name       : Insurance-Modal
//Date Created    : 02/01/2023
//Written By      : Stephen Farkas
//Description     : Insurance Modal
//MM/DD/YYYY xxx  Description
//-----------------------------------------------------------------------------
// Data Passing
//-----------------------------------------------------------------------------
import { Component, Input, OnInit  } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs/Subject';
import { first, throwIfEmpty } from 'rxjs/operators';
import { InsuranceModel } from '../../models/InsuranceModel';
import { InsuranceService } from '../../services/insurance.service';
import { VirtualEarthService } from '../../services/virtualEarth.service';



@Component({
  selector: 'app-insurance-modal',
  templateUrl: './insurance-modal.component.html',
  styleUrls: ['./insurance-modal.component.css']
})


export class InsuranceModalComponent implements OnInit {
  initialState: any;
  insuranceData: any;
  note: string = "";
  saveInsurance: Boolean = false;
  public onClose: Subject<number>;


  constructor(
    private modalService: BsModalService,
    public bsModalRef: BsModalRef,
    public insuranceService: InsuranceService,
    private virtualEarthService: VirtualEarthService,
  ) { }

  ngOnInit(): void {
    // this.note = sessionStorage.getItem('note');
    this.insuranceData = new InsuranceModel();
    this.insuranceData.name = this.initialState.insuranceName;
    this.onClose = new Subject();
  }
  
  insuranceChanged(){
    this.saveInsurance = false;
    if (this.insuranceData.name != '' 
      && this.insuranceData.phone != ''
      && this.insuranceData.street1 != ''
      && this.insuranceData.city != ''
      && this.insuranceData.postalCode != ''){
        this.saveInsurance = true;
      }
  }
  zipKeypress(event: any){
    if (event.target.value.length == 5){
      this.virtualEarthService.postalCode( event.target.value )
      .pipe(first())
      .subscribe(
          data => {
            if (data.statusCode == 200)
            {
              this.insuranceData.city = data.resourceSets[0].resources[0].address.locality;
              this.insuranceData.state = data.resourceSets[0].resources[0].address.adminDistrict;
              this.insuranceData.county = data.resourceSets[0].resources[0].address.adminDistrict2;

              this.insuranceChanged();
            }
          });
    }
  }

  saveButtonClicked(){
    this.insuranceService.save( this.insuranceData)
          .pipe(first())
          .subscribe(
          data => {
            if (data.valid) {
              this.onClose.next(Number(data.id));
              this.bsModalRef.hide();
            }
          });
  }

  cancelButtonClicked(){
    this.onClose.next(0);
    this.bsModalRef.hide();
  }

}
