//Page Name       : Patient
//Date Created    : 08/05/2022
//Written By      : Stephen Farkas
//Description     : Patient Entry / Edit
//MM/DD/YYYY xxx  Description
//08/29/2022 SJF  Added Medications/Diagnosis/Allergy
//09/26/2022 SJF  Added change flag for lab update for CET
//11/18/2022 SJF  Added accordian to sections for customer login
//01/18/2023 SJF  Added allowSelfPay
//02/01/2023 SJF  Added Convert Insurance Button & Modal
//02/14/2023 SJF  Added parolOfficer
//02/17/2023 SJF  Added list of lab orders
//02/22/2023 SJF Added Parol Officer UserType = 14
//03/21/2023 SJF Added PreAuth to Insurance
//04/07/2023 SJF Added DataShareService & check for data change on cancel/exit
//04/10/2023 SJF Added DeleteAttachment
//04/17/2023 SJF Added location to search
//04/18/2023 SJF Added dynamic search to insurance add
//04/27/2023 SJF Changed Insurance Type to Workmans Comp check
//05/03/2023 SJF Changed search from Name to First Name & Last Name
//05/15/2023 SJF Added printing of label for order.
//07/09/2023 SJF Code Sync
//07/10/2023 SJF Added Billing Review User Type
//08/01/2023 SJF Added Freeform Medication & Allergy
//08/04/2023 SJF Added Effective Data & Expire Date for ROI
//08/07/2023 SJF Added Allow Facesheet
//-----------------------------------------------------------------------------
// Data Passing
//-----------------------------------------------------------------------------

import { Component, OnInit, AfterViewChecked, ViewChild, ElementRef, HostListener } from '@angular/core';
import { first } from 'rxjs/operators';
import {formatDate} from '@angular/common';

import { PatientService } from '../../services/patient.service';
import { CustomerService } from '../../services/customer.service';
import { LocationService } from '../../services/location.service';
import { LabOrderService } from '../../services/labOrder.service';
import { CodeService } from '../../services/code.service';
import { UserService } from '../../services/user.service';
import { VirtualEarthService } from '../../services/virtualEarth.service';
import { Router, NavigationStart } from '@angular/router';
import jsPDF from 'jspdf';

import { PatientModel, PatientListItemModel } from '../../models/PatientModel';
import { AddressModel } from '../../models/AddressModel';
import { PatientInsuranceModel, PatientInsuranceListItemModel } from '../../models/PatientInsuranceModel';
import { PatientAttachmentModel, PatientAttachmentListItemModel } from '../../models/PatientAttachmentModel';
import { PatientNoteListItemModel, PatientNoteModel} from '../../models/PatientNoteModel';
import { MedicationListItemModel } from '../../models/MedicationModel';
import { LabOrderListModel } from '../../models/LabOrderModel';
import { Icd10ListItemModel } from '../../models/Icd10Model';
import { AllergyListItemModel } from '../../models/AllergyModel';
import { MedicationService } from '../../services/medication.service';
import { Icd10Service } from '../../services/icd10.service';
import { AllergyService } from '../../services/allergy.service';
import { InsuranceService } from '../../services/insurance.service';
import { CodeItemModel } from '../../models/CodeModel';
import { LabOrderBatchDemographicsItemModel } from '../../models/LabOrderModel';
import { Observable, ReplaySubject } from 'rxjs';
import { IfStmt } from '@angular/compiler';
import { ToxModel, ToxOralModel} from '../../models/LabOrderTestModel';


import { PdfGPPService } from '../../services/pdfGPP.service';
import { PdfRPPService } from '../../services/pdfRPP.service';
import { PdfUTISTIService } from '../../services/pdfUTISTI.service';
import { PdfToxUrineService } from '../../services/pdfToxUrine.Service';
import { PdfToxOralService } from '../../services/pdfToxOral.service';

import { InsuranceModalComponent } from '../../modal/insurance-modal/insurance-modal.component';
import { MessageModalComponent } from '../../modal/message-modal/message-modal.component';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { LabOrderPdfModel } from '../../models/LabOrderAttachmentModel';
import { GPPModel, UTIModel, RPPModel} from '../../models/LabOrderTestModel';
import { DataShareService } from '../../services/data-share.service';

import { ClientPrintJob, InstalledPrinter, JSPrintManager, WSStatus } from 'JSPrintManager';

@Component({
  selector: 'app-patient',
  templateUrl: './patient.component.html',
  styleUrls: ['./patient.component.css']
})
export class PatientComponent implements OnInit, AfterViewChecked {

  // Variables to hold screen data
  customerId: number = 0;
  locationId: number = 0;
  locationName: string = "";
  entityId: number = 0;
  patientId: number = 0;
  patientSearchData: any;
  patientData: any;
  insuranceData: any;
  workmansComp: boolean;
  attachmentData: any;
  noteData: any;
  userType: number = 0;
  showError: boolean;
  errorMessage: string;
  createOrder: boolean = false;
  viewOnly: boolean = false;

  // Search Variables
  searchFirstName: string;
  searchLastName: string;
  searchDOB: string;
  searchGenderId: number;
  searchMedicalRecordId: string;
  searchActive: boolean;
  searchPriority: boolean;
  searchIsEmployee: boolean;     
  searchIsPatient: boolean;
  linked: boolean;

  // Variables to control screen display
  showSearch: boolean;
  showSearchList: boolean;
  showPatient: boolean;
  showPatientDetail: boolean;
  showAddressFromCustomer: boolean;
  locationCode: number;
  locationList: any;
  showInsuranceList: boolean;
  showInsuranceListDetail: boolean;
  showInsuranceEdit: boolean;
  showAttachmentList: boolean;
  showAttachmentEdit: boolean;
  showNoteList: boolean;
  showNoteEdit: boolean;
  showOrderList: boolean;
  showOrderView: boolean;
  showCustomerField: boolean;
  showICD10: boolean;
  showICD10Detail: boolean;
  showMeds: boolean;
  showMedsDetail: boolean;
  showAllergies: boolean;
  showAllergiesDetail: boolean;
  showAttachmentListDetail: boolean;
  showNoteListDetail: boolean;
  location: string = '';
  patientSaveButton: string = "Save";
  customerFilter: string = "";
  customerBillingTypeId: number = 0;
  allowSelfPay: boolean;
  customerLogin: boolean;
  parolOfficer: boolean;
  poList: any;
  allowFacesheet: boolean = false;
  useFacesheet: boolean = false;
 
  patientSave: boolean;
  insuranceSave: boolean;
  attachmentDisabled: boolean;
  attachmentSave: boolean;
  noteDisabled: boolean;
  noteSave: boolean;
  dateErrorMessage: string = '';
  attachmentDateErrorMessage: string = '';

  addMedication: boolean;
  addAllergy: boolean;

  // Variables for drop down data
  genderList: any;
  genderSearchList: any;
  ethnicityList: any;
  relationshipList: any;
  insuranceTypeList: any;
  attachmentTypeList: any;
  insuranceList: any;
  insuranceSearchList: any;
  PayorSelected: boolean;
  stateList: any;
  countryList: any;
  sequenceList: any;
  requireMR:boolean = false;

   // Medication
  searchMedication: string;
  medicationSearchList: any;
  medicationCurrentList: any;
  medicationName: string;

  // Diagnosis
  searchIcd: string;
  icdSearchList: any;
  icdCurrentList: any;

  // Allergy
  searchAllergy: string;
  allergySearchList: any;ViewChild
  allergyCurrentList: any;
  allergyName: string;

  // Lab Order
  labListData: any;
  labOrderData: any;
  showLabList: boolean;

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
  pdfData: any;
  gppData: any;
  utiData: any;
  rppData: any;

  // Modal Dialog
  modalRef: BsModalRef;

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

  // For demographic change when CET
  checkList: any;
  orderDemographicsListData: any;
  showOrderDemographicsList: boolean = false;
  demographicsNote: string = '';
  demographicsSave: boolean = false;

  arrayBuffer: any; // User for file import

  sortProperty: string = 'id';
  sortOrder = 1;

  pendingOps: boolean = true;

  constructor(
    private patientService: PatientService,
    private customerService: CustomerService,
    private locationService: LocationService,
    private codeService: CodeService,
    private medicationService: MedicationService,
    private icd10Service: Icd10Service,
    private allergyService: AllergyService,
    private labOrderService: LabOrderService,
    private userService: UserService,
    private insuranceService: InsuranceService,
    private pdfGPPService: PdfGPPService,
    private pdfRPPService: PdfRPPService,
    private pdfUTISTIService: PdfUTISTIService,
    private pdfToxUrineService: PdfToxUrineService,
    private pdfToxOralService: PdfToxOralService,
    private virtualEarthService: VirtualEarthService,
    private router: Router,
    private modalService: BsModalService,
    private dataShareService: DataShareService,
    
  ) { }

  ngOnInit(): void {

    this.dataShareService.changeUnsaved(false);

    if (sessionStorage.getItem('userId_Login') == ""){
      this.router.navigateByUrl('/login');
    }
    // Initialize screen handling variables
    this.showSearch = true;
    this.showSearchList = false;
    this.showPatient = false;
    this.showAddressFromCustomer = false;
    this.showError = false;
    this.searchActive = true;
    this.loadDropdownLists();
    this.loadDropdownListsAlpha();
    this.showOrderDemographicsList = false;

    // Based on the user login, set the customerId;
    this.customerId = Number(sessionStorage.getItem('entityId_Login'));
    this.entityId = Number(sessionStorage.getItem('entityId_Login'));
    this.userType = Number(sessionStorage.getItem('userType'));
    
    if (Number(sessionStorage.getItem('customerId')) == 0 && (this.userType == 12 || this.userType == 13)){
      this.showSearch = false;
      this.showSearchList = false;
      this.showPatientDetail = false;
      this.showInsuranceListDetail = false;
      this.showMedsDetail = false;
      this.showICD10Detail = false;
      this.showAllergiesDetail = false;
      this.showAttachmentListDetail = false;
      this.showNoteListDetail = false;
      this.showError = true;
      this.errorMessage = "An account has not been selected";
    }
    else if (this.customerId == 0){
      this.customerLogin = false;
      this.showPatientDetail = true;
      this.showInsuranceListDetail = true;
      this.showMedsDetail = true;
      this.showICD10Detail = true;
      this.showAllergiesDetail = true;
      this.showAttachmentListDetail = true;
      this.showNoteListDetail = true;
      this.customerFilter = sessionStorage.getItem('customerName');
      if (this.customerFilter!="Genesis Reference Labs"){
        this.customerFilter = "(Customer: " + this.customerFilter + ")";
        this.customerId = Number(sessionStorage.getItem('customerId'));
      }
      else{
        this.customerFilter = "";
      }
    }
    else{
      this.customerLogin = true;

////////////



    }

    if (this.userType == 14 || this.userType == 15){
      this.viewOnly = true;
    }

    var callingScreen = sessionStorage.getItem("callingScreen");

    if (callingScreen == "patient")
    {
      this.linked = false;
      // returning from lab order
      sessionStorage.setItem('searchPatientId','');
      sessionStorage.setItem('searchCustomerId','');

      this.searchFirstName = sessionStorage.getItem('searchFirstName')
      sessionStorage.setItem('searchtName','');
      this.searchLastName = sessionStorage.getItem('searchLastName');
      sessionStorage.setItem('searchLastName','');
      this.searchDOB = sessionStorage.getItem('searchDOB');
      sessionStorage.setItem('searchDOB','');
      this.searchGenderId = Number(sessionStorage.getItem('searchGenderId'));
      sessionStorage.setItem('searchGenderId','');
      this.searchMedicalRecordId = sessionStorage.getItem('searchMedicalRecordId');
      sessionStorage.setItem('searchMedicalRecordId','');
      // this.searchActive = Boolean(Number(sessionStorage.getItem('searchActive')));
      // sessionStorage.setItem('searchActive','');
      this.searchPriority = Boolean(Number(sessionStorage.getItem('searchPriority')));
      sessionStorage.setItem('searchPriority','');
      this.searchIsEmployee = Boolean(Number(sessionStorage.getItem('searchIsEmployee')));
      sessionStorage.setItem('searchIsEmployee','');
      this.searchIsPatient = Boolean(Number(sessionStorage.getItem('searchIsPatient')));

      this.searchButtonClicked();
    }
    else if (callingScreen == "inbox"){
      this.linked = true;
      this.selectButtonClicked(Number(sessionStorage.getItem('searchPatientId')));
    }
    else if (callingScreen == "dashboard"){
      this.linked = true;
      this.selectButtonClicked(Number(sessionStorage.getItem('searchPatientId')));
    }
    else if (callingScreen == "laborder"){
      this.linked = true;
      this.selectButtonClicked(Number(sessionStorage.getItem('searchPatientId')));
    }
    else{
      console.log("Other", sessionStorage.getItem('locationId'))
      this.linked = false;
      this.searchFirstName = '';
      this.searchLastName = '';
      this.searchMedicalRecordId = '';
      this.searchGenderId = -1;
      this.searchActive = true;
      this.searchIsPatient = true;
      if(Number(sessionStorage.getItem('locationId'))  > 0){
        this.searchButtonClicked();
      }
      if (this.userType == 14){
        this.searchButtonClicked();
      }
    }
    
  }

  @HostListener('document:keyup', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key == 'Enter'){
      if (this.showSearch) {
        this.searchButtonClicked();
      }      
    }
  }

  ngAfterViewChecked(){
    if (this.location == ""){
    }
    else if (this.location == "insuranceList"){
      var elmnt = document.getElementById("insuranceListCard");
      elmnt.scrollIntoView();
    }
    else if (this.location == "noteList"){
      const elmnt = document.getElementById("noteListCard");
      elmnt.scrollIntoView();
    }
    else if (this.location == "attachmentList"){
      const elmnt = document.getElementById("attachmentListCard");
      elmnt.scrollIntoView();
    }
    else if (this.location == "orderList"){
      var elmnt = document.getElementById("orderListCard");
      elmnt.scrollIntoView(false);
    }
    this.location = '';
  }

  clearSearchButtonClicked(){
    this.searchFirstName = '';
    this.searchLastName = '';
    this.searchMedicalRecordId = '';
    this.searchDOB = null;
    this.searchGenderId = -1;
    this.searchActive = true;
    this.searchIsPatient = true;
    this.searchIsEmployee = false;
    this.searchPriority = false;

  }

  searchButtonClicked(){
    this.showError = false;
    this.showCustomerField = false;

    this.locationId = Number(sessionStorage.getItem('locationId'));
    
    var location = sessionStorage.getItem('locationName');
    if (location == 'All Locations'){
      this.locationName = '';
    }
    else{
      this.locationName = "(Location: " + location + ")";
    }

    if (this.userType != 14)
    {
      this.patientService.search(  this.customerId,
                                    this.locationId,
                                    this.searchFirstName,
                                    this.searchLastName,
                                    this.searchDOB,
                                    this.searchGenderId,
                                    this.searchMedicalRecordId,
                                    this.searchActive,
                                    this.searchPriority,
                                    this.searchIsEmployee,
                                    this.searchIsPatient )
          .pipe(first())
          .subscribe(
              data => {
                if (data.valid)
                {
                  this.patientSearchData = data.list;
                  if(this.patientSearchData.length == 0){
                      this.showSearchList = false;
                      this.showPatient = false;
                      this.showAddressFromCustomer = false;
                      this.showError = true;
                      this.errorMessage = "No records found";
                  }
                  else{
                      this.showSearchList = true;
                      this.showPatient = false;
                      this.showError = false;
                      this.errorMessage = "";
                  }
                }
                else if (data.message == "No records found")
                {
                  this.errorMessage = "No records found";
                  this.showError = true;
                  this.showSearchList = false;
                  this.showPatient = false;
                }
                else
                {
                  this.errorMessage = data.message;

                }
              },
              error => {
                this.showError = true;
                this.errorMessage = error;
              });
    }
    else{
      this.patientService.getForPO(  Number(sessionStorage.getItem('userId_Login')),
                                    this.searchFirstName,
                                    this.searchLastName,
                                    this.searchDOB,
                                    this.searchGenderId,
                                    this.searchMedicalRecordId,
                                    this.searchActive)
            .pipe(first())
            .subscribe(
            data => {
            if (data.valid)
            {
              this.patientSearchData = data.list;
              if(this.patientSearchData.length == 0){
                this.showSearchList = false;
                this.showPatient = false;
                this.showAddressFromCustomer = false;
                this.showError = true;
                this.errorMessage = "No records found";
              }
              else{
                this.showSearchList = true;
                this.showPatient = false;
                this.showError = false;
                this.errorMessage = "";
              }
            }
            else if (data.message == "No records found")
            {
              this.errorMessage = "No records found";
              this.showError = true;
              this.showSearchList = false;
              this.showPatient = false;
            }
            else
            {
              this.errorMessage = data.message;

            }
            },
            error => {
              this.showError = true;
              this.errorMessage = error;
            });
    }
  }
  
  selectButtonClicked(patientId: number){
    this.medicationSearchList = new Array<MedicationListItemModel>();
    this.medicationCurrentList =  new Array<MedicationListItemModel>();
    this.medicationName = "";

    this.icdSearchList = new Array<Icd10ListItemModel>();
    this.icdCurrentList = new Array<Icd10ListItemModel>();

    this.allergySearchList = new Array<AllergyListItemModel>();
    this.allergyCurrentList = new Array<AllergyListItemModel>();
    this.allergyName = "";
    this.requireMR = false;
    this.useFacesheet = false;

    // Call the patient service to get the data for the selected patient
    
    this.patientService.get( patientId)
            .pipe(first())
            .subscribe(
            data => {
              if (data.valid)
              {
                
                this.patientId = data.patientId;
                this.errorMessage = "";
                this.showError = false;
                this.patientData = data;

                if (this.userType != 14){

                  if (data.medications != null){
                    for (let item of data.medications){
                      var med = new MedicationListItemModel();
                      med.medicationId = item.medicationId;
                      med.description = item.description;
                      this.medicationCurrentList.push(med);
                    }
                  }
      
                  if (data.diagnosis != null){
                    for (let item of data.diagnosis){
                      var diag = new Icd10ListItemModel();
                      diag.icD10Code = item.icD10Code;
                      diag.description = item.description;
                      this.icdCurrentList.push(diag);
                    }
                  }
      
                  if (data.allergies != null){
                    for (let item of data.allergies){
                      var allergy = new AllergyListItemModel();
                      allergy.allergyId = item.allergyId;
                      allergy.description = item.description;
                      this.allergyCurrentList.push(allergy);
                    }
                  }

                  this.showSearch = false;
                  this.showSearchList = false;
                  this.showPatient = true;
                  this.showInsuranceList = true;
                  this.showAttachmentList = true;
                  this.showNoteList = true;
                  this.showMeds = true;
                  this.showICD10 = true;
                  this.showAllergies = true;                
                  this.showLabList = true;

                  this.patientSave = false;

                  this.patientSaveButton = "Save";

                  // Position screen
                  var elmnt = document.getElementById("topOfScreen");
                  elmnt.scrollIntoView();

                  // Get customer Info

                  this.customerService.get( this.patientData.customerId)
                  .pipe(first())
                  .subscribe(
                            data => {
                              if (data.valid)
                              {
                                this.customerBillingTypeId = data.customerBillingTypeId;
                                this.allowSelfPay = data.allowSelfPay;
                                this.parolOfficer = data.parolOfficer;
                                this.allowFacesheet = data.facesheetAddress;

                                // Check if this came from inbox with a flag
                                if (sessionStorage.getItem('searchItem') == "Insurance"){
                                  sessionStorage.setItem('searchItem','');
                                  this.addInsuranceButtonClicked();
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
                else{
                  // Parol Officer
                  this.showSearch = false;
                  this.showSearchList = false;
                  this.showPatient = true;
                  this.showInsuranceList = false;
                  this.showAttachmentList = false;
                  this.showNoteList = false;
                  this.showMeds = false;
                  this.showICD10 = false;
                  this.showAllergies = false;                
                  this.showLabList = true;

                  this.patientSave = false;

                  this.patientSaveButton = "Save";
                }

                this.labListData = new Array<LabOrderListModel>();

                // Load Lab Orders
                this.labOrderService.search(0, 0, 0, 0, this.patientId, "", "", 99, "", "",1 )
                      .pipe(first())
                      .subscribe(
                      data => {
                        if (data.valid)
                        {
                          if (this.userType != 14){
                            this.labListData = data.list;
                          }
                          else{
                            // Parole officer - Only show the orders that have been accessioned
                            this.labListData = new Array<LabOrderListModel>();
                            data.list.forEach(item => {
                              if (item.labStatusId >= 30 && item.labStatusId <=60){
                                this.labListData.push(item);
                              }
                            });
                          }

                          this.sortBy("collectionDate");
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

  sortBy(property: string) {
    this.sortOrder = property === this.sortProperty ? (this.sortOrder * -1) : 1;
    this.sortProperty = property;
    this.labListData = [...this.labListData.sort((a: any, b: any) => {
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

  addOrderButtonClicked(patientId: number) {
    // Set variables to pass in
    sessionStorage.setItem('callingScreen','patient');
    sessionStorage.setItem('callingFirst','True');
    sessionStorage.setItem('searchPatientId',String(patientId));
    sessionStorage.setItem('searchCustomerId',String(this.customerId));
    if (this.searchFirstName == 'undefined') { this.searchFirstName = '';}
    sessionStorage.setItem('searchFirstName',this.searchFirstName);
    if (this.searchLastName == 'undefined') { this.searchLastName = '';}
    sessionStorage.setItem('searchCity',this.searchLastName);
    sessionStorage.setItem('searchDOB',this.searchDOB);
    sessionStorage.setItem('searchGenderId',String(Number(this.searchGenderId)));
    if (this.searchMedicalRecordId == 'undefined') { this.searchMedicalRecordId = '';}
    sessionStorage.setItem('searchMedicalRecordId',this.searchMedicalRecordId);
    sessionStorage.setItem('searchActive',String(Number(this.searchActive)));
    sessionStorage.setItem('searchPriority',String(Number(this.searchPriority)));
    sessionStorage.setItem('searchIsEmployee',String(Number(this.searchIsEmployee)));
    sessionStorage.setItem('searchIsPatient',String(Number(this.searchIsPatient)));
    sessionStorage.setItem('searchOrderId','0');

    this.router.navigateByUrl('/lab-order');
  }

  expandPatientButtonClicked(){
    this.showPatientDetail = true;
  }
  compactPatientButtonClicked(){
    this.showPatientDetail = false;
  }
  lastNameChanged(){
    this.patientData.lastNameMissing = false;
    this.requireMR = false;

    var word = this.patientData.lastName
    this.patientData.lastName =  word[0].toUpperCase() + word.substr(1).toLowerCase();
    this.patientChanged();
  }

  lastNameCkChanged(){
    if (this.patientData.lastNameMissing){
      this.patientData.lastName = null;
      if (this.patientData.firstNameMissing){
        this.requireMR = true;
      }
      else{
        this.requireMR = false;
      }
    }
    else{
      this.requireMR = false;
    }
  }

  firstNameChanged(){
    this.patientData.firstNameMissing = false;
    this.requireMR = false;
    var word = this.patientData.firstName
    this.patientData.firstName =  word[0].toUpperCase() + word.substr(1).toLowerCase();
    this.patientChanged();
  }

  firstNameCkChanged(){
    if (this.patientData.firstNameMissing){
      this.patientData.firstName = null;
      if (this.patientData.lastNameMissing){
        this.requireMR = true;
      }
      else{
        this.requireMR = false;
      }
    }
    else{
      this.requireMR = false;
    }
    this.patientChanged();
  }
  
  dobChanged(){
    const today = new Date();
    var maxDate = today.setDate(today.getDate());
    let minDate = Date.parse('1900-01-02T00:00:00');

    var dobck = Date.parse(this.patientData.dob );

    console.log("DOBCK",this.patientData.dob,dobck);

    if (dobck > maxDate){
      this.dateErrorMessage = "DOB date cannot be in the future."
    }
    else if (dobck < minDate)
    {
      this.dateErrorMessage = "Invalid DOB";
    }
    else
    {
      this.dateErrorMessage = "";
    }

    this.patientData.dobMissing = false;
    this.patientChanged();
  }

  dobCkChanged(){
    if (this.patientData.dobMissing){
      this.patientData.dob = null;
    }
    this.patientChanged();
  }

  addressChanged(){
    console.log("AddressChanged");
    this.patientData.addressMissing = false;
    this.patientChanged();
  }

  addressCkChanged(){
    console.log("AddressCkChanged");
    if (this.patientData.addressMissing){
      this.patientData.address.street1 = null;
    }
    this.patientChanged();
  }

  patientChanged(){
    console.log("Patient",this.patientData);
    this.patientSave = false;
    if ((this.patientData.firstName != "" || this.patientData.firstNameMissing)
      && (this.patientData.lastName !="" && this.patientData.lastName.length > 1 || this.patientData.lastNameMissing)
      && ((this.patientData.dob !="" && this.patientData.dob != undefined) || this.patientData.dobMissing)
      && (this.patientData.genderId > -1)
      && (this.patientData.address.street1 !="" || this.patientData.addressMissing || this.useFacesheet)
      && (this.patientData.address.postalCode !="" || this.patientData.addressMissing || this.useFacesheet)
      && (this.patientData.address.city !="" || this.patientData.addressMissing || this.useFacesheet)
      && (this.patientData.phone !="" || this.patientData.phoneMissing || this.useFacesheet)
      && (!this.requireMR || this.patientData.medicalRecordId!= "") ){
      this.patientSave = true;
    }
    this.dataShareService.changeUnsaved(true);
  }

  zipKeypress(event: any){
    if (event.target.value.length == 5){
      this.virtualEarthService.postalCode( event.target.value )
      .pipe(first())
      .subscribe(
          data => {
            if (data.statusCode == 200)
            {
              this.patientData.address.city = data.resourceSets[0].resources[0].address.locality;
              this.patientData.address.state = data.resourceSets[0].resources[0].address.adminDistrict;
              this.patientData.address.county = data.resourceSets[0].resources[0].address.adminDistrict2;

              this.patientChanged();
            }
          });
    }
  }

  addButtonClicked(){

    //userType != 6 && userType != 7 && userType != 8 && !patientData.addressMissing && !CustomerData) || (!allowFacesheet && CustomerLogin)
    // console.log("User", this.userType);
    // console.log("Missing", this.patientData.addressMissing);
    // console.log("allow", this.allowFacesheet);
    // console.log("Custom")



    this.patientId = 0;
    this.requireMR = false;
    this.useFacesheet = false;
    // Initialze data to a blank record
    this.patientData = new PatientModel();
    this.patientData.customerId = this.customerId;
    this.patientData.locationId = Number(sessionStorage.getItem('locationId'));
    if (this.customerId == 0){
      this.showCustomerField = true;
    }
    else{
      this.showCustomerField = false;
    }
    this.patientData.addressId = 0;
    this.patientData.address = new AddressModel();
    this.patientData.address.countryCode = 'USA';
    this.patientData.active = true;

    this.medicationCurrentList =  new Array<MedicationListItemModel>();
    this.medicationName = "";
    this.icdCurrentList = new Array<Icd10ListItemModel>();
    this.allergyCurrentList = new Array<AllergyListItemModel>();
    this.allergyName = "";

    // Pull any values from the search over to new patient
    this.patientData.firstName = this.searchFirstName;
    this.patientData.lastName = this.searchLastName;
    this.patientData.dob = this.searchDOB;
    this.patientData.genderId = this.searchGenderId;
    this.patientData.medicalRecordId = this.searchMedicalRecordId

    // Set screen handling variables
    this.showSearch = false;
    this.showSearchList = false;
    this.showPatient = true;

    this.patientSave = false;
    
    this.errorMessage = "";
    this.showError = false;

    this.patientSaveButton = "Save & Continue";

    // Get customer Info

    var locationId = Number(sessionStorage.getItem('locationId'));

    this.customerService.get( this.customerId)
            .pipe(first())
            .subscribe(
            data => {
              if (data.valid)
              {

                this.customerBillingTypeId = data.customerBillingTypeId;

                // Check if residental facility
                this.showAddressFromCustomer = false;
                this.locationCode = 0;
                this.locationList = new Array<CodeItemModel>();
                this.allowFacesheet = data.facesheetAddress;

                data.locations.forEach( (item) =>{
                  if (locationId == 0 || item.locationId == locationId){
                    if (item.residentialFacility == true){
                      var item2 = new CodeItemModel();
                      item2.id = item.addressId;
                      item2.description = item.locationName;
                      this.locationList.push(item2);
                      this.showAddressFromCustomer = true;
                    }
                  }
                });
                if (this.showAddressFromCustomer){
                  this.locationCode = this.locationList[0].id;
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

  useAddressButtonClicked(){
    // Get location address and copy it into address
    
    this.patientService.getAddress( this.locationCode)
            .pipe(first())
            .subscribe(
            data => {
              if (data.valid)
              {
                this.patientData.address = data;
                this.patientData.address.addressId = 0;
                if (this.patientData.address.countryCode == '   '){
                  this.patientData.address.countryCode = 'USA';
                }
                this.patientChanged();
              }
            });

  }

  usePhoneButtonClicked(){
    this.locationService.get(this.locationCode)
            .pipe(first())
                .subscribe(
                data => {
                  if (data.valid)
                  {
                    this.patientData.phone = data.phone;
                    this.patientChanged();
                  }
                });
  }

  backButtonClicked() {
    var cng = false;
    this.dataShareService.unsaved.subscribe(data=>{
      cng = data;
    });
    if (cng){
      if (confirm("WARNING: You have unsaved changes. Press Cancel to go back and save these changes, or OK to lose these changes."  )){
        cng = false;
      }
    }
    if (!cng){
      if (sessionStorage.getItem('callingScreen') == "inbox"){
        // go back to inbox screen
        this.router.navigateByUrl('/inbox');
      }
      else if (sessionStorage.getItem('callingScreen') == "dashboard"){
        // go back to inbox screen
        this.router.navigateByUrl('/dashboard');
      }
      else if (sessionStorage.getItem("callingScreen") == "laborder"){
        // go back to laborder screen
        this.router.navigateByUrl('/lab-order');
      }
      else{
        this.showSearch = true;
        this.showSearchList = true;
        this.showPatient = false;
        this.showAddressFromCustomer = false;

        this.showInsuranceList = false;
        this.showInsuranceEdit = false;
        this.showAttachmentList = false;
        this.showAttachmentEdit = false;
        this.showMeds = false;
        this.showICD10 = false;
        this.showAllergies = false;
        this.showLabList = false;

        this.showNoteList = false;
        this.showNoteEdit = false;
        this.showError = false;
        this.showOrderDemographicsList = false;
        // Postion screen
        this.location="topOfScreen";
      }
    }
  }

  saveAndCreateButtonClicked() {
    this.createOrder = true;
    this.saveButtonClicked();
  }

  createButtonClicked() {
    this.addOrderButtonClicked(this.patientId);
  }

  saveButtonClicked() {
    this.showError = false;
    this.patientService.save( this.patientData)
          .pipe(first())
          .subscribe(
          data => {
            if (data.valid) {
              if (this.patientId == 0){
                // New Patient
                var posn: number  = data.id.indexOf(",");
                this.patientId = Number(data.id.substring(0,posn));
                var addressId = Number(data.id.substring(posn + 1, data.id.length));

                this.patientData.patientId = this.patientId;
                this.patientData.addressId = addressId;
                this.patientData.address.addressId = addressId;
                this.patientSaveButton = "Save";
                this.showInsuranceListDetail = true;
                this.showSummaryItems();
              }
              else{
                // Existing Patient
                this.showSearch = true;
                this.showSearchList = true;
                this.hideSummaryItems();

                if (this.userType == 7 || this.userType == 8){
                  // CET
                  this.labOrderService.getLabDemographicsChange(this.patientId)
                        .pipe(first())
                        .subscribe(
                        data => {
                          if (data.valid){

                            if (sessionStorage.getItem('callingScreen') == "inbox"){
                              // go back to inbox screen
                              this.router.navigateByUrl('/inbox');
                            }
                            else{
                              this.hideSummaryItems();
                              this.checkList = new Array<LabOrderBatchDemographicsItemModel>();
                              this.orderDemographicsListData = data.list;
                              this.showOrderDemographicsList = true;
                              this.demographicsSave = false;
                              this.showSearch = false;
                              this.showSearchList = false;

                              // Position screen
                              var elmnt = document.getElementById("topOfScreen");
                              elmnt.scrollIntoView();
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

                else if(this.createOrder){
                  this.addOrderButtonClicked(this.patientId);
                }
                else{
                  // Update list
                  this.searchButtonClicked();
                }
              }
              this.showAddressFromCustomer = false;
              this.dataShareService.changeUnsaved(false);
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

  hideSummaryItems(){
    // Hide summary items
    this.showPatient = false;
    this.showInsuranceList = false;
    this.showAttachmentList = false;
    this.showNoteList = false;
    this.showOrderList = false;
    this.showMeds = false;
    this.showICD10 = false;
    this.showAllergies = false;
    this.showLabList = false;
  }

  showSummaryItems(){
    // Show summary items
    this.showPatient = true;
    this.showInsuranceList = true;
    this.showAttachmentList = true;
    this.showNoteList = true;
    this.showOrderList = true;
    this.showMeds = true;
    this.showICD10 = true;
    this.showAllergies = true;
    this.showLabList = true;
  }

  // Insurnace

  expandInsuranceButtonClicked(){
    this.showInsuranceListDetail = true;
  }
  compactInsuranceButtonClicked(){
    this.showInsuranceListDetail = false;
  }
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
                this.insuranceSave = false;
                this.PayorSelected = true;
                this.workmansComp = false;
                if (this.insuranceData.insuranceTypeId == 2){
                  this.workmansComp = true;
                }

                this.hideSummaryItems();

                // Position screen
                var elmnt = document.getElementById("topOfScreen");
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

  PayorChanged(){
    if (this.insuranceData.insuranceId > 0){
      this.insuranceService.get( this.insuranceData.insuranceId)
      .pipe(first())
      .subscribe(
            data => {
              if (data.valid)
              {
                this.insuranceData.preAuthRequired = data.preauthRequired;

                this.hideSummaryItems();

                // Position screen
                var elmnt = document.getElementById("topOfScreen");
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
    this.insuranceChanged();
  }

  insuranceChanged(){
    this.insuranceSave = false;
    if (this.insuranceData.insuranceId == 0){
      if (this.insuranceData.insuranceName != "" && this.insuranceData.memberId !="" ){
        this.insuranceSave = true;
      }
    }
    else if(this.insuranceData.insuranceId > 0){
      if (this.insuranceData.memberId !="" ){
        this.insuranceSave = true;
      }
    }
    this.dataShareService.changeUnsaved(true);
  }

  addInsuranceButtonClicked(){

    var dateStamp  =  formatDate(new Date() , 'yyyy-MM-dd HH:mm:ss', 'en');


    this.errorMessage = "";
    this.showError = false;
    this.insuranceData = new PatientInsuranceModel();
    this.insuranceData.patinetInsuranceId = 0;
    this.insuranceData.patientId = this.patientId
    this.insuranceData.insuranceId = -1;
    this.insuranceData.active = true;
    this.insuranceSave = false;
    this.PayorSelected = false;
    this.insuranceSearchList = new Array<CodeItemModel>;
    this.workmansComp = false;

    this.hideSummaryItems();

    this.showInsuranceEdit = true;
    // Postion screen
    var elmnt = document.getElementById("topOfScreen");
    elmnt.scrollIntoView();
  }

  payorKeypress(event: any){
    if (event.target.value.length > 1){
      this.insuranceSearchList = this.insuranceList.filter(item => item.description.toLowerCase().indexOf(event.target.value.toLowerCase()) !== -1);

      var item = new CodeItemModel();
            item.id = 0;
            item.description = "Not In List";
            this.insuranceSearchList.push(item);
    }
  }

  payorClicked(id: number){
    this.insuranceData.insuranceId = id;
    this.PayorSelected = true;
  }

  resetPayorButtonClicked(){
    this.insuranceData.insuranceId = null;
    this.PayorSelected = false;
  }

  saveInsuranceButtonClicked(hideThis: boolean){
    this.showError = false;
    this.insuranceData.patientName = this.patientData.firstName + ' ' + this.patientData.lastName;
    this.insuranceData.customerId = this.patientData.customerId;
    this.insuranceData.userName = sessionStorage.getItem('userName');

    if (this.workmansComp == true){
      this.insuranceData.insuranceTypeId = 2;
    }
    else{
      this.insuranceData.insuranceTypeId = 1;
    }

    this.patientService.savePatientInsurance( this.insuranceData)
          .pipe(first())
          .subscribe(
          data => {
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
                                      this.dataShareService.changeUnsaved(false);

                                      if (hideThis){
                                        this.showInsuranceEdit = false;

                                        this.showSummaryItems();
      
                                        // Postion screen
                                        this.location="insuranceList";
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

    this.showSummaryItems();
    
    // Postion screen
    this.location="insuranceList";
  }  

  convertInsuranceButtonClicked(){
    const initialState: ModalOptions = {
      initialState: {
        insuranceName: this.insuranceData.insurance
      }
    };
    this.modalRef = this.modalService.show(InsuranceModalComponent, {
      initialState 
    });
    this.modalRef.setClass('modal-lg');
    
    this.modalRef.content.onClose.subscribe(result => {
      if (result > 0){
        // Updated in Modal

        // Reload insurance Co list
        this.loadInsuranceDropdownLists();

        // Update patient insurance
        this.insuranceData.insuranceId = result;
        this.insuranceData.insurance = '';

        this.saveInsuranceButtonClicked(false);
        
      }
    })
  }

  // Attachments

  expandAttachmentButtonClicked(){
    this.showAttachmentListDetail = true;
  }
  compactAttachmentButtonClicked(){
    this.showAttachmentListDetail = false;
  }

  selectAttachmentButtonClicked(attachmentId: number){
    // Call the attachment service to get the data for the selected attachment
    this.patientService.getPatientAttachment( attachmentId)
            .pipe(first())
            .subscribe(
            data => {
              if (data.valid)
              {
                this.errorMessage = "";
                this.showError = false;
                this.attachmentData = data;
                // this.attachmentDisabled = true;
                // this.showAttachmentEdit = true;
                // this.attachmentSave = false;

                // this.hideSummaryItems();

                // // Postion screen
                // var elmnt = document.getElementById("topOfScreen");
                // elmnt.scrollIntoView();

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

  attachmentDateChanged(){
    this.attachmentDateErrorMessage = '';
    if (this.attachmentData.effectiveDate != '' && this.attachmentData.expireDate != ''){
      var dt1 = Date.parse(this.attachmentData.effectiveDate);
      var dt2 = Date.parse(this.attachmentData.expireDate);
      if (dt1 > dt2){
        this.attachmentDateErrorMessage = "Expire data must be after effective date."
      }
    }

    this.attachmentChanged();
  }
  attachmentChanged(){
    this.attachmentSave = false;
    if (this.attachmentData.attachmentTypeId > 0 
    && (this.attachmentData.fileType !="" || this.captures.length > 0)){
      this.attachmentSave = true;
    }
    if (this.attachmentData.attachmentTypeId == 12 && (this.attachmentData.effectiveDate == '' || this.attachmentData.expireDate == '')){
      this.attachmentSave = false;
    }
    if (this.attachmentDateErrorMessage !=''){
      this.attachmentSave = false;
    }
    this.dataShareService.changeUnsaved(true);
  }

  addAttachmentButtonClicked(){
    this.attachmentData = new PatientAttachmentModel();

    this.errorMessage = "";
    this.showError = false;
    this.attachmentDisabled = false;
    this.showAttachmentEdit = true;
    this.attachmentSave = false;

    this.fileUploaded = false;
    this.fileScanned = false;
    
    this.captures = new Array<string>();

    this.hideSummaryItems();

    // Postion screen
    var elmnt = document.getElementById("topOfScreen");
    elmnt.scrollIntoView();
  }

  saveAttachmentButtonClicked(){
    this.attachmentData.patientId = this.patientId;
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
    
    this.patientService.savePatientAttachment( this.attachmentData)
          .pipe(first())
          .subscribe(
          data => {
            // console.log("Data",data);
            if (data.valid) {
              // Find attachment type in list
              for (let item of this.attachmentTypeList){
                if (item.id == this.attachmentData.attachmentTypeId){
                  this.attachmentData.attachmentType = item.description;
                }
              }

              // Update list
              var item = new PatientAttachmentListItemModel();
              item.patientAttachmentId = Number(data.id);
              item.patientId = this.patientId;
              item.dateCreated = this.attachmentData.dateCreated.substring(0,10);
              item.attachmentType = this.attachmentData.attachmentType;
              item.description = this.attachmentData.description;
              if (this.patientData.attachments == null){
                this.patientData.attachments = new Array<PatientAttachmentListItemModel>();
              }
              this.patientData.attachments.push(item);

              this.showAttachmentEdit = false;
              this.dataShareService.changeUnsaved(false);

              this.showSummaryItems();
    
              // Postion screen
              this.location="attachmentList";
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
    if (this.cameraOn){
      this.stopDevice();
    }

    this.showAttachmentEdit = false;

    this.showSummaryItems();
    
    // Postion screen
    this.location="attachmentList";
  }

  deleteAttachmentButtonClicked(attachmentId: number){
    this.patientService.deletedPatientAttachment( attachmentId)
            .pipe(first())
            .subscribe(
            data => {
              if (data.valid)
              {
                this.errorMessage = "";
                this.showError = false;

                let index = this.patientData.attachments.findIndex(d => d.patientAttachmentId === attachmentId); //find index in your array
                this.patientData.attachments.splice(index, 1);//remove element from array    
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

  readFile(event: any){
    const target: DataTransfer = <DataTransfer>(event.target);
    if (target.files.length !== 1) {
      throw new Error('Cannot get multiple files');
    }
    else
    {
      var temp = target.files[0].name;
      var posn = temp.indexOf(".",1);

      this.attachmentData.fileType = event.target.files[0].type;

      this.convertFile(event.target.files[0]).subscribe(base64 => {
        this.attachmentData.fileAsBase64 = base64;
        this.attachmentChanged();
      });
      this.fileUploaded = true;

    }
  }

  convertFile(file : File) : Observable<string> {
    const result = new ReplaySubject<string>(1);
    const reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = (event) => result.next(btoa(event.target.result.toString()));
    return result;
  }

  // Notes

  expandNoteButtonClicked(){
    this.showNoteListDetail = true;
  }
  compactNoteButtonClicked(){
    this.showNoteListDetail = false;
  }

  selectNoteButtonClicked(noteId: number){
    this.patientService.getPatientNote( noteId)
            .pipe(first())
            .subscribe(
            data => {
              if (data.valid)
              {
                //console.log(data);

                this.errorMessage = "";
                this.showError = false;
                this.noteData = data;
                this.noteDisabled = true;
                this.showNoteEdit = true;
                this.noteSave = false;

                this.hideSummaryItems();

                // Postion screen
                var elmnt = document.getElementById("topOfScreen");
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

  noteChanged(){
    this.noteSave = false;
    if (this.noteData.subject != "" && this.noteData.note !=""){
      this.noteSave = true;
    }
    this.dataShareService.changeUnsaved(true);
  }

  addNoteButtonClicked(){

    var dateStamp  =  formatDate(new Date() , 'yyyy-MM-dd HH:mm:ss', 'en');


    this.errorMessage = "";
    this.showError = false;
    this.noteData = new PatientNoteModel();
    this.noteData.patientNoteId = 0;
    this.noteData.patientId = this.patientId
    this.noteData.dateTime = formatDate(new Date() , 'MM/dd/yyyy HH:mm:ss', 'en');
    this.noteSave = false;

    //console.log(this.noteData);

    this.noteDisabled = false;
    this.showNoteEdit = true;

    this.hideSummaryItems();

    // Postion screen
    var elmnt = document.getElementById("topOfScreen");
    elmnt.scrollIntoView();
  }

  saveNoteButtonClicked(){
    this.patientService.savePatientNote( this.noteData)
          .pipe(first())
          .subscribe(
          data => {
            // console.log("Data",data);
            if (data.valid) {
              // Update list
              var item = new PatientNoteListItemModel();
              item.patientNoteId = Number(data.id);
              item.patientId = this.patientId;
              item.dateTime = this.noteData.dateTime.substring(0,10);
              item.subject = this.noteData.subject;
              item.note = this.noteData.note;
              if (this.patientData.notes == null){
                this.patientData.notes = new Array<PatientNoteListItemModel>();
              }
              this.patientData.notes.push(item);

              this.showNoteEdit = false;
              this.dataShareService.changeUnsaved(false);

              this.showSummaryItems();
    
              // Postion screen
              this.location="noteList";
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

  cancelNoteButtonClicked(){
    this.showNoteEdit = false;

    this.showSummaryItems();
    
    // Postion screen
    this.location="noteList";
  }

  // Medications

  expandMedicationButtonClicked(){
    this.showMedsDetail = true;
  }
  compactMedicationButtonClicked(){
    this.showMedsDetail = false;
  }

  medicationKeypress(event: any){
    this.addMedication = false;
    if (event.target.value.length > 2){
      if(event.key == 'Enter' && this.medicationSearchList.length > 0){
        this.newMedicationClick(this.medicationSearchList[0].medicationId);
      }
      else{
        this.medicationService.search( event.target.value )
        .pipe(first())
        .subscribe(
            data => {
              if (data.valid)
              {
                this.medicationSearchList = data.list;
              }
              else{
                this.medicationSearchList = new Array<MedicationListItemModel>();
                this.addMedication = true;
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
      this.medicationSearchList = new Array<MedicationListItemModel>();
    }
  }

  newMedicationClick(id: number){
    var found = false;
    // Check if medication already in lab list
    for (let item of this.medicationCurrentList){
      if (item.medicationId == id){
        found = true;
        break;
      }
    }

    if (!found){
      // Find medication in list
      for (let item of this.medicationSearchList){
        if (item.medicationId == id){
          // Add medication to the database
          this.showError = false;
          this.patientService.savePatientMedication( this.patientId, id,'')
                .pipe(first())
                .subscribe(
                data => {
                  if (data.valid) {
                    this.medicationCurrentList.push(item);
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
          break;
        }
      }
    }
  }

  currentMedicationClick(value: string){
    var index = 0;
    var sepArray = value.split(',');
    var medicationId = Number(sepArray[0]);
    var description = sepArray[1];
    if (medicationId > 0){
      for (let item of this.medicationCurrentList){
        if (item.medicationId == medicationId){
          // remove medication from the database
          this.showError = false;
          this.patientService.deletePatientMedication( this.patientId, medicationId, '')
                .pipe(first())
                .subscribe(
                data => {
                  if (data.valid) {
                    this.medicationCurrentList.splice(index, 1);
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
          break;
        }
        index++;
      }
    }
    else{
      // custom added - match text
      for (let item of this.medicationCurrentList){
        if (item.description == description){
          // remove medication from the database
          this.showError = false;
          this.patientService.deletePatientMedication( this.patientId, 0, description)
                .pipe(first())
                .subscribe(
                data => {
                  if (data.valid) {
                    this.medicationCurrentList.splice(index, 1);
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
          break;
        }
        index++;
      }
    }
  }

  addMedicationButtonClicked(){
    var found = false;
    this.addMedication = false;
    // Check if medication already in lab list
    for (let item of this.medicationCurrentList){
      if (item.description == this.medicationName){
        found = true;
        break;
      }
    }

    if (!found){
      var item = new MedicationListItemModel;
      item.medicationId = 0;
      item.description = this.medicationName;
      this.showError = false;
      this.patientService.savePatientMedication( this.patientId, 0,this.medicationName)
            .pipe(first())
            .subscribe(
            data => {
              if (data.valid) {
                this.medicationCurrentList.push(item);
                this.medicationName = "";
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

  }

  // ICD

  expandIcdButtonClicked(){
    this.showICD10Detail = true;
  }
  compactIcdButtonClicked(){
    this.showICD10Detail = false;
  }

  icdKeypress(event: any){
    if (event.target.value.length > 2){
      if(event.key == 'Enter' && this.icdSearchList.length > 0){
        this.newIcdClick(this.icdSearchList[0].icD10Code);
      }
      else{
        this.icd10Service.search( event.target.value )

        .pipe(first())
        .subscribe(
            data => {
              if (data.valid)
              {
                this.icdSearchList = data.list;
              }
            },
            error => {
              this.errorMessage = error;
              this.showError = true;
            });
      }
    }
  }

  newIcdClick(id: string){
    var found = false;
    // Check if icd code already in lab list
    for (let item of this.icdCurrentList){
      if (item.icD10Code == id){
        found = true;
        break;
      }
    }

    if (!found){
      // Find icd code in list
      for (let item of this.icdSearchList){
        if (item.icD10Code == id){
          // Add medication to the database
          this.showError = false;
          this.patientService.savePatientIcd10( this.patientId, id)
                .pipe(first())
                .subscribe(
                data => {
                  if (data.valid) {
                    this.icdCurrentList.push(item);
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
          break;
        }
      }
    }
  }

  currentIcdClick(id: string){
    var index = 0;
    for (let item of this.icdCurrentList){
      if (item.icD10Code == id){
        // Remove medication from the database
        this.showError = false;
        this.patientService.deletePatientIcd10( this.patientId, id)
              .pipe(first())
              .subscribe(
              data => {
                if (data.valid) {
                  this.icdCurrentList.splice(index, 1)
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
        break;
      }
      index++;
    }
  }

  // Allergy

  expandAllergyButtonClicked(){
    this.showAllergiesDetail = true;
  }
  compactAllergyButtonClicked(){
    this.showAllergiesDetail = false;
  }
  
  allergyKeypress(event: any){
    this.addAllergy = false;
    if (event.target.value.length > 2){
      if(event.key == 'Enter' && this.icdSearchList.length > 0){
        this.newAllergyClick(this.allergySearchList[0].allergyId);
      }
      else{
        this.allergyService.search( event.target.value )

        .pipe(first())
        .subscribe(
            data => {
              if (data.valid)
              {
                this.allergySearchList = data.list;
              }
              else{
                this.allergySearchList = new Array<AllergyListItemModel>();
                this.addAllergy = true;
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
      this.allergySearchList = new Array<AllergyListItemModel>();
    }
  }

  newAllergyClick(id: number){
    var found = false;
    // Check if allergy already in lab list
    for (let item of this.allergyCurrentList){
      if (item.allergyId == id){
        found = true;
        break;
      }
    }

    if (!found){
      // Find allergy in list
      for (let item of this.allergySearchList){
        if (item.allergyId == id){
          // Add medication to the database
          this.showError = false;
          this.patientService.savePatientAllergy( this.patientId, id, '')
                .pipe(first())
                .subscribe(
                data => {
                  if (data.valid) {
                    this.allergyCurrentList.push(item);
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
          break;
        }
      }
    }
  }

  currentAllergyClick(value: string){
    var index = 0;
    var sepArray = value.split(',');
    var allergyId = Number(sepArray[0]);
    var description = sepArray[1];
    if (allergyId > 0){
      for (let item of this.allergyCurrentList){
        if (item.allergyId == allergyId){
          // remove allergy from the database
          this.showError = false;
          this.patientService.deletePatientAllergy( this.patientId, allergyId, '')
                .pipe(first())
                .subscribe(
                data => {
                  if (data.valid) {
                    this.allergyCurrentList.splice(index, 1);
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
          break;
        }
        index++;
      }
    }
    else{
      // custom added - match text
      for (let item of this.allergyCurrentList){
        if (item.description == description){
          // remove allergy from the database
          this.showError = false;
          this.patientService.deletePatientAllergy( this.patientId, 0, description)
                .pipe(first())
                .subscribe(
                data => {
                  if (data.valid) {
                    this.allergyCurrentList.splice(index, 1);
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
          break;
        }
        index++;
      }
    }
    
  }

  addAllergyButtonClicked(){
    var found = false;
    this.addAllergy = false;
    // Check if allergy already in lab list
    for (let item of this.allergyCurrentList){
      if (item.description == this.allergyName){
        found = true;
        break;
      }
    }

    if (!found){
      var item = new AllergyListItemModel;
      item.allergyId = 0;
      item.description = this.allergyName;
      this.showError = false;
      this.patientService.savePatientAllergy( this.patientId, 0,this.allergyName)
            .pipe(first())
            .subscribe(
            data => {
              if (data.valid) {
                this.allergyCurrentList.push(item);
                this.allergyName = "";
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
  }

  // Demographics Changed

  demographicsUpdateChanged(){
    this.demographicsSave = false;
    var isChecked = false;
    for (let item of this.orderDemographicsListData){
      if (item.checked){
        isChecked = true;
      }
    }
    if (isChecked && this.demographicsNote != "")
    {
      this.demographicsSave = true;
    }
  }

  onAllDemographicChange(isChecked: boolean){
    this.checkList = new Array<LabOrderBatchDemographicsItemModel>();
    if (isChecked){
      for (let item of this.orderDemographicsListData){
        item.checked = true;

        var item2 = new LabOrderBatchDemographicsItemModel();
        item2.labOrderId = item.labOrderId;
        item2.description = item.description;
        this.checkList.push(item2)
      }
    }
    else{
      for (let item of this.orderDemographicsListData){
        item.checked = false;
      }
    }
    this.demographicsUpdateChanged();
    console.log("CheckList ",this.checkList);
  }

  onLabCheckChange(labOrderId: number, description: string,isChecked: boolean){
    if (isChecked){
      var item = new CodeItemModel();
      item.id = labOrderId;
      item.description = description;
      
      this.checkList.push(item)
    }
    else{
      var index = 0;
      for (let item of this.checkList){
        if (item.id == labOrderId && item.description == description){
          this.checkList.splice(index, 1)
          break;
        }
        index++;
      }
    }
    this.demographicsUpdateChanged();
    //console.log("CheckList",this.checkList);
  }

  labUpdateDemographicsButtonClicked(){
    if (this.checkList.length > 0)
    {
      console.log("Batch update");
      this.labOrderService.batchDemographicsUpdate(this.patientId, this.demographicsNote, this.checkList)
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
   
        // Process finished update screen
        this.demographicsNote = "";
        this.showOrderDemographicsList = false;
        this.searchButtonClicked();
    }

  }

  loadDropdownLists(){

    this.codeService.getList( 'Gender,Ethnicity,Relationship,InsuranceType,AttachmentType,Insurance,Sequence,PO' )

    .pipe(first())
    .subscribe(
        data => {
          if (data.valid)
          {
            this.genderList = data.list0;
            var gitem = new CodeItemModel();
            gitem.id = -1;
            gitem.description = "Select";
            this.genderList.splice(0,0,gitem);
            this.genderSearchList = data.list0;
            this.ethnicityList = data.list1;
            this.relationshipList = data.list2;
            this.insuranceTypeList = data.list3;
            this.attachmentTypeList = data.list4;
            this.insuranceList = data.list5;
            this.sequenceList = data.list6;
            this.poList = data.list7;
            var item = new CodeItemModel();
            item.id = -1;
            item.description = "Select";
            this.insuranceTypeList.splice(0,0,item);
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

  loadInsuranceDropdownLists(){

    this.codeService.getList( 'Insurance' )

    .pipe(first())
    .subscribe(
        data => {
          if (data.valid)
          {
            this.insuranceList = data.list0;
            var item = new CodeItemModel();
            item.id = -1;
            item.description = "Select";
            this.insuranceList.splice(0,0,item);
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

  loadDropdownListsAlpha(){
    this.codeService.getAlphaList( 'State,Country' )

    .pipe(first())
    .subscribe(
        data => {
          if (data.valid)
          {
            this.stateList = data.list0;
            this.countryList = data.list1;
 
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

  orderPdfClicked(labOrderId: number){
    this.pdfData = new LabOrderPdfModel();
    // Get the lab order data
    this.labOrderService.get(labOrderId )
        .pipe(first())
        .subscribe(
        data => {
          if (data.valid)
          {
            this.labOrderData = data;

            if (this.labOrderData.specimens[0].requestPDF == 1){
              this.orderPdfShow(this.labOrderData.specimens[0].labOrderSpecimenId);
            }
            else{
              // Get the patient data
              this.patientService.get( this.patientId)
                  .pipe(first())
                  .subscribe(
                  data => {
                    if (data.valid){
                      var doc;
                      this.patientData = data;
                      this.userService.get(this.labOrderData.userId_Physician)
                        .pipe(first())
                        .subscribe(
                        data => {                  
                          if (data.valid){
                            var physicianNPI = data.npi;
                              this.userService.getSignature( this.labOrderData.userId_Physician, this.labOrderData.userSignatureId_Physician )
                                  .pipe(first())
                                  .subscribe(
                                  data => {
                                    var PhysicianSig = data.fileAsBase64;

                                    this.labOrderService.getPatientSignature( this.labOrderData.patientId, this.labOrderData.labOrderId )

                                    .pipe(first())
                                    .subscribe(
                                    data => {
                                      var PatientSig = data.fileAsBase64;

                                      // This is for Pdf generate

                                      if (this.labOrderData.specimens[0].labTypeId == 1){
                                        this.loadToxData(this.labOrderData.specimens[0].tests);
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

                                        doc = this.pdfToxUrineService.generateToxUrine(this.labOrderData, tox, this.patientData, physicianNPI, PhysicianSig, PatientSig);
                                      }
                                      else if (this.labOrderData.specimens[0].labTypeId == 2){
                                        this.loadToxOralData(this.labOrderData.specimens[0].tests);
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
                                        doc = this.pdfToxOralService.generateToxOral(this.labOrderData, toxOral, this.patientData, physicianNPI, PhysicianSig, PatientSig);
                                      }
                                      else if (this.labOrderData.specimens[0].labTypeId == 3){
                                        this.gppData = new GPPModel();
                                        this.loadGPPData();
                                        doc = this.pdfGPPService.generateGPP(this.labOrderData, this.gppData, this.patientData, physicianNPI, PhysicianSig, PatientSig);
                                      }
                                      else if (this.labOrderData.specimens[0].labTypeId == 4){
                                        this.utiData = new UTIModel();
                                        this.loadUTIData();
                                        doc = this.pdfUTISTIService.generateUTISTI(this.labOrderData, this.utiData, this.patientData, physicianNPI, PhysicianSig, PatientSig);
                                      }
                                      else if (this.labOrderData.specimens[0].labTypeId == 5){
                                        this.rppData = new RPPModel();
                                        this.loadRPPData();
                                        doc = this.pdfRPPService.generateRPP(this.labOrderData, this.rppData, this.patientData, physicianNPI, PhysicianSig, PatientSig);
                                      }

                                      this.pdfData.specimenId = this.labOrderData.specimens[0].labOrderSpecimenId;

                                      this.pdfData.fileType = "application/pdf";

                                      var b64 = doc.output('datauristring'); // base64 string
                                
                                      this.pdfData.fileType = "application/pdf";
                                
                                      this.pdfData.fileAsBase64 = b64.replace("data:application/pdf;filename=generated.pdf;base64,", "");
                                
                              
                                      this.labOrderService.saveLabOrderRequestPdf( this.pdfData)
                                            .pipe(first())
                                            .subscribe(
                                            data => {
                                              //console.log("Data",data);
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
                                    });
                                  });
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
    console.log("PDF Show");
    this.labOrderService.getLabOrderRequestPdf( specimenId)
    .pipe(first())
    .subscribe(
    data => {
      console.log("Data",data);
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

  resultPdfClicked(specimenId: number) {
    console.log("Result PDF Show");
    this.labOrderService.getLabOrderResultPdf( specimenId)
    .pipe(first())
    .subscribe(
    data => {
      console.log("Data",data);
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

  loadGPPData(){
    let data = this.labOrderService.loadGPPData(this.labOrderData.specimens[0].tests )
    this.gppData = data; 

  }

  loadUTIData(){
    let data = this.labOrderService.loadUTIData(this.labOrderData.specimens[0].tests )
    this.utiData = data; 
  }

  loadRPPData(){
    let data = this.labOrderService.loadRPPData(this.labOrderData.specimens[0].tests )
    this.rppData = data; 

    if (this.labOrderData.collectionDevice == 1){
      this.rppData.swab = true;
    }
    else{
      this.rppData.saliva = true;
    }
  }

  printBarcodeFromMenu(labOrderId: number){
    this.labOrderService.get(labOrderId )
        .pipe(first())
        .subscribe(
        data => {
          if (data.valid){
            this.labOrderData = data;
            this.printBarcode();
          }
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

    var specimenBarcode = this.labOrderData.specimens[0].specimenBarcode;
    var firstName = this.labOrderData.firstName;
    var lastName = this.labOrderData.lastName;
    var dob = formatDate(this.labOrderData.dob,'MM/dd/yyyy','en');
    var location = this.labOrderData.facilityCode;
    var collectionDate = ""
    if (this.labOrderData.specimens[0].collectionDate == "")
    {
      collectionDate = "Missing";
    }
    else{
      collectionDate = formatDate((this.labOrderData.specimens[0].collectionDate + 'Z').toLocaleString(),'MM/dd/yyyy','en');
    }

    JSPrintManager.auto_reconnect = true;
    JSPrintManager.license_url = "https://www.neodynamic.com/licenses/jspm/v5/genuin-health";
     
    JSPrintManager.start();
    JSPrintManager.WS.onStatusChanged = function () {

      if (JSPrintManager.websocket_status == WSStatus.Open){
        

        //Create a ClientPrintJob
        var cpj = new ClientPrintJob();
        //Set Printer type (Refer to the help, there many of them!)
        var barcodePrinter = sessionStorage.getItem('barcodePrinter');
        var barcodeQty = Number(sessionStorage.getItem('barcodeQty'));
        // console.log("Printer",barcodePrinter);
        cpj.clientPrinter = new InstalledPrinter(barcodePrinter);
        //Set content to print...
        //Create Zebra EPL commands for sample label

        var cmds = "";
        if (barcodePrinter == 'ZDesigner ZD410-203dpi ZPL')
        {
          for (let i = 1;i<=barcodeQty;i++){
          
            cmds += "^XA";
            cmds += "^FO30,20^BY2^BCN,30,Y,N,N,N^FD>:" + specimenBarcode + "^FS";
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
            cmds += "^FO215,20^BY2^BCN,30,Y,N,N,N^FD>:" + specimenBarcode + "^FS";
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
        console.log(cmds);
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
}


