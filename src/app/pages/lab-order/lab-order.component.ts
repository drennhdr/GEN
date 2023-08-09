//Page Name       : Lab Order
//Date Created    : 08/12/2022
//Written By      : Stephen Farkas
//Description     : Lab Order Entry
//MM/DD/YYYY xxx  Description
//09/23/2022 SJF  Added patient signature
//09/27/2022 SJF  Added notes
//10/12/2022 SJF  Added barcode print
//10/12/2022 SJF  Added Accessioning Checkboxes on bottom of page
//10/12/2022 SJF  Added Patient Conscent on file.
//10/26/2022 SJF  Added pdfGPP
//11/02/2022 SJF  Added Get & Save Pdf
//11/29/2022 SJF  Added Delegates
//12/22/2022 SJF  Added Status Modal
//01/10/2023 SJF  Added Oral Tox
//01/13/2023 SJF  Updated Tox Urine to new format
//01/18/2023 SJF  Added insurnace check
//03/14/2023 SJF  When missing checked, clear field
//04/07/2023 SJF  Added DataShareService & check for data change on cancel/exit
//04/17/2023 SJF  Added location check to see if location picked.
//04/18/2023 SJF  Added add function
//04/18/2023 SJF  Added ability to add insurace on new order create
//04/28/2023 SJF  Changed Insurance Type to Workmans Comp check
//04/29/2023 SJF  Changed to new oral tox method
//05/17/2023 SJF  Added date type search
//05/21/2023 SJF  Added Swab location for STI
//05/22/2023 SJF  Added Topaz Signature Capture
//06/06/2023 SJF  Added UnAccession and Edit Processed for CET Mgr
//06/26/2023 SJF  Added printListButtonClicked
//07/09/2023 SJF Removed Norhydrocodone & Noroxycodone
//07/10/2023 SJF Added Billing Review User Type
//07/20/2023 SJF Update for delegate signature on molecular.
//07/21/2023 SJF Added Reviewed Order
//07/24/2023 SJF Added location filter to lab order list for accounts with shared patients.
//07/30/2023 CTB Added export lab orders to CSV, prepare list of requests/results pdf's as single pdf.
//08/03/2023 SJF Added Freeform Medication & Allergy
//08/09/2023 SJF Added include facesheet message and logic
//-----------------------------------------------------------------------------
// Data Passing
//-----------------------------------------------------------------------------

import { Component, ElementRef, OnInit, ViewChild, HostListener } from '@angular/core';
import { catchError, first,switchMap } from 'rxjs/operators';
import SignaturePad from 'signature_pad';
import {formatDate} from '@angular/common';

import { LabOrderService } from '../../services/labOrder.service';
import { PatientService } from '../../services/patient.service';
import { CustomerService } from '../../services/customer.service';
import { LocationService } from '../../services/location.service';
import { UserService } from '../../services/user.service';
import { PhysicianPreferenceService } from '../../services/physicianPreference.service'
import { CodeService } from '../../services/code.service';
import { MedicationService } from '../../services/medication.service';
import { Icd10Service } from '../../services/icd10.service';
import { AllergyService } from '../../services/allergy.service';
import { InsuranceService } from '../../services/insurance.service';
import { PdfGPPService } from '../../services/pdfGPP.service';
import { PdfRPPService } from '../../services/pdfRPP.service';
import { PdfUTISTIService } from '../../services/pdfUTISTI.service';
import { PdfToxUrineService } from '../../services/pdfToxUrine.Service';
import { PdfToxOralService } from '../../services/pdfToxOral.service';
import { DownloadService } from '../../services/download.service';
//import { DatePipe } from '@angular/common'

import jsPDF from 'jspdf';

import { Router } from '@angular/router';

import { PatientModel } from '../../models/PatientModel';
import { LabOrderModel, LabOrderTestItemModel, LabOrderDiagnosisItemModel, LabOrderMedicationItemModel, LabOrderPOCTModel, LabOrderSpecmenItemModel, LabOrderAllergyItemModel, LabOrderListModel, LabOrderListItemModel } from '../../models/LabOrderModel';
import { LabOrderAttachmentModel, LabOrderAttachmentListItemModel, LabOrderPdfModel } from '../../models/LabOrderAttachmentModel';
import { LabOrderNoteModel, LabOrderNoteListItemModel } from '../../models/LabOrderNoteModel';
import { PhysicianPreferenceModel, PhysicianPreferenceTestModel } from '../../models/PhysicianPreferenceModel';
import { ToxModel,AlcoholModel, AntidepressantsModel, AntipsychoticsModel, BenzodiazepinesModel, CannabinoidsModel, CannabinoidsSynthModel, DissociativeModel, GabapentinoidsModel, HallucinogensModel, IllicitModel, OpioidAgonistsModel, OpioidAntagonistsModel, SedativeModel, SkeletalModel, StimulantsModel, GPPModel, UTIModel, RPPModel} from '../../models/LabOrderTestModel';
import { ToxOralModel, OralIllicitModel, OralSedativeModel, OralBenzodiazepinesModel, OralMuscleModel, OralAntipsychoticsModel, OralAntidepressantsModel, OralStimulantsModel, OralKratomModel, OralNicotineModel, OralOpioidAntagonistsModel, OralGabapentinoidsModel, OralDissociativeModel, OralOpioidAgonistsModel} from '../../models/LabOrderTestModel';
//import { isNgTemplate } from '@angular/compiler';
import { Toast } from 'bootstrap';
import { PatientInsuranceModel, PatientInsuranceListItemModel } from '../../models/PatientInsuranceModel';
import { MedicationListModel, MedicationListItemModel } from '../../models/MedicationModel';
import { LocationListItemModel } from '../../models/LocationModel';
import { Icd10ListModel, Icd10ListItemModel } from '../../models/Icd10Model';
import { AllergyListModel, AllergyListItemModel } from '../../models/AllergyModel';
import { CodeItemModel } from '../../models/CodeModel';
import { ThisReceiver } from '@angular/compiler';
import { forkJoin, from, Observable, of, ReplaySubject } from 'rxjs';
import { StatusModalComponent } from '../../modal/status-modal/status-modal.component';
import { IssueModalComponent } from '../../modal/issue-modal/issue-modal.component';
import { AttachmentModalComponent } from '../../modal/attachment-modal/attachment-modal.component';
import { PopupModalComponent } from '../../modal/popup-modal/popup-modal.component';
import { MessageModalComponent } from '../../modal/message-modal/message-modal.component';

import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { ClientPrintJob, InstalledPrinter, JSPrintManager, WSStatus } from 'JSPrintManager';
import { DataShareService } from '../../services/data-share.service';
import { PDFDocument } from 'pdf-lib'
import { UserModel } from '../../models/UserModel';
import { UserSignatureModel } from '../../models/UserSignatureModel';

@Component({
  selector: 'app-lab-order',
  templateUrl: './lab-order.component.html',
  styleUrls: ['./lab-order.component.css']
})
export class LabOrderComponent implements OnInit {

  // Patient Signature
  signaturePad: SignaturePad;
  @ViewChild('canvas') canvasEl: ElementRef;
  signatureImg: string = '';
  p: number = 1;

  // Variables to hold screen data
  customerId: number = 0;
  customerIdLogin: number = 0;
  patientId: number = 0;
  userId: number = 0;
  userType: number = 0;
  searchSignatureListData: any;
  labOrderData: any;
  specimenId: number = 0;
  lastspecimenId: number = 0;
  repeatPrevious: boolean = false;
  patientData: any;
  insuranceData: any;
  noteData: any;
  PrimaryInsurance: string;
  SecondaryInsurance: string;
  physicianList: any;
  locationList: any;
  labList: any;
  poccList: any;
  collectionDate: string;
  collectionTime: string;
  showError: boolean;
  errorMessage: string;
  signature: boolean;
  signatureId: number;
  signatureDelegate: boolean;
  pregnantYes: boolean;
  pregnantNo: boolean;
  checkList: any;
  printLabel: boolean;
  pdfData: any;
  pdfDoc: string;
  delegates: any;
  delegateSearch: boolean;
  delegateSignature: number;

  // Search Data
  searchData: any;
  searchSpecimenId: string;
  searchName: string;
  searchStartDate: string;
  searchEndtDate: string;
  searchLabStatusId: number;
  searchLabTypeId: number;
  corpUser: boolean;
  customerFilter: string = "";

  searchLocationId: number;
  locationSearchList: any;
  showLocationSearch: boolean = false;

  readonly labOrderListStaticHeaders = [
    'Issues', 'Actions'
  ];
  resutlPDFDocument = null;
  @ViewChild('labOrdersList') labOrdersList: ElementRef;
 

  // Patient Search
  patientSearchData: any;
  searchPatientName: string;
  searchCity: string;
  searchDOB: string;
  searchGenderId: number;
  searchMedicalRecordId: string;
  searchActive: boolean;
  searchIsPatient: boolean;
  searchIsEmployee: boolean;
  searchPriority: boolean;
  searchDateTypeId: number;
  searchCount: number = 0;
  locationId: number;

  // Insurance
  customerBillingTypeId: number = 0;
  showAddInsurnace: boolean = true;
  showInsuranceCard: boolean = false;
  insuranceSave: boolean = false;
  insuranceSearchList: any;
  insuranceList: any;
  insuranceTypeList: any;
  PayorSelected: boolean = false;
  workmansComp: boolean;
  genderSearchList: any;

  labStatusList: any;
  labTypeList: any;
  dateTypeList: any;
  missingInsurance: any;

  // Variables to control screen display
  showSearch: boolean;
  showSearchList: boolean;
  showSearchSignatureList: boolean;
  showPatient: boolean;
  showPatientSearch: boolean;
  showPatientSearchList: boolean;
  showSelect: boolean;
  showLabInfo: boolean;
  showPreferences: boolean;
  showPOCC: boolean;
  showPOCCSwitch: boolean;
  showToxUrine: boolean;
  showToxUrinePanel: boolean;
  showToxOral: boolean;
  showToxOralPanel: boolean;
  showGPP: boolean;
  showUTI: boolean;
  showRPP: boolean;
  showICD10: boolean;
  showMeds: boolean;
  showAllergies: boolean;
  showButtons: boolean;
  showLabMessage: boolean;
  showCancel: boolean;
  isPhysician: boolean = false;
  showDonor: boolean;
  showNoteList: boolean;
  showNoteEdit: boolean;
  showNoteAdd: boolean;
  DateError: string = '';

  allowToxUrine: boolean;
  allowToxOral: boolean;
  allowGPP: boolean;
  allowUTI: boolean;
  allowRPP: boolean;
  orderDisabled: Boolean;
  labOrderSave: boolean;

  addMedication: boolean;
  addAllergy: boolean;
  allowFacesheet: boolean;

  // Physician Preferences
  preference1: boolean = false;
  preference1Id: number;
  preference1Text: string;
  preference2: boolean = false;
  preference2Id: number;
  preference2Text: string;
  preference3: boolean = false;
  preference3Id: number;
  preference3Text: string;
  preference4: boolean = false;
  preference4Id: number;
  preference4Text: string;
  preference5: boolean = false;
  preference5Id: number;
  preference5Text: string;
  preference6: boolean = false;
  preference6Id: number;
  preference6Text: string;
  preference7: boolean = false;
  preference7Id: number;
  preference7Text: string;
  preference8: boolean = false;
  preference8Id: number;
  preference8Text: string;

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

  gppData: any;
  utiData: any;
  rppData: any;
  swabLocationList: any;
  swabLocation: number = 0;

  // Medication

  searchMedication: string;
  medicationSearchList: any;
  medicationCurrent: boolean;
  medicationCurrentList: any;
  medicationOrderList: any;
  medicationName: string;

  // Diagnosis

  searchIcd: string;
  icdSearchList: any;
  icdCurrentList: any;
  icdCurrent: boolean;
  icdOrderList: any;

  // Allergy

  searchAllergy: string;
  allergySearchList: any;
  allergyCurrent: boolean;
  allergyCurrentList: any;
  allergyOrderList: any;
  allergyName: string;

  // Attachments
  
  showAttachmentList: boolean = false;
  showAttachmentEdit: boolean = false;
  attachmentData: any;
  attachmentListData: any;
  attachmentTypeList: any;

  attachmentDisabled: boolean;
  attachmentSave: boolean;
  attachmentDoc: string; // This hold the url passed for the ngx-doc-viewer
  attachmentViewer: string;

  fileUploaded:boolean = false;
  fileScanned: boolean = false;

  noteDisabled: boolean;
  noteSave: boolean;

  // Camera Variables
  picWidth = 600; //480;
  picHeight = 800;// 640;

  // Topaz
  topazInstalled: boolean = false;
  topazSignature: string = "";

  imgWidth: number = 400;
  imgHeight: number = 100;

  imageData: string = "";
  interval: any;

  @ViewChild("video")
  public video: ElementRef;

  @ViewChild("canvas")
  public canvas: ElementRef;


  captures: string[] = [];
  error: any;
  isCaptured: boolean = false;
  cameraOn: boolean;

  // Accessioning missing data
  missingPhysician: boolean = false;
  missingLocation: boolean = false;
  missingDate: boolean = false;
  missingTime: boolean = false;
  missingDiagnosis: boolean = false;
  missingSelection: boolean = false;
  dialog: any;
  myModalInfo: any;

  // Modal Dialog
  modalRef: BsModalRef;

  // for label printing
  barcodePrinterSet: boolean = false;

  // For Accessioning
  physicianHardcopy: boolean;
  patientHardcopy: boolean;
  gotoAccession: boolean;
  accessionBarcode: string = "";

  passLabOrderId = 0;

  sortProperty: string = 'id';
  sortOrder = 1;

  constructor(
    private labOrderService: LabOrderService,
    private patientService: PatientService,
    private customerService: CustomerService,
    private locationService: LocationService,
    private physicianPreferenceService: PhysicianPreferenceService,
    private userService: UserService,
    private codeService: CodeService,
    private medicationService: MedicationService,
    private icd10Service: Icd10Service,
    private allergyService: AllergyService,
    private router: Router,
    private modalService: BsModalService,
    private pdfGPPService: PdfGPPService,
    private pdfRPPService: PdfRPPService,
    private pdfUTISTIService: PdfUTISTIService,
    private pdfToxUrineService: PdfToxUrineService,
    private pdfToxOralService: PdfToxOralService,
    private dataShareService: DataShareService,
    private insuranceService: InsuranceService,
    private downloadService: DownloadService
    //private datePipe: DatePipe,
  ) { }

  ngOnInit(): void {
    this.searchPatientName = "";
    this.searchCity = "";
    this.searchDOB = "";
    this.searchGenderId = 0;
    this.searchMedicalRecordId = "";
    this.searchActive = true;
    this.searchIsPatient = true;
    this.searchIsEmployee = false;
    this.searchPriority = false;

    this.dataShareService.changeUnsaved(false);

    if (sessionStorage.getItem('userId_Login') == ""){
      this.router.navigateByUrl('/login');
    }
    this.loadDropdownLists();
    this.delegateSignature = 0;
    this.showCancel = false;
    this.customerIdLogin = Number(sessionStorage.getItem('entityId_Login'));
    
    var filter = sessionStorage.getItem('locationName');
    if (filter == 'All Locations'){
      this.showLocationSearch = true;
      this.loadLocationList();
    }
    else{
      this.showLocationSearch = false;
    }

    if (sessionStorage.getItem('callingFirst') == 'True'){
      sessionStorage.setItem('callingFirst','');
      this.patientId = Number(sessionStorage.getItem('searchPatientId'));
      this.customerId = Number(sessionStorage.getItem('searchCustomerId'));
      this.passLabOrderId =  Number(sessionStorage.getItem('searchOrderId'));
    }
    else if (sessionStorage.getItem('callingScreen') =='laborder'){
      this.customerId = Number(sessionStorage.getItem('entityId_Login'));
      this.searchSpecimenId = sessionStorage.getItem('searchSpecimenId');
      sessionStorage.setItem('searchSpecimenId','');
      this.searchName = sessionStorage.getItem('searchName');
      sessionStorage.setItem('searchName','');
      this.searchStartDate = sessionStorage.getItem('searchStartDate');
      sessionStorage.setItem('searchStartDate','');
      this.searchEndtDate = sessionStorage.getItem('searchEndtDate');
      sessionStorage.setItem('searchEndtDate','');
      this.searchLabStatusId = Number(sessionStorage.getItem('searchLabStatusId'));
      sessionStorage.setItem('searchLabStatusId','');
      this.searchLabTypeId = Number(sessionStorage.getItem('searchLabTypeId'));
      sessionStorage.setItem('searchLabTypeId','');

      sessionStorage.setItem('callingFirst','');
      sessionStorage.setItem('searchSpecimenId', '');
      sessionStorage.setItem('searchName','');
      sessionStorage.setItem('searchStartDate','');
      sessionStorage.setItem('searchEndtDate', '');
      sessionStorage.setItem('searchLabStatusId', '');
      sessionStorage.setItem('searchLabTypeId', '');
      sessionStorage.setItem('searchPatientId','');
    }
    else{
      // This takes care of if the initial call was from patient screen and then user clicked menu button
      sessionStorage.setItem('callingScreen','');
      sessionStorage.setItem('searchPatientId','0');
      sessionStorage.setItem('searchCustomerId','0');
      sessionStorage.setItem('searchOrderId','0');
      sessionStorage.setItem('callingFirst','');
      sessionStorage.setItem('searchSpecimenId', '');
      sessionStorage.setItem('searchName','');
      sessionStorage.setItem('searchStartDate','');
      sessionStorage.setItem('searchEndtDate', '');
      sessionStorage.setItem('searchLabStatusId', '');
      sessionStorage.setItem('searchLabTypeId', '');
      this.customerId = Number(sessionStorage.getItem('entityId_Login'));
    }
    
    this.userId = Number(sessionStorage.getItem('userId_Login'));
    this.userType = Number(sessionStorage.getItem('userType'));
    this.signatureId = Number(sessionStorage.getItem('signatureId'));
    this.locationId = Number(sessionStorage.getItem('locationId'));
    this.delegates = JSON.parse(sessionStorage.getItem('delegate'));

    this.checkList = new Array<CodeItemModel>();

    this.medicationSearchList = new Array<MedicationListItemModel>();
    this.medicationCurrentList =  new Array<MedicationListItemModel>();
    this.medicationCurrent = false;
    this.medicationOrderList = new Array<MedicationListItemModel>();

    this.icdSearchList = new Array<Icd10ListItemModel>();
    this.icdCurrentList = new Array<Icd10ListItemModel>();
    this.icdCurrent = false;
    this.icdOrderList = new Array<Icd10ListItemModel>();

    this.allergySearchList = new Array<AllergyListItemModel>();
    this.allergyCurrentList = new Array<AllergyListItemModel>();
    this.allergyCurrent = false;
    this.allergyOrderList = new Array<AllergyListItemModel>();

    if (Number(sessionStorage.getItem('customerId')) == 0 && (this.userType == 12 || this.userType == 13)){
      this.showSearch = false;
      this.showSearchList = false;
      this.errorMessage = "An account has not been selected";
      this.showError = true;
    }
    else{

      if (sessionStorage.getItem('entityId_Login') == '0'){
        this.corpUser = true;
      }
      else{
        this.corpUser = false;
      }

      this.noteData = new LabOrderNoteModel();
      var barcodePrinter = sessionStorage.getItem('barcodePrinter');
      if (barcodePrinter.length > 0){
        this.barcodePrinterSet = true;
        this.printLabel = true;
      }

      
      if (this.customerId == 0){
        this.customerFilter = sessionStorage.getItem('customerName');
        if (this.customerFilter!="Genesis Reference Labs"){
          this.customerFilter = "(Customer: " + this.customerFilter + ")";
          this.customerId = Number(sessionStorage.getItem('customerId'));
        }
        else{
          this.customerFilter = "";
        }
      }

      this.collectionTime = '';

      this.delegateSearch = false;

      if (this.delegates != null){
        this.delegates.forEach(item => {
          if (item.userId_Delegate == this.userId){
            this.delegateSearch = true;
          }
        });
      }

      if (this.patientId != 0)
      {
        // console.log("From Patient", this.patientId);
        // From patient screen
        this.showSearch = false;
        this.showSearchList = false;
        this.showSearchSignatureList = false;
        this.medicationOrderList = new Array<MedicationListItemModel>();
        this.icdOrderList = new Array<Icd10ListItemModel>();
        this.allergyOrderList = new Array<AllergyListItemModel>();
        this.specimenId = 0;
        this.signature = false;
        this.signatureDelegate = false;
        //this.printLabel = true;
        this.accessionBarcode = "";
        this.loadPatientData();
      }
      else if (this.passLabOrderId > 0){
        // console.log("From LabOrder", this.passLabOrderId);
        this.selectButtonClicked(this.passLabOrderId);
      }
      else if (sessionStorage.getItem('callingScreen') =='laborder'){
        sessionStorage.setItem('callingScreen','');
        if (sessionStorage.getItem('physician') == 'true'){
          this.isPhysician = true;
        }
        
        this.showSearch = true;
        this.searchButtonClicked();
      }
      else{
        // console.log("From Menu");
        // From Menu
        this.showSearch = true;
        this.showSearchList = false;
        this.showSearchSignatureList = false;
        this.showPatient = false;
        this.showSelect = false;
        this.searchSpecimenId = '';
        this.searchName = '';
        const today = new Date();
        var startDate = today.setDate(today.getDate() - 7);
        this.searchStartDate = formatDate(startDate , 'yyyy-MM-dd', 'en');
        this.searchEndtDate = '';
        this.searchLabStatusId = 0;
        this.searchLabTypeId = 99;
        this.printLabel = false;

        if (sessionStorage.getItem('physician') == 'true'){
          this.isPhysician = true;
        }

        if (sessionStorage.getItem('unsigned') == "true"){
          sessionStorage.removeItem('unsigned');
          this.signSearchButtonClicked();
        }

      }
    }

    var isInstalled = document.documentElement.getAttribute('SigPlusExtLiteExtension-installed');
    console.log("IsInstalled", document.documentElement);
    if (!isInstalled) {
    // alert("SigPlusExtLite extension is either not installed or disabled. Please install or enable the extension.");
    // return
    }
    else{
      // alert("SigPlus installed");
      this.topazInstalled = true;

      sessionStorage.setItem('image','');

      this.refreshData();
        this.interval = setInterval(() => { 
            this.refreshData(); 
        }, 5000);
    }
  }

  ngOnDestroy() {
    clearInterval(this.interval);
  }

  @HostListener('document:keyup', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key == 'Enter'){
      if (this.showSearch) {
        this.searchButtonClicked();
      }      
    }
  }

  refreshData(){
    if (sessionStorage.getItem('image') != ''){
      this.topazSignature = "data:image/png;base64," + sessionStorage.getItem('image');
      sessionStorage.setItem('image','');
      clearInterval(this.interval);
      this.labInfoChanged();
    } 
  }



  clearSearchButtonClicked(){
    this.searchSpecimenId = '';
    this.searchName = '';
    const today = new Date();
    var startDate = today.setDate(today.getDate() - 7);
    this.searchStartDate = formatDate(startDate , 'yyyy-MM-dd', 'en');
    this.searchEndtDate = '';
    this.searchLabStatusId = 0;
    this.searchLabTypeId = 99;
    this.searchDateTypeId = 1;
  }

  searchButtonClicked(){
    var locationId = 0;

    if (this.showLocationSearch){
      var locationId = this.searchLocationId;
    }
    else{
      var locationId = Number(sessionStorage.getItem('locationId'));
    }
    
    console.log("LocationId",locationId);
    this.labOrderService.search(this.customerId, locationId, this.searchLabStatusId, 0, 0, this.searchName, this.searchSpecimenId, this.searchLabTypeId, this.searchStartDate, this.searchEndtDate, this.searchDateTypeId )
        .pipe(first())
        .subscribe(
        data => {
          if (data.valid)
          {
            console.log("Lab Orders", data);
            this.searchData = data.list;
            this.showSearchList = true;
            this.showSearchSignatureList = false;
            this.printLabel = false;
            this.searchCount = this.searchData.length;
          }
          else if (data.message == 'No records found'){
            this.searchData = null;
            this.showSearchList = true;
            this.showSearchSignatureList = false;
            this.printLabel = false;
            this.searchCount = 0;
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

  statusModalClicked(specimenBarcode: string){
    const initialState: ModalOptions = {
      initialState: {
        specimenBarcode: specimenBarcode
      }
    };
    this.modalRef = this.modalService.show(StatusModalComponent, {
      initialState 
    });
    this.modalRef.setClass('modal-lg');
  }

  patientClicked(patientId: number){
    sessionStorage.setItem('callingScreen', 'laborder');
    sessionStorage.setItem('callingFirst','false');
    sessionStorage.setItem('searchSpecimenId', this.searchSpecimenId);
    sessionStorage.setItem('searchName',this.searchName);
    sessionStorage.setItem('searchStartDate',this.searchStartDate);
    sessionStorage.setItem('searchEndtDate', this.searchEndtDate);
    sessionStorage.setItem('searchLabStatusId', this.searchLabStatusId.toString());
    sessionStorage.setItem('searchLabTypeId', this.searchLabTypeId.toString());

    sessionStorage.setItem('searchPatientId', patientId.toString());
    // go to patient screen
    this.router.navigateByUrl('/patient');

  }

  issueModalClicked(labOrderId: number){
    var demographicsHold = false;
    if (this.userType == 1 || this.userType == 6 || this.userType == 7 || this.userType == 8){
      this.searchData.forEach(item => {
        if (item.labOrderId == labOrderId){
          demographicsHold = item.demographicsHold;
        }
      });
    }

    const initialState: ModalOptions = {
      initialState: {
        labOrderId: labOrderId,
        demographicsHold: demographicsHold
      }
    };
    

    this.modalRef = this.modalService.show(IssueModalComponent, {
      initialState 
    });

    this.modalRef.content.onClose.subscribe(result => {
      if (result > 0){
        this.searchData.forEach(item => {
          if (item.labOrderId = labOrderId){
            item.demographicsHold = 0;
          }
        });
      }
    });
  }

  attachmentModalClicked(labOrderId: number, patientId: number){
    const initialState: ModalOptions = {
      initialState: {
        labOrderId: labOrderId,
        patientId: patientId,
        // class: 'modal-lg',
      }
    };
    this.modalRef = this.modalService.show(AttachmentModalComponent, {
      initialState 
    });
    this.modalRef.setClass('modal-lg');
  }


  signSearchButtonClicked(){
    this.labOrderService.searchSignature(this.userId )
        .pipe(first())
        .subscribe(
        data => {
          //console.log(data);
          if (data.valid)
          {
            this.checkList = new Array<CodeItemModel>();
            this.searchSignatureListData = data.list;
            this.showSearchSignatureList = true;
            this.showSearchList = false;
            this.printLabel = false;
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

  signSearchButton2Clicked(){
    this.labOrderService.searchDelegate(this.userId )
        .pipe(first())
        .subscribe(
        data => {
          //console.log(data);
          if (data.valid)
          {
            this.checkList = new Array<CodeItemModel>();
            this.searchSignatureListData = data.list;
            this.showSearchSignatureList = true;
            this.showSearchList = false;
            this.printLabel = false;
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

  onAllSignatureChange(isChecked: boolean){
    this.checkList = new Array<CodeItemModel>();
    if (isChecked){
      for (let item of this.searchSignatureListData){
        item.checked = true;

        var item2 = new CodeItemModel();
        item2.id = item.labOrderId;
        this.checkList.push(item2)
      }
    }
    else{
      for (let item of this.searchSignatureListData){
        item.checked = false;
      }
    }
  }

  onSignatureChange(labOrderId: number, isChecked: boolean){
    if (isChecked){
      var item = new CodeItemModel();
      item.id = labOrderId;
      
      this.checkList.push(item)
    }
    else{
      var index = 0;
      for (let item of this.checkList){
        if (item.id == labOrderId){
          this.checkList.splice(index, 1)
          break;
        }
        index++;
      }
    }
  }

  signButtonClicked(){
    if (this.checkList.length > 0)
    {
      var labOrderId = this.checkList[0].id;
      // Remove this item from list
      this.checkList.splice(0, 1)
      this.selectButtonClicked(labOrderId);
    }

  }

  esignButtonClicked(){
    if (this.checkList.length > 0)
    {
      var signatureId = this.signatureId;
      if (this.delegateSearch){
        signatureId = -1;
      }
      // console.log("Batch eSign");
      this.labOrderService.eSign( this.checkList, signatureId)
        .pipe(first())
        .subscribe(
        data => {
          if (data.valid) {
            // Loop through orders and regenerate PDF's
            this.checkList.forEach(item => {
              this.orderPdfRegenerate(item.id);
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
   

      this.cancelButtonClicked();
    }

  }

  addLabOrderButtonClicked(){
    this.showSearch = false;
    this.showSearchList = false;
    this.showPatientSearch = true;
    this.showPatientSearchList = true;
    sessionStorage.setItem('image','');
    this.topazSignature = "";
    this.searchPatientButtonClicked();
  }

  clearPatientSearchButtonClicked(){
    this.searchPatientName = "";
    this.searchCity = "";
    this.searchDOB = "";
    this.searchGenderId = 0;
    this.searchMedicalRecordId = "";
    this.searchActive = true;
    this.searchIsPatient = true;
    this.searchIsEmployee = false;
    this.searchPriority = false;
  }

  cancelPatientButtonClicked(){
    this.showSearch = true;
    this.showSearchList = true;
    this.showPatientSearch = false;
    this.showPatientSearchList = false;
  }

  searchPatientButtonClicked(){
    this.showError = false;
    
    var locationId = Number(sessionStorage.getItem('locationId'));

    this.patientService.search(  this.customerId,
                                  locationId,
                                  this.searchPatientName,
                                  this.searchCity,
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
                    this.showError = true;
                    this.errorMessage = "No records found";
                }
                else{
                    this.showError = false;
                    this.errorMessage = "";
                }
              }
              else if (data.message == "No records found")
              {
                this.errorMessage = "No records found";
                this.showError = true;
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

  addOrderButtonClicked(patientId: number){
    this.patientId = patientId;
    this.showPatientSearch = false;
    this.showPatientSearchList = false;
    this.showSearchSignatureList = false;
    this.medicationOrderList = new Array<MedicationListItemModel>();
    this.icdOrderList = new Array<Icd10ListItemModel>();
    this.allergyOrderList = new Array<AllergyListItemModel>();
    this.specimenId = 0;
    this.signature = false;
    this.signatureDelegate = false;
    //this.printLabel = true;
    this.accessionBarcode = "";
    sessionStorage.setItem('image','');
    this.topazSignature = "";
    this.loadPatientData();
    this.labOrderData.userSignatureId_Physician = 0;
    this.labOrderData.patientSignatureId = 0;
    // Position screen
    var elmnt = document.getElementById("topOfScreen");
    elmnt.scrollIntoView();
  }


  selectButtonClicked(labOrderId: number){
    this.delegateSignature = 0;
    this.medicationSearchList = new Array<MedicationListItemModel>();
    this.medicationCurrentList =  new Array<MedicationListItemModel>();
    this.medicationCurrent = false;
    this.medicationOrderList = new Array<MedicationListItemModel>();
    this.medicationName = "";
    this.icdSearchList = new Array<Icd10ListItemModel>();
    this.icdCurrentList = new Array<Icd10ListItemModel>();
    this.icdCurrent = false;
    this.icdOrderList = new Array<Icd10ListItemModel>();
    this.allergySearchList = new Array<AllergyListItemModel>();
    this.allergyCurrentList = new Array<AllergyListItemModel>();
    this.allergyCurrent = false;
    this.allergyOrderList = new Array<AllergyListItemModel>();
    this.allergyName = "";
    this.showCancel = false;
    sessionStorage.setItem('image','');
    this.topazSignature = "";

    this.labOrderService.get(labOrderId )
        .pipe(first())
        .subscribe(
        data => {
          if (data.valid)
          {
            this.patientId = data.patientId;
            this.labOrderData = data;

            this.PrimaryInsurance = this.labOrderData.primaryInsurance;
            this.SecondaryInsurance = this.labOrderData.secondaryInsurance;
            this.specimenId = this.labOrderData.specimens[0].labOrderSpecimenId;
            if (this.labOrderData.specimens[0].collectionDate == null){
              this.collectionDate = null;
              this.collectionTime = null;
              this.missingDate = true;
              this.missingTime = true;
            }
            else{

              var localDate = new Date(this.labOrderData.specimens[0].collectionDate + 'Z');

              this.collectionDate = formatDate(localDate, 'yyyy-MM-dd', 'en');
              this.collectionTime = formatDate(localDate, 'HH:mm', 'en');

            }
            if (this.labOrderData.locationId == 0){
              this.missingLocation = true;
            }

            if (this.labOrderData.userId_Physician == 0){
              this.missingPhysician = true;
            }

            this.missingSelection = this.labOrderData.specimens[0].missingSelection;
            this.accessionBarcode = this.labOrderData.specimens[0].specimenBarcode;

            if (this.labOrderData.userSignatureId_Physician == -1){
              this.physicianHardcopy = true;
            }
            if (this.labOrderData.patientSignatureId == -1){
              this.patientHardcopy = true;
            }

            this.pregnantYes = false;
            this.pregnantNo = false;
            if (this.labOrderData.isPregnant == 1){
              this.pregnantYes = true;
            }
            if (this.labOrderData.isPregnant == 2){
              this.pregnantNo = true;
            }
            this.showSearch = false;
            this.showSearchList = false;
            this.showSearchSignatureList = false;

            this.showPatient = true;
            this.showAddInsurnace = false;
            this.showInsuranceCard = false;
            this.showSelect = false;
            this.showLabInfo = true;
            this.showPreferences = false;
            this.showPOCC = this.labOrderData.poctScreen;

            this.showToxUrine = false;
            this.showToxUrinePanel = false;
            this.showToxOral = false;
            this.showToxOralPanel = false;
            this.showGPP = false;
            this.showUTI = false;
            this.showRPP = false;
            this.showICD10 = true;
            this.showMeds = false;
            this.showAllergies = false;
            this.showLabMessage = false;
            this.showNoteAdd = true;

        

            // Load Patient Data

            this.patientService.getForLabOrder( this.patientId)
                .pipe(first())
                .subscribe(
                data => {
                  if (data.valid)
                  {             
                    this.patientId = data.patientId;

                    this.errorMessage = "";
                    this.showError = false;
                    this.patientData = data;
                  }
                });

            if (this.labOrderData.specimens[0].labTypeId == 0){
              this.showSelect = true;
              this.showICD10 = false;
              this.patientData = new PatientModel();
              this.patientData.labOrderSpecimenId_ToxUrine = 0;
              this.patientData.labOrderSpecimenId_ToxOral = 0;
              this.patientData.labOrderSpecimenId_RPP = 0;
              this.patientData.labOrderSpecimenId_UTISTI = 0;
              this.patientData.labOrderSpecimenId_GPP = 0;
            }
            else if (this.labOrderData.specimens[0].labTypeId == 1){
              this.loadToxData(this.labOrderData.specimens[0].tests);
              this.showToxUrine = true;
              this.showToxUrinePanel = true;
              this.showMeds = true;
            }
            else if (this.labOrderData.specimens[0].labTypeId == 2){
              this.loadToxOralData(this.labOrderData.specimens[0].tests);
              this.showToxOral = true;
              this.showToxOralPanel = true;
              this.showMeds = true;
            }
            else if (this.labOrderData.specimens[0].labTypeId == 3){
              this.gppData = new GPPModel();
              this.loadGPPData();
              this.showGPP = true;
            }
            else if (this.labOrderData.specimens[0].labTypeId == 4){
              this.utiData = new UTIModel();
              this.loadUTIData();
              this.showUTI = true;
              this.showAllergies = true;
            }
            else if (this.labOrderData.specimens[0].labTypeId == 5){
              this.rppData = new RPPModel();
              this.loadRPPData();
              this.showRPP = true;
            }
            this.donerSignature();
            this.showButtons = true;
            this.labOrderSave = false;
            
            //  Set the edit ability based on user type and status
            if (this.userType==9 || this.userType==10 || this.userType==11)
            {
              // Disable for sales.
              this.orderDisabled = true;
            }
            else if (this.labOrderData.specimens[0].labStatusId < 20){
              this.orderDisabled = false;
            }
            else if (this.labOrderData.specimens[0].labStatusId < 30 && (this.userType == 6 || this.userType == 7 || this.userType == 8)){
              // Accessioning - CET
              this.orderDisabled = false;
            } 
            else if (this.labOrderData.specimens[0].labStatusId < 50 && this.userType == 8){
              // CET Manager
              this.showLabMessage = true;
              this.orderDisabled = false;
            } 
            else{
              this.orderDisabled = true; 
            }
            
            // Cancel order button
            if (this.labOrderData.specimens[0].labStatusId < 20 && (this.userType == 2 || this.userType == 3 || this.userType == 7 || this.userType == 8 || this.userType == 12 || this.userType == 13)){
              this.showCancel = true;
            }

            if (this.userType == 1 || this.userType == 6 || this.userType == 7 || this.userType == 8){
              this.showAttachmentList = true;
              this.labOrderService.getLabOrderAttachmentList(this.labOrderData.labOrderId)
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
                      });
            }

            if (this.labOrderData.medications != null){
              for (let item of this.labOrderData.medications){
                var med = new MedicationListItemModel();
                med.medicationId = item.medicationId;
                med.description = item.description;
                this.medicationOrderList.push(med);
              }
            }

            if (this.labOrderData.diagnosis != null){
              for (let item of this.labOrderData.diagnosis){
                var diag = new Icd10ListItemModel();
                diag.icD10Code = item.code;
                diag.description = item.description;
                this.icdOrderList.push(diag);
              }
            }

            if (this.labOrderData.allergies != null){
              for (let item of this.labOrderData.allergies){
                var allergy = new AllergyListItemModel();
                allergy.allergyId = item.allergyId;
                allergy.description = item.description;
                this.allergyOrderList.push(allergy);
              }
            }

            //if (this.labOrderData.notes != null && this.userType != 2 && this.userType != 3){
            if (this.userType != 2 && this.userType != 3){
              this.showNoteList = true;
            }
            else{
              this.showNoteList = false;
            }
        
            // Position Screen
            var elmnt = document.getElementById("topOfScreen");
            elmnt.scrollIntoView();

            // Load the dropdown info for physicians & locations
            this.loadCustomerData(this.labOrderData.customerId);


            if (this.labOrderData.userSignatureId_Physician > 0){
              // Already Signed, do not show option to sign.
              this.signatureId = 0;
              this.delegateSignature = 0;
              this.signature = true;
            }
            else{
              // Not signed yet
              this.signature = false;
              // Check if delegate user.
              if (this.delegates != null){
                this.delegates.forEach( (item) =>{
                  if(this.labOrderData.userId_Physician = item.userId){
                    this.userService.GetUserSignatureId(this.labOrderData.userId_Physician)
                        .pipe(first())
                        .subscribe(
                        data => {
                          if (data.valid)
                          {
                            this.delegateSignature = Number(data.id);
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
                });
              }
            }

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

  addInsuranceButtonClicked(){
    this.showInsuranceCard = true;
    this.insuranceData = new PatientInsuranceModel();
    this.insuranceData.patinetInsuranceId = 0;
    this.insuranceData.patientId = this.patientId
    this.insuranceData.insuranceId = -1;
    this.insuranceData.active = true;
    this.insuranceSave = false;
    this.PayorSelected = false;
    this.showSelect = false;
    this.workmansComp = false;

    this.codeService.getList( 'InsuranceType,Insurance' )

    .pipe(first())
    .subscribe(
        data => {
          if (data.valid)
          {
            this.insuranceTypeList = data.list0;
            this.insuranceList = data.list1;
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

  saveInsuranceButtonClicked(){
    this.showInsuranceCard = false;
    this.showSelect = true;

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
                                    this.showInsuranceCard = false;
                                    this.showSelect = true;
                                    this.loadPatientData();
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
    this.showInsuranceCard = false;
    this.showSelect = true;
  }

  insuranceChanged(){
    this.insuranceSave = false;
    if (this.insuranceData.insuranceId == 0){
      if (this.insuranceData.insuranceName != "" && this.insuranceData.memberId !=""){
        this.insuranceSave = true;
      }
    }
    else if(this.insuranceData.insuranceId > 0){
      if (this.insuranceData.memberId !=""){
        this.insuranceSave = true;
      }
    }
    this.dataShareService.changeUnsaved(true);
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

  loadPatientData(){
    // Call the patient service to get the data for the selected patient
    this.patientService.getForLabOrder( this.patientId)
            .pipe(first())
            .subscribe(
            data => {
              if (data.valid)
              {              
                this.patientId = data.patientId;

                this.errorMessage = "";
                this.showError = false;
                this.patientData = data;
                this.labOrderData = new LabOrderModel();
                this.labOrderData.patientSignatureId = 0;
                this.labOrderData.specimens = new Array<LabOrderSpecmenItemModel>();
                this.labOrderData.specimens[0] = new LabOrderSpecmenItemModel();
                this.labOrderData.specimens[0].labOrderSpecimentId = 0;
                this.labOrderData.specimens[0].tests = new Array<LabOrderTestItemModel>(); 
                this.labOrderData.medications = Array<LabOrderMedicationItemModel>();
                this.labOrderData.diagnosis = new Array<LabOrderDiagnosisItemModel>();
                this.labOrderData.poct = new LabOrderPOCTModel();

                this.labOrderData.patientId = this.patientId;
                this.labOrderData.lastName =  this.patientData.lastName;
                this.labOrderData.firstName = this.patientData.firstName;
                this.labOrderData.dob = this.patientData.dob;
                this.labOrderData.genderId = this.patientData.genderId;
                this.labOrderData.billingTypeId = this.patientData.billingTypeId;
                this.labOrderData.selfPay = this.patientData.selfPay;
                this.labOrderData.contractPay = this.patientData.contractPay;
                this.labOrderData.customerId = this.patientData.customerId;
                if (this.patientData.conscentOnFile > 0){
                  this.labOrderData.patientConsentOnFile = true;
                }

                this.labOrderData.patientInsuranceId_Primary = -1;
                this.labOrderData.patientInsuranceId_Secondary = -1;
                if (this.patientData.insurances == null){
                  this.patientData.insurances = new Array<PatientInsuranceListItemModel>();
                }
                else{
                  this.patientData.insurances.forEach( (item) =>{
                    if (item.sequence == 1){
                      this.labOrderData.patientInsuranceId_Primary = item.insuranceId;
                      this.PrimaryInsurance = item.insurance;
                    }
                    else if(item.sequence == 2){
                      this.labOrderData.patientInsuranceId_Secondary = item.insuranceId;
                      this.SecondaryInsurance = item.insurance;
                    }
                  });
                }

                this.showPatient = true;
                this.showAddInsurnace = true;
                this.showInsuranceCard = false;
                this.showSelect = true;
                this.showLabInfo = false;
                this.showPreferences = false;
                this.showPOCC = false;
                this.showPOCCSwitch = false;
                this.showToxUrine = false;
                this.showToxUrinePanel = false;
                this.showToxOral = false;
                this.showToxOralPanel = false;
                this.showGPP = false;
                this.showUTI = false;
                this.showRPP = false;
                this.showICD10 = false;
                this.showMeds = false;
                this.showAllergies = false;
                
                if (this.userType ==6 && this.labOrderData.laborderid > 0){
                  this.showNoteList = true;
                  this.showNoteAdd = true;
                }
              
                this.labOrderSave = false;

                this.loadCustomerData(this.labOrderData.customerId);
                    

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

  loadCustomerData(customerId: number){
    this.errorMessage = "";
    this.showError = false;
    // Call the customer service to get the data for the selected customer
    this.customerService.get(customerId)
            .pipe(first())
            .subscribe(
            data => {
              //console.log("Customer",data);
              if (data.valid)
              {
                this.allowToxUrine = data.service_ToxUrine;
                this.allowToxOral = data.service_ToxOral;
                this.allowGPP = data.service_GPP;
                this.allowUTI = data.service_UTISTI;
                this.allowRPP = data.service_RPP;
                var allowSelfPay = data.allowSelfPay;
                var requireInsurance = data.requireInsurance;
                this.customerBillingTypeId = data.customerBillingTypeId;
                this.missingInsurance = true;
                this.allowFacesheet = data.facesheetAddress;

                if (this.labOrderData.labOrderId == 0){
                  this.labOrderData.facilityCode = data.facilityCode;

                  // console.log("Facility Code",this.labOrderData.facilityCode)
                }

                //console.log("Patient Info", this.patientData);
                
                // Make sure that if insurance is required that there is insurnace
                if (this.labOrderData.labOrderId == 0){
                  if (!requireInsurance){
                    this.missingInsurance = false;
                  }
                  if (this.customerBillingTypeId == 1 || this.customerBillingTypeId == 2){
                    // Reference Agreement or Contract Pay
                    this.missingInsurance = false;
                  }
                  else if (allowSelfPay && this.labOrderData.selfPay){
                    this.missingInsurance = false;
                  }
                  else if ((this.customerBillingTypeId == 3) &&  this.labOrderData.contractPay){
                    // Insurance/Contract Pay
                    this.missingInsurance = false;
                  }
                  else if (this.labOrderData.patientInsuranceId_Primary > -1 || this.labOrderData.patientInsuranceId_Secondary > -1 ) {
                    this.missingInsurance = false;
                  }
                  else if (this.patientData.scholarship || this.patientData.hardship){
                    this.missingInsurance = false;
                  }
                }
                else{
                  this.missingInsurance = false;
                }
                

                if (this.missingInsurance){
                  this.errorMessage = "Insurance must be defined for this patient before an order can be created.";
                  this.showError = true;
                  this.showSelect = false;
                }
                else{

                  // Load Location Data
                  var userId = 0 ;
                  
                  // if (this.labOrderData.labOrderId > 0){
                  //   userId = this.labOrderData.userId_Physician;  // Order already created
                  // }
                  // else 
                  
                  if (this.customerIdLogin > 0) {
                    userId = this.userId; // New Order
                  }

                  if (userId > 0){
                    this.locationService.search(userId)
                          .pipe(first())
                          .subscribe(
                          data => {
                            if (data.valid)
                            {
    
                              var location = sessionStorage.getItem('locationName');
                              if (location == 'All Locations'){
                                this.locationList = data.list;
                                if (this.locationList.length == 1){
                                  // If there is only 1 location, default to that location.
                                  this.labOrderData.locationId = this.locationList[0].id;
                                }
                              }
                              else{
                                this.locationList = new Array(LocationListItemModel);
                                this.locationList[0].locationId = Number(sessionStorage.getItem('locationId'));
                                this.locationList[0].locationName = location;
                                this.labOrderData.locationId = Number(sessionStorage.getItem('locationId'));
                              }
                              
                              
                              
                              // Load Physician Data
                              this.userService.search(customerId, '','',true, false)
                                      .pipe(first())
                                      .subscribe(
                                      data => {
                                        if (data.valid)
                                        {
                                          this.physicianList = data.list;
                                          // if there is only 1 physician - default
                                          if (this.physicianList.length == 1){
                                            this.labOrderData.userId_Physician = this.physicianList[0].userId;
                                          }
                                          // If physician logged in, default to physician
                                          this.physicianList.forEach( (item) =>{
                                            if (item.userId == this.userId){
                                              this.labOrderData.userId_Physician = this.userId;
                                              //this.physicianSelected();
                                            }
                                          });


                                          // All loaded move to next section
                                          this.preference1Text = "";
                                          this.preference2Text = "";
                                          this.preference3Text = "";
                                          this.preference4Text = "";
                                          this.preference5Text = "";
                                          this.preference6Text = "";
                                          this.preference7Text = "";
                                          this.preference8Text = "";

                                          this.loadPatientMedicationList();
                                          this.loadPatientIcdList();
                                          this.loadPatientAllergyList();                                      
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
                  else{
                    var location = sessionStorage.getItem('locationName');
                    if (location == ""){
                      location = 'All Locations';
                    }
                    // console.log("Location",location);
                    if (location == 'All Locations'){
                      this.locationList = data.locations;
                      if (this.locationList.length == 1  && this.labOrderData.labOrderId == 0){
                        // If there is only 1 location, default to that location.
                        this.labOrderData.locationId = this.locationList[0].id;
                      }
                    }
                    else{
                      this.locationList = new Array(LocationListItemModel);
                      this.locationList[0].locationId = Number(sessionStorage.getItem('locationId'));
                      this.locationList[0].locationName = location;
                      this.labOrderData.locationId = Number(sessionStorage.getItem('locationId'));
                    }
                    // Load Physician Data
                    this.userService.search(customerId, '','',true,false)
                            .pipe(first())
                            .subscribe(
                            data => {
                              if (data.valid)
                              {
                                this.physicianList = data.list;
                                // if there is only 1 physician - default
                                if (this.physicianList.length == 1){
                                  this.labOrderData.userId_Physician = this.physicianList[0].userId;
                                }

                                // All loaded move to next section
                                this.preference1Text = "";
                                this.preference2Text = "";
                                this.preference3Text = "";
                                this.preference4Text = "";
                                this.preference5Text = "";
                                this.preference6Text = "";
                                this.preference7Text = "";
                                this.preference8Text = "";

                                this.loadPatientMedicationList();
                                this.loadPatientIcdList();
                                this.loadPatientAllergyList();                                      
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

  missingPhysicianClicked(){
    if (this.missingPhysician){
      this.labOrderData.userId_Physician = null;
    }
    this.labInfoChanged();
  }

  locationSelected(){
    this.missingLocation = false;
    this.labInfoChanged();
  }
  
  missingLocationClicked(){
    if (this.missingLocation){
      this.labOrderData.locationId = null;
    }
    this.labInfoChanged();
  }

  missingDateClicked(){
    if (this.missingDate){
      this.collectionDate = null;
    }
    this.labInfoChanged();
  }

  timeSelected(){
    this.missingTime = false;
    this.labInfoChanged();
  }

  missingTimeClicked(){
    if (this.missingTime){
      this.collectionTime = null;
    }
    this.labInfoChanged();
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
    this.swabLocation = this.labOrderData.specimens[0].swabLocationId;
  }

  loadRPPData(){
    let data = this.labOrderService.loadRPPData(this.labOrderData.specimens[0].tests )
    this.rppData = data; 

    if (this.labOrderData.specimens[0].collectionDeviceId == 3){
      this.rppData.swab = true;
    }
    else{
      this.rppData.saliva = true;
    }
  }

  labMessageButtonClicked(){
    this.showLabMessage = false;
    this.orderDisabled = false;
  }

  holdButtonClicked(){
    this.labOrderData.specimens[0].labTypeId = 0;
    this.showSelect = false;
    this.orderDisabled = false;
    this.showLabInfo = true;
    this.showPreferences = false;
    this.showToxUrine = false;
    this.showToxUrinePanel = false;
    this.showToxOral = false;
    this.showToxOralPanel = false;
    this.showGPP = false;
    this.showUTI = false;
    this.showRPP = false;
    this.showICD10 = false;
    this.showMeds = false;
    this.showAllergies = false;
    this.showButtons = true;
    this.showPOCC = false;
    this.showPOCCSwitch = false;

    this.donerSignature();
  }

  toxUrineButtonClicked(){
    this.showAddInsurnace = false;
    this.labOrderData.specimens[0].labTypeId = 1;
    this.labOrderData.specimens[0].version = "2022.11";
    this.lastspecimenId = this.patientData.labOrderSpecimenId_ToxUrine;

    const today = new Date();
    var startDate = today.setDate(today.getDate())
    this.collectionDate = formatDate(startDate , 'yyyy-MM-dd', 'en');
    this.collectionTime = formatDate(startDate , 'HH:mm', 'en');

    this.toxUrineConfirmationPanel = false;
    this.toxUrineFullPanel = false;
    this.toxUrineTargetReflexPanel = false;
    this.toxUrineUniversalReflexPanel = false;
    this.toxUrineCustomPanel = false;
    this.presumptiveTesting15 = false;
    this.presumptiveTesting13 = false;
    this.alcohol = new AlcoholModel();
    this.antidepressants = new AntidepressantsModel();
    this.antipsychotics = new AntipsychoticsModel();
    this.benzodiazepines = new BenzodiazepinesModel();
    this.cannabinoids = new CannabinoidsModel();
    this.cannabinoidsSynth = new CannabinoidsSynthModel();
    this.dissociative = new DissociativeModel();
    this.gabapentinoids = new  GabapentinoidsModel();
    this.hallucinogens = new HallucinogensModel();
    this.illicit = new IllicitModel();
    this.kratom = false;
    this.opioidAgonists = new OpioidAgonistsModel();
    this.opioidAntagonists = new OpioidAntagonistsModel();
    this.sedative = new SedativeModel();
    this.skeletal  = new SkeletalModel();
    this.stimulants = new StimulantsModel()
    this.thcSource = false;
    this.showSelect = false;
    this.orderDisabled = false;
    this.showLabInfo = true;
    this.showPreferences = true;
    this.showToxUrine = true;
    this.showToxUrinePanel = true;
    this.showToxOral = false;
    this.showToxOralPanel = false;
    this.showGPP = false;
    this.showUTI = false;
    this.showRPP = false;
    this.showICD10 = true;
    this.showMeds = true;
    this.showAllergies = false;
    this.showButtons = true;
    this.showPOCC = false;
    this.showPOCCSwitch = true;

    this.duplicateCheck();
  
    this.physicianSelected();
    this.donerSignature();
    if (this.userType ==6 || this.userType == 7 || this.userType == 8 ){
      this.showNoteList = true;
      this.showNoteAdd = true;
    }
    else{
      this.showNoteList = false;
    }
  }

  toxOralButtonClicked(){
    this.showAddInsurnace = false;
    this.labOrderData.specimens[0].labTypeId = 2;
    this.labOrderData.specimens[0].version = "2023.01";
    this.lastspecimenId = this.patientData.labOrderSpecimenId_ToxOral;

    const today = new Date();
    var startDate = today.setDate(today.getDate())
    this.collectionDate = formatDate(startDate , 'yyyy-MM-dd', 'en');
    this.collectionTime = formatDate(startDate , 'HH:mm', 'en');

    this.presumptiveTesting15 = false;
    this.presumptiveTesting13 = false;
    
    this.oralIllicit = new OralIllicitModel();
    this.oralSedative = new OralSedativeModel();
    this.oralBenzodiazepines = new OralBenzodiazepinesModel();
    this.oralMuscle = new OralMuscleModel();
    this.oralAntipsychotics = new OralAntipsychoticsModel();
    this.oralAntidepressants = new OralAntidepressantsModel();
    this.oralStimulants = new OralStimulantsModel();
    this.oralKratom = new OralKratomModel();
    this.oralNicotine = new OralNicotineModel();
    this.oralOpioidAntagonists = new OralOpioidAntagonistsModel();
    this.oralGabapentinoids = new OralGabapentinoidsModel();
    this.oralDissociative = new OralDissociativeModel();
    this.oralOpioidAgonists = new OralOpioidAgonistsModel();

    this.showSelect = false;
    this.orderDisabled = false;
    this.showLabInfo = true;
    this.showPreferences = true;
    this.showToxUrine = false;
    this.showToxUrinePanel = false;
    this.showToxOral = true;
    this.showToxOralPanel = true;
    this.showGPP = false;
    this.showUTI = false;
    this.showRPP = false;
    this.showICD10 = true;
    this.showMeds = true;
    this.showAllergies = false;
    this.showButtons = true;
    this.showPOCC = false;
    this.showPOCCSwitch = true;
    this.duplicateCheck();
    this.physicianSelected();
    this.donerSignature();
    if (this.userType ==6 || this.userType == 7 || this.userType == 8 ){
      this.showNoteList = true;
      this.showNoteAdd = true;
    }
    else{
      this.showNoteList = false;
    }
  }

  gppButtonClicked(){
    this.showAddInsurnace = false;
    this.labOrderData.specimens[0].labTypeId = 3;
    this.labOrderData.specimens[0].version = "2022.11";
    this.lastspecimenId = this.patientData.labOrderSpecimenId_GPP;

    const today = new Date();
    var startDate = today.setDate(today.getDate())
    this.collectionDate = formatDate(startDate , 'yyyy-MM-dd', 'en');
    this.collectionTime = formatDate(startDate , 'HH:mm', 'en');

    this.gppData = new GPPModel();

    this.showSelect = false;
    this.orderDisabled = false;
    this.showLabInfo = true;
    this.showPreferences = false;
    this.showToxUrine = false;
    this.showToxUrinePanel = false;
    this.showToxOral = false;
    this.showToxOralPanel = false;
    this.showGPP = true;
    this.showUTI = false;
    this.showRPP = false;
    this.showICD10 = true;
    this.showMeds = false;
    this.showAllergies = false;
    this.showButtons = true;
    this.showPOCC = false;
    this.showPOCCSwitch = false;
    this.duplicateCheck();
    this.donerSignature();
    if (this.userType ==6 || this.userType == 7 || this.userType == 8 ){
      this.showNoteList = true;
      this.showNoteAdd = true;
    }
    else{
      this.showNoteList = false;
    }
  }

  rppButtonClicked(){
    this.showAddInsurnace = false;
    this.labOrderData.specimens[0].labTypeId = 5;
    this.labOrderData.specimens[0].version = "2022.11";
    this.lastspecimenId = this.patientData.labOrderSpecimenId_RPP;

    const today = new Date();
    var startDate = today.setDate(today.getDate())
    this.collectionDate = formatDate(startDate , 'yyyy-MM-dd', 'en');
    this.collectionTime = formatDate(startDate , 'HH:mm', 'en');

    this.rppData = new RPPModel();
    this.rppData.swab = true;

    this.showSelect = false;
    this.orderDisabled = false;
    this.showLabInfo = true;
    this.showPreferences = false;
    this.showToxUrine = false;
    this.showToxUrinePanel = false;
    this.showToxOral = false;
    this.showToxOralPanel = false;
    this.showGPP = false;
    this.showUTI = false;
    this.showRPP = true;
    this.showICD10 = true;
    this.showMeds = false;
    this.showAllergies = false;
    this.showButtons = true;
    this.showPOCC = false;
    this.showPOCCSwitch = false;
    this.duplicateCheck();
    this.donerSignature();
    if (this.userType ==6 || this.userType == 7 || this.userType == 8 ){
      this.showNoteList = true;
      this.showNoteAdd = true;
    }
    else{
      this.showNoteList = false;
    }
  }

  utiButtonClicked(){
    this.showAddInsurnace = false;
    this.labOrderData.specimens[0].labTypeId = 4;
    this.labOrderData.specimens[0].version = "2022.11";
    this.lastspecimenId = this.patientData.labOrderSpecimenId_UTISTI;
    this.utiData = new UTIModel();

    const today = new Date();
    var startDate = today.setDate(today.getDate())
    this.collectionDate = formatDate(startDate , 'yyyy-MM-dd', 'en');
    this.collectionTime = formatDate(startDate , 'HH:mm', 'en');

    this.showSelect = false;
    this.orderDisabled = false;
    this.showLabInfo = true;
    this.showPreferences = false;
    this.showToxUrine = false;
    this.showToxUrinePanel = false;
    this.showToxOral = false;
    this.showToxOralPanel = false;
    this.showGPP = false;
    this.showUTI = true;
    this.showRPP = false;
    this.showICD10 = true;
    this.showMeds = false;
    this.showAllergies = true;
    this.showButtons = true;
    this.showPOCC = false;
    this.showPOCCSwitch = false;
    this.utiData.urine = true; // Default to urine
    this.duplicateCheck();
    this.donerSignature();
    if (this.userType ==6 || this.userType == 7 || this.userType == 8 ){
      this.showNoteList = true;
      this.showNoteAdd = true;
    }
    else{
      this.showNoteList = false;
    }
  }

  donerSignature(){
    if (!this.topazInstalled){
      // Cutomer login, not yet signed and no conscent on file
      if ((this.userType == 2 || this.userType == 3) && this.labOrderData.patientSignatureId == 0 && !this.labOrderData.patientConsentOnFile){
        this.showDonor = true;

        this.signaturePad = new SignaturePad(this.canvasEl.nativeElement);
      }
    }
    else{
      this.showDonor = true;
    }
  }

  cancelButtonClicked(){
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
      this.showCancel = false;
      if (this.gotoAccession){
        sessionStorage.setItem('barcode',this.labOrderData.specimens[0].specimenBarcode);
        this.router.navigateByUrl('/accessioning');
      }
      else if (sessionStorage.getItem('callingScreen') == "patient"){
        // go back to patient screen
        this.router.navigateByUrl('/patient');
      }
      else if (sessionStorage.getItem('callingScreen') == "inbox"){
        // go back to inbox screen
        this.router.navigateByUrl('/inbox');
      }
      else if (sessionStorage.getItem('callingScreen') == "dashboard"){
        // go back to dashboard screen
        this.router.navigateByUrl('/dashboard');
      }
      else{
        sessionStorage.setItem('image','');
        this.topazSignature = "";
        // go back to order list
        this.showSearch = true;
        this.showSearchList = true;
        this.showSearchSignatureList = false;

        this.showPatient = false;
        this.showInsuranceCard = false;
        this.showSelect = false;
        this.orderDisabled = false;
        this.showLabInfo = false;
        this.showPreferences = false;
        this.showPOCC = false;
        this.showToxUrine = false;
        this.showToxUrinePanel = false;
        this.showToxOral = false;
        this.showToxOralPanel = false;
        this.showGPP = false;
        this.showUTI = false;
        this.showRPP = false;
        this.showICD10 = false;
        this.showMeds = false;
        this.showAllergies = false;
        this.showButtons = false;
        this.showLabMessage = false;
        this.showAttachmentList = false;
        this.showNoteList = false;
        this.showNoteEdit = false;
        this.showDonor = false;
        if (this.signaturePad != null){
          this.signaturePad.clear();
        }
        this.signatureImg = "";

        this.preference1Text = "";
        this.preference2Text = "";
        this.preference3Text = "";
        this.preference4Text = "";
        this.preference5Text = "";
        this.preference6Text = "";
        this.preference7Text = "";
        this.preference8Text = "";
        this.printLabel = false;
        this.physicianHardcopy = false;
        this.patientHardcopy = false;
        this.gotoAccession = false;

        this.labOrderData.userId_Physician = 0;
        this.labOrderData.locationId = 0;

        if (this.checkList.length > 0){
          this.signButtonClicked()
        }
        else{
          // Postion screen
          var elmnt = document.getElementById("topOfScreen");
          elmnt.scrollIntoView();
        }
      }
    }
  }

  backButtonClicked(){
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
      this.showCancel = false;
      if (sessionStorage.getItem('callingScreen') != "patient"){
        this.cancelButtonClicked();
      }
      else if (sessionStorage.getItem('callingScreen') == "inbox"){
        // go back to inbox screen
        this.router.navigateByUrl('/inbox');
      }
      else if (this.checkList.length > 0){
        this.signButtonClicked()
      }
      else{
        this.showSelect = true;
        this.orderDisabled = false;
        this.showLabInfo = false;
        this.showPreferences = false;
        this.showPOCC = false;
        this.showToxUrine = false;
        this.showToxUrinePanel = false;
        this.showToxOral = false;
        this.showToxOralPanel = false;
        this.showGPP = false;
        this.showUTI = false;
        this.showRPP = false;
        this.showICD10 = false;
        this.showMeds = false;
        this.showAllergies = false;
        this.showButtons = false;
        this.showAttachmentList = false;
        this.showDonor = false;
        if (this.signaturePad != null){
          this.signaturePad.clear();
        }
        this.signatureImg = "";

        this.preference1Text = "";
        this.preference2Text = "";
        this.preference3Text = "";
        this.preference4Text = "";
        this.preference5Text = "";
        this.preference6Text = "";
        this.preference7Text = "";
        this.preference8Text = "";

        this.labOrderData.userId_Physician = 0;
        this.labOrderData.locationId = 0;
        this.delegateSignature = 0;

        // Postion screen
        var elmnt = document.getElementById("patientCard");
        elmnt.scrollIntoView();
      }
    }
  }

  labInfoChanged(){
    this.labOrderSave = false;
    var testChecked = false;
    if (this.labOrderData.specimens[0].labTypeId == 0){
      testChecked = true;
    }
    if (this.labOrderData.specimens[0].labTypeId == 1){
      if (this.presumptiveTesting15 ||
        this.presumptiveTesting13 ||
        this.illicit.full ||
        this.illicit.amphetamine ||
        this.illicit.cocaine ||
        this.illicit.heroin ||
        this.illicit.mdma ||
        this.illicit.methamphetamine ||
        this.illicit.pcp ||
        this.alcohol.full ||
        this.alcohol.etg ||
        this.alcohol.ets ||
        this.alcohol.nicotine ||
        this.cannabinoids.full ||
        this.cannabinoids.cbd ||
        this.cannabinoids.thc ||
        this.cannabinoidsSynth.full ||
        this.cannabinoidsSynth.adb ||
        this.cannabinoidsSynth.mdmb ||
        this.cannabinoidsSynth.mdmb5f ||
        this.opioidAgonists.full ||
        this.opioidAgonists.codeine ||
        this.opioidAgonists.dihydrocodeine ||
        this.opioidAgonists.hydrocodone ||
        this.opioidAgonists.norhydrocodone ||
        this.opioidAgonists.hydromorphone ||
        this.opioidAgonists.morphine ||
        this.opioidAgonists.dextromethorphan ||
        this.opioidAgonists.levorphanol ||
        this.opioidAgonists.meperidine ||
        this.opioidAgonists.oxycodone ||
        this.opioidAgonists.oxymorphone ||
        this.opioidAgonists.noroxycodone ||
        this.opioidAgonists.tramadol ||
        this.opioidAgonists.tapentadol ||
        this.opioidAgonists.fentanyl ||
        this.opioidAgonists.norfentanyl ||
        this.opioidAgonists.acetylfentanyl ||
        this.opioidAgonists.carfentanil ||
        this.opioidAgonists.norcarfentanil ||
        this.opioidAgonists.fluorofentanyl ||
        this.opioidAgonists.buprenorphine ||
        this.opioidAgonists.norbuprenorphine ||
        this.opioidAgonists.methadone ||
        this.opioidAgonists.eddp ||
        this.opioidAgonists.isotonitazene ||
        this.opioidAgonists.tianeptine ||
        this.opioidAntagonists.full ||
        this.opioidAntagonists.naloxone ||
        this.opioidAntagonists.nalmefene ||
        this.opioidAntagonists.naltrexone ||   
        this.skeletal.full ||
        this.skeletal.baclofen ||
        this.skeletal.carisoprodol ||
        this.skeletal.cyclobenzaprine ||
        this.skeletal.meprobamate ||
        this.skeletal.methocarbamol ||
        this.skeletal.tizanidine || 
        this.hallucinogens.full ||
        this.hallucinogens.lsd ||
        // this.hallucinogens.psilocybin ||  
        this.gabapentinoids.full ||
        this.gabapentinoids.gabapentin ||
        this.gabapentinoids.pregabalin || 
        this.antipsychotics.full ||
        this.antipsychotics.aripiprazole ||
        this.antipsychotics.haloperidol || 
        this.antipsychotics.lurasidone ||
        this.antipsychotics.olanzapine || 
        this.antipsychotics.quetiapine ||
        this.antipsychotics.risperidone ||   
        this.antipsychotics.ziprasidone ||  
        this.benzodiazepines.full ||
        this.benzodiazepines.alprazolam ||
        this.benzodiazepines.chlordiazepoxide ||
        this.benzodiazepines.clonazepam ||
        this.benzodiazepines.clonazolam ||
        this.benzodiazepines.etizolam ||
        this.benzodiazepines.flualprazolam ||
        this.benzodiazepines.lorazepam ||
        this.benzodiazepines.midazolam ||
        this.benzodiazepines.oxazepam ||
        this.benzodiazepines.temazepam ||
        this.benzodiazepines.triazolam ||
        this.sedative.full ||
        this.sedative.butalbital ||
        this.sedative.phenibut ||
        this.sedative.xylazine || 
        this.sedative.zolpidem ||
        this.sedative.zopiclone ||
        this.antidepressants.full ||
        this.antidepressants.amitriptyline ||
        this.antidepressants.doxepin ||
        this.antidepressants.imipramine ||
        this.antidepressants.mirtazapine ||
        this.antidepressants.citalopram ||
        this.antidepressants.duloxetine ||
        this.antidepressants.fluoxetine ||
        this.antidepressants.paroxetine ||
        this.antidepressants.sertraline ||
        this.antidepressants.bupropion ||
        this.antidepressants.trazodone ||
        this.antidepressants.venlafaxine ||
        this.antidepressants.vortioxetine ||
        this.stimulants.full ||
        this.stimulants.benzylone || 
        this.stimulants.eutylone ||
        this.stimulants.mda ||
        this.stimulants.methylphenidate ||
        this.stimulants.phentermine ||
        this.dissociative.full ||
        this.dissociative.ketamine ||
        this.dissociative.pcp

      )
      testChecked = true;
    }
    else if (this.labOrderData.specimens[0].labTypeId == 2){
      if (this.oralIllicit.full ||
        this.oralIllicit.mam6 ||
        this.oralIllicit.amphetamine ||
        this.oralIllicit.methamphetamine ||
        this.oralIllicit.benzoylecgonine ||
        this.oralIllicit.mdma ||
        this.oralIllicit.pcp ||
        this.oralIllicit.thc ||
        this.oralSedative.full ||
        this.oralSedative.zolpidem ||
        this.oralSedative.butalbital ||
        this.oralBenzodiazepines.full ||
        this.oralBenzodiazepines.alprazolam ||
        this.oralBenzodiazepines.diazepam ||
        this.oralBenzodiazepines.clonazepam ||
        this.oralBenzodiazepines.aminoclonazepam ||
        this.oralBenzodiazepines.nordiazepam ||
        this.oralBenzodiazepines.lorazepam ||
        this.oralBenzodiazepines.oxazepam ||
        this.oralBenzodiazepines.temazepam ||
        this.oralMuscle.full ||
        this.oralMuscle.baclofen ||
        this.oralMuscle.carisoprodol ||
        this.oralMuscle.cyclobenzaprine ||     
        this.oralMuscle.meprobamate || 
        this.oralMuscle.methocarbamol ||
        this.oralAntipsychotics.aripiprazole ||
        this.oralAntipsychotics.quetiapine ||
        this.oralAntipsychotics.risperidone ||
        this.oralAntipsychotics.ziprasidone ||
        this.oralAntidepressants.full ||
        this.oralAntidepressants.amitriptyline ||
        this.oralAntidepressants.citalopram ||
        this.oralAntidepressants.fluoxetine ||
        this.oralAntidepressants.nortriptyline ||
        this.oralAntidepressants.paroxetine ||
        this.oralAntidepressants.sertraline ||
        this.oralAntidepressants.venlafaxine ||
        this.oralAntidepressants.desmethylvenlafaxine ||
        this.oralAntidepressants.mirtazapine ||
        this.oralAntidepressants.trazodone ||
        this.oralStimulants.full ||
        this.oralStimulants.methylphenidate ||
        this.oralStimulants.ritalinicAcid || 
        this.oralStimulants.mda ||
        this.oralStimulants.phentermine ||
        this.oralKratom.full ||
        this.oralKratom.mitragynine ||  
        this.oralNicotine.full ||
        this.oralNicotine.cotinine ||
        this.oralOpioidAntagonists.full ||
        this.oralOpioidAntagonists.naloxone ||
        this.oralOpioidAntagonists.naltrexone ||
        this.oralGabapentinoids.full ||
        this.oralGabapentinoids.gabapentin ||
        this.oralGabapentinoids.pregabalin ||
        this.oralDissociative.full ||
        this.oralDissociative.ketamine ||
        this.oralDissociative.norketamine || 
        this.oralOpioidAgonists.full ||
        this.oralOpioidAgonists.buprenorphine ||
        this.oralOpioidAgonists.norbuprenorphine ||
        this.oralOpioidAgonists.codeine ||
        this.oralOpioidAgonists.dextromethorphan ||
        this.oralOpioidAgonists.hydrocodone ||
        // this.oralOpioidAgonists.norhydrocodone ||
        this.oralOpioidAgonists.hydromorphone ||
        this.oralOpioidAgonists.fentanyl ||
        this.oralOpioidAgonists.norfentanyl ||
        this.oralOpioidAgonists.methadone ||
        this.oralOpioidAgonists.eddp ||
        this.oralOpioidAgonists.morphine ||
        this.oralOpioidAgonists.oxycodone ||
        // this.oralOpioidAgonists.noroxycodone ||
        this.oralOpioidAgonists.oxymorphone ||
        this.oralOpioidAgonists.tapentadol ||
        this.oralOpioidAgonists.tramadol
      )
      testChecked = true;
    }
    else if (this.labOrderData.specimens[0].labTypeId == 3){
      // GPP
      if (this.gppData.gastrointestinal ||
          this.gppData.helicobacter){
            testChecked = true;
          }
    }
    else if (this.labOrderData.specimens[0].labTypeId == 4){
      // UTI
      if (this.utiData.uCommon ||
          this.utiData.uUncommon ||
          this.utiData.uSTILeukorrhea ||
          this.utiData.uYeast ||
          this.utiData.uAdditional ||
          this.utiData.sSTI ||
          this.utiData.sBacterialVaginosis ||
          this.utiData.sYeast ||
          this.utiData.sEmerging
          ){
            testChecked = true;
        }
    }
    else if (this.labOrderData.specimens[0].labTypeId == 5){
      // RPP
      if (this.rppData.viralTargets ||
          this.rppData.bacterialTargets ||
          this.rppData.covidOnly ||
          this.rppData.covidThenReflux ||
          this.rppData.covidPlusModerate ||
          this.rppData.moderateAssessment){
            testChecked = true;
        }
    }
    if (testChecked){
      // Turn off no items selected
      this.missingSelection = false;
    }
    else if (this.missingSelection){
      testChecked = true;
    }

    var signatureGood = true;
    if (this.userId == this.labOrderData.userId_Physician && this.signatureId > 0){
      if (!this.signature){
        signatureGood = false;
      }
    }
    var poccGood = true;
    if (this.labOrderData.poctScreen 
      && this.labOrderData.poct.pocResultId_AMP < 1
      && this.labOrderData.poct.pocResultId_BAR < 1
      && this.labOrderData.poct.pocResultId_BUP < 1
      && this.labOrderData.poct.pocResultId_BZO < 1
      && this.labOrderData.poct.pocResultId_COC < 1
      && this.labOrderData.poct.pocResultId_MDMA < 1
      && this.labOrderData.poct.pocResultId_MET < 1
      && this.labOrderData.poct.pocResultId_MTD < 1
      && this.labOrderData.poct.pocResultId_OPI < 1
      && this.labOrderData.poct.pocResultId_OXY < 1
      && this.labOrderData.poct.pocResultId_PCP < 1
      && this.labOrderData.poct.pocResultId_TCA < 1
      && this.labOrderData.poct.pocResultId_THC < 1 ){
      poccGood = false;
    }
    if (testChecked && (this.labOrderData.userId_Physician > 0 || this.missingPhysician)
      && (this.labOrderData.locationId > 0 || this.missingLocation)
      && (this.collectionDate != '' || this.missingDate)
      && (this.collectionTime != '' || this.missingTime)
      && signatureGood && poccGood
      && (!this.showMeds || (this.showMeds && this.medicationOrderList.length > 0 || this.labOrderData.noMeds || this.labOrderData.medicationNotProvided))
      && (!this.showICD10 || (this.showICD10 && this.icdOrderList.length > 0) || this.missingDiagnosis)
      && (!this.showAllergies || (this.showAllergies && this.allergyOrderList.length > 0) || this.labOrderData.noAllergy)) {
      this.labOrderSave = true;
    }
    this.dataShareService.changeUnsaved(true);
  }

  physicianSelected(){
  this.delegateSignature = 0;
  this.missingPhysician = false;

  // Clear any old data
  this.preference1Text = "";
  this.preference2Text = "";
  this.preference3Text = "";
  this.preference4Text = "";
  this.preference5Text = "";
  this.preference6Text = "";
  this.preference7Text = "";
  this.preference8Text = "";
  // Call the physician preference service to get the data for the selected physician
  this.physicianPreferenceService.search(this.labOrderData.userId_Physician, this.labOrderData.customerId, this.labOrderData.specimens[0].labTypeId )
        .pipe(first())
        .subscribe(
        data => {
          // console.log(data);
          if (data.valid)
          {
            var prefs = data.list;
            var cntr = 1;
            prefs.forEach( (item) =>{
              if (cntr == 1){
                this.preference1Id = item.physicianPreferenceId;
                this.preference1Text = item.name;
              }
              else if (cntr == 2){
                this.preference2Id = item.physicianPreferenceId;
                this.preference2Text = item.name;
              }
              else if (cntr == 3){
                this.preference3Id = item.physicianPreferenceId;
                this.preference3Text = item.name;
              }
              else if (cntr == 4){
                this.preference4Id = item.physicianPreferenceId;
                this.preference4Text = item.name;
              }
              else if (cntr == 5){
                this.preference5Id = item.physicianPreferenceId;
                this.preference5Text = item.name;
              }
              else if (cntr == 6){
                this.preference6Id = item.physicianPreferenceId;
                this.preference6Text = item.name;
              }
              else if (cntr == 7){
                this.preference7Id = item.physicianPreferenceId;
                this.preference7Text = item.name;
              }
              else if (cntr == 8){
                this.preference8Id = item.physicianPreferenceId;
                this.preference8Text = item.name;
              }
              cntr++;
            });
            this.labInfoChanged();
          }

          if (this.delegates != null){
            this.delegates.forEach( (item) =>{
              if(this.labOrderData.userId_Physician == item.userId){
                this.userService.GetUserSignatureId(this.labOrderData.userId_Physician)
                    .pipe(first())
                    .subscribe(
                    data => {
                      if (data.valid)
                      {
                        this.delegateSignature = Number(data.id);
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
            });
          }

        },
        error => {
        this.errorMessage = error;
        });
  }

  physicianPreference(preference: number){
    if (this.labOrderData.specimens[0].labTypeId == 1){
      this.toxUrineFullPanel = false;
      this.toxUrineConfirmationPanel = false;
      this.toxUrineTargetReflexPanel = false;
      this.toxUrineUniversalReflexPanel = false;
      this.toxUrineCustomPanel = false;
      this.repeatPrevious = false;
      this.presumptiveTesting15 = false;
      this.presumptiveTesting13 = false;
      this.alcohol.full = false;
      this.antidepressants.full = false;
      this.antipsychotics.full = false;
      this.benzodiazepines.full = false;
      this.cannabinoids.full = false;
      this.cannabinoidsSynth.full = false;
      this.dissociative.full = false;
      this.gabapentinoids.full = false;
      this.hallucinogens.full = false;
      this.illicit.full = false;
      this.kratom = false;
      this.opioidAgonists.full = false;
      this.opioidAntagonists.full = false;
      this.sedative.full = false;
      this.skeletal.full = false;
      this.stimulants.full = false;
      this.thcSource = false;

      this.alcoholUChanged(false);
      this.antidepressantsUChanged(false);
      this.antipsychoticsUChanged(false);
      this.benzodiazepinesUChanged(false);
      this.cannabinoidsUChanged(false);
      this.cannabinoidsSynthUChanged(false);
      this.dissociativeUChanged(false);
      this.gabapentinoidsUChanged(false);
      this.hallucinogensUChanged(false);
      this.illicitUChanged(false);
      this.opioidAgonistsUChanged(false);
      this.opioidAntagonistsUChanged(false);
      this.sedativeUChanged(false);
      this.skeletalUChanged(false);
      this.stimulantsUChanged(false);
    }
    else{

      // console.log("Oral");
      this.toxOralFullPanel = false;
      this.repeatPrevious = false;
      this.oralIllicit.full = false;
      this.oralSedative.full = false;
      this.oralBenzodiazepines.full = false;
      this.oralMuscle.full = false;
      this.oralAntipsychotics = false;
      this.oralAntidepressants.full = false;
      this.oralStimulants.full = false;
      this.oralKratom.full = false;
      this.oralNicotine.full = false;
      this.oralOpioidAntagonists.full = false;
      this.oralGabapentinoids.full = false;
      this.oralDissociative.full = false;
      this.oralOpioidAgonists.full = false;
      
      this.oralIllicit = new OralIllicitModel();
      this.oralSedative = new OralSedativeModel();
      this.oralBenzodiazepines = new OralBenzodiazepinesModel();
      this.oralMuscle = new OralMuscleModel();
      this.oralAntipsychotics = new OralAntipsychoticsModel();
      this.oralAntidepressants = new OralAntidepressantsModel();
      this.oralStimulants = new OralStimulantsModel();
      this.oralKratom = new OralKratomModel();
      this.oralNicotine = new OralNicotineModel();
      this.oralOpioidAntagonists = new OralOpioidAntagonistsModel();
      this.oralGabapentinoids = new OralGabapentinoidsModel();
      this.oralDissociative = new OralDissociativeModel();
      this.oralOpioidAgonists = new OralOpioidAgonistsModel();
    }

    var preferenceId:number = 0;
    var cked: boolean = false;
    if (preference == 1){
      cked = this.preference1;
      preferenceId = this.preference1Id;
      this.preference2 = false;
      this.preference3 = false;
      this.preference4 = false;
      this.preference5 = false;
      this.preference6 = false;
      this.preference7 = false;
      this.preference8 = false;
    }
    else if (preference == 2){
      cked = this.preference2;
      preferenceId = this.preference2Id;
      this.preference1 = false;
      this.preference3 = false;
      this.preference4 = false;
      this.preference5 = false;
      this.preference6 = false;
      this.preference7 = false;
      this.preference8 = false;
    }
    else if (preference == 3){
      cked = this.preference3;
      preferenceId = this.preference3Id;
      this.preference1 = false;
      this.preference2 = false;
      this.preference4 = false;
      this.preference5 = false;
      this.preference6 = false;
      this.preference7 = false;
      this.preference8 = false;
    }
    else if (preference == 4){
      cked = this.preference4;
      preferenceId = this.preference4Id;
      this.preference1 = false;
      this.preference2 = false;
      this.preference3 = false;
      this.preference5 = false;
      this.preference6 = false;
      this.preference7 = false;
      this.preference8 = false;
    }
    else if (preference == 5){
      cked = this.preference5;
      preferenceId = this.preference5Id;
      this.preference1 = false;
      this.preference2 = false;
      this.preference3 = false;
      this.preference4 = false;
      this.preference6 = false;
      this.preference7 = false;
      this.preference8 = false;
    }
    else if (preference == 6){
      cked = this.preference6;
      preferenceId = this.preference6Id;
      this.preference1 = false;
      this.preference2 = false;
      this.preference3 = false;
      this.preference4 = false;
      this.preference5 = false;
      this.preference7 = false;
      this.preference8 = false;
    }
    else if (preference == 7){
      cked = this.preference7;
      preferenceId = this.preference7Id;
      this.preference1 = false;
      this.preference2 = false;
      this.preference3 = false;
      this.preference4 = false;
      this.preference5 = false;
      this.preference6 = false;
      this.preference8 = false;
    }
    else if (preference == 8){
      cked = this.preference8;
      preferenceId = this.preference8Id;
      this.preference1 = false;
      this.preference2 = false;
      this.preference3 = false;
      this.preference4 = false;
      this.preference5 = false;
      this.preference6 = false;
      this.preference7 = false;
    }
    
    if (cked){
    // Call the physician preference service to get the data for the selected physician preference
      this.physicianPreferenceService.get(preferenceId )
            .pipe(first())
            .subscribe(
            data => {

              // console.log("Preference",data);
              if (data.valid)
              {
                if (this.labOrderData.specimens[0].labTypeId == 1){
                  this.loadToxData(data.tests);
                }
                else{
                  this.loadToxOralData(data.tests);
                }      
                this.labInfoChanged();    
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
  }

  duplicateCheck(){
    //  Check to make sure that only 1 lab order for each type can be ordered on a single day.
    var ck = Number(this.collectionDate.substring(0,4));
    if (ck >= 2023){
      this.DateError = '';
      this.missingDate = false;
      if(!this.labOrderData.selfPay && !this.labOrderData.contractPay){
        this.labOrderService.checkForDuplicate(this.labOrderData.patientId, this.labOrderData.specimens[0].labTypeId, this.collectionDate )
                .pipe(first())
                .subscribe(
                data => {
                  if (data.valid)
                  {  
                    if (data.id == "0" || parseInt(data.id) == this.labOrderData.labOrderId){
                      this.labInfoChanged();
                    }
                    else{
                      this.DateError = "There is already a lab order for this lab type for " + formatDate(new Date(this.collectionDate + ':08:00') , 'MM-dd-yyyy', 'en');
                      this.collectionDate = null;
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
        else{
          this.labInfoChanged();
      }
    }
  }

  repeatPreviousTest(){
    if (this.labOrderData.specimens[0].labTypeId == 1){
      // Clear out test check boxes
      this.toxUrineFullPanel = false;
      this.toxUrineConfirmationPanel = false;
      this.toxUrineTargetReflexPanel = false;
      this.toxUrineUniversalReflexPanel = false;
      this.toxUrineCustomPanel = false;

      this.preference1 = false;
      this.preference2 = false;
      this.preference3 = false;
      this.preference4 = false;
      this.preference5 = false;
      this.preference6 = false;
      this.preference7 = false;
      this.preference8 = false;

      this.presumptiveTesting15 = false;
      this.presumptiveTesting13 = false;
      this.alcohol.full = false;
      this.antidepressants.full = false;
      this.antipsychotics.full = false;
      this.benzodiazepines.full = false;
      this.cannabinoids.full = false;
      this.cannabinoidsSynth.full = false;
      this.dissociative.full = false;
      this.gabapentinoids.full = false;
      this.hallucinogens.full = false;
      this.illicit.full = false;
      this.kratom = false;
      this.opioidAgonists.full = false;
      this.opioidAntagonists.full = false;
      this.sedative.full = false;
      this.skeletal.full = false;
      this.stimulants.full = false;
      this.thcSource = false;

      this.alcoholUChanged(false);
      this.antidepressantsUChanged(false);
      this.antipsychoticsUChanged(false);
      this.benzodiazepinesUChanged(false);
      this.cannabinoidsUChanged(false);
      this.cannabinoidsSynthUChanged(false);
      this.dissociativeUChanged(false);
      this.gabapentinoidsUChanged(false);
      this.hallucinogensUChanged(false);
      this.illicitUChanged(false);
      this.opioidAgonistsUChanged(false);
      this.opioidAntagonistsUChanged(false);
      this.sedativeUChanged(false);
      this.skeletalUChanged(false);
      this.stimulantsUChanged(false);
    }
    else{
      // Clear out test check boxes


      this.preference1 = false;
      this.preference2 = false;
      this.preference3 = false;
      this.preference4 = false;
      this.preference5 = false;
      this.preference6 = false;
      this.preference7 = false;
      this.preference8 = false;

      this.toxOralFullPanel = false;
      this.repeatPrevious = false;
      this.oralIllicit.full = false;
      this.oralSedative.full = false;
      this.oralBenzodiazepines.full = false;
      this.oralMuscle.full = false;
      this.oralAntipsychotics = false;
      this.oralAntidepressants.full = false;
      this.oralStimulants.full = false;
      this.oralKratom.full = false;
      this.oralNicotine.full = false;
      this.oralOpioidAntagonists.full = false;
      this.cannabinoidsSynth.full = false;
      this.oralGabapentinoids.full = false;
      this.oralDissociative.full = false;
      this.oralOpioidAgonists.full = false;
      
      this.oralIllicit = new OralIllicitModel();
      this.oralSedative = new OralSedativeModel();
      this.oralBenzodiazepines = new OralBenzodiazepinesModel();
      this.oralMuscle = new OralMuscleModel();
      this.oralAntipsychotics = new OralAntipsychoticsModel();
      this.oralAntidepressants = new OralAntidepressantsModel();
      this.oralStimulants = new OralStimulantsModel();
      this.oralKratom = new OralKratomModel();
      this.oralNicotine = new OralNicotineModel();
      this.oralOpioidAntagonists = new OralOpioidAntagonistsModel();
      this.oralGabapentinoids = new OralGabapentinoidsModel();
      this.oralDissociative = new OralDissociativeModel();
      this.oralOpioidAgonists = new OralOpioidAgonistsModel();
    }
    if (this.repeatPrevious){
      // Call the lab order service to get the data for the last lab order
        this.labOrderService.getTestsForSpecimen(this.lastspecimenId )
              .pipe(first())
              .subscribe(
              data => {
                if (data.valid)
                {
                  if (this.labOrderData.specimens[0].labTypeId == 1){
                    this.loadToxData(data.tests);
                  }
                  else{
                    this.loadToxOralData(data.tests);
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
  }

  poccChanged(){
    if (this.labOrderData.poctScreen){
      // console.log("POCT", this.labOrderData.poct.pocResultId_AMP);
      this.showPOCC = true;
      if (this.labOrderData.poct.pocResultId_AMP == 0){
        this.labOrderData.poct.pocResultId_AMP = 3;
        this.labOrderData.poct.pocResultId_BAR = 3;
        this.labOrderData.poct.pocResultId_BUP = 3;
        this.labOrderData.poct.pocResultId_BZO = 3;
        this.labOrderData.poct.pocResultId_COC = 3;
        this.labOrderData.poct.pocResultId_MDMA = 3;
        this.labOrderData.poct.pocResultId_MET = 3;
        this.labOrderData.poct.pocResultId_MTD = 3;
        this.labOrderData.poct.pocResultId_OPI = 3;
        this.labOrderData.poct.pocResultId_OXY = 3;
        this.labOrderData.poct.pocResultId_PCP = 3;
        this.labOrderData.poct.pocResultId_TCA = 3;
        this.labOrderData.poct.pocResultId_THC = 3;
        this.labOrderData.poct.pocResultId_FEN = 3;
      }
    }
    else{
      this.showPOCC = false;
    }
    this.labInfoChanged();
  }

  utiChanged(option: number){
    if (option == 0){
      if (this.utiData.urine){
        this.utiData.swab = false;
        this.utiData.sSTI = false;
        this.utiData.sBacterialVaginosis = false;
        this.utiData.sYeast = false;
        this.utiData.sEmerging = false;
        this.utiCommonChecked();
        this.utiUncommenChecked();
        this.utiSTILeukorrheaChecked();
        this.utiYeast1Checked();
        this.utiAdditionalChecked();
      }
      else{
        this.utiData.swab = true;
        this.utiData.uCommon = false;
        this.utiData.uUncommon = false;
        this.utiData.uSTILeukorrhea = false;
        this.utiData.uYeast = false;
        this.utiData.uAdditional = false;
        this.utiSTIChecked();
        this.utiBacterialVaginosisChecked();
        this.utiYeast2Checked();
        this.utiEmergingChecked();
        if (this.swabLocation == 0){
          this.swabLocation = 1;
        }
      }
    }
    else{
      if (this.utiData.swab == true){
        this.utiData.urine = false;
        this.utiData.uCommon = false;
        this.utiData.uUncommon = false;
        this.utiData.uSTILeukorrhea = false;
        this.utiData.uYeast = false;
        this.utiData.uAdditional = false;
        this.utiCommonChecked();
        this.utiUncommenChecked();
        this.utiSTILeukorrheaChecked();
        this.utiYeast1Checked();
        this.utiAdditionalChecked();
        if (this.swabLocation == 0){
          this.swabLocation = 1;
        }
      }
      else{
        this.utiData.urine = true;
        this.utiData.sSTI = false;
        this.utiData.sBacterialVaginosis = false;
        this.utiData.sYeast = false;
        this.utiData.sEmerging = false;
        this.utiSTIChecked();
        this.utiBacterialVaginosisChecked();
        this.utiYeast2Checked();
        this.utiEmergingChecked();
      }
    }
    this.labInfoChanged();
  }

  utiCommonChecked() {
    if (this.utiData.uCommon){
      this.utiData.uEnterococcusFaecalis = true;
      this.utiData.uEscherichiacoli = true;
      this.utiData.uKlebsiellaPneumoniae = true;
      this.utiData.uStaphylococcussaprophyticus = true;
      this.utiData.uStreptococcusAgalactiae = true;
    }
    else{
      this.utiData.uEnterococcusFaecalis = false;
      this.utiData.uEscherichiacoli = false;
      this.utiData.uKlebsiellaPneumoniae = false;
      this.utiData.uStaphylococcussaprophyticus = false;
      this.utiData.uStreptococcusAgalactiae = false;
    }
    this.labInfoChanged();
  }

  utiUncommenChecked(){
    if (this.utiData.uUncommon){
      this.utiData.uEnterobacterCloacae = true;
      this.utiData.uEnterococcusFaecium = true;
      this.utiData.uGardnerellaVaginalis = true;
      this.utiData.uKlebsiellaOxytoca = true;
      this.utiData.uMycoplasmaHominis = true;
      this.utiData.uProteusMirabilis = true;
      this.utiData.uPseudomonasAeruginosa = true;
      this.utiData.uSerratiaMarcescens = true;
      this.utiData.uStaphylococcusAureus = true;   
    }
    else{
      this.utiData.uEnterobacterCloacae = false;
      this.utiData.uEnterococcusFaecium = false;
      this.utiData.uGardnerellaVaginalis = false;
      this.utiData.uKlebsiellaOxytoca = false;
      this.utiData.uMycoplasmaHominis = false;
      this.utiData.uProteusMirabilis = false;
      this.utiData.uPseudomonasAeruginosa = false;
      this.utiData.uSerratiaMarcescens = false;
      this.utiData.uStaphylococcusAureus = false;   
    }
    this.labInfoChanged();
  }

  utiSTILeukorrheaChecked(){
    if (this.utiData.uSTILeukorrhea){
      this.utiData.uChlamydiaTrachomatis = true;
      this.utiData.uSGardnerellaVaginalis = true;
      this.utiData.uMycoplasmaGenitalium = true;
      this.utiData.uSMycoplasmaHominis = true;
      this.utiData.uNeisseriaGonorrhoeae = true;
      this.utiData.uTrichomonasVaginalis = true;
      this.utiData.uUreaplasmaUrealyticum = true;
    }
    else{
      this.utiData.uChlamydiaTrachomatis = false;
      this.utiData.uSGardnerellaVaginalis = false;
      this.utiData.uMycoplasmaGenitalium = false;
      this.utiData.uSMycoplasmaHominis = false;
      this.utiData.uNeisseriaGonorrhoeae = false;
      this.utiData.uTrichomonasVaginalis = false;
      this.utiData.uUreaplasmaUrealyticum = false;
    }
    this.labInfoChanged();
  }

  utiYeast1Checked(){
    if (this.utiData.uYeast){
      this.utiData.uYeast = true;
      this.utiData.uCandidaAlbicans = true;
      this.utiData.uCandidaAuris = true;
      this.utiData.uCandidaGlabrata = true;
      this.utiData.uCandidaKrusei = true;
      this.utiData.uCandidaLusitaniae = true;
      this.utiData.uCandidaParapsilosis = true;
      this.utiData.uCandidaTropicalis = true;
    }
    else{
      this.utiData.uYeast = false;
      this.utiData.uCandidaAlbicans = false;
      this.utiData.uCandidaAuris = false;
      this.utiData.uCandidaGlabrata = false;
      this.utiData.uCandidaKrusei = false;
      this.utiData.uCandidaLusitaniae = false;
      this.utiData.uCandidaParapsilosis = false;
      this.utiData.uCandidaTropicalis = false;
    }
    this.labInfoChanged();
  }

  utiAdditionalChecked(){
    if (this.utiData.uAdditional){
      this.utiData.uAdditional = true;
      this.utiData.uAcinetobacterBaumanii = true;
      this.utiData.uActinotignumSchaalii = true;
      this.utiData.uAerococcusUrinae = true;
      this.utiData.uAlloscardoviaOmnicolens = true;
      this.utiData.uCitrobacterFreundii = true;
      this.utiData.uCitrobacterKoseri = true;
      this.utiData.uCorynebacteriumRiegelii = true;
      this.utiData.uKlebsiellaaerogenes = true;
      this.utiData.uMorganellaMorganii = true;
      this.utiData.uPantoeaAgglomerans = true;
      this.utiData.uProvidenciaStuartii = true;
      this.utiData.uStaphylococcusEpidermidis = true;
      this.utiData.uStaphylococcusHaemolyticus = true;
      this.utiData.uStaphylococcusLugdunensis = true;
      this.utiData.uStreptococcusAnginosus = true;
      this.utiData.uStreptococcusOralis = true;
    }
    else{
      this.utiData.uAdditional = false;
      this.utiData.uAcinetobacterBaumanii = false;
      this.utiData.uActinotignumSchaalii = false;
      this.utiData.uAerococcusUrinae = false;
      this.utiData.uAlloscardoviaOmnicolens = false;
      this.utiData.uCitrobacterFreundii = false;
      this.utiData.uCitrobacterKoseri = false;
      this.utiData.uCorynebacteriumRiegelii = false;
      this.utiData.uKlebsiellaaerogenes = false;
      this.utiData.uMorganellaMorganii = false;
      this.utiData.uPantoeaAgglomerans = false;
      this.utiData.uProvidenciaStuartii = false;
      this.utiData.uStaphylococcusEpidermidis = false;
      this.utiData.uStaphylococcusHaemolyticus = false;
      this.utiData.uStaphylococcusLugdunensis = false;
      this.utiData.uStreptococcusAnginosus = false;
      this.utiData.uStreptococcusOralis = false;
    }
    this.labInfoChanged();
  }

  utiSTIChecked(){
    if (this.utiData.sSTI){
      this.utiData.sChlamydiaTrachomatis = true;
      this.utiData.sHPV16 = true;
      this.utiData.sHPV18 = true;
      this.utiData.sHPV31 = true;
      this.utiData.sHPV33 = true;
      this.utiData.sHSV1 = true;
      this.utiData.sHSV2 = true;
      this.utiData.sNeisseriaGonorrhoeae = true;
      this.utiData.sTreponemaPallidum = true;
    }
    else{
      this.utiData.sChlamydiaTrachomatis = false;
      this.utiData.sHPV16 = false;
      this.utiData.sHPV18 = false;
      this.utiData.sHPV31 = false;
      this.utiData.sHPV33 = false;
      this.utiData.sHSV1 = false;
      this.utiData.sHSV2 = false;
      this.utiData.sNeisseriaGonorrhoeae = false;
      this.utiData.sTreponemaPallidum = false;
    }
    this.labInfoChanged();
  }

  utiBacterialVaginosisChecked(){
    if (this.utiData.sBacterialVaginosis){
      this.utiData.sGardnerellaVaginalis = true;
      this.utiData.sMycoplasmaGenitalium = true;
      this.utiData.sMycoplasmaHominis = true;
      this.utiData.sTrichomonasVaginalis = true;
      this.utiData.sUreaplasmaUrealyticum = true;
    }
    else{
      this.utiData.sGardnerellaVaginalis = false;
      this.utiData.sMycoplasmaGenitalium = false;
      this.utiData.sMycoplasmaHominis = false;
      this.utiData.sTrichomonasVaginalis = false;
      this.utiData.sUreaplasmaUrealyticum = false;
    }
    this.labInfoChanged();
  }

  utiYeast2Checked(){
    if (this.utiData.sYeast){
      this.utiData.sCandidaAlbicans = true;
      this.utiData.sCandidaAuris = true;
      this.utiData.sCandidaGlabrata = true;
      this.utiData.sCandidaKrusei = true;
      this.utiData.sCandidaLusitaniae = true;
      this.utiData.sCandidaParapsilosis = true;
      this.utiData.sCandidaTropicalis = true;
    }
    else{
      this.utiData.sCandidaAlbicans = false;
      this.utiData.sCandidaAuris = false;
      this.utiData.sCandidaGlabrata = false;
      this.utiData.sCandidaKrusei = false;
      this.utiData.sCandidaLusitaniae = false;
      this.utiData.sCandidaParapsilosis = false;
      this.utiData.sCandidaTropicalis = false;
    }
    this.labInfoChanged();
  }

  utiEmergingChecked(){
    if (this.utiData.sEmerging){
      this.utiData.sMpox = true;
    }
    else{
      this.utiData.sMpox = false;
    }
    this.labInfoChanged();
  }
  
  rppChanged(item: number){
    if (item == 1){
      if (this.rppData.fullRespiratory){
        this.rppData.viralTargets = true;
        this.rppData.bacterialTargets = true;
      }
      else{
        this.rppData.viralTargets = false;
        this.rppData.bacterialTargets = false;
      }
      this.rpp2Checked();
      this.rpp3Checked();
      this.rppData.covidOnly = false;
      this.rppData.covidThenReflux = false;
      this.rppData.covidPlusModerate = false;
      this.rppData.moderateAssessment = false;
      this.rpp5Checked();
    }
    else if (item == 2){
      this.rppData.fullRespiratory = false;
      this.rpp2Checked();
      this.rpp3Checked();
      this.rppData.covidOnly = false;
      this.rppData.covidThenReflux = false;
      this.rppData.covidPlusModerate = false;
      this.rppData.moderateAssessment = false;
      this.rpp5Checked();
    }
    else if (item == 3){
      this.rppData.fullRespiratory = false;
      this.rpp2Checked();
      this.rpp3Checked();
      this.rppData.covidOnly = false;
      this.rppData.covidThenReflux = false;
      this.rppData.covidPlusModerate = false;
      this.rppData.moderateAssessment = false;
      this.rpp5Checked();
    }
    else if (item == 4){
      this.rppData.fullRespiratory = false;
      this.rppData.viralTargets = false;
      this.rppData.bacterialTargets = false;
      this.rpp2Checked();
      this.rpp3Checked();
      this.rppData.covidThenReflux = false;
      this.rppData.covidPlusModerate = false;
      this.rppData.moderateAssessment = false;
      this.rpp5Checked();
    }
    else if (item == 5){
      this.rppData.fullRespiratory = false;
      this.rppData.viralTargets = false;
      this.rppData.bacterialTargets = false;
      this.rpp2Checked();
      this.rpp3Checked();
      this.rppData.covidOnly = false;
      this.rppData.covidPlusModerate = false;
      this.rppData.moderateAssessment = false;
      this.rpp5Checked();
    }
    else if (item == 6){
      this.rppData.fullRespiratory = false;
      this.rppData.viralTargets = false;
      this.rppData.bacterialTargets = false;
      this.rpp2Checked();
      this.rpp3Checked();
      this.rppData.covidOnly = false;
      this.rppData.covidThenReflux = false;
      this.rppData.moderateAssessment = false;
      this.rpp5Checked();
    }
    else if (item == 7){
      this.rppData.fullRespiratory = false;
      this.rppData.viralTargets = false;
      this.rppData.bacterialTargets = false;
      this.rpp2Checked();
      this.rpp3Checked();
      this.rppData.covidOnly = false;
      this.rppData.covidThenReflux = false;
      this.rppData.covidPlusModerate = false;
      this.rpp5Checked();
    }
    this.labInfoChanged();
  }

  rpp2Checked(){
    if(this.rppData.viralTargets){
      this.rppData.influenzaA = true;
      this.rppData.influenzaB  = true;
      this.rppData.parainfluenza = true;
      this.rppData.adenovirus = true;
      this.rppData.bocavirus = true;
      this.rppData.coronavirus = true;
      this.rppData.rhinovirus = true;
      this.rppData.parechovirus = true;
      this.rppData.respiratorySyncytial = true;
      this.rppData.metapneumovirus = true;
    }
    else{
      this.rppData.influenzaA = false;
      this.rppData.influenzaB  = false;
      this.rppData.parainfluenza = false;
      this.rppData.adenovirus = false;
      this.rppData.bocavirus = false;
      this.rppData.coronavirus = false;
      this.rppData.rhinovirus = false;
      this.rppData.parechovirus = false;
      this.rppData.respiratorySyncytial = false;
      this.rppData.metapneumovirus = false;
    }
    
  }

  rpp3Checked(){
    if (this.rppData.bacterialTargets){
      this.rppData.mycoplasmaPneumoniae = true;
      this.rppData.chlamydiaPneumoniae = true;
      this.rppData.ctreptococcusPneumoniae = true;
      this.rppData.klebsiellaPneumoniae = true;
      this.rppData.haemophilusInfluenza = true;
      this.rppData.legionellaPneumophila = true;
      this.rppData.moraxellaCatarrhalis = true;
      this.rppData.bordatellaSpecies = true;
      this.rppData.staphlococcusAureus = true;
    }
    else{
      this.rppData.mycoplasmaPneumoniae = false;
      this.rppData.chlamydiaPneumoniae = false;
      this.rppData.ctreptococcusPneumoniae = false;
      this.rppData.klebsiellaPneumoniae = false;
      this.rppData.haemophilusInfluenza = false;
      this.rppData.legionellaPneumophila = false;
      this.rppData.moraxellaCatarrhalis = false;
      this.rppData.bordatellaSpecies = false;
      this.rppData.staphlococcusAureus = false;
    }
  }

  rpp5Checked(){
    if (this.rppData.covidThenReflux || this.rppData.moderateAssessment || this.rppData.covidPlusModerate){
      this.rppData.covidParainfluenza = true;
      this.rppData.covidInfluenzaA = true;
      this.rppData.covidInfluenzaB = true;
      this.rppData.covidRespiratory = true;
      this.rppData.covidRhinovirus = true;
      this.rppData.covidStreptococcus = true;
      this.rppData.covidChlamydia = true;
      this.rppData.covidLegionella = true;
      this.rppData.covidHaemophilus = true;
    }
    else{
      this.rppData.covidParainfluenza = false;
      this.rppData.covidInfluenzaA = false;
      this.rppData.covidInfluenzaB = false;
      this.rppData.covidRespiratory = false;
      this.rppData.covidRhinovirus = false;
      this.rppData.covidStreptococcus = false;
      this.rppData.covidChlamydia = false;
      this.rppData.covidLegionella = false;
      this.rppData.covidHaemophilus = false;
    }
  }

  rppCollectionChanged(value: number){
    console.log("Value,value");
    console.log("Swab",this.rppData.swab);
    console.log("Saliva",this.rppData.saliva);
    if (value == 2 && this.rppData.swab == false){
      value = 1;
    }
    else if (value == 1 && this.rppData.saliva == false){
      value = 2;
    }
    if (value == 1){
      this.rppData.swab = true;
      this.rppData.saliva = false;
    }
    else{
      this.rppData.swab = false;
      this.rppData.saliva = true;

      this.rppData.covidOnly = true;
      this.rppData.fullRespiratory = false;
      this.rppData.viralTargets = false;
      this.rppData.bacterialTargets = false;
      this.rpp2Checked();
      this.rpp3Checked();
      this.rppData.covidThenReflux = false;
      this.rppData.covidPlusModerate = false;
      this.rppData.moderateAssessment = false;
      this.rpp5Checked();

    }
  }

  saveAndAccessionButtonClicked(){
    this.gotoAccession = true;
    this.saveButtonClicked();
  }

  saveButtonClicked(){

   const utcDate = new Date(this.collectionDate + " " + this.collectionTime).toISOString();

   var reDate = new Date(utcDate);

   this.labOrderData.specimens[0].collectionDate = reDate;
   //this.labOrderData.specimens[0].collectionDate = this.collectionDate + " " + this.collectionTime;

    // Clear Data fields with checked missing 
    if (this.missingPhysician){
      this.labOrderData.userId_Physician = 0;
    }
    if (this.missingLocation){
      this.labOrderData.locationId = 0;
    }
    if (this.missingDate){
      this.collectionDate = "";
      this.labOrderData.specimens[0].collectionDate = "";
    }
    else if (this.missingTime){
      this.collectionTime = "";
      this.labOrderData.specimens[0].collectionDate = this.collectionDate + " 12:00";
    }
    else {
      this.labOrderData.specimens[0].collectionDate = reDate;
      //this.labOrderData.specimens[0].collectionDate = this.collectionDate + " " + this.collectionTime;
    }
    this.labOrderData.specimens[0].missingSelection = this.missingSelection;
    
    // Fill in missing fields
    if (this.labOrderData.specimens[0].labStatusId == 0 ){
      this.labOrderData.specimens[0].labStatusId = 1;
      this.labOrderData.specimens[0].resultedPosative = false;
      this.labOrderData.specimens[0].specimenBarcode = "";
      this.labOrderData.specimens[0].shippedOnIce = false;
      this.labOrderData.specimens[0].receivedOnIce = false;
    }

    
    this.labOrderData.specimens[0].specimenBarcode =  this.accessionBarcode;
    this.labOrderData.comment = "";
    this.labOrderData.userId_Updated = Number(sessionStorage.getItem('userId_Login'));

    this.labOrderData.isPregnant = 0;
    if(this.pregnantYes){ this.labOrderData.isPregnant = 1}
    if(this.pregnantNo){ this.labOrderData.isPregnant = 2}

    this.labOrderData.specimens[0].tests = new Array<LabOrderTestItemModel>();
    if (this.labOrderData.specimens[0].labTypeId == 1 && !this.missingSelection){
      // Tox
      this.loadToxFromTest();
    }
    else if (this.labOrderData.specimens[0].labTypeId == 2 && !this.missingSelection){
      // Tox
      this.loadToxOralFromTest();
    }
    else if (this.labOrderData.specimens[0].labTypeId == 3 && !this.missingSelection){
      // GPP
      this.loadGPPFromTest();
    }
    else if (this.labOrderData.specimens[0].labTypeId == 4 && !this.missingSelection){
      //UTI
      this.loadUTIFromTest();
      if (this.utiData.swab){
        this.labOrderData.specimens[0].swabLocationId = this.swabLocation;
      }
      else{
        this.labOrderData.specimens[0].swabLocationId = 0;
      }
    }
    else if (this.labOrderData.specimens[0].labTypeId == 5 && !this.missingSelection){
      //RPP
      this.loadRPPFromTest();
    }

    // Add in medications
    this.labOrderData.medications = new Array<LabOrderMedicationItemModel>();
    for (let item of this.medicationOrderList){
      var med = new LabOrderMedicationItemModel();
      med.labOrderId = 0;
      med.labOrderMedicationId = 0;
      med.medicationId = item.medicationId;
      if (item.medicationId > 0){
        med.description = '';
      }
      else{
        med.description = item.description;
      }
      
      this.labOrderData.medications.push(med);
    }

    // Add in ICD10
    this.labOrderData.diagnosis = new Array<LabOrderDiagnosisItemModel>();
    for (let item of this.icdOrderList){
      var diagnosis = new LabOrderDiagnosisItemModel();
      diagnosis.labOrderId = 0;
      diagnosis.icd_Version = 10;
      diagnosis.code = item.icD10Code;
      this.labOrderData.diagnosis.push(diagnosis);
    }

    // Add in allergies
    this.labOrderData.allergies = new Array<LabOrderAllergyItemModel>();
    for (let item of this.allergyOrderList){
      var allergy = new LabOrderAllergyItemModel();
      allergy.labOrderId = 0;
      allergy.labOrderAllergyId = 0;
      allergy.allergyId = item.allergyId;
      if (item.allergyId > 0){
        allergy.description = '';
      }
      else{
        allergy.description = item.description;
      }
      this.labOrderData.allergies.push(allergy);
    }

    // Physician Signature

    if (this.labOrderData.userSignatureId_Physician == 0){
      if (this.signature){
        this.labOrderData.userSignatureId_Physician = this.signatureId;
        this.labOrderData.datePhysicianSignature = formatDate(new Date() , 'MM-dd-yyyy HH:mm', 'en');
        this.labOrderData.userId_Delegate = 0;
      }
      else if (this.signatureDelegate){
        this.labOrderData.userSignatureId_Physician = this.delegateSignature;
        this.labOrderData.userId_Delegate = this.userId;
        this.labOrderData.datePhysicianSignature = formatDate(new Date() , 'MM-dd-yyyy HH:mm', 'en');
      }
      else if (this.physicianHardcopy){
        this.labOrderData.userSignatureId_Physician = -1;
        this.labOrderData.userId_Delegate = 0;
      }
    }

    // Patient Signature

    if (this.labOrderData.patientSignatureId == 0){
      if (this.signatureImg != ""){
        this.labOrderData.patientSignatureId = 1;
        this.labOrderData.fileAsBase64_Patient = this.signatureImg.replace("data:image/png;base64,","");
        this.labOrderData.fileType_Patient = "image/png";
      }
      else if (this.topazSignature != ""){
        this.labOrderData.patientSignatureId = 1;
        this.labOrderData.fileAsBase64_Patient = this.topazSignature.replace("data:image/png;base64,","");
        this.labOrderData.fileType_Patient = "image/png";
      }
      else{
        this.labOrderData.fileAsBase64_Patient = "";
        if (this.patientHardcopy){
          this.labOrderData.patientSignatureId = -1;
        }
      }
    }

    this.showError = false;
    console.log("Save Date", this.labOrderData);
    this.labOrderService.save( this.labOrderData)
          .pipe(first())
          .subscribe(
          data => {
            if (data.valid) {
              this.dataShareService.changeUnsaved(false);
              var sepArray = data.id.split(',');
              var OrderId = Number(sepArray[0]);
              this.labOrderData.specimens[0].specimenBarcode = sepArray[1];

              if (this.printLabel){
                this.printBarcode();
              }

              const initialState: ModalOptions = {
                initialState: {
                  message: "Specimen Id: " + this.labOrderData.specimens[0].specimenBarcode,
                  button1:"Close",
                  button2:"Print",
                }
              };
              
              this.modalRef = this.modalService.show(MessageModalComponent, {
                initialState 
              });

              this.modalRef.content.onClose.subscribe(result => {
                if (result == 0){
                  // Print Selected
                  this.orderPdfClicked(OrderId);
                }
              });

              // If this is a new lab order, check if there is a note to save

              if (this.labOrderData.labOrderId == 0 && this.noteData.note != ""){
                this.noteData.labOrderId = OrderId;
                this.labOrderService.saveLabOrderNote( this.noteData)
                      .pipe(first())
                      .subscribe(
                      data => {
                        // console.log("Data",data);
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
              }





              // // Show specimen barcode
              // const initialState: ModalOptions = {
              //   initialState: {
              //     message: "Specimen Id: " + this.labOrderData.specimens[0].specimenBarcode
              //   }
              // };
              // this.modalRef = this.modalService.show(PopupModalComponent, {
              //   initialState 
              // });

              // Clear the screen.
              this.cancelButtonClicked();

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

  cancelOrderDropdownButtonClicked(labOrderId: number){
    this.labOrderService.get(labOrderId )
        .pipe(first())
        .subscribe(
        data => {
          if (data.valid){
            this.labOrderData = data;
            this.labOrderService.cancel( this.labOrderData)
              .pipe(first())
              .subscribe(
              data => {
                if (data.valid) {
                  this.searchButtonClicked();
                }
              },
              error => {
                this.errorMessage = error;
                this.showError = true;
              });
          }
        });

  }

  cancelOrderButtonClicked(){
    
    this.labOrderService.cancel( this.labOrderData)
        .pipe(first())
        .subscribe(
        data => {
          if (data.valid) {
            this.dataShareService.changeUnsaved(false);
            this.cancelButtonClicked();
          }
        },
        error => {
          this.errorMessage = error;
          this.showError = true;
        });
  }

  unAccessionButtonClicked(labOrderId: number){
    this.labOrderService.get(labOrderId )
        .pipe(first())
        .subscribe(
        data => {
          if (data.valid){
            this.labOrderData = data;
            this.labOrderService.unAccession( this.labOrderData)
              .pipe(first())
              .subscribe(
              data => {
                if (data.valid) {
                  this.searchButtonClicked();
                }
              },
              error => {
                this.errorMessage = error;
                this.showError = true;
              });
          }
        });

 
  }

  reviewedOrderClicked(labOrderSpecimenId: number){
    this.labOrderService.specimenReviewed(labOrderSpecimenId )
        .pipe(first())
        .subscribe(
              data => {
                if (data.valid) {
                  this.searchButtonClicked();
                }
              },
              error => {
                this.errorMessage = error;
                this.showError = true;
              });

  }

  unCancelOrderDropdownButtonClicked(labOrderId: number){
    this.labOrderService.get(labOrderId )
        .pipe(first())
        .subscribe(
        data => {
          if (data.valid){
            this.labOrderData = data;
            this.labOrderService.unCancel( this.labOrderData)
              .pipe(first())
              .subscribe(
              data => {
                if (data.valid) {
                  this.searchButtonClicked();
                }
              },
              error => {
                this.errorMessage = error;
                this.showError = true;
              });
          }
        });

  }

  loadToxFromTest(){
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

    this.labOrderData.specimens[0].tests = this.labOrderService.loadToxFromTest(tox, this.specimenId );
  }

  loadToxOralFromTest(){
    var oral = new ToxOralModel();
    oral.fullConfirmation = this.toxOralFullPanel;
    oral.illicit = this.oralIllicit;
    oral.sedative = this.oralSedative;
    oral.benzodiazepines = this.oralBenzodiazepines;
    oral.muscle = this.oralMuscle;
    oral.antipsychotics = this.oralAntipsychotics;
    oral.antidepressants = this.oralAntidepressants;
    oral.stimulants = this.oralStimulants;
    oral.kratom = this.oralKratom;
    oral.nicotine = this.oralNicotine;
    oral.opioidAntagonists = this.oralOpioidAntagonists;
    oral.gabapentinoids = this.oralGabapentinoids;
    oral.dissociative = this.oralDissociative;
    oral.opioidAgonists = this.oralOpioidAgonists;
    this.labOrderData.specimens[0].tests = this.labOrderService.loadToxOralFromTest(oral, this.specimenId );
  }

  loadGPPFromTest(){
    if (this.gppData.gastrointestinal)
    {
        var test = new LabOrderTestItemModel();
        test.labTestId = 2000;
        test.labOrderSpecimenId = this.specimenId;
        this.labOrderData.specimens[0].tests.push(test);
    }
    if (this.gppData.helicobacter)
    {
        var test = new LabOrderTestItemModel();
        test.labTestId = 2100;test.labOrderSpecimenId = this.specimenId;
        this.labOrderData.specimens[0].tests.push(test);
    }
  }

  loadUTIFromTest(){
    if (this.utiData.uCommon){
      var test = new LabOrderTestItemModel();
      test.labTestId = 3000;
      test.labOrderSpecimenId = this.specimenId;
      this.labOrderData.specimens[0].tests.push(test);
    }
    if (this.utiData.uUncommon){
      var test = new LabOrderTestItemModel();
      test.labTestId = 3100;
      test.labOrderSpecimenId = this.specimenId;
      this.labOrderData.specimens[0].tests.push(test);
    }
    if (this.utiData.uSTILeukorrhea){
      var test = new LabOrderTestItemModel();
      test.labTestId = 3200;
      test.labOrderSpecimenId = this.specimenId;
      this.labOrderData.specimens[0].tests.push(test);
    }
    if (this.utiData.uYeast){
      var test = new LabOrderTestItemModel();
      test.labTestId = 3300;
      test.labOrderSpecimenId = this.specimenId;
      this.labOrderData.specimens[0].tests.push(test);
    }
    if (this.utiData.uAdditional){
      var test = new LabOrderTestItemModel();
      test.labTestId = 3400;
      test.labOrderSpecimenId = this.specimenId;
      this.labOrderData.specimens[0].tests.push(test);
    }
    if (this.utiData.sSTI){
      var test = new LabOrderTestItemModel();
      test.labTestId = 3500;
      test.labOrderSpecimenId = this.specimenId;
      this.labOrderData.specimens[0].tests.push(test);
    }
    if (this.utiData.sBacterialVaginosis){
      var test = new LabOrderTestItemModel();
      test.labTestId = 3600;
      test.labOrderSpecimenId = this.specimenId;
      this.labOrderData.specimens[0].tests.push(test);
    }
    if (this.utiData.sYeast){
      var test = new LabOrderTestItemModel();
      test.labTestId = 3700;
      test.labOrderSpecimenId = this.specimenId;
      this.labOrderData.specimens[0].tests.push(test);
    }
    if (this.utiData.sEmerging){
      var test = new LabOrderTestItemModel();
      test.labTestId = 3800;
      test.labOrderSpecimenId = this.specimenId;
      this.labOrderData.specimens[0].tests.push(test);
    }
  }

  loadRPPFromTest(){
    if (this.rppData.swab){
      this.labOrderData.specimens[0].collectionDeviceId = 3;
    }
    else{
      this.labOrderData.specimens[0].collectionDeviceId = 2;
    }
    if (this.rppData.fullRespiratory)
    {
        var test = new LabOrderTestItemModel();
        test.labTestId = 4000;
        test.labOrderSpecimenId = this.specimenId;
        this.labOrderData.specimens[0].tests.push(test);
    }
    else{
      if (this.rppData.viralTargets)
      {
          var test = new LabOrderTestItemModel();
          test.labTestId = 4100;
          test.labOrderSpecimenId = this.specimenId;
          this.labOrderData.specimens[0].tests.push(test);
      }
      if (this.rppData.bacterialTargets)
      {
          var test = new LabOrderTestItemModel();
          test.labTestId = 4200;
          test.labOrderSpecimenId = this.specimenId;
          this.labOrderData.specimens[0].tests.push(test);
      }
      if (this.rppData.covidOnly)
      {
          var test = new LabOrderTestItemModel();
          test.labTestId = 4300;
          test.labOrderSpecimenId = this.specimenId;
          this.labOrderData.specimens[0].tests.push(test);
      }
      if (this.rppData.covidThenReflux)
      {
          var test = new LabOrderTestItemModel();
          test.labTestId = 4400;
          test.labOrderSpecimenId = this.specimenId;
          this.labOrderData.specimens[0].tests.push(test);
          var test1 = new LabOrderTestItemModel();
      }
      if (this.rppData.covidPlusModerate)
      {
          var test = new LabOrderTestItemModel();
          test.labTestId = 4600;
          test.labOrderSpecimenId = this.specimenId;
          this.labOrderData.specimens[0].tests.push(test);
          var test1 = new LabOrderTestItemModel();
      }
      if (this.rppData.moderateAssessment)
      {
          var test = new LabOrderTestItemModel();
          test.labTestId = 4500;
          test.labOrderSpecimenId = this.specimenId;
          this.labOrderData.specimens[0].tests.push(test);
          var test1 = new LabOrderTestItemModel();
      }
    }
  }
  // Tox Urine

  toxFull(){
    if (this.toxUrineFullPanel){
      this.toxUrineCustomPanel = false;
      this.presumptiveTesting15 = true;
      this.presumptiveTesting13 = false;
      this.alcohol.full = true;
      this.antidepressants.full = true;
      this.antipsychotics.full = true;
      this.benzodiazepines.full = true;
      this.cannabinoids.full = true;
      this.cannabinoidsSynth.full = true;
      this.dissociative.full = true;
      this.gabapentinoids.full = true;
      this.hallucinogens.full = false;
      this.illicit.full = true;
      this.kratom = true;
      this.opioidAgonists.full = true;
      this.opioidAntagonists.full = true;
      this.sedative.full = true;
      this.skeletal.full = true;
      this.stimulants.full = true;
      this.thcSource = true;
    }
    else{
      this.toxUrineCustomPanel = true;
      this.presumptiveTesting15 = false;
      this.presumptiveTesting13 = false;
      this.alcohol.full = false;
      this.antidepressants.full = false;
      this.antipsychotics.full = false;
      this.benzodiazepines.full = false;
      this.cannabinoids.full = false;
      this.cannabinoidsSynth.full = false;
      this.dissociative.full = false;
      this.gabapentinoids.full = false;
      this.hallucinogens.full = false;
      this.illicit.full = false;
      this.kratom = false;
      this.opioidAgonists.full = false;
      this.opioidAntagonists.full = false;
      this.sedative.full = false;
      this.skeletal.full = false;
      this.stimulants.full = false;
      this.thcSource = false;
    }

    this.toxUrineConfirmationPanel = false;
    this.toxUrineTargetReflexPanel = false;
    this.toxUrineUniversalReflexPanel = false;

    this.preference1 = false;
    this.preference2 = false;
    this.preference3 = false;
    this.preference4 = false;
    this.preference5 = false;
    this.preference6 = false;
    this.preference7 = false;
    this.preference8 = false;
    this.repeatPrevious = false;

    this.alcoholUChanged(false);
    this.antidepressantsUChanged(false);
    this.antipsychoticsUChanged(false);
    this.benzodiazepinesUChanged(false);
    this.cannabinoidsUChanged(false);
    this.cannabinoidsSynthUChanged(false);
    this.dissociativeUChanged(false);
    this.gabapentinoidsUChanged(false);
    this.hallucinogensUChanged(false);
    this.illicitUChanged(false);
    this.opioidAgonistsUChanged(false);
    this.opioidAntagonistsUChanged(false);
    this.sedativeUChanged(false);
    this.skeletalUChanged(false);
    this.stimulantsUChanged(false);
    this.labInfoChanged(); 
  }

  toxReflex(posn: number){
    if (this.toxUrineTargetReflexPanel && posn == 1){
      this.presumptiveTesting15 = true;
      this.presumptiveTesting13 = false;
      this.toxUrineUniversalReflexPanel = false;
      this.toxUrineCustomPanel = false;
    }
    else if(this.toxUrineUniversalReflexPanel && posn == 2){
      this.presumptiveTesting15 = true;
      this.presumptiveTesting13 = false;
      this.toxUrineTargetReflexPanel = false;
      this.toxUrineCustomPanel = false;
    }
    else{
      this.presumptiveTesting15 = false;
      this.presumptiveTesting13 = false;
      this.toxUrineCustomPanel = true;
    }
    this.toxUrineFullPanel = false;
    this.toxUrineConfirmationPanel = false;
    
    this.preference1 = false;
    this.preference2 = false;
    this.preference3 = false;
    this.preference4 = false;
    this.preference5 = false;
    this.preference6 = false;
    this.preference7 = false;
    this.preference8 = false;
    this.repeatPrevious = false;

    this.repeatPrevious = false;
    this.alcohol.full = false;
    this.antidepressants.full = false;
    this.antipsychotics.full = false;
    this.benzodiazepines.full = false;
    this.cannabinoids.full = false;
    this.cannabinoidsSynth.full = false;
    this.dissociative.full = false;
    this.gabapentinoids.full = false;
    this.hallucinogens.full = false;
    this.illicit.full = false;
    this.kratom = false;
    this.opioidAgonists.full = false;
    this.opioidAntagonists.full = false;
    this.sedative.full = false;
    this.skeletal.full = false;
    this.stimulants.full = false;
    this.thcSource = false;

    this.alcoholUChanged(false);
    this.antidepressantsUChanged(false);
    this.antipsychoticsUChanged(false);
    this.benzodiazepinesUChanged(false);
    this.cannabinoidsUChanged(false);
    this.cannabinoidsSynthUChanged(false);
    this.dissociativeUChanged(false);
    this.gabapentinoidsUChanged(false);
    this.hallucinogensUChanged(false);
    this.illicitUChanged(false);
    this.opioidAgonistsUChanged(false);
    this.opioidAntagonistsUChanged(false);
    this.sedativeUChanged(false);
    this.skeletalUChanged(false);
    this.stimulantsUChanged(false);

  }

  toxPanel(){
    if (this.toxUrineConfirmationPanel){
      this.toxUrineCustomPanel = false;
      this.presumptiveTesting15 = false;
      this.presumptiveTesting13 = false;
      this.alcohol.full = true;
      this.antidepressants.full = true;
      this.antipsychotics.full = true;
      this.benzodiazepines.full = true;
      this.cannabinoids.full = true;
      this.cannabinoidsSynth.full = true;
      this.dissociative.full = true;
      this.gabapentinoids.full = true;
      this.hallucinogens.full = false;
      this.illicit.full = true;
      this.kratom = true;
      this.opioidAgonists.full = true;
      this.opioidAntagonists.full = true;
      this.sedative.full = true;
      this.skeletal.full = true;
      this.stimulants.full = true;
      this.thcSource = true;
    }
    else{
      this.toxUrineCustomPanel = true;
      this.alcohol.full = false;
      this.antidepressants.full = false;
      this.antipsychotics.full = false;
      this.benzodiazepines.full = false;
      this.cannabinoids.full = false;
      this.cannabinoidsSynth.full = false;
      this.dissociative.full = false;
      this.gabapentinoids.full = false;
      this.hallucinogens.full = false;
      this.illicit.full = false;
      this.kratom = false;
      this.opioidAgonists.full = false;
      this.opioidAntagonists.full = false;
      this.sedative.full = false;
      this.skeletal.full = false;
      this.stimulants.full = false;
      this.thcSource = false;
    }

    this.toxUrineFullPanel = false;
    this.toxUrineTargetReflexPanel = false;
    this.toxUrineUniversalReflexPanel = false;
    this.preference1 = false;
    this.preference2 = false;
    this.preference3 = false;
    this.preference4 = false;
    this.preference5 = false;
    this.preference6 = false;
    this.preference7 = false;
    this.preference8 = false;
    this.repeatPrevious = false;

    this.alcoholUChanged(false);
    this.antidepressantsUChanged(false);
    this.antipsychoticsUChanged(false);
    this.benzodiazepinesUChanged(false);
    this.cannabinoidsUChanged(false);
    this.cannabinoidsSynthUChanged(false);
    this.dissociativeUChanged(false);
    this.gabapentinoidsUChanged(false);
    this.hallucinogensUChanged(false);
    this.illicitUChanged(false);
    this.opioidAgonistsUChanged(false);
    this.opioidAntagonistsUChanged(false);
    this.sedativeUChanged(false);
    this.skeletalUChanged(false);
    this.stimulantsUChanged(false);
    this.labInfoChanged();
  }

  toxCustom(){
    if (this.toxUrineCustomPanel){
      this.toxUrineConfirmationPanel = false;
      this.toxUrineFullPanel = false;
      this.toxUrineTargetReflexPanel = false;
      this.toxUrineUniversalReflexPanel = false;
      this.preference1 = false;
      this.preference2 = false;
      this.preference3 = false;
      this.preference4 = false;
      this.preference5 = false;
      this.preference6 = false;
      this.preference7 = false;
      this.preference8 = false;
      this.repeatPrevious = false;
    }
    else{
      this.alcohol.full = false;
      this.antidepressants.full = false;
      this.antipsychotics.full = false;
      this.benzodiazepines.full = false;
      this.cannabinoids.full = false;
      this.cannabinoidsSynth.full = false;
      this.dissociative.full = false;
      this.gabapentinoids.full = false;
      this.hallucinogens.full = false;
      this.illicit.full = false;
      this.kratom = false;
      this.opioidAgonists.full = false;
      this.opioidAntagonists.full = false;
      this.sedative.full = false;
      this.skeletal.full = false;
      this.stimulants.full = false;
      this.thcSource = false;
      this.alcoholUChanged(false);
      this.antidepressantsUChanged(false);
      this.antipsychoticsUChanged(false);
      this.benzodiazepinesUChanged(false);
      this.cannabinoidsUChanged(false);
      this.cannabinoidsSynthUChanged(false);
      this.dissociativeUChanged(false);
      this.gabapentinoidsUChanged(false);
      this.hallucinogensUChanged(false);
      this.illicitUChanged(false);
      this.opioidAgonistsUChanged(false);
      this.opioidAntagonistsUChanged(false);
      this.sedativeUChanged(false);
      this.skeletalUChanged(false);
      this.stimulantsUChanged(false);
      this.labInfoChanged();
    }
  }

  presumtiveChanged15(){
    if((this.presumptiveTesting13 == false && this.presumptiveTesting15 == false) || this.toxUrineConfirmationPanel){
      this.toxUrineFullPanel = false;
      this.toxUrineTargetReflexPanel = false;
      this.toxUrineUniversalReflexPanel = false;
      this.toxUrineConfirmationPanel = false;
      this.repeatPrevious = false;
      this.preference1 = false;
      this.preference2 = false;
      this.preference3 = false;
      this.preference4 = false;
      this.preference5 = false;
      this.preference6 = false;
      this.preference7 = false;
      this.preference8 = false;
      this.labInfoChanged();
    }
    this.presumptiveTesting13 = false;
    
  }

  presumtiveChanged13(){
    if((this.presumptiveTesting13 == false && this.presumptiveTesting15 == false) || this.toxUrineConfirmationPanel){
      this.toxUrineFullPanel = false;
      this.toxUrineTargetReflexPanel = false;
      this.toxUrineUniversalReflexPanel = false;
      this.toxUrineConfirmationPanel = false;
      this.repeatPrevious = false;
      this.preference1 = false;
      this.preference2 = false;
      this.preference3 = false;
      this.preference4 = false;
      this.preference5 = false;
      this.preference6 = false;
      this.preference7 = false;
      this.preference8 = false;
      this.labInfoChanged();
    }
    this.presumptiveTesting15 = false;

  }
  
  illicitUChanged(reset:boolean) {
    if (this.illicit.full){
      this.illicit.amphetamine = true;
      this.illicit.cocaine = true;
      this.illicit.heroin = true;
      this.illicit.mdma = true;
      this.illicit.methamphetamine = true;
      this.illicit.pcp = true;
    }
    else {
      this.illicit.amphetamine = false;
      this.illicit.cocaine = false;
      this.illicit.heroin = false;
      this.illicit.mdma = false;
      this.illicit.methamphetamine = false;
      this.illicit.methamphetaminePosative = false;
      this.illicit.pcp = false;
    }
    if(reset){
      this.toxUrineFullPanel = false;
      this.toxUrineConfirmationPanel = false;
      this.repeatPrevious = false;
      this.preference1 = false;
      this.preference2 = false;
      this.preference3 = false;
      this.preference4 = false;
      this.preference5 = false;
      this.preference6 = false;
      this.preference7 = false;
      this.preference8 = false;
      if (this.toxUrineUniversalReflexPanel == false && this.toxUrineTargetReflexPanel == false){
        this.toxUrineCustomPanel = true;
      }
      this.labInfoChanged();
    }
  }

  illicitItemUChanged(reset:boolean) {
    if (this.illicit.amphetamine &&
      this.illicit.cocaine &&
      this.illicit.heroin &&
      this.illicit.mdma &&
      this.illicit.methamphetamine &&
      this.illicit.pcp)
    {
      this.illicit.full = true;
    }
    else {
      this.illicit.full = false;
    }
    if(reset){
      this.toxUrineFullPanel = false;
      this.toxUrineConfirmationPanel = false;
      this.repeatPrevious = false;
      this.preference1 = false;
      this.preference2 = false;
      this.preference3 = false;
      this.preference4 = false;
      this.preference5 = false;
      this.preference6 = false;
      this.preference7 = false;
      this.preference8 = false;
      if (this.toxUrineUniversalReflexPanel == false && this.toxUrineTargetReflexPanel == false){
        this.toxUrineCustomPanel = true;
      }
      this.labInfoChanged();
    }
  }

  cannabinoidsUChanged(reset:boolean) {
    if (this.cannabinoids.full){
      this.cannabinoids.cbd = true;
      this.cannabinoids.thc = true;
      this.thcSource = true;
    }
    else {
      this.cannabinoids.cbd = false;
      this.cannabinoids.thc = false;
      this.thcSource = false;
    }
    if(reset){
      this.toxUrineFullPanel = false;
      this.toxUrineConfirmationPanel = false;
      this.repeatPrevious = false;
      this.preference1 = false;
      this.preference2 = false;
      this.preference3 = false;
      this.preference4 = false;
      this.preference5 = false;
      this.preference6 = false;
      this.preference7 = false;
      this.preference8 = false;
      if (this.toxUrineUniversalReflexPanel == false && this.toxUrineTargetReflexPanel == false){
        this.toxUrineCustomPanel = true;
      }
      this.labInfoChanged();
    }
  }

  cannabinoidsItemUChanged(reset:boolean) {
    if (this.cannabinoids.cbd &&
      this.cannabinoids.thc)
    {
      this.cannabinoids.full = true;
      this.thcSource = true;
    }
    else {
      this.cannabinoids.full = false;
      this.thcSource = false;
    }

    if(reset){
      this.toxUrineFullPanel = false;
      this.toxUrineConfirmationPanel = false;
      this.repeatPrevious = false;
      this.preference1 = false;
      this.preference2 = false;
      this.preference3 = false;
      this.preference4 = false;
      this.preference5 = false;
      this.preference6 = false;
      this.preference7 = false;
      this.preference8 = false;
      if (this.toxUrineUniversalReflexPanel == false && this.toxUrineTargetReflexPanel == false){
        this.toxUrineCustomPanel = true;
      }
      this.labInfoChanged();
    }
  }

  cannabinoidsSynthUChanged(reset:boolean) {
    if (this.cannabinoidsSynth.full){
      this.cannabinoidsSynth.adb = true;
      this.cannabinoidsSynth.mdmb = true;
      this.cannabinoidsSynth.mdmb5f = true;
    }
    else {
      this.cannabinoidsSynth.adb = false;
      this.cannabinoidsSynth.mdmb = false;
      this.cannabinoidsSynth.mdmb5f = false;
      this.thcSource = false;
    }
    if(reset){
      this.toxUrineFullPanel = false;
      this.toxUrineConfirmationPanel = false;
      this.repeatPrevious = false;
      this.preference1 = false;
      this.preference2 = false;
      this.preference3 = false;
      this.preference4 = false;
      this.preference5 = false;
      this.preference6 = false;
      this.preference7 = false;
      this.preference8 = false;
      if (this.toxUrineUniversalReflexPanel == false && this.toxUrineTargetReflexPanel == false){
        this.toxUrineCustomPanel = true;
      }
      this.labInfoChanged();
    }
  }

  cannabinoidsSynthItemUChanged(reset:boolean) {
    if (this.cannabinoidsSynth.adb &&
      this.cannabinoidsSynth.mdmb &&
      this.cannabinoidsSynth.mdmb5f)
    {
      this.cannabinoidsSynth.full = true;
    }
    else {
      this.cannabinoidsSynth.full = false;
    }

    if (!this.cannabinoids.cbd ||
      !this.cannabinoids.thc)
      {
        this.thcSource = false;
    }

    if(reset){
      this.toxUrineFullPanel = false;
      this.toxUrineConfirmationPanel = false;
      this.repeatPrevious = false;
      this.preference1 = false;
      this.preference2 = false;
      this.preference3 = false;
      this.preference4 = false;
      this.preference5 = false;
      this.preference6 = false;
      this.preference7 = false;
      this.preference8 = false;
      if (this.toxUrineUniversalReflexPanel == false && this.toxUrineTargetReflexPanel == false){
        this.toxUrineCustomPanel = true;
      }
      this.labInfoChanged();
    }
  }

  alcoholUChanged(reset:boolean) {
    if (this.alcohol.full){
      this.alcohol.etg = true;
      this.alcohol.ets = true;
      this.alcohol.nicotine = true;
    }
    else {
      this.alcohol.etg = false;
      this.alcohol.ets = false;
      this.alcohol.nicotine = false;
    }
    if(reset){
      this.toxUrineFullPanel = false;
      this.toxUrineConfirmationPanel = false;
      this.repeatPrevious = false;
      this.preference1 = false;
      this.preference2 = false;
      this.preference3 = false;
      this.preference4 = false;
      this.preference5 = false;
      this.preference6 = false;
      this.preference7 = false;
      this.preference8 = false;
      if (this.toxUrineUniversalReflexPanel == false && this.toxUrineTargetReflexPanel == false){
        this.toxUrineCustomPanel = true;
      }
      this.labInfoChanged();
    }
  }

  alcoholIemUChanged(reset:boolean) {
    if (this.alcohol.etg && this.alcohol.ets && this.alcohol.nicotine){
      this.alcohol.full = true;
    }
    else {
      this.alcohol.full = false;
    }
    if(reset){
      this.toxUrineFullPanel = false;
      this.toxUrineConfirmationPanel = false;
      this.repeatPrevious = false;
      this.preference1 = false;
      this.preference2 = false;
      this.preference3 = false;
      this.preference4 = false;
      this.preference5 = false;
      this.preference6 = false;
      this.preference7 = false;
      this.preference8 = false;
      if (this.toxUrineUniversalReflexPanel == false && this.toxUrineTargetReflexPanel == false){
        this.toxUrineCustomPanel = true;
      }
      this.labInfoChanged();
    }
  }

  opioidAgonistsUChanged(reset:boolean) {
    if (this.opioidAgonists.full){
      this.opioidAgonists.codeine = true;
      this.opioidAgonists.dihydrocodeine = true;
      this.opioidAgonists.hydrocodone = true;
      this.opioidAgonists.norhydrocodone = true;
      this.opioidAgonists.hydromorphone = true;
      this.opioidAgonists.morphine = true;
      this.opioidAgonists.dextromethorphan = true;
      this.opioidAgonists.levorphanol = true;
      this.opioidAgonists.meperidine = true;
      this.opioidAgonists.oxycodone = true;
      this.opioidAgonists.oxymorphone = true;
      this.opioidAgonists.noroxycodone = true;
      this.opioidAgonists.tramadol = true;
      this.opioidAgonists.tapentadol = true;
      this.opioidAgonists.fentanyl = true;
      this.opioidAgonists.norfentanyl = true;
      this.opioidAgonists.acetylfentanyl = true;
      this.opioidAgonists.carfentanil = true;
      this.opioidAgonists.norcarfentanil = true;
      this.opioidAgonists.fluorofentanyl = true;
      this.opioidAgonists.buprenorphine = true;
      this.opioidAgonists.norbuprenorphine = true;
      this.opioidAgonists.methadone = true;
      this.opioidAgonists.eddp = true;
      this.opioidAgonists.isotonitazene = true;
      this.opioidAgonists.tianeptine = true;
    }
    else {
      this.opioidAgonists.codeine = false;
      this.opioidAgonists.dihydrocodeine = false;
      this.opioidAgonists.hydrocodone = false;
      this.opioidAgonists.norhydrocodone = false;
      this.opioidAgonists.hydromorphone = false;
      this.opioidAgonists.morphine = false;
      this.opioidAgonists.dextromethorphan = false;
      this.opioidAgonists.levorphanol = false;
      this.opioidAgonists.meperidine = false;
      this.opioidAgonists.oxycodone = false;
      this.opioidAgonists.oxymorphone = false;
      this.opioidAgonists.noroxycodone = false;
      this.opioidAgonists.tramadol = false;
      this.opioidAgonists.tapentadol = false;
      this.opioidAgonists.fentanyl = false;
      this.opioidAgonists.norfentanyl = false;
      this.opioidAgonists.acetylfentanyl = false;
      this.opioidAgonists.carfentanil = false;
      this.opioidAgonists.norcarfentanil = false;
      this.opioidAgonists.fluorofentanyl = false;
      this.opioidAgonists.buprenorphine = false;
      this.opioidAgonists.norbuprenorphine = false;
      this.opioidAgonists.methadone = false;
      this.opioidAgonists.eddp = false;
      this.opioidAgonists.isotonitazene = false;
      this.opioidAgonists.tianeptine = false;
    }
    if(reset){
      this.toxUrineFullPanel = false;
      this.toxUrineConfirmationPanel = false;
      this.repeatPrevious = false;
      this.preference1 = false;
      this.preference2 = false;
      this.preference3 = false;
      this.preference4 = false;
      this.preference5 = false;
      this.preference6 = false;
      this.preference7 = false;
      this.preference8 = false;
      if (this.toxUrineUniversalReflexPanel == false && this.toxUrineTargetReflexPanel == false){
        this.toxUrineCustomPanel = true;
      }
      this.labInfoChanged();
    }
  }

  opioidAgonistsItemUChanged(reset:boolean) {
    this.opioidAgonists.norbuprenorphine = this.opioidAgonists.buprenorphine;
    this.opioidAgonists.norfentanyl = this.opioidAgonists.fentanyl;
    this.opioidAgonists.norcarfentanil = this.opioidAgonists.carfentanil;
    this.opioidAgonists.norhydrocodone = this.opioidAgonists.hydrocodone;
    this.opioidAgonists.eddp = this.opioidAgonists.methadone;
    this.opioidAgonists.noroxycodone = this.opioidAgonists.oxycodone;

    if (this.opioidAgonists.codeine &&
      this.opioidAgonists.dihydrocodeine &&
      this.opioidAgonists.hydrocodone &&
      // this.opioidAgonists.norhydrocodone &&
      this.opioidAgonists.hydromorphone &&
      this.opioidAgonists.hydrocodone &&
      this.opioidAgonists.morphine &&
      this.opioidAgonists.dextromethorphan &&
      this.opioidAgonists.levorphanol &&
      this.opioidAgonists.meperidine &&
      this.opioidAgonists.oxycodone &&
      this.opioidAgonists.oxymorphone &&
      // this.opioidAgonists.noroxycodone &&
      this.opioidAgonists.tramadol &&
      this.opioidAgonists.tapentadol &&
      this.opioidAgonists.fentanyl &&
      // this.opioidAgonists.norfentanyl &&
      this.opioidAgonists.acetylfentanyl &&
      this.opioidAgonists.carfentanil &&
      // this.opioidAgonists.norcarfentanil &&
      this.opioidAgonists.fluorofentanyl &&
      this.opioidAgonists.buprenorphine &&
      // this.opioidAgonists.norbuprenorphine&&
      this.opioidAgonists.methadone &&
      // this.opioidAgonists.eddp //&&
      this.opioidAgonists.isotonitazene &&
      this.opioidAgonists.tianeptine
      )
    {
      this.opioidAgonists.full = true;
    }
    else {
      this.opioidAgonists.full = false;
    }
    if(reset){
      this.toxUrineFullPanel = false;
      this.toxUrineConfirmationPanel = false;
      this.repeatPrevious = false;
      this.preference1 = false;
      this.preference2 = false;
      this.preference3 = false;
      this.preference4 = false;
      this.preference5 = false;
      this.preference6 = false;
      this.preference7 = false;
      this.preference8 = false;
      if (this.toxUrineUniversalReflexPanel == false && this.toxUrineTargetReflexPanel == false){
        this.toxUrineCustomPanel = true;
      }
      this.labInfoChanged();
    }
  }

  opioidAntagonistsUChanged(reset:boolean) {
    if (this.opioidAntagonists.full){
      this.opioidAntagonists.naloxone = true;
      this.opioidAntagonists.nalmefene = true;
      this.opioidAntagonists.naltrexone = true;     
    }
    else {
      this.opioidAntagonists.naloxone = false;
      this.opioidAntagonists.nalmefene = false;
      this.opioidAntagonists.naltrexone = false;  
    }
    if(reset){
      this.toxUrineFullPanel = false;
      this.toxUrineConfirmationPanel = false;
      this.repeatPrevious = false;
      this.preference1 = false;
      this.preference2 = false;
      this.preference3 = false;
      this.preference4 = false;
      this.preference5 = false;
      this.preference6 = false;
      this.preference7 = false;
      this.preference8 = false;
      if (this.toxUrineUniversalReflexPanel == false && this.toxUrineTargetReflexPanel == false){
        this.toxUrineCustomPanel = true;
      }
      this.labInfoChanged();
    }
  }

  opioidAntagonistsItemUChanged(reset:boolean) {
    if (this.opioidAntagonists.naloxone &&
      this.opioidAntagonists.nalmefene &&
      this.opioidAntagonists.naltrexone )
    {
      this.opioidAntagonists.full = true;
    }
    else {
      this.opioidAntagonists.full = false;
    }
    if(reset){
      this.toxUrineFullPanel = false;
      this.toxUrineConfirmationPanel = false;
      this.repeatPrevious = false;
      this.preference1 = false;
      this.preference2 = false;
      this.preference3 = false;
      this.preference4 = false;
      this.preference5 = false;
      this.preference6 = false;
      this.preference7 = false;
      this.preference8 = false;
      if (this.toxUrineUniversalReflexPanel == false && this.toxUrineTargetReflexPanel == false){
        this.toxUrineCustomPanel = true;
      }
      this.labInfoChanged();
    }
  }

  skeletalUChanged(reset:boolean) {
    if (this.skeletal.full){
      this.skeletal.baclofen = true;
      this.skeletal.carisoprodol = true;
      this.skeletal.cyclobenzaprine = true;
      this.skeletal.meprobamate = true;
      this.skeletal.methocarbamol = true;
      this.skeletal.tizanidine = true;      
    }
    else {
      this.skeletal.baclofen = false;
      this.skeletal.carisoprodol = false;
      this.skeletal.cyclobenzaprine = false;
      this.skeletal.meprobamate = false;
      this.skeletal.methocarbamol = false;
      this.skeletal.tizanidine = false;
    }
    if(reset){
      this.toxUrineFullPanel = false;
      this.toxUrineConfirmationPanel = false;
      this.repeatPrevious = false;
      this.preference1 = false;
      this.preference2 = false;
      this.preference3 = false;
      this.preference4 = false;
      this.preference5 = false;
      this.preference6 = false;
      this.preference7 = false;
      this.preference8 = false;
      if (this.toxUrineUniversalReflexPanel == false && this.toxUrineTargetReflexPanel == false){
        this.toxUrineCustomPanel = true;
      }
      this.labInfoChanged();
    }
  }

  skeletalItemUChanged(reset:boolean) {
    if (this.skeletal.baclofen &&
      this.skeletal.carisoprodol &&
      this.skeletal.cyclobenzaprine &&
      this.skeletal.meprobamate &&
      this.skeletal.methocarbamol &&
      this.skeletal.tizanidine )
    {
      this.skeletal.full = true;
    }
    else {
      this.skeletal.full = false;
    }
    if(reset){
      this.toxUrineFullPanel = false;
      this.toxUrineConfirmationPanel = false;
      this.repeatPrevious = false;
      this.preference1 = false;
      this.preference2 = false;
      this.preference3 = false;
      this.preference4 = false;
      this.preference5 = false;
      this.preference6 = false;
      this.preference7 = false;
      this.preference8 = false;
      if (this.toxUrineUniversalReflexPanel == false && this.toxUrineTargetReflexPanel == false){
        this.toxUrineCustomPanel = true;
      }
      this.labInfoChanged();
    }
  }

  hallucinogensUChanged(reset:boolean) {
    if (this.hallucinogens.full){
      this.hallucinogens.lsd = true;
      // this.hallucinogens.psilocybin = true;      
    }
    else {
      this.hallucinogens.lsd = false;
      // this.hallucinogens.psilocybin = false;    
    }
    if(reset){
      this.toxUrineFullPanel = false;
      this.toxUrineConfirmationPanel = false;
      this.repeatPrevious = false;
      this.preference1 = false;
      this.preference2 = false;
      this.preference3 = false;
      this.preference4 = false;
      this.preference5 = false;
      this.preference6 = false;
      this.preference7 = false;
      this.preference8 = false;
    if (this.toxUrineUniversalReflexPanel == false && this.toxUrineTargetReflexPanel == false){
      this.toxUrineCustomPanel = true;
    }
      this.labInfoChanged();
    }
  }

  hallucinogensItemUChanged(reset:boolean) {
    if (this.hallucinogens.lsd) //&&
      // this.hallucinogens.psilocybin )
    {
      this.hallucinogens.full = true;
    }
    else {
      this.hallucinogens.full = false;
    }
    if(reset){
      this.toxUrineFullPanel = false;
      this.toxUrineConfirmationPanel = false;
      this.repeatPrevious = false;
      this.preference1 = false;
      this.preference2 = false;
      this.preference3 = false;
      this.preference4 = false;
      this.preference5 = false;
      this.preference6 = false;
      this.preference7 = false;
      this.preference8 = false;
    if (this.toxUrineUniversalReflexPanel == false && this.toxUrineTargetReflexPanel == false){
      this.toxUrineCustomPanel = true;
    }
      this.labInfoChanged();
    }
  }

  thcSourceUChanged(reset:boolean) {
    if (this.thcSource){
      this.cannabinoids.cbd = true;
      this.cannabinoids.thc = true;
    }
    if(reset){
      this.toxUrineFullPanel = false;
      this.toxUrineConfirmationPanel = false;
      this.repeatPrevious = false;
      this.preference1 = false;
      this.preference2 = false;
      this.preference3 = false;
      this.preference4 = false;
      this.preference5 = false;
      this.preference6 = false;
      this.preference7 = false;
      this.preference8 = false;
      if (this.toxUrineUniversalReflexPanel == false && this.toxUrineTargetReflexPanel == false){
        this.toxUrineCustomPanel = true;
      }
      this.labInfoChanged();
    }
  }

  gabapentinoidsUChanged(reset:boolean) {
    if (this.gabapentinoids.full){
      this.gabapentinoids.gabapentin = true;
      this.gabapentinoids.pregabalin = true;  
    }
    else {
      this.gabapentinoids.gabapentin = false;
      this.gabapentinoids.pregabalin = false;  
    }
    if(reset){
      this.toxUrineFullPanel = false;
      this.toxUrineConfirmationPanel = false;
      this.repeatPrevious = false;
      this.preference1 = false;
      this.preference2 = false;
      this.preference3 = false;
      this.preference4 = false;
      this.preference5 = false;
      this.preference6 = false;
      this.preference7 = false;
      this.preference8 = false;
      if (this.toxUrineUniversalReflexPanel == false && this.toxUrineTargetReflexPanel == false){
        this.toxUrineCustomPanel = true;
      }
      this.labInfoChanged();
    }
  }

  gabapentinoidsItemUChanged(reset:boolean) {
    if (this.gabapentinoids.gabapentin &
      this.gabapentinoids.pregabalin )
    {
      this.gabapentinoids.full = true;
    }
    else {
      this.gabapentinoids.full = false;
    }
    if(reset){
      this.toxUrineFullPanel = false;
      this.toxUrineConfirmationPanel = false;
      this.repeatPrevious = false;
      this.preference1 = false;
      this.preference2 = false;
      this.preference3 = false;
      this.preference4 = false;
      this.preference5 = false;
      this.preference6 = false;
      this.preference7 = false;
      this.preference8 = false;
      if (this.toxUrineUniversalReflexPanel == false && this.toxUrineTargetReflexPanel == false){
        this.toxUrineCustomPanel = true;
      }
      this.labInfoChanged();
    }
  }

  antipsychoticsUChanged(reset:boolean) {
    if (this.antipsychotics.full){
      this.antipsychotics.aripiprazole = true;
      this.antipsychotics.haloperidol = true; 
      this.antipsychotics.lurasidone = true;
      this.antipsychotics.olanzapine = true; 
      this.antipsychotics.quetiapine = true;
      this.antipsychotics.risperidone = true;  
      this.antipsychotics.ziprasidone = true;
    }
    else {
      this.antipsychotics.aripiprazole = false;
      this.antipsychotics.haloperidol = false; 
      this.antipsychotics.lurasidone = false;
      this.antipsychotics.olanzapine = false; 
      this.antipsychotics.quetiapine = false;
      this.antipsychotics.risperidone = false;  
      this.antipsychotics.ziprasidone = false;
    }
    if(reset){
      this.toxUrineFullPanel = false;
      this.toxUrineConfirmationPanel = false;
      this.repeatPrevious = false;
      this.preference1 = false;
      this.preference2 = false;
      this.preference3 = false;
      this.preference4 = false;
      this.preference5 = false;
      this.preference6 = false;
      this.preference7 = false;
      this.preference8 = false;
      if (this.toxUrineUniversalReflexPanel == false && this.toxUrineTargetReflexPanel == false){
        this.toxUrineCustomPanel = true;
      }
      this.labInfoChanged();
    }
  }

  antipsychoticsItemUChanged(reset:boolean) {
    if (this.antipsychotics.aripiprazole &
      this.antipsychotics.haloperidol &
      this.antipsychotics.lurasidone &
      this.antipsychotics.olanzapine &
      this.antipsychotics.quetiapine &
      this.antipsychotics.risperidone &
      this.antipsychotics.ziprasidone 
      )
    {
      this.antipsychotics.full = true;
    }
    else {
      this.antipsychotics.full = false;
    }
    if(reset){
      this.toxUrineFullPanel = false;
      this.toxUrineConfirmationPanel = false;
      this.repeatPrevious = false;
      this.preference1 = false;
      this.preference2 = false;
      this.preference3 = false;
      this.preference4 = false;
      this.preference5 = false;
      this.preference6 = false;
      this.preference7 = false;
      this.preference8 = false;
      if (this.toxUrineUniversalReflexPanel == false && this.toxUrineTargetReflexPanel == false){
        this.toxUrineCustomPanel = true;
      }
      this.labInfoChanged();
    }
  }

  benzodiazepinesUChanged(reset:boolean) {
    if (this.benzodiazepines.full){
      this.benzodiazepines.alprazolam = true;
      this.benzodiazepines.chlordiazepoxide = true;
      this.benzodiazepines.clonazepam = true;
      this.benzodiazepines.clonazolam = true;
      this.benzodiazepines.etizolam = true;
      this.benzodiazepines.flualprazolam = true;
      this.benzodiazepines.lorazepam = true;
      this.benzodiazepines.midazolam = true;
      this.benzodiazepines.oxazepam = true;
      this.benzodiazepines.temazepam = true;
      this.benzodiazepines.triazolam = true;
    }
    else{
      this.benzodiazepines.alprazolam = false;
      this.benzodiazepines.chlordiazepoxide = false;
      this.benzodiazepines.clonazepam = false;
      this.benzodiazepines.clonazolam = false;
      this.benzodiazepines.etizolam = false;
      this.benzodiazepines.flualprazolam = false;
      this.benzodiazepines.lorazepam = false;
      this.benzodiazepines.midazolam = false;
      this.benzodiazepines.oxazepam = false;
      this.benzodiazepines.temazepam = false;
      this.benzodiazepines.triazolam = false;
    }
    if(reset){
      this.toxUrineFullPanel = false;
      this.toxUrineConfirmationPanel = false;
      this.repeatPrevious = false;
      this.preference1 = false;
      this.preference2 = false;
      this.preference3 = false;
      this.preference4 = false;
      this.preference5 = false;
      this.preference6 = false;
      this.preference7 = false;
      this.preference8 = false;
      if (this.toxUrineUniversalReflexPanel == false && this.toxUrineTargetReflexPanel == false){
        this.toxUrineCustomPanel = true;
      }
      this.labInfoChanged();
    }
  }

  benzodiazepinesItemUChanged(reset:boolean) {
    if (this.benzodiazepines.alprazolam &&
      this.benzodiazepines.chlordiazepoxide &&
      this.benzodiazepines.clonazepam &&
      this.benzodiazepines.clonazolam &&
      this.benzodiazepines.etizolam &&
      this.benzodiazepines.flualprazolam &&
      this.benzodiazepines.lorazepam &&
      this.benzodiazepines.midazolam &&
      this.benzodiazepines.oxazepam &&
      this.benzodiazepines.temazepam &&
      this.benzodiazepines.triazolam) 
    {
      this.benzodiazepines.full = true
    }
    else {
      this.benzodiazepines.full = false;
    }
    if(reset){
      this.toxUrineFullPanel = false;
      this.toxUrineConfirmationPanel = false;
      this.repeatPrevious = false;
      this.preference1 = false;
      this.preference2 = false;
      this.preference3 = false;
      this.preference4 = false;
      this.preference5 = false;
      this.preference6 = false;
      this.preference7 = false;
      this.preference8 = false;
      if (this.toxUrineUniversalReflexPanel == false && this.toxUrineTargetReflexPanel == false){
        this.toxUrineCustomPanel = true;
      }
      this.labInfoChanged();
    }
  }

  sedativeUChanged(reset:boolean) {
    if (this.sedative.full){
      this.sedative.butalbital = true;
      this.sedative.phenibut = true;      
      this.sedative.xylazine = true; 
      this.sedative.zolpidem = true;
      this.sedative.zopiclone = true; 
    }
    else {
      this.sedative.butalbital = false;
      this.sedative.phenibut = false;
      this.sedative.xylazine = false; 
      this.sedative.zolpidem = false;
      this.sedative.zopiclone = false; 
    }
    if(reset){
      this.toxUrineFullPanel = false;
      this.toxUrineConfirmationPanel = false;
      this.repeatPrevious = false;
      this.preference1 = false;
      this.preference2 = false;
      this.preference3 = false;
      this.preference4 = false;
      this.preference5 = false;
      this.preference6 = false;
      this.preference7 = false;
      this.preference8 = false;
      if (this.toxUrineUniversalReflexPanel == false && this.toxUrineTargetReflexPanel == false){
        this.toxUrineCustomPanel = true;
      }
      this.labInfoChanged();
    }
  }

  sedativeItemUChanged(reset:boolean) {
    if (
      this.sedative.butalbital &
      this.sedative.phenibut &
      this.sedative.xylazine &
      this.sedative.zolpidem &
      this.sedative.zopiclone )
    {
      this.sedative.full = true;
    }
    else {
      this.sedative.full = false;
    }
    if(reset){
      this.toxUrineFullPanel = false;
      this.toxUrineConfirmationPanel = false;
      this.repeatPrevious = false;
      this.preference1 = false;
      this.preference2 = false;
      this.preference3 = false;
      this.preference4 = false;
      this.preference5 = false;
      this.preference6 = false;
      this.preference7 = false;
      this.preference8 = false;
      if (this.toxUrineUniversalReflexPanel == false && this.toxUrineTargetReflexPanel == false){
        this.toxUrineCustomPanel = true;
      }
      this.labInfoChanged();
    }
  }

  antidepressantsUChanged(reset:boolean) {
    if (this.antidepressants.full){
      this.antidepressants.amitriptyline = true;
      this.antidepressants.doxepin = true;
      this.antidepressants.imipramine = true;
      this.antidepressants.mirtazapine = true;
      this.antidepressants.citalopram = true;
      this.antidepressants.duloxetine = true;
      this.antidepressants.fluoxetine = true;
      this.antidepressants.paroxetine = true;
      this.antidepressants.sertraline = true;
      this.antidepressants.bupropion = true;
      this.antidepressants.trazodone = true;
      this.antidepressants.venlafaxine = true;
      this.antidepressants.vortioxetine = true;
    }
    else {
      this.antidepressants.amitriptyline = false;
      this.antidepressants.doxepin = false;
      this.antidepressants.imipramine = false;
      this.antidepressants.mirtazapine = false;
      this.antidepressants.citalopram = false;
      this.antidepressants.duloxetine = false;
      this.antidepressants.fluoxetine = false;
      this.antidepressants.paroxetine = false;
      this.antidepressants.sertraline = false;
      this.antidepressants.bupropion = false;
      this.antidepressants.trazodone = false;
      this.antidepressants.venlafaxine = false;
      this.antidepressants.vortioxetine = false;
    }
    if(reset){
      this.toxUrineFullPanel = false;
      this.toxUrineConfirmationPanel = false;
      this.repeatPrevious = false;
      this.preference1 = false;
      this.preference2 = false;
      this.preference3 = false;
      this.preference4 = false;
      this.preference5 = false;
      this.preference6 = false;
      this.preference7 = false;
      this.preference8 = false;
      if (this.toxUrineUniversalReflexPanel == false && this.toxUrineTargetReflexPanel == false){
        this.toxUrineCustomPanel = true;
      }
      this.labInfoChanged();
    }
  }

  antidepressantsItemUChanged(reset:boolean) {
    if (this.antidepressants.amitriptyline &&
      this.antidepressants.doxepin &&
      this.antidepressants.imipramine &&
      this.antidepressants.mirtazapine &&
      this.antidepressants.citalopram &&
      this.antidepressants.duloxetine &&
      this.antidepressants.fluoxetine &&
      this.antidepressants.paroxetine &&
      this.antidepressants.sertraline &&
      this.antidepressants.bupropion &&
      this.antidepressants.trazodone &&
      this.antidepressants.venlafaxine &&
      this.antidepressants.vortioxetine
      )
    {
      this.antidepressants.full = true;
    }
    else {
      this.antidepressants.full = false;
    }
    if(reset){
      this.toxUrineFullPanel = false;
      this.toxUrineConfirmationPanel = false;
      this.repeatPrevious = false;
      this.preference1 = false;
      this.preference2 = false;
      this.preference3 = false;
      this.preference4 = false;
      this.preference5 = false;
      this.preference6 = false;
      this.preference7 = false;
      this.preference8 = false;
      if (this.toxUrineUniversalReflexPanel == false && this.toxUrineTargetReflexPanel == false){
        this.toxUrineCustomPanel = true;
      }
      this.labInfoChanged();
    }
  }

  stimulantsUChanged(reset:boolean) {
    if (this.stimulants.full){
      this.stimulants.benzylone = true; 
      this.stimulants.eutylone = true;
      this.stimulants.mda = true;
      this.stimulants.methylphenidate = true;
      this.stimulants.phentermine = true;
    }
    else {
      this.stimulants.benzylone = false; 
      this.stimulants.eutylone = false;
      this.stimulants.mda = false;
      this.stimulants.methylphenidate = false;
      this.stimulants.phentermine = false;
    }
    if(reset){
      this.toxUrineFullPanel = false;
      this.toxUrineConfirmationPanel = false;
      this.repeatPrevious = false;
      this.preference1 = false;
      this.preference2 = false;
      this.preference3 = false;
      this.preference4 = false;
      this.preference5 = false;
      this.preference6 = false;
      this.preference7 = false;
      this.preference8 = false;
      if (this.toxUrineUniversalReflexPanel == false && this.toxUrineTargetReflexPanel == false){
        this.toxUrineCustomPanel = true;
      }
      this.labInfoChanged();
    }
  }

  stimulantsItemUChanged(reset:boolean) {
    if (this.stimulants.benzylone &
      this.stimulants.eutylone &
      this.stimulants.mda &
      this.stimulants.methylphenidate &
      this.stimulants.phentermine )
    {
      this.stimulants.full = true;
    }
    else {
      this.stimulants.full = false;
    }
    if(reset){
      this.toxUrineFullPanel = false;
      this.toxUrineConfirmationPanel = false;
      this.repeatPrevious = false;
      this.preference1 = false;
      this.preference2 = false;
      this.preference3 = false;
      this.preference4 = false;
      this.preference5 = false;
      this.preference6 = false;
      this.preference7 = false;
      this.preference8 = false;
      if (this.toxUrineUniversalReflexPanel == false && this.toxUrineTargetReflexPanel == false){
        this.toxUrineCustomPanel = true;
      }
      this.labInfoChanged();
    }
  }

  dissociativeUChanged(reset:boolean) {
    if (this.dissociative.full){
      this.dissociative.ketamine = true;
      this.dissociative.pcp = true; 
    }
    else {
      this.dissociative.ketamine = false;
      this.dissociative.pcp = false; 
    }
    if(reset){
      this.toxUrineFullPanel = false;
      this.toxUrineConfirmationPanel = false;
      this.repeatPrevious = false;
      this.preference1 = false;
      this.preference2 = false;
      this.preference3 = false;
      this.preference4 = false;
      this.preference5 = false;
      this.preference6 = false;
      this.preference7 = false;
      this.preference8 = false;
      if (this.toxUrineUniversalReflexPanel == false && this.toxUrineTargetReflexPanel == false){
        this.toxUrineCustomPanel = true;
      }
      this.labInfoChanged();
    }
  }

  dissociativeItemUChanged(reset:boolean) {
    if (this.dissociative.ketamine &
      this.dissociative.pcp )
    {
      this.dissociative.full = true;
    }
    else {
      this.dissociative.full = false;
    }
    if(reset){
      this.toxUrineFullPanel = false;
      this.toxUrineConfirmationPanel = false;
      this.repeatPrevious = false;
      this.preference1 = false;
      this.preference2 = false;
      this.preference3 = false;
      this.preference4 = false;
      this.preference5 = false;
      this.preference6 = false;
      this.preference7 = false;
      this.preference8 = false;
      if (this.toxUrineUniversalReflexPanel == false && this.toxUrineTargetReflexPanel == false){
        this.toxUrineCustomPanel = true;
      }
      this.labInfoChanged();
    }
  }

  // Tox Oral
  
  toxOralFull(){
    if (this.toxOralFullPanel){
      this.oralIllicit.full = true;
      this.oralSedative.full = true;
      this.oralBenzodiazepines.full = true;
      this.oralMuscle.full = true;
      this.oralAntipsychotics.full = true;
      this.oralAntidepressants.full = true;
      this.oralStimulants.full = true;
      this.oralKratom.full = true;
      this.oralNicotine.full = true;
      this.oralOpioidAntagonists.full = true;
      this.oralGabapentinoids.full = true;
      this.oralDissociative.full = true;
      this.oralOpioidAgonists.full = true;
    }
    else{
      this.oralIllicit.full = false;
      this.oralSedative.full = false;
      this.oralBenzodiazepines.full = false;
      this.oralMuscle.full = false;
      this.oralAntipsychotics.full = false;
      this.oralAntidepressants.full = false;
      this.oralStimulants.full = false;
      this.oralKratom.full = false;
      this.oralNicotine.full = false;
      this.oralOpioidAntagonists.full = false;
      this.oralGabapentinoids.full = false;
      this.oralDissociative.full = false;
      this.oralOpioidAgonists.full = false;
    }

    this.illicitOChanged(false);
    this.sedativeOChanged(false);
    this.benzodiazepinesOChanged(false);
    this.muscularOChanged(false);
    this.antipsychoticsOChanged(false);
    this.antidepressantsOChanged(false);
    this.stimulantsOChanged(false);
    this.kratomOChanged(false);
    this.nicotineOChanged(false);
    this.opioidAntagonistsOChanged(false);
    this.gabapentinoidsOChanged(false);
    this.dissociativeOChanged(false);
    this.opioidAgonistsOChanged(false);
    
    this.repeatPrevious = false;
    this.preference1 = false;
    this.preference2 = false;
    this.preference3 = false;
    this.preference4 = false;
    this.preference5 = false;
    this.preference6 = false;
    this.preference7 = false;
    this.preference8 = false;
    this.labInfoChanged();
  }

  illicitOChanged(reset:boolean) {
    if (this.oralIllicit.full){
      this.oralIllicit.mam6 = true;
      this.oralIllicit.amphetamine = true;
      this.oralIllicit.methamphetamine = true;
      this.oralIllicit.benzoylecgonine = true;
      this.oralIllicit.mdma = true;
      this.oralIllicit.pcp = true;
      this.oralIllicit.thc = true;
    }
    else {
      this.oralIllicit.mam6 = false;
      this.oralIllicit.amphetamine = false;
      this.oralIllicit.methamphetamine = false;
      this.oralIllicit.benzoylecgonine = false;
      this.oralIllicit.mdma = false;
      this.oralIllicit.pcp = false;
      this.oralIllicit.thc = false;
    }
    if(reset){
      this.toxOralFullPanel = false;
      this.repeatPrevious = false;
      this.preference1 = false;
      this.preference2 = false;
      this.preference3 = false;
      this.preference4 = false;
      this.preference5 = false;
      this.preference6 = false;
      this.preference7 = false;
      this.preference8 = false;
      this.labInfoChanged();
    }
  }

  illicitItemOChanged(reset:boolean) {
    if (this.oralIllicit.mam6 &&
      this.oralIllicit.amphetamine &&
      this.oralIllicit.methamphetamine &&
      this.oralIllicit.benzoylecgonine &&
      this.oralIllicit.mdma &&
      this.oralIllicit.pcp &&
      this.oralIllicit.thc)
    {
      this.oralIllicit.full = true;
    }
    else {
      this.oralIllicit.full = false;
    }
    if(reset){
      this.toxOralFullPanel = false;
      this.repeatPrevious = false;
      this.preference1 = false;
      this.preference2 = false;
      this.preference3 = false;
      this.preference4 = false;
      this.preference5 = false;
      this.preference6 = false;
      this.preference7 = false;
      this.preference8 = false;
      this.labInfoChanged();
    }
  }

  sedativeOChanged(reset:boolean) {
    if (this.oralSedative.full){
      this.oralSedative.zolpidem = true; 
      this.oralSedative.butalbital = true;
    }
    else {
      this.oralSedative.zolpidem = false;
      this.oralSedative.butalbital = false;
    }
    if(reset){
      this.toxOralFullPanel = false;
      this.repeatPrevious = false;
      this.preference1 = false;
      this.preference2 = false;
      this.preference3 = false;
      this.preference4 = false;
      this.preference5 = false;
      this.preference6 = false;
      this.preference7 = false;
      this.preference8 = false;
      this.labInfoChanged();
    }
  }

  sedativeItemOChanged(reset:boolean) {
    if (this.oralSedative.zolpidem && 
        this.oralSedative.butalbital)
    {
      this.oralSedative.full = true;
    }
    else {
      this.oralSedative.full = false;
    }
    if(reset){
      this.toxOralFullPanel = false;
      this.repeatPrevious = false;
      this.preference1 = false;
      this.preference2 = false;
      this.preference3 = false;
      this.preference4 = false;
      this.preference5 = false;
      this.preference6 = false;
      this.preference7 = false;
      this.preference8 = false;
      this.labInfoChanged();
    }
  }

  benzodiazepinesOChanged(reset:boolean) {
    if (this.oralBenzodiazepines.full){
      this.oralBenzodiazepines.alprazolam = true;
      this.oralBenzodiazepines.diazepam = true;
      this.oralBenzodiazepines.clonazepam = true;
      this.oralBenzodiazepines.aminoclonazepam = true;
      this.oralBenzodiazepines.nordiazepam = true;
      this.oralBenzodiazepines.lorazepam = true;
      this.oralBenzodiazepines.oxazepam = true;
      this.oralBenzodiazepines.temazepam = true;
    }
    else{
      this.oralBenzodiazepines.alprazolam = false;
      this.oralBenzodiazepines.diazepam = false;
      this.oralBenzodiazepines.clonazepam = false;
      this.oralBenzodiazepines.aminoclonazepam = false;
      this.oralBenzodiazepines.nordiazepam = false;
      this.oralBenzodiazepines.lorazepam = false;
      this.oralBenzodiazepines.oxazepam = false;
      this.oralBenzodiazepines.temazepam = false;
    }
    if(reset){
      this.toxOralFullPanel = false;
      this.repeatPrevious = false;
      this.preference1 = false;
      this.preference2 = false;
      this.preference3 = false;
      this.preference4 = false;
      this.preference5 = false;
      this.preference6 = false;
      this.preference7 = false;
      this.preference8 = false;
      this.labInfoChanged();
    }
  }

  benzodiazepinesItemOChanged(reset:boolean) {
    this.oralBenzodiazepines.aminoclonazepam = this.oralBenzodiazepines.clonazepam;
    if (this.oralBenzodiazepines.alprazolam &&
      this.oralBenzodiazepines.diazepam &&
      this.oralBenzodiazepines.clonazepam &&
      // this.oralBenzodiazepines.aminoclonazepam &&     
      this.oralBenzodiazepines.nordiazepam &&
      this.oralBenzodiazepines.lorazepam &&
      this.oralBenzodiazepines.oxazepam &&
      this.oralBenzodiazepines.temazepam) 
      {
        this.oralBenzodiazepines.full = true
      }
      else {
        this.oralBenzodiazepines.full = false;
      }
      if(reset){
        this.toxOralFullPanel = false;
        this.repeatPrevious = false;
        this.preference1 = false;
        this.preference2 = false;
        this.preference3 = false;
        this.preference4 = false;
        this.preference5 = false;
        this.preference6 = false;
        this.preference7 = false;
        this.preference8 = false;
        this.labInfoChanged();
      }
  }

  muscularOChanged(reset:boolean) {
    if (this.oralMuscle.full){
      this.oralMuscle.baclofen = true;
      this.oralMuscle.carisoprodol = true;
      this.oralMuscle.cyclobenzaprine = true;     
      this.oralMuscle.meprobamate = true; 
      this.oralMuscle.methocarbamol = true;
    }
    else {
      this.oralMuscle.baclofen = false;
      this.oralMuscle.carisoprodol = false;
      this.oralMuscle.cyclobenzaprine = false;  
      this.oralMuscle.meprobamate = false;
      this.oralMuscle.methocarbamol = false;
    }
    if(reset){
      this.toxOralFullPanel = false;
      this.repeatPrevious = false;
      this.preference1 = false;
      this.preference2 = false;
      this.preference3 = false;
      this.preference4 = false;
      this.preference5 = false;
      this.preference6 = false;
      this.preference7 = false;
      this.preference8 = false;
      this.labInfoChanged();
    }
  }

  muscularItemOChanged(reset:boolean) {
    if (this.oralMuscle.baclofen &&
      this.oralMuscle.carisoprodol &&
      this.oralMuscle.cyclobenzaprine &&
      this.oralMuscle.meprobamate &&
      this.oralMuscle.methocarbamol )
    {
      this.oralMuscle.full = true;
    }
    else {
      this.oralMuscle.full = false;
    }
    if(reset){
      this.toxOralFullPanel = false;
      this.repeatPrevious = false;
      this.preference1 = false;
      this.preference2 = false;
      this.preference3 = false;
      this.preference4 = false;
      this.preference5 = false;
      this.preference6 = false;
      this.preference7 = false;
      this.preference8 = false;
      this.labInfoChanged();
    }
  }

  antipsychoticsOChanged(reset:boolean) {
    if (this.oralAntipsychotics.full){
      this.oralAntipsychotics.aripiprazole = true;
      this.oralAntipsychotics.quetiapine = true;
      this.oralAntipsychotics.risperidone = true;
      this.oralAntipsychotics.ziprasidone = true;
    }
    else {
      this.oralAntipsychotics.aripiprazole = false;
      this.oralAntipsychotics.quetiapine = false;
      this.oralAntipsychotics.risperidone = false;
      this.oralAntipsychotics.ziprasidone = false;

    }
    if(reset){
      this.toxOralFullPanel = false;
      this.repeatPrevious = false;
      this.preference1 = false;
      this.preference2 = false;
      this.preference3 = false;
      this.preference4 = false;
      this.preference5 = false;
      this.preference6 = false;
      this.preference7 = false;
      this.preference8 = false;
      this.labInfoChanged();
    }
  }

  antipsychoticsItemOChanged(reset:boolean) {
    if (this.oralAntipsychotics.aripiprazole &&
      this.oralAntipsychotics.quetiapine &&
      this.oralAntipsychotics.risperidone &&
      this.oralAntipsychotics.ziprasidone)
    {
      this.oralAntipsychotics.full = true;
    }
    else {
      this.oralAntipsychotics.full = false;
    }
    if(reset){
      this.toxOralFullPanel = false;
      this.repeatPrevious = false;
      this.preference1 = false;
      this.preference2 = false;
      this.preference3 = false;
      this.preference4 = false;
      this.preference5 = false;
      this.preference6 = false;
      this.preference7 = false;
      this.preference8 = false;
      this.labInfoChanged();
    }
  }

  antidepressantsOChanged(reset:boolean) {
    if (this.oralAntidepressants.full){
      this.oralAntidepressants.amitriptyline = true;
      this.oralAntidepressants.citalopram = true;
      this.oralAntidepressants.fluoxetine = true;
      this.oralAntidepressants.nortriptyline = true;
      this.oralAntidepressants.paroxetine = true;
      this.oralAntidepressants.sertraline = true;
      this.oralAntidepressants.venlafaxine = true;
      this.oralAntidepressants.desmethylvenlafaxine = true;
      this.oralAntidepressants.doxepin = true;
      this.oralAntidepressants.mirtazapine = true;
      this.oralAntidepressants.trazodone = true;
    }
    else {
      this.oralAntidepressants.amitriptyline = false;
      this.oralAntidepressants.citalopram = false;
      this.oralAntidepressants.fluoxetine = false;
      this.oralAntidepressants.nortriptyline = false;
      this.oralAntidepressants.paroxetine = false;
      this.oralAntidepressants.sertraline = false;
      this.oralAntidepressants.venlafaxine = false;
      this.oralAntidepressants.desmethylvenlafaxine = false;
      this.oralAntidepressants.doxepin = false;
      this.oralAntidepressants.mirtazapine = false;
      this.oralAntidepressants.trazodone = false;
    }
    if(reset){
      this.toxOralFullPanel = false;
      this.repeatPrevious = false;
      this.preference1 = false;
      this.preference2 = false;
      this.preference3 = false;
      this.preference4 = false;
      this.preference5 = false;
      this.preference6 = false;
      this.preference7 = false;
      this.preference8 = false;
      this.labInfoChanged();
    }
  }

  antidepressantsItemOChanged(reset:boolean) {
    if (this.oralAntidepressants.amitriptyline &&
      this.oralAntidepressants.citalopram &&
      this.oralAntidepressants.fluoxetine &&
      this.oralAntidepressants.nortriptyline &&
      this.oralAntidepressants.paroxetine &&
      this.oralAntidepressants.sertraline &&
      this.oralAntidepressants.venlafaxine &&
      this.oralAntidepressants.desmethylvenlafaxine &&
      this.oralAntidepressants.doxepin &&
      this.oralAntidepressants.mirtazapine &&
      this.oralAntidepressants.trazodone)
    {
      this.oralAntidepressants.full = true;
    }
    else {
      this.oralAntidepressants.full = false;
    }
    if(reset){
      this.toxOralFullPanel = false;
      this.repeatPrevious = false;
      this.preference1 = false;
      this.preference2 = false;
      this.preference3 = false;
      this.preference4 = false;
      this.preference5 = false;
      this.preference6 = false;
      this.preference7 = false;
      this.preference8 = false;
      this.labInfoChanged();
    }
  }

  stimulantsOChanged(reset:boolean) {
    if (this.oralStimulants.full){
      this.oralStimulants.methylphenidate = true;
      this.oralStimulants.ritalinicAcid = true;
      this.oralStimulants.mda = true;
      this.oralStimulants.phentermine = true; 
    }
    else {
      this.oralStimulants.methylphenidate = false;
      this.oralStimulants.ritalinicAcid = false;  
      this.oralStimulants.mda = false;  
      this.oralStimulants.phentermine = false;  
    }
    if(reset){
      this.toxOralFullPanel = false;
      this.repeatPrevious = false;
      this.preference1 = false;
      this.preference2 = false;
      this.preference3 = false;
      this.preference4 = false;
      this.preference5 = false;
      this.preference6 = false;
      this.preference7 = false;
      this.preference8 = false;
      this.labInfoChanged();
    }
  }
  
  stimulantsItemOChanged(reset:boolean) {
    if (this.oralStimulants.methylphenidate &&
      this.oralStimulants.ritalinicAcid &&
      this.oralStimulants.mda &&
      this.oralStimulants.phentermine )
    {
      this.oralStimulants.full = true;
    }
    else {
      this.oralStimulants.full = false;
    }
    if(reset){
      this.toxOralFullPanel = false;
      this.repeatPrevious = false;
      this.preference1 = false;
      this.preference2 = false;
      this.preference3 = false;
      this.preference4 = false;
      this.preference5 = false;
      this.preference6 = false;
      this.preference7 = false;
      this.preference8 = false;
      this.labInfoChanged();
    }
  }

  kratomOChanged(reset:boolean) {
    if (this.oralKratom.full){
      this.oralKratom.mitragynine = true;     
    }
    else {
      this.oralKratom.mitragynine = false;  
    }
    if(reset){
      this.toxOralFullPanel = false;
      this.repeatPrevious = false;
      this.preference1 = false;
      this.preference2 = false;
      this.preference3 = false;
      this.preference4 = false;
      this.preference5 = false;
      this.preference6 = false;
      this.preference7 = false;
      this.preference8 = false;
      this.labInfoChanged();
    }
  }

  kratomItemOChanged(reset:boolean) {
    if (this.oralKratom.mitragynine )
    {
      this.oralKratom.full = true;
    }
    else {
      this.oralKratom.full = false;
    }
    if(reset){
      this.toxOralFullPanel = false;
      this.repeatPrevious = false;
      this.preference1 = false;
      this.preference2 = false;
      this.preference3 = false;
      this.preference4 = false;
      this.preference5 = false;
      this.preference6 = false;
      this.preference7 = false;
      this.preference8 = false;
      this.labInfoChanged();
    }
  }

  nicotineOChanged(reset:boolean) {
    if (this.oralNicotine.full){   
      this.oralNicotine.cotinine = true;
    }
    else {
      this.oralNicotine.cotinine = false;
    }
    if(reset){
      this.toxOralFullPanel = false;
      this.repeatPrevious = false;
      this.preference1 = false;
      this.preference2 = false;
      this.preference3 = false;
      this.preference4 = false;
      this.preference5 = false;
      this.preference6 = false;
      this.preference7 = false;
      this.preference8 = false;
      this.labInfoChanged();
    }
  }

  nicotineItemOChanged(reset:boolean) {
    if (this.oralNicotine.cotinine  )
    {
      this.oralNicotine.full = true;
    }
    else {
      this.oralNicotine.full = false;
    }
    if(reset){
      this.toxOralFullPanel = false;
      this.repeatPrevious = false;
      this.preference1 = false;
      this.preference2 = false;
      this.preference3 = false;
      this.preference4 = false;
      this.preference5 = false;
      this.preference6 = false;
      this.preference7 = false;
      this.preference8 = false;
      this.labInfoChanged();
    }
  } 

  opioidAntagonistsOChanged(reset:boolean) {
    if (this.oralOpioidAntagonists.full){
      this.oralOpioidAntagonists.naloxone = true;
      this.oralOpioidAntagonists.naltrexone = true;     
    }
    else {
      this.oralOpioidAntagonists.naloxone = false;
      this.oralOpioidAntagonists.naltrexone = false;  
    }
    if(reset){
      this.toxOralFullPanel = false;
      this.repeatPrevious = false;
      this.preference1 = false;
      this.preference2 = false;
      this.preference3 = false;
      this.preference4 = false;
      this.preference5 = false;
      this.preference6 = false;
      this.preference7 = false;
      this.preference8 = false;
      this.labInfoChanged();
    }
  }

  opioidAntagonistsItemOChanged(reset:boolean) {
    if (this.oralOpioidAntagonists.naloxone &&
      this.oralOpioidAntagonists.naltrexone )
    {
      this.oralOpioidAntagonists.full = true;
    }
    else {
      this.oralOpioidAntagonists.full = false;
    }
    if(reset){
      this.toxOralFullPanel = false;
      this.repeatPrevious = false;
      this.preference1 = false;
      this.preference2 = false;
      this.preference3 = false;
      this.preference4 = false;
      this.preference5 = false;
      this.preference6 = false;
      this.preference7 = false;
      this.preference8 = false;
      this.labInfoChanged();
    }
  }

  gabapentinoidsOChanged(reset:boolean) {
    if (this.oralGabapentinoids.full){
      this.oralGabapentinoids.gabapentin = true;
      this.oralGabapentinoids.pregabalin = true;     
    }
    else {
      this.oralGabapentinoids.gabapentin = false;
      this.oralGabapentinoids.pregabalin = false;  
    }
    if(reset){
      this.toxOralFullPanel = false;
      this.repeatPrevious = false;
      this.preference1 = false;
      this.preference2 = false;
      this.preference3 = false;
      this.preference4 = false;
      this.preference5 = false;
      this.preference6 = false;
      this.preference7 = false;
      this.preference8 = false;
      this.labInfoChanged();
    }
  }

  gabapentinoidsItemOChanged(reset:boolean) {
    if (this.oralGabapentinoids.gabapentin &&
      this.oralGabapentinoids.pregabalin )
    {
      this.oralGabapentinoids.full = true;
    }
    else {
      this.oralGabapentinoids.full = false;
    }
    if(reset){
      this.toxOralFullPanel = false;
      this.repeatPrevious = false;
      this.preference1 = false;
      this.preference2 = false;
      this.preference3 = false;
      this.preference4 = false;
      this.preference5 = false;
      this.preference6 = false;
      this.preference7 = false;
      this.preference8 = false;
      this.labInfoChanged();
    }
  }

  dissociativeOChanged(reset:boolean) {
    if (this.oralDissociative.full){
      this.oralDissociative.ketamine = true;
      this.oralDissociative.norketamine = true;     
    }
    else {
      this.oralDissociative.ketamine = false;
      this.oralDissociative.norketamine = false;  
    }
    if(reset){
      this.toxOralFullPanel = false;
      this.repeatPrevious = false;
      this.preference1 = false;
      this.preference2 = false;
      this.preference3 = false;
      this.preference4 = false;
      this.preference5 = false;
      this.preference6 = false;
      this.preference7 = false;
      this.preference8 = false;
      this.labInfoChanged();
    }
  }

  dissociativeItemOChanged(reset:boolean) {
    this.oralDissociative.norketamine = this.oralDissociative.ketamine;
    if (this.oralDissociative.ketamine)
    {
      this.oralDissociative.full = true;
    }
    else {
      this.oralDissociative.full = false;
    }
    if(reset){
      this.toxOralFullPanel = false;
      this.repeatPrevious = false;
      this.preference1 = false;
      this.preference2 = false;
      this.preference3 = false;
      this.preference4 = false;
      this.preference5 = false;
      this.preference6 = false;
      this.preference7 = false;
      this.preference8 = false;
      this.labInfoChanged();
    }
  }

  opioidAgonistsOChanged(reset:boolean) {
    if (this.oralOpioidAgonists.full){
      this.oralOpioidAgonists.buprenorphine = true;
      this.oralOpioidAgonists.norbuprenorphine = true;
      this.oralOpioidAgonists.codeine = true;
      this.oralOpioidAgonists.dextromethorphan = true;
      this.oralOpioidAgonists.hydrocodone = true;
      // this.oralOpioidAgonists.norhydrocodone = true;
      this.oralOpioidAgonists.hydromorphone = true;
      this.oralOpioidAgonists.fentanyl = true;
      this.oralOpioidAgonists.norfentanyl = true;
      this.oralOpioidAgonists.methadone = true;
      this.oralOpioidAgonists.eddp = true;
      this.oralOpioidAgonists.morphine = true;
      this.oralOpioidAgonists.oxycodone = true;
      // this.oralOpioidAgonists.noroxycodone = true;
      this.oralOpioidAgonists.oxymorphone = true;
      this.oralOpioidAgonists.tapentadol = true;
      this.oralOpioidAgonists.tramadol = true;
    }
    else {
      this.oralOpioidAgonists.buprenorphine = false;
      this.oralOpioidAgonists.norbuprenorphine = false;
      this.oralOpioidAgonists.codeine = false;
      this.oralOpioidAgonists.dextromethorphan = false;
      this.oralOpioidAgonists.hydrocodone = false;
      // this.oralOpioidAgonists.norhydrocodone = false;
      this.oralOpioidAgonists.hydromorphone = false;
      this.oralOpioidAgonists.fentanyl = false;
      this.oralOpioidAgonists.norfentanyl = false;
      this.oralOpioidAgonists.methadone = false;
      this.oralOpioidAgonists.eddp = false;
      this.oralOpioidAgonists.morphine = false;
      this.oralOpioidAgonists.oxycodone = false;
      // this.oralOpioidAgonists.noroxycodone = false;
      this.oralOpioidAgonists.oxymorphone = false;
      this.oralOpioidAgonists.tapentadol = false;
      this.oralOpioidAgonists.tramadol = false;
    }
    if(reset){
      this.toxOralFullPanel = false;
      this.repeatPrevious = false;
      this.preference1 = false;
      this.preference2 = false;
      this.preference3 = false;
      this.preference4 = false;
      this.preference5 = false;
      this.preference6 = false;
      this.preference7 = false;
      this.preference8 = false;
      this.labInfoChanged();
    }
  }

  opioidAgonistsItemOChanged(reset:boolean) {
    this.oralOpioidAgonists.norbuprenorphine = this.oralOpioidAgonists.buprenorphine;
    // this.oralOpioidAgonists.norhydrocodone = this.oralOpioidAgonists.hydrocodone;
    this.oralOpioidAgonists.norfentanyl = this.oralOpioidAgonists.fentanyl;
    this.oralOpioidAgonists.eddp = this.oralOpioidAgonists.methadone;
    // this.oralOpioidAgonists.noroxycodone = this.oralOpioidAgonists.oxycodone;
    if (this.oralOpioidAgonists.buprenorphine &&
      // this.oralOpioidAgonists.norbuprenorphine &&
      this.oralOpioidAgonists.codeine &&
      this.oralOpioidAgonists.dextromethorphan &&
      this.oralOpioidAgonists.hydrocodone &&
      // this.oralOpioidAgonists.norhydrocodone &&
      this.oralOpioidAgonists.hydromorphone &&
      this.oralOpioidAgonists.fentanyl &&
      // this.oralOpioidAgonists.norfentanyl &&
      this.oralOpioidAgonists.methadone &&
      // this.oralOpioidAgonists.eddp &&
      this.oralOpioidAgonists.morphine &&
      this.oralOpioidAgonists.oxycodone &&
      // this.oralOpioidAgonists.noroxycodone &&
      this.oralOpioidAgonists.oxymorphone &&
      this.oralOpioidAgonists.tapentadol &&
      this.oralOpioidAgonists.tramadol)
    {
      this.oralOpioidAgonists.full = true;
    }
    else {
      this.oralOpioidAgonists.full = false;
    }
    if(reset){
      this.toxOralFullPanel = false;
      this.repeatPrevious = false;
      this.preference1 = false;
      this.preference2 = false;
      this.preference3 = false;
      this.preference4 = false;
      this.preference5 = false;
      this.preference6 = false;
      this.preference7 = false;
      this.preference8 = false;
      this.labInfoChanged();
    }
  }
  
  pregnantChanged(option: number) {
    if (option == 1){
      this.pregnantNo = false;
    }
    else{
      this.pregnantYes = false;
    }
    this.labInfoChanged();
  }

  // Medications

  loadPatientMedicationList(){

    this.patientService.getPatientMedicationList( this.patientId)
    .pipe(first())
    .subscribe(
        data => {
          if (data.valid)
          {
            this.medicationCurrentList = data.list;
            if (this.medicationCurrentList.length > 0){
              this.medicationCurrent = true;
            }
            else{
              this.medicationCurrent = false;
            }
          }

          else
          {
            this.medicationCurrentList =  new Array<MedicationListItemModel>();
            this.errorMessage = data.message;
            this.showError = true;
          }
        },
        error => {
          this.errorMessage = error;
          this.showError = true;
        });

        
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
              console.log("Medications",data);
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

  allMedicationsButton(){
    for (let citem of this.medicationCurrentList){
      var found = false;
      // Check if medication already in lab list
      for (let item of this.medicationOrderList){
        if (item.medicationId == citem.medicationId){
          found = true;
          break;
        }
      }

      if (!found){
        this.medicationOrderList.push(citem);
      }
    }
    this.labInfoChanged();
  }

  newMedicationClick(id: number){
    var found = false;
    // Check if medication already in lab list
    for (let item of this.medicationOrderList){
      if (item.medicationId == id){
        found = true;
        break;
      }
    }

    if (!found){
      // Find medication in list
      for (let item of this.medicationSearchList){
        if (item.medicationId == id){
          this.medicationOrderList.push(item);
          break;
        }
      }
      this.labInfoChanged();
    }
  }

  currentMedicationClick(value: string){
    var sepArray = value.split(',');
    var medicationId = Number(sepArray[0]);
    var description = sepArray[1];
    var found = false;
    // Check if medication already in lab list
    if (medicationId > 0){
      for (let item of this.medicationOrderList){
        if (item.medicationId == medicationId){
          found = true;
          break;
        }
      }
      
      if (!found){
        // Find medication in list
        for (let item of this.medicationCurrentList){
          if (item.medicationId == medicationId){
            this.medicationOrderList.push(item);
          }
        }
        this.labInfoChanged();
      }
    }
    else{
      for (let item of this.medicationOrderList){
        if (item.description == description){
          found = true;
          break;
        }
      }
      
      if (!found){
        // Find medication in list
        for (let item of this.medicationCurrentList){
          if (item.description == description){
            this.medicationOrderList.push(item);
          }
        }
        this.labInfoChanged();
      }
    }
  }

  orderMedicationClick(value: string){
    var index = 0;
    var sepArray = value.split(',');
    var medicationId = Number(sepArray[0]);
    var description = sepArray[1];
    if (medicationId > 0){
      for (let item of this.medicationOrderList){
        if (item.medicationId == medicationId){
          this.medicationOrderList.splice(index, 1)
          break;
        }
        index++;
      }
    }
    else{
      for (let item of this.medicationOrderList){
        if (item.description == description){
          this.medicationOrderList.splice(index, 1)
          break;
        }
        index++;
      }
    }

    this.labInfoChanged();
  }

  noMedicationsClick(){
    this.medicationOrderList = new Array<MedicationListItemModel>();
    this.labInfoChanged();
  }

  addMedicationButtonClicked(){
    var found = false;
    this.addMedication = false;
    // Check if medication already in lab list
    for (let item of this.medicationOrderList){
      if (item.description == this.medicationName){
        found = true;
        break;
      }
    }

    if (!found){
      var item = new MedicationListItemModel;
      item.medicationId = 0;
      item.description = this.medicationName;
      this.medicationOrderList.push(item);
      this.medicationName = "";
    }
    this.labInfoChanged();
  }

  allDiagnosisButton(){
    for (let citem of this.icdCurrentList){
      var found = false;
      // Check if diagnosis already in lab list
      for (let item of this.icdOrderList){
        if (item.icD10Code == citem.icD10Code){
          found = true;
          break;
        }
      }

      if (!found){
        this.icdOrderList.push(citem);
      }
    }
    this.labInfoChanged();
  }

  noDiagnosisClick(){
    this.icdOrderList = new Array<Icd10ListItemModel>();
    this.labInfoChanged();
  }

  loadPatientIcdList(){
    this.patientService.getPatientIcd10List( this.patientId)
    .pipe(first())
    .subscribe(
        data => {
          if (data.valid)
          {
            this.icdCurrentList = data.list;
            if (this.icdCurrentList.length > 0){
              this.icdCurrent = true;
            }
            else {
              this.icdCurrent = false;
            }
          }

          else
          {
            this.icdOrderList = new Array<Icd10ListItemModel>();
            this.errorMessage = data.message;
            this.showError = true;
          }
        },
        error => {
          this.errorMessage = error;
          this.showError = true;
        });

        
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
    for (let item of this.icdOrderList){
      if (item.icD10Code == id){
        found = true;
        break;
      }
    }

    if (!found){
      // Find icd code in list
      for (let item of this.icdSearchList){
        if (item.icD10Code == id){
          this.icdOrderList.push(item);
          break;
        }
      }
      this.labInfoChanged();
    }
  }

  currentIcdClick(id: string){
    var found = false;
    // Check if icd 10 already in lab list
    for (let item of this.icdOrderList){
      if (item.icD10Code == id){
        found = true;
        break;
      }
    }
    
    if (!found){
      // Find icd in list
      for (let item of this.icdCurrentList){
        if (item.icD10Code == id){
          this.icdOrderList.push(item);
        }
      }
      this.labInfoChanged();
    }
  }

  orderIcdClick(id: string){
    var index = 0;
    for (let item of this.icdOrderList){
      if (item.icD10Code == id){
        this.icdOrderList.splice(index, 1)
        break;
      }
      index++;
    }
    this.labInfoChanged();
  }

  allAllergiesButton(){
    for (let citem of this.allergyCurrentList){
      var found = false;
      // Check if allergy already in lab list
      for (let item of this.allergyOrderList){
        if (item.allergyId == citem.allergyId){
          found = true;
          break;
        }
      }

      if (!found){
        this.allergyOrderList.push(citem);
      }
    }
    this.labInfoChanged();
  }
  
  loadPatientAllergyList(){
    this.patientService.getPatientAllergyList( this.patientId)
    .pipe(first())
    .subscribe(
        data => {
          if (data.valid)
          {
            this.allergyCurrentList = data.list;
            if (this.allergyCurrentList.length > 0){
              this.allergyCurrent = true;
            }
            else {
              this.allergyCurrent = false;
            }
          }

          else
          {
            this.allergyCurrentList = new Array<AllergyListItemModel>();
            this.errorMessage = data.message;
            this.showError = true;
          }
        },
        error => {
          this.errorMessage = error;
          this.showError = true;
        });

        
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
    for (let item of this.allergyOrderList){
      if (item.allergyId == id){
        found = true;
        break;
      }
    }

    if (!found){
      // Find allergy in list
      for (let item of this.allergySearchList){
        if (item.allergyId == id){
          this.allergyOrderList.push(item);
          break;
        }
      }
      this.labInfoChanged();
    }
  }

  currentAllergyClick(value: string){
    var sepArray = value.split(',');
    var allergyId = Number(sepArray[0]);
    var description = sepArray[1];
    var found = false;
    // Check if allergy already in lab list
    if (allergyId > 0){
      for (let item of this.allergyOrderList){
        if (item.allergyId == allergyId){
          found = true;
          break;
        }
      }
      
      if (!found){
        // Find allergy in list
        for (let item of this.allergyCurrentList){
          if (item.allergyId == allergyId){
            this.allergyOrderList.push(item);
          }
        }
        this.labInfoChanged();
      }
    }
    else{
      for (let item of this.allergyOrderList){
        if (item.description == description){
          found = true;
          break;
        }
      }
      
      if (!found){
        // Find allergy in list
        for (let item of this.allergyCurrentList){
          if (item.description == description){
            this.allergyOrderList.push(item);
          }
        }
        this.labInfoChanged();
      }
    }
  }

  orderAllergyClick(value: string){
    var index = 0;
    var sepArray = value.split(',');
    var allergyId = Number(sepArray[0]);
    var description = sepArray[1];
    if (allergyId > 0){
      for (let item of this.allergyOrderList){
        if (item.allergyId == allergyId){
          this.allergyOrderList.splice(index, 1)
          break;
        }
        index++;
      }
    }
    else{
      for (let item of this.allergyOrderList){
        if (item.description == description){
          this.allergyOrderList.splice(index, 1)
          break;
        }
        index++;
      }
    }
    this.labInfoChanged();
  }

  noAllergiesClick(){
    this.allergyOrderList = new Array<AllergyListItemModel>();
    this.labInfoChanged();
  }

  addAllergyButtonClicked(){
    var found = false;
    this.addAllergy = false;
    // Check if allergy already in lab list
    for (let item of this.allergyOrderList){
      if (item.description == this.allergyName){
        found = true;
        break;
      }
    }

    if (!found){
      var item = new AllergyListItemModel;
      item.allergyId = 0;
      item.description = this.allergyName;
      this.allergyOrderList.push(item);
      this.allergyName = "";
    }
    this.labInfoChanged();
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
                this.hideLabItems();
                this.showAttachmentEdit = true;

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
    if (this.attachmentData.loAttachmentTypeId > 0 && this.attachmentData.title != "" && this.attachmentData.description != "" 
      && (this.attachmentData.fileType !="" || this.captures.length > 0)){
      this.attachmentSave = true;
    }

  }

  addAttachmentButtonClicked(){
    this.attachmentData = new LabOrderAttachmentModel();

    this.hideLabItems();
    this.showAttachmentEdit = true;

    this.errorMessage = "";
    this.showError = false;
    this.attachmentDisabled = false;
    
    this.attachmentSave = false;

    this.fileUploaded = false;
    this.fileScanned = false;
    
    this.captures = new Array<string>();

    // Position screen
    var elmnt = document.getElementById("topOfScreen");
    elmnt.scrollIntoView();
  }

  saveAttachmentButtonClicked(){
    this.attachmentData.labOrderId = this.labOrderData.labOrderId;
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
              item.labOrderId = this.labOrderData.labOrderId;
              item.dateCreated = this.attachmentData.dateCreated.substring(0,10);
              item.attachmentType = this.attachmentData.attachmentType;
              item.description = this.attachmentData.description;
              if (this.attachmentListData == null){
                this.attachmentListData = new Array<LabOrderAttachmentListItemModel>();
              }
              this.attachmentListData.push(item);

              this.showAttachmentEdit = false;
              this.showLabItems();

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

  cancelAttachmentButtonClicked(){
    this.showAttachmentEdit = false;
    this.showAttachmentList = true;
    if (this.cameraOn){
      this.stopDevice();
    }

    this.showAttachmentEdit = false;
    this.showLabItems();
    
    // Position screen
    var elmnt = document.getElementById("topOfScreen");
    elmnt.scrollIntoView();

  }

  readFile(event: any){
    const target: DataTransfer = <DataTransfer>(event.target);
    if (target.files.length !== 1) {
      throw new Error('Cannot get multiple files');
    }
    else
    {
      this.fileUploaded = true;
      this.attachmentData.fileType = event.target.files[0].type;

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

  hideLabItems(){
    this.showPatient = false;
    this.showLabInfo = false;
    this.showPreferences = false;
    this.showPOCC = false;
    this.showToxUrine = false;
    this.showToxUrinePanel = false;
    this.showToxOral = false;
    this.showToxOralPanel = false;
    this.showGPP = false;
    this.showUTI = false;
    this.showRPP = false;
    this.showICD10 = false;
    this.showMeds = false;
    this.showAllergies = false;
    this.showButtons = false;
    this.showAttachmentList = false;
    this.showNoteList = false;
  }

  showLabItems(){
    this.showPatient = true;
    this.showLabInfo = true;
    this.showPreferences = true;
    this.showButtons = true;
    this.showAttachmentList = true;
    this.showNoteList = true;

    if (this.labOrderData.specimens[0].labTypeId == 1){
      this.showToxUrine = true;
      this.showToxUrinePanel = true;
      this.showICD10 = true;
      this.showMeds = true;
      this.showPOCCSwitch = true;
    }
    else if (this.labOrderData.specimens[0].labTypeId == 2){
      this.showToxOral = true;
      this.showToxOralPanel = true;
      this.showICD10 = true;
      this.showMeds = true;
      this.showPOCCSwitch = true;
    }
    else if (this.labOrderData.specimens[0].labTypeId == 3){
      this.showGPP = true;
      this.showICD10 = true;
    }
    else if (this.labOrderData.specimens[0].labTypeId == 4){
      this.showUTI = true;
      this.showICD10 = true;
      this.showAllergies = true;
    }
    else if (this.labOrderData.specimens[0].labTypeId == 5){
      this.showRPP = true;
      this.showICD10 = true;
    }
    

  }

  // Notes

  selectNoteButtonClicked(noteId: number){
    if (this.labOrderData.labOrderId == 0)
    {
      this.noteDisabled = false;
      this.showNoteEdit = true;
      this.noteSave = true;
    }
    else{
      this.labOrderService.getLabOrderNote( noteId)
              .pipe(first())
              .subscribe(
              data => {
                if (data.valid)
                {
                  this.errorMessage = "";
                  this.showError = false;
                  this.noteData = data;
                  this.noteDisabled = true;
                  this.hideLabItems();
                  this.showNoteEdit = true;
                  this.noteSave = false;

                  // Postion screen
                  // var elmnt = document.getElementById("topOfScreen");
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
  }

  noteChanged(){
    this.noteSave = false;
    if (this.noteData.subject != "" && this.noteData.note !=""){
      this.noteSave = true;
    }

  }

  addNoteButtonClicked(){

    this.errorMessage = "";
    this.showError = false;
    this.noteData = new LabOrderNoteModel();
    this.noteData.labOrderNoteId = 0;
    this.noteData.labOrderId = this.labOrderData.labOrderId
    this.noteData.dateTime = formatDate(new Date() , 'MM/dd/yyyy HH:mm:ss', 'en');
      
    this.noteSave = false;
    this.noteDisabled = false;
    this.hideLabItems();
    this.showNoteEdit = true;

    //Postion screen
    var elmnt = document.getElementById("topOfScreen");
    elmnt.scrollIntoView();
  }

  saveNoteButtonClicked(){
    if (this.labOrderData.labOrderId == 0)
    {
      this.showNoteAdd = false;
      // Update list
      var item = new LabOrderNoteListItemModel();
      item.labOrderNoteId = 0;
      item.labOrderId = this.labOrderData.labOrderId;
      item.dateTime = this.noteData.dateTime.substring(0,10);
      item.note = this.noteData.note;
      this.labOrderData.notes = new Array<LabOrderNoteListItemModel>();
      this.labOrderData.notes.push(item);

      this.showNoteEdit = false;
      this.showLabItems();
    
      // Position screen
      var elmnt = document.getElementById("topOfScreen");
      elmnt.scrollIntoView();
    }
    else
    {
      this.labOrderService.saveLabOrderNote( this.noteData)
            .pipe(first())
            .subscribe(
            data => {
              if (data.valid) {
                // Update list
                var item = new LabOrderNoteListItemModel();
                item.labOrderNoteId = Number(data.id);
                item.labOrderId = this.labOrderData.labOrderId;
                item.dateTime = this.noteData.dateTime.substring(0,10);
                item.note = this.noteData.note;
                if (this.labOrderData.notes == null){
                  this.labOrderData.notes = new Array<LabOrderNoteListItemModel>();
                }
                this.labOrderData.notes.push(item);

                this.showNoteEdit = false;
      
                this.showLabItems();
    
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
  }

  cancelNoteButtonClicked(){
    this.showNoteEdit = false;
    this.showLabItems();
    
    // Position screen
    var elmnt = document.getElementById("topOfScreen");
    elmnt.scrollIntoView();
  }

  bothSigButtonClicked(){
    this.physicianHardcopy = true;
    this.patientHardcopy = true;
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

  loadDropdownLists(){

    this.codeService.getList( 'POCCStatus,LabStatus,LabType,LOAttachmentType,Gender,SwabLocation' )

    .pipe(first())
    .subscribe(
        data => {
          if (data.valid)
          {
            this.poccList = data.list0;
            // console.log('POCC',this.poccList);
            this.labStatusList = data.list1;
            this.labTypeList = data.list2;
            this.attachmentTypeList = data.list3;
            this.genderSearchList = data.list4;
            this.swabLocationList = data.list5;

            var item = new CodeItemModel();
            item.id = 99;
            item.description = "All";
            this.labTypeList.push(item);

            this.searchLabTypeId = 99;

            this.dateTypeList = new Array<CodeItemModel>();
            var dt1 = new CodeItemModel();
            dt1.id = 1;
            dt1.description = "Collected Date";
            this.dateTypeList.push(dt1);
            var dt2 = new CodeItemModel();
            dt2.id = 2;
            dt2.description = "Received Date";
            this.dateTypeList.push(dt2);
            var dt3 = new CodeItemModel();
            dt3.id = 3;
            dt3.description = "Accessioned Date";
            this.dateTypeList.push(dt3);
            var dt4 = new CodeItemModel();
            dt4.id = 4;
            dt4.description = "Resulted Date";
            this.dateTypeList.push(dt4);

            this.searchDateTypeId = 1;
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

  loadLocationList(){
    var customerIdLogin = Number(sessionStorage.getItem('entityId_Login'));
    var customerId = Number(sessionStorage.getItem('customerId'));
    
    if (customerIdLogin > 0) {
      var userId = Number(sessionStorage.getItem('userId_Login'));
      this.locationService.search(userId)
            .pipe(first())
            .subscribe(
            data => {
              if (data.valid)
              {
                this.locationSearchList = data.list;

                var item = new LocationListItemModel();
                item.locationId = 0;
                item.locationName = "All";
                this.locationSearchList.splice(0,0,item);

                this.searchLocationId = 0; //Number(sessionStorage.getItem('locationId'));
              }
            },
            error => {
              //
            });
    
    }
    else{
      this.locationService.getForCustomer(customerId)
            .pipe(first())
            .subscribe(
            data => {
              if (data.valid)
              {
                this.locationSearchList = data.list;
                var item = new LocationListItemModel();
                item.locationId = 0;
                item.locationName = "All";
                this.locationSearchList.splice(0,0,item);
                this.searchLocationId = 0;// Number(sessionStorage.getItem('locationId'));
              }
            },
            error => {
              //
            });

    }
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

  // Signature Stuff

  startDrawing(event: Event) {
    console.log(event);
    // works in device not in browser

  }

  moved(event: Event) {
    // works in device not in browser
  }

  clearPad() {
    this.signaturePad.clear();
  }

  savePad() {
    const base64Data = this.signaturePad.toDataURL();
    this.signatureImg = base64Data;
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

  StartSign()
  {   
    // Set up Topaz Signature Pad
    var message = { "firstName": "", "lastName": "", "eMail": "", "location": "", "imageFormat": 1, "imageX": this.imgWidth, "imageY": this.imgHeight, "imageTransparency": false, "imageScaling": false, "maxUpScalePercent": 0.0, "rawDataFormat": "ENC", "minSigPoints": 25 };
     
    top.document.addEventListener('SignResponse', this.SignResponse, false);
    var messageData = JSON.stringify(message);
    var element = document.createElement("MyExtensionDataElement");
    element.setAttribute("messageAttribute", messageData);
    document.documentElement.appendChild(element);

    // Set up event listener
    var evt = document.createEvent("Events");
    evt.initEvent("SignStartEvent", true, false);				
    element.dispatchEvent(evt);		


   }

  SignResponse(event)
	{	
    // Get the signature image from the data returned by Topaz
		var str = event.target.getAttribute("msgAttribute");
		var obj = JSON.parse(str);
    // Save the data in Session Storage so that it can be displayed on the screen.
    sessionStorage.setItem('image',obj.imageData)


  }

  printBarcode(){
    var sex  = "";
    if (this.labOrderData.genderId == 1){
      sex = "F";
    }
    else if (this.labOrderData.genderId == 2){
      sex = "M"
    }

    var specimenBarcode = this.labOrderData.specimens[0].specimenBarcode;
    var firstName = this.labOrderData.firstName;
    var lastName = this.labOrderData.lastName;
    var dob = formatDate(this.labOrderData.dob,'MM/dd/yyyy','en');
    //console.log("Label Location",this.labOrderData.facilityCode);
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

  orderPdfRegenerate(labOrderId: number){
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
  
  orderPdfClicked(labOrderId: number) {
    this.pdfData = new LabOrderPdfModel();
    this.getLabOrderData(labOrderId).
    pipe(
      switchMap((labOrderModel:LabOrderModel)=>{
        return this.getRequestPDFData(labOrderModel);
      })
    ).subscribe(async (orderdata) => {
      await this.mergePDFs([orderdata.fileAsBase64]);
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
        this.preparePDFPreviewInNewTab(this.pdfData);           
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
    this.labOrderService.getLabOrderResultPdf(specimenId)
      .pipe(first())
      .subscribe(
        data => {
          console.log("Data", data);
          if (data.valid) {
            this.pdfData = data;
            this.preparePDFPreviewInNewTab(this.pdfData);
          }
          else {
            //this.errorMessage = data.message;
          }
        },
        error => {
          this.errorMessage = error;
          this.showError = true;
        });
  }

  preparePDFPreviewInNewTab(pdfData) {
    let bytes = this.base64ToArrayBuffer(pdfData.fileAsBase64);
    this.openPDFInNewWindow(bytes)
  }

  openPDFInNewWindow(bytes) {
    var fileblob = new Blob([bytes], { type: 'application/pdf' });
    var url = window.URL.createObjectURL(fileblob);
    let anchor = document.createElement("a");
    anchor.href = url;
    anchor.target = "_blank"
    anchor.click();
  }

  printListButtonClicked() {
    let csvDataAsString = this.getCSVFromHTMLTable();
    this.downloadService.downloadFile(csvDataAsString, 'LabOrderList.csv', 'text/csv');
  }

  printLabelsButtonClicked() {
    this.searchData?.forEach(labOrder => {
      this.labOrderService.get(labOrder.labOrderId )
        .pipe(first())
        .subscribe(
        data => {
          if (data.valid){
            this.labOrderData = data;
            this.printBarcode();
          }
        });
      
    });
  }

  private getCSVFromHTMLTable() {
    let csvStringBuilder = '';
    var labOrderListTable = this.labOrdersList.nativeElement;
    //children[0]: Table Headers
    let headers = labOrderListTable.children[0];
    //staticHeaderIndexs: indexes will be used to skip prepare static header row data while iterating body tr tags.//
    let staticHeaderIndexs = [];
    for (let i = 0; i < headers?.children.length; i++) {
      let headerText = headers.children[i].innerText;
      if (this.labOrderListStaticHeaders.indexOf(headerText) == -1) {
        csvStringBuilder += headerText + ",";
      }
      else {
        staticHeaderIndexs.push(i);
      }
    }
    csvStringBuilder = this.addNewLineToString(csvStringBuilder);
    //children[1]: Table Body
    let tbody = labOrderListTable.children[1];
    for (let i = 0; i < tbody.children.length; i++) {
      if (tbody.children[i] instanceof HTMLTableRowElement) {
        for (let j = 0; j < tbody?.children[i].children.length; j++) {
          if (staticHeaderIndexs.indexOf(j) == -1)
            csvStringBuilder += tbody.children[i].children[j].innerText + ",";
        }
        csvStringBuilder = this.addNewLineToString(csvStringBuilder);
      }
    }
    csvStringBuilder = this.addNewLineToString(csvStringBuilder);
    return csvStringBuilder;
  }

  addNewLineToString(inputString) {
    inputString = inputString.substring(0, inputString.length - 1) + "\n";
    return inputString;
  }

  async mergePDFs(base64PDFs) {
    const mergedPDF = !this.resutlPDFDocument ? await PDFDocument.create() : this.resutlPDFDocument
    for (const base64PDF of base64PDFs) {
      if (!!base64PDF) {
        const pdfBytes = this.base64ToArrayBuffer(base64PDF);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const copiedPages = await mergedPDF.copyPages(pdfDoc, pdfDoc.getPageIndices());
        copiedPages.forEach(page => mergedPDF.addPage(page));
      }
    }
    const mergedPDFBytes = await mergedPDF.save();
    this.openPDFInNewWindow(mergedPDFBytes);
    this.resutlPDFDocument = null;
  }

  base64ToArrayBuffer(base64Str) {
    return Uint8Array.from(atob(base64Str), c => c.charCodeAt(0));
  };

  async printResultsButtonClicked() {
    let qualifiedLabOrderSpecimenId = [];
    this.searchData?.forEach(labOrder => {
      if (labOrder.labStatusId == 50) {
        qualifiedLabOrderSpecimenId.push(labOrder.labOrderSpecimenId);
      }
    });
    if (qualifiedLabOrderSpecimenId.length > 0) {
      let requests = qualifiedLabOrderSpecimenId.map(specimenId =>
        this.labOrderService.getLabOrderResultPdf(specimenId)
          .pipe(catchError(e => {
            let pdfModel = new LabOrderPdfModel();
            pdfModel.message = e;
            console.log("error handler message", e.toString())
            return of(pdfModel)
          }))
      );
      forkJoin(requests)
        .subscribe(async (orderdata) => {
          await this.mergePDFs(orderdata.map(order => order.fileAsBase64));
        })
    }else{
        alert('No resulting Specimen ID found.')
    }
  }

  async printRequestsButtonClicked() {
    let qualifiedLabOrderIds = [];
    this.searchData?.forEach(labOrder => {
        qualifiedLabOrderIds.push(labOrder.labOrderId);
    });
    if (qualifiedLabOrderIds.length > 0) {
      let requests = qualifiedLabOrderIds.map(orderId =>
        this.getLabOrderData(orderId)
          .pipe(
            switchMap(orderData => {
              return this.getRequestPDFData(orderData);
            })
          )
          .pipe(catchError(e => {
            let pdfModel = new LabOrderPdfModel();
            pdfModel.message = e;
            console.log("error handler message", e.toString())
            return of(pdfModel)
          }))
      );
      forkJoin(requests)
        .subscribe(async (orderdata) => {
          await this.mergePDFs(orderdata.map((order: LabOrderPdfModel) => order.fileAsBase64));
        })
        // Method2 to get pdf data using switchmap and forkjoin.
        // let labOrderPdfModelArray$: Observable<LabOrderPdfModel>[] = [];
        // from(qualifiedLabOrderIds).pipe(
        //   switchMap((labOrderId) => {
        //     return this.getLabOrderData(labOrderId)
        //   }),
        //   switchMap((orderData: LabOrderModel) => {
        //     let pdfData$ = this.getOrderPDFData(orderData);
        //     labOrderPdfModelArray$.push(pdfData$);
        //     return forkJoin(labOrderPdfModelArray$);
        //   })
        // ).subscribe(async (orderdata) => {
        //   await this.mergePDFs(orderdata.map((order: LabOrderPdfModel) => order.fileAsBase64));
        // });
        // return;
    }
  }

  getLabOrderData(labOrderId): Observable<LabOrderModel> {
    return this.labOrderService.get(labOrderId);
  }

  getRequestPDFData(orderData): Observable<LabOrderPdfModel> {
    if (orderData.valid) {
      this.patientId = orderData.patientId;
      this.labOrderData = orderData;
      if (this.labOrderData.specimens[0].requestPDF == 1) {
        return this.labOrderService.getLabOrderRequestPdf(this.labOrderData.specimens[0].labOrderSpecimenId)
      }
      else {
        return this.createAndGetPDFData(this.labOrderData);
      }
    }
    else {
      let pdfData: any = new LabOrderPdfModel();
      return of(pdfData)
    }
  }

  createAndGetPDFData(orderData): Observable<LabOrderPdfModel> {
    let pdfData: any = new LabOrderPdfModel();
    let doc;
    let physicianNPI;
    let PhysicianSig;
    let PatientSig;
    return this.patientService.get(orderData.patientId).pipe(
      switchMap((patientModel: PatientModel) => {
        if (patientModel.valid) {
          this.patientData = patientModel;
          return this.userService.get(orderData.userId_Physician);
        } else {
          return of(pdfData)
        }
      }),
      switchMap((userModel: UserModel) => {
        if (userModel.valid) {
          physicianNPI = userModel.npi;
          return this.userService.getSignature(orderData.userId_Physician, orderData.userSignatureId_Physician)
        }
        else {
          return of(pdfData)
        }
      }),
      switchMap((userSignatureModel: UserSignatureModel) => {
        PhysicianSig = userSignatureModel.fileAsBase64;
        return this.labOrderService.getPatientSignature(orderData.patientId, orderData.labOrderId)
      }),
      switchMap((userSignatureModel: UserSignatureModel) => {
        PatientSig = userSignatureModel.fileAsBase64;
        console.log("Patient Signature", PatientSig);
        // This is for Pdf generate
        if (orderData.specimens[0].labTypeId == 1) {
          this.loadToxData(orderData.specimens[0].tests);
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

          doc = this.pdfToxUrineService.generateToxUrine(orderData, tox, this.patientData, physicianNPI, PhysicianSig, PatientSig);
        }
        else if (orderData.specimens[0].labTypeId == 2) {
          this.loadToxOralData(orderData.specimens[0].tests);
          var toxOral = new ToxOralModel();
          toxOral.fullConfirmation = this.toxOralFullPanel;
          toxOral.illicit = this.oralIllicit;
          toxOral.sedative = this.oralSedative;
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
          doc = this.pdfToxOralService.generateToxOral(orderData, toxOral, this.patientData, physicianNPI, PhysicianSig, PatientSig);
        }
        else if (orderData.specimens[0].labTypeId == 3) {
          this.gppData = new GPPModel();
          this.loadGPPData();
          doc = this.pdfGPPService.generateGPP(orderData, this.gppData, this.patientData, physicianNPI, PhysicianSig, PatientSig);
        }
        else if (orderData.specimens[0].labTypeId == 4) {
          this.utiData = new UTIModel();
          this.loadUTIData();
          doc = this.pdfUTISTIService.generateUTISTI(orderData, this.utiData, this.patientData, physicianNPI, PhysicianSig, PatientSig);
        }
        else if (orderData.specimens[0].labTypeId == 5) {
          this.rppData = new RPPModel();
          this.loadRPPData();
          doc = this.pdfRPPService.generateRPP(orderData, this.rppData, this.patientData, physicianNPI, PhysicianSig, PatientSig);
        }

        pdfData.specimenId = orderData.specimens[0].labOrderSpecimenId;

        pdfData.fileType = "application/pdf";

        var b64 = doc.output('datauristring'); // base64 string

        pdfData.fileType = "application/pdf";

        pdfData.fileAsBase64 = b64.replace("data:application/pdf;filename=generated.pdf;base64,", "");

        this.labOrderService.saveLabOrderRequestPdf(pdfData)
          .pipe(first())
          .subscribe(
            data => {
              console.log("SaveData", data);
              if (data.valid) {
                console.log("RequestPDFSaved");
              }
              else {
                this.errorMessage = data.message;
                this.showError = true;
              }
            },
            error => {
              this.errorMessage = error;
              this.showError = true;
            });
        return of(pdfData);
      })
    )
  }
  
}

