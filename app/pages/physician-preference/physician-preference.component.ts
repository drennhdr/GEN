//Page Name       : Physician Preference
//Date Created    : 08/10/2022
//Written By      : Stephen Farkas
//Description     : Physician Preference Entry
//MM/DD/YYYY xxx  Description
//01/09/2023 SJF  Added Tox Oral
//01/16/2023 SJF  Added Targeted Reflex and Universal Reflex
//02/13/2023 SJF  Added message modal
//05/01/2023 SJF  Changed to new oral tox method
//-----------------------------------------------------------------------------
// Data Passing
//-----------------------------------------------------------------------------

import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import {formatDate} from '@angular/common';

import { PhysicianPreferenceService } from '../../services/physicianPreference.service';
import { LabOrderService } from '../../services/labOrder.service';

import { PhysicianPreferenceModel, PhysicianPreferenceTestModel } from '../../models/PhysicianPreferenceModel';
import {ToxModel, AlcoholModel, AntidepressantsModel, AntipsychoticsModel, BenzodiazepinesModel, CannabinoidsModel, CannabinoidsSynthModel, DissociativeModel, GabapentinoidsModel, HallucinogensModel, IllicitModel, OpioidAgonistsModel, OpioidAntagonistsModel, SedativeModel, SkeletalModel, StimulantsModel } from '../../models/LabOrderTestModel';
import { ToxOralModel, OralIllicitModel, OralSedativeModel, OralBenzodiazepinesModel, OralMuscleModel, OralAntipsychoticsModel, OralAntidepressantsModel, OralStimulantsModel, OralKratomModel, OralNicotineModel, OralOpioidAntagonistsModel, OralGabapentinoidsModel, OralDissociativeModel, OralOpioidAgonistsModel} from '../../models/LabOrderTestModel';
import { MessageModalComponent } from '../../modal/message-modal/message-modal.component';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-physician-preference',
  templateUrl: './physician-preference.component.html',
  styleUrls: ['./physician-preference.component.css']
})
export class PhysicianPreferenceComponent implements OnInit {

    // Variables to hold screen data
    customerId: number = 0;
    preferenceId: number = 0;
    preferenceListhData: any;
    preferenceData: any;
    toxUrineTargetReflexPanel: boolean;
    toxUrineUniversalReflexPanel: boolean;
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

     errorMessage: string;
     dateErrorMessage: string;
                                   
   
     // Variables to control screen display
     showList: boolean;
     showUrine: boolean;
     showOral: boolean;
     showInfo: boolean;
 
     
     preferenceSave: boolean;
     orderDisabled: boolean;
     preferenceSunset: boolean;

    // Modal Dialog
    modalRef: BsModalRef;

     constructor(
      private physicianPreferenceService: PhysicianPreferenceService,
      private labOrderService: LabOrderService,
      private modalService: BsModalService,
      private router: Router,
     ) { }

  ngOnInit(): void {
    if (sessionStorage.getItem('userId_Login') == ""){
      this.router.navigateByUrl('/login');
    }
    // Initialize screen handling variables
    this.showList = true;
    this.showUrine = false;
    this.showOral = false;
    this.showInfo = false;
    this.preferenceSunset = false;

    this.loadList();
  }

  loadList(){
    this.physicianPreferenceService.search(parseInt(sessionStorage.getItem('userId_Login')),0,0)
    .pipe(first())
    .subscribe(
        data => {
          if (data.valid)
          {
            this.preferenceListhData = data.list;
            if(this.preferenceListhData.length == 0){
                this.errorMessage = "No records found";
            }
            else{
              this.errorMessage = "";
            }
          }
          else if (data.message = "No records found")
          {
            this.errorMessage = "No records found";
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

  addToxUrineButtonClicked(){
    this.preferenceData = new PhysicianPreferenceModel();
    this.preferenceData.availableForAll = true;
    this.toxUrineTargetReflexPanel = false;
    this.toxUrineUniversalReflexPanel = false;
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
    

    this.showList= false
    this.showUrine = true;
    this.showOral = false;
    this.showInfo = true;

    this.preferenceSave = false;
    this.orderDisabled = false;
    this.preferenceSunset = false;
  }

  addToxOralButtonClicked(){
    this.preferenceData = new PhysicianPreferenceModel();
    this.preferenceData.availableForAll = true;
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
    this.thcSource = false;

    this.showList= false
    this.showUrine = false;
    this.showOral = true;
    this.showInfo = true;

    this.preferenceSave = false;
    this.orderDisabled = false;
    this.preferenceSunset = false;
    
  }

  selectButtonClicked(physicianPreferenceId: number){
    // Call the lab service to get the data for the selected preference
    this.physicianPreferenceService.get( physicianPreferenceId)
            .pipe(first())
            .subscribe(
            data => {
              if (data.valid)
              {
                //console.log(data);
                this.preferenceId = data.physicianPreferenceId;
                this.errorMessage = "";
                this.preferenceData = data;

                this.showList= false
                if (this.preferenceData.labTypeId == 1){
                  this.showUrine = true;
                  this.showOral = false;
                  this.loadTestsFromPreference();
                }
                else{
                  this.showUrine = false;
                  this.showOral = true;
                  this.loadOralTestsFromPreference();
                }
                this.showInfo = true;

                

                this.preferenceSave = false;
                this.orderDisabled = true;
                this.preferenceSunset = false;
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

  loadTestsFromPreference(){

    let data = this.labOrderService.loadToxData(this.preferenceData.tests )

    this.toxUrineTargetReflexPanel = data.targetReflex;
    this.toxUrineUniversalReflexPanel = data.universalReflex;
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

  loadOralTestsFromPreference(){

    let data = this.labOrderService.loadToxOralData(this.preferenceData.tests )

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

  preferenceChanged(){
    this.preferenceSave = false;
    if (this.preferenceData.name != '' && this.preferenceData.effectiveDate != '' && this.dateErrorMessage == ""){
      this.preferenceSave = true;
    }
  }

  effectiveDateChanged(){
    const today = new Date();
    var startDate = today.setDate(today.getDate())
    var startck = new Date(formatDate(startDate , 'MM/dd/yy', 'en'));

    var effectiveck = new Date(formatDate(this.preferenceData.effectiveDate , 'MM/dd/yy', 'en'));

    if (effectiveck < startck){
      this.dateErrorMessage = "Effective date cannot be in the past."
    }
    else
    {
      this.dateErrorMessage = "";
    }

    this.preferenceChanged();
  }

  saveButtonClicked(labType: number){
    this.preferenceData.version = "2022.11";
    this.preferenceData.labTypeId = labType;
    this.preferenceData.labTestId = 0;
    this.preferenceData.customerId = parseInt(sessionStorage.getItem('entityId_Login'));
    this.preferenceData.userId = parseInt(sessionStorage.getItem('userId_Login'));
    this.preferenceData.active = true;
    if (this.preferenceData.labTypeId == 1){
      this.loadPreferenceFromTest();
    }
    else{
      this.loadOralPreferenceFromTest();
    }
    this.physicianPreferenceService.save( this.preferenceData)
          .pipe(first())
          .subscribe(
          data => {
            console.log(data);
            if (data.valid) {
              this.showList = true;
              this.showUrine = false;
              this.showOral = false;
              this.showInfo = false;
          
              this.loadList();
            }
            else{
              this.errorMessage = data.message;
            }
          },
          error => {
          this.errorMessage = error;
          });
  }

  sunsetChanged(){
    const today = new Date();
    var startDate = today.setDate(today.getDate())
    var startck = new Date(formatDate(startDate , 'MM/dd/yy', 'en'));

    var sunsetck = new Date(formatDate(this.preferenceData.sunsetDate , 'MM/dd/yy', 'en'));

    if (sunsetck < startck){
      this.dateErrorMessage = "Sunset date cannot be in the past."
      this.preferenceSunset = false;
    }
    else
    {
      this.dateErrorMessage = "";
      this.preferenceSunset = true;
    }
    
  }

  sunsetButtonClicked(){
    const initialState: ModalOptions = {
      initialState: {
        message: "Are you sure that you wish to sunset the order?",
      }
    };
    

    this.modalRef = this.modalService.show(MessageModalComponent, {
      initialState 
    });

    this.modalRef.content.onClose.subscribe(result => {
      if (result == 1){
        this.physicianPreferenceService.sunset( this.preferenceData)
            .pipe(first())
            .subscribe(
            data => {
              console.log(data);
              if (data.valid) {
                this.showList = true;
                this.showUrine = false;
                this.showOral = false;
                this.showInfo = false;
            
                this.loadList();
              }
              else{
                this.errorMessage = data.message;
              }
            },
            error => {
            this.errorMessage = error;
            });
      }
    });

  }

  loadPreferenceFromTest(){
    var tox = new ToxModel();
    tox.targetReflex = this.toxUrineTargetReflexPanel;
    tox.universalReflex = this.toxUrineUniversalReflexPanel;
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

    console.log("Tox Test",tox);

    this.preferenceData.tests = this.labOrderService.loadToxFromTestPP(tox );
  
  }

  loadOralPreferenceFromTest(){
    var oral = new ToxOralModel();
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

    this.preferenceData.tests = this.labOrderService.loadToxOralFromTestPP(oral );
  }

  backButtonClicked(){
    this.showList= true
    this.showUrine = false;
    this.showOral = false;
    this.showInfo = false;

    this.preferenceSave = false;
    this.orderDisabled = false;
  }



  // Tox Urine
  toxReflex(posn: number){
    if (this.toxUrineTargetReflexPanel && posn == 1){
      this.presumptiveTesting15 = true;
      this.presumptiveTesting13 = false;
      this.toxUrineUniversalReflexPanel = false;
    }
    else if(this.toxUrineUniversalReflexPanel && posn == 2){
      this.presumptiveTesting15 = true;
      this.presumptiveTesting13 = false;
      this.toxUrineTargetReflexPanel = false;
    }
    else{
      this.presumptiveTesting15 = false;
      this.presumptiveTesting13 = false;
    }
  }

  presumtiveChanged15(){
    if(this.presumptiveTesting13 == false && this.presumptiveTesting15 == false){
      this.toxUrineTargetReflexPanel = false;
      this.toxUrineUniversalReflexPanel = false;
    }
    if (this.presumptiveTesting15){
      this.presumptiveTesting13 = false;
    }

  }

  presumtiveChanged13(){
    if(this.presumptiveTesting13 == false && this.presumptiveTesting15 == false){
      this.toxUrineTargetReflexPanel = false;
      this.toxUrineUniversalReflexPanel = false;
    }
    if (this.presumptiveTesting13){
      this.presumptiveTesting15 = false;
    }
  }

  illicitUChanged() {
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
      this.illicit.pcp = false;
    }
  }

  illicitItemUChanged() {
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
  }

  cannabinoidsUChanged() {
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
  }

  cannabinoidsItemUChanged() {
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
  }

  cannabinoidsSynthUChanged() {
    if (this.cannabinoidsSynth.full){
      this.cannabinoidsSynth.adb = true;
      this.cannabinoidsSynth.mdmb = true;
      this.cannabinoidsSynth.mdmb5f = true;
    }
    else {
      this.cannabinoidsSynth.adb = false;
      this.cannabinoidsSynth.mdmb = false;
      this.cannabinoidsSynth.mdmb5f = false;
    }
  }

  cannabinoidsSynthItemUChanged() {
    if (this.cannabinoidsSynth.adb &&
      this.cannabinoidsSynth.mdmb &&
      this.cannabinoidsSynth.mdmb5f)
    {
      this.cannabinoidsSynth.full = true;
    }
    else {
      this.cannabinoidsSynth.full = false;
    }
  }

  alcoholUChanged() {
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
  }

  alcoholIemUChanged() {
    if (this.alcohol.etg && this.alcohol.ets && this.alcohol.nicotine){
      this.alcohol.full = true;
    }
    else {
      this.alcohol.full = false;
    }
  }

  opioidAgonistsUChanged() {
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
  }

  opioidAgonistsItemUChanged() {
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
      // this.opioidAgonists.norbuprenorphine &&
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
  }

  opioidAntagonistsUChanged() {
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
  }

  opioidAntagonistsItemUChanged() {
    if (this.opioidAntagonists.naloxone &&
      this.opioidAntagonists.nalmefene &&
      this.opioidAntagonists.naltrexone )
    {
      this.opioidAntagonists.full = true;
    }
    else {
      this.opioidAntagonists.full = false;
    }
  }

  skeletalUChanged() {
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
  }

  skeletalItemUChanged() {
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
  }

  hallucinogensUChanged() {
    if (this.hallucinogens.full){
      this.hallucinogens.lsd = true;
      // this.hallucinogens.psilocybin = true;      
    }
    else {
      this.hallucinogens.lsd = false;
      // this.hallucinogens.psilocybin = false;    
    }
  }

  hallucinogensItemUChanged() {
    if (
      this.hallucinogens.lsd) // &&
      // this.hallucinogens.psilocybin )
    {
      this.hallucinogens.full = true;
    }
    else {
      this.hallucinogens.full = false;
    }
  }

  thcSourceUChanged() {
    if (this.thcSource){
      this.cannabinoids.cbd = true;
      this.cannabinoids.thc = true;
    }
  }

  gabapentinoidsUChanged() {
    if (this.gabapentinoids.full){
      this.gabapentinoids.gabapentin = true;
      this.gabapentinoids.pregabalin = true;  
    }
    else {
      this.gabapentinoids.gabapentin = false;
      this.gabapentinoids.pregabalin = false;  
    }
  }

  gabapentinoidsItemUChanged() {
    if (this.gabapentinoids.gabapentin &
      this.gabapentinoids.pregabalin )
    {
      this.gabapentinoids.full = true;
    }
    else {
      this.gabapentinoids.full = false;
    }
  }

  antipsychoticsUChanged() {
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
  }

  antipsychoticsItemUChanged() {
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
  }

  benzodiazepinesUChanged() {
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
  }

  benzodiazepinesItemUChanged() {
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
  }

  sedativeUChanged() {
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
  }

  sedativeItemUChanged() {
    if (
      this.sedative.butalbital &
      this.sedative.phenibut &&
      this.sedative.xylazine &
      this.sedative.zolpidem &
      this.sedative.zopiclone )
    {
      this.sedative.full = true;
    }
    else {
      this.sedative.full = false;
    }
  }

  antidepressantsUChanged() {
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
  }

  antidepressantsItemUChanged() {
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
  }

  stimulantsUChanged() {
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
  }

  stimulantsItemUChanged() {
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
  }

  dissociativeUChanged() {
    if (this.dissociative.full){
      this.dissociative.ketamine = true;
      this.dissociative.pcp = true; 
    }
    else {
      this.dissociative.ketamine = false;
      this.dissociative.pcp = false; 
    }
  }

  dissociativeItemUChanged() {
    if (this.dissociative.ketamine &
      this.dissociative.pcp )
    {
      this.dissociative.full = true;
    }
    else {
      this.dissociative.full = false;
    }
  }
  

  // Tox Oral

  illicitOChanged() {
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
  }

  illicitItemOChanged() {
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
  }

  sedativeOChanged() {
    if (this.oralSedative.full){
      this.oralSedative.zolpidem = true; 
      this.oralSedative.butalbital = true;
    }
    else {
      this.oralSedative.zolpidem = false;
      this.oralSedative.butalbital = false;
    }
  }

  sedativeItemOChanged() {
    if (this.oralSedative.zolpidem && 
        this.oralSedative.butalbital)
    {
      this.oralSedative.full = true;
    }
    else {
      this.oralSedative.full = false;
    }
  }

  benzodiazepinesOChanged() {
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
  }

  benzodiazepinesItemOChanged() {
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
  }

  muscularOChanged() {
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
  }

  muscularItemOChanged() {
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
  }

  antipsychoticsOChanged() {
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
  }

  antipsychoticsItemOChanged() {
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
  }

  antidepressantsOChanged() {
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
  }

  antidepressantsItemOChanged() {
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
  }

  stimulantsOChanged() {
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
  }
  
  stimulantsItemOChanged() {
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
  }

  kratomOChanged() {
    if (this.oralKratom.full){
      this.oralKratom.mitragynine = true;     
    }
    else {
      this.oralKratom.mitragynine = false;  
    }
  }

  kratomItemOChanged() {
    if (this.oralKratom.mitragynine )
    {
      this.oralKratom.full = true;
    }
    else {
      this.oralKratom.full = false;
    }
  }

  nicotineOChanged() {
    if (this.oralNicotine.full){   
      this.oralNicotine.cotinine = true;
    }
    else {
      this.oralNicotine.cotinine = false;
    }
  }

  nicotineItemOChanged() {
    if (this.oralNicotine.cotinine  )
    {
      this.oralNicotine.full = true;
    }
    else {
      this.oralNicotine.full = false;
    }
  } 

  opioidAntagonistsOChanged() {
    if (this.oralOpioidAntagonists.full){
      this.oralOpioidAntagonists.naloxone = true;
      this.oralOpioidAntagonists.naltrexone = true;     
    }
    else {
      this.oralOpioidAntagonists.naloxone = false;
      this.oralOpioidAntagonists.naltrexone = false;  
    }
  }

  opioidAntagonistsItemOChanged() {
    if (this.oralOpioidAntagonists.naloxone &&
      this.oralOpioidAntagonists.naltrexone )
    {
      this.oralOpioidAntagonists.full = true;
    }
    else {
      this.oralOpioidAntagonists.full = false;
    }
  }

  gabapentinoidsOChanged() {
    if (this.oralGabapentinoids.full){
      this.oralGabapentinoids.gabapentin = true;
      this.oralGabapentinoids.pregabalin = true;     
    }
    else {
      this.oralGabapentinoids.gabapentin = false;
      this.oralGabapentinoids.pregabalin = false;  
    }
  }

  gabapentinoidsItemOChanged() {
    if (this.oralGabapentinoids.gabapentin &&
      this.oralGabapentinoids.pregabalin )
    {
      this.oralGabapentinoids.full = true;
    }
    else {
      this.oralGabapentinoids.full = false;
    }
  }

  dissociativeOChanged() {
    if (this.oralDissociative.full){
      this.oralDissociative.ketamine = true;
      this.oralDissociative.norketamine = true;     
    }
    else {
      this.oralDissociative.ketamine = false;
      this.oralDissociative.norketamine = false;  
    }
  }

  dissociativeItemOChanged() {
    this.oralDissociative.norketamine = this.oralDissociative.ketamine;
    if (this.oralDissociative.ketamine)
    {
      this.oralDissociative.full = true;
    }
    else {
      this.oralDissociative.full = false;
    }
  }

  opioidAgonistsOChanged() {
    if (this.oralOpioidAgonists.full){
      this.oralOpioidAgonists.buprenorphine = true;
      this.oralOpioidAgonists.norbuprenorphine = true;
      this.oralOpioidAgonists.codeine = true;
      this.oralOpioidAgonists.dextromethorphan = true;
      this.oralOpioidAgonists.hydrocodone = true;
      this.oralOpioidAgonists.norhydrocodone = true;
      this.oralOpioidAgonists.hydromorphone = true;
      this.oralOpioidAgonists.fentanyl = true;
      this.oralOpioidAgonists.norfentanyl = true;
      this.oralOpioidAgonists.methadone = true;
      this.oralOpioidAgonists.eddp = true;
      this.oralOpioidAgonists.morphine = true;
      this.oralOpioidAgonists.oxycodone = true;
      this.oralOpioidAgonists.noroxycodone = true;
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
      this.oralOpioidAgonists.norhydrocodone = false;
      this.oralOpioidAgonists.hydromorphone = false;
      this.oralOpioidAgonists.fentanyl = false;
      this.oralOpioidAgonists.norfentanyl = false;
      this.oralOpioidAgonists.methadone = false;
      this.oralOpioidAgonists.eddp = false;
      this.oralOpioidAgonists.morphine = false;
      this.oralOpioidAgonists.oxycodone = false;
      this.oralOpioidAgonists.noroxycodone = false;
      this.oralOpioidAgonists.oxymorphone = false;
      this.oralOpioidAgonists.tapentadol = false;
      this.oralOpioidAgonists.tramadol = false;
    }
  }

  opioidAgonistsItemOChanged() {
    this.oralOpioidAgonists.norbuprenorphine = this.oralOpioidAgonists.buprenorphine;
    this.oralOpioidAgonists.norhydrocodone = this.oralOpioidAgonists.hydrocodone;
    this.oralOpioidAgonists.norfentanyl = this.oralOpioidAgonists.fentanyl;
    this.oralOpioidAgonists.eddp = this.oralOpioidAgonists.methadone;
    this.oralOpioidAgonists.noroxycodone = this.oralOpioidAgonists.oxycodone;
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
  }



}
