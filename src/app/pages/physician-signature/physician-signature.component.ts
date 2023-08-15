//Page Name       : Physician Signature
//Date Created    : 09/22/2022
//Written By      : Stephen Farkas
//Description     : Physician Signature Capture
//MM/DD/YYYY xxx  Description
//05/22/2023 SJF  Added Topaz Signature Capture
//12/08/2023 SJF  Displaying current Signature of physician
//-----------------------------------------------------------------------------
// Data Passing
//-----------------------------------------------------------------------------
import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import SignaturePad from 'signature_pad';
import { first, switchMap } from 'rxjs/operators';
import {formatDate} from '@angular/common';

import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';

import { UserSignatureModel } from '../../models/UserSignatureModel';
import { GenericResponseModel } from '../../models/GenericResponseModel';

@Component({
  selector: 'app-physician-signature',
  templateUrl: './physician-signature.component.html',
  styleUrls: ['./physician-signature.component.css']
})

export class PhysicianSignatureComponent implements OnInit, AfterViewInit  {

  signaturePad: SignaturePad;
  @ViewChild('canvas') canvasEl: ElementRef;
  errorMessage: string = "";

  signatureImg: string = '';
  padImg: string = '';
  // ctx: any;

  topazInstalled: boolean = false;
  topazSignature: string = "";
  tp2Signature: string;

  imgWidth: number = 400;
  imgHeight: number = 100;

  imageData: string = "";
  interval: any;

  currentPhysicianSignatureAs64String:string;

  constructor(
    private userService: UserService, 
    private router: Router,
  ) { }

  ngOnInit(): void {
    if (sessionStorage.getItem('userId_Login') == ""){
      this.router.navigateByUrl('/login');
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
    this.getCurrentPhysicianSignature();
  }

  ngAfterViewInit() {
    this.signaturePad = new SignaturePad(this.canvasEl.nativeElement);
    
  }

  ngOnDestroy() {
    clearInterval(this.interval);
  }

  refreshData(){
    if (sessionStorage.getItem('image') != ''){
      this.topazSignature = "data:image/png;base64," + sessionStorage.getItem('image');
      sessionStorage.setItem('image','');
      clearInterval(this.interval);

      // Save the image to the server
      var userSignature = new UserSignatureModel();
      userSignature.userSignatureId = 0;
      userSignature.userId = Number(sessionStorage.getItem('userId_Login'));
      userSignature.dateCreated = formatDate(new Date() , 'MM-dd-yyyy HH:mm', 'en');
      userSignature.fileType = "image/png";
      userSignature.fileAsBase64 = this.topazSignature.replace("data:image/png;base64,","");;
      
      this.userService.saveSignature( userSignature )
            .pipe(first())
            .subscribe(
            data => {
              if (data.valid) {
                this.errorMessage = "Your signature has been updated."
                const base64Data = this.signaturePad.toDataURL();
                this.signatureImg = base64Data;
              }
              else{
                this.errorMessage = data.message;
              }
            },
            error => {
              this.errorMessage = error;
            });



    }
    
  }

  startDrawing(event: Event) {
    // console.log("Draw");
    // console.log(event);
    // works in device not in browser

  }

  moved(event: Event) {
    // works in device not in browser
  }

  clearPad() {
    this.signaturePad.clear();
  }

  savePad() {
    //const base64Data = this.signaturePad.toDataURL("image/bmp");

    var userSignature = new UserSignatureModel();
    userSignature.userSignatureId = 0;
    userSignature.userId = Number(sessionStorage.getItem('userId_Login'));
    userSignature.dateCreated = formatDate(new Date() , 'MM-dd-yyyy HH:mm', 'en');
    userSignature.fileType = "image/png";
    userSignature.fileAsBase64 = this.signaturePad.toDataURL("image/png");
    userSignature.fileAsBase64 = userSignature.fileAsBase64.replace("data:image/png;base64,","");
    console.log("userSignature", userSignature);
    
    this.userService.saveSignature( userSignature )
          .pipe(first())
          .subscribe(
          data => {
            console.log("Data",data);
            if (data.valid) {
              this.errorMessage = "Your signature has been updated."
              const base64Data = this.signaturePad.toDataURL();
              this.signatureImg = base64Data;
            }
            else{
              this.errorMessage = data.message;
            }
          },
          error => {
            this.errorMessage = error;
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

  getCurrentPhysicianSignature(){
    this.currentPhysicianSignatureAs64String = "";
    var userID = Number(sessionStorage.getItem('userId_Login'));
    this.userService.GetUserSignatureId(userID).pipe(
      switchMap((genericResponseModel:GenericResponseModel)=>{
        return this.userService.getSignature(userID, (Number(genericResponseModel.id)||0))
      })
    ).subscribe((userSignatureModel:UserSignatureModel)=>{
      this.currentPhysicianSignatureAs64String = !!userSignatureModel.fileAsBase64? `data:image/png;base64,${userSignatureModel.fileAsBase64}` : "";
    },error=>{
      console.log(JSON.stringify(error));
    })
  }
}

