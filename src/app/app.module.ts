import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
//import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
//import { ToastrModule } from 'ngx-toastr';

import { AppRoutingModule } from './app.routing';
import { ComponentsModule } from './components/components.module';
import { ModalModule, BsModalService } from 'ngx-bootstrap/modal';  

import { AppComponent } from './app.component';

import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { PdfViewerModule } from  'ng2-pdf-viewer';
import { DatePipe } from '@angular/common';
import { AccountIncidentModalComponent } from './modal/account-incident-modal/account-incident-modal.component';
import { LocationModalComponent } from './modal/location-modal/location-modal.component';
//import { PatientMergeComponent } from './pages/patient-merge/patient-merge.component';
//import { CustomerSelectComponent } from './pages/customer-select/customer-select.component';
//import { ParolOfficerComponent } from './parol-officer/parol-officer.component';
//import { CustomerIssueComponent } from './pages/customer-issue/customer-issue.component';
//import { PopupModalComponent } from './modal/popup-modal/popup-modal.component';
//import { PreauthComponent } from './pages/preauth/preauth.component';
//import { LabComponent } from './pages/lab/lab.component';
// import { InsuranceComponent } from './pages/insurance/insurance.component';
//import { CustomerModalComponent } from './modal/customer-modal/customer-modal.component';
//import { MessageModalComponent } from './modal/message-modal/message-modal.component';
// import { HelpModalComponent } from './modal/help-modal/help-modal.component';
//import { InsuranceModalComponent } from './modal/insurance-modal/insurance-modal.component';
//import { StatusModalComponent } from './modal/status-modal/status-modal.component';
// import { NgxDocViewerModule } from 'ngx-doc-viewer';
 
@NgModule({
  imports: [
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    ComponentsModule,
    RouterModule,
    AppRoutingModule,
    // NgxDocViewerModule,
    PdfViewerModule,
    ModalModule.forRoot()
    //ToastrModule.forRoot()
  ],
  declarations: [
    AppComponent,
    AdminLayoutComponent,
    AccountIncidentModalComponent,
    LocationModalComponent,
    //PatientMergeComponent,
    //CustomerSelectComponent,
    //SalesDetailComponent,
    //ParolOfficerComponent,
    // CustomerIssueComponent,
    //PopupModalComponent,
    //PreauthComponent,
    //LabComponent,
    // InsuranceComponent,
    //CustomerModalComponent,
    // MessageModalComponent,
    // HelpModalComponent,
    //InsuranceModalComponent,
    //StatusModalComponent,
    //PrinterModalComponent,
    // AttachmentModalComponent,
    //BarcodeModalComponent,
  ],

  providers: [BsModalService],
  bootstrap: [AppComponent]
})
export class AppModule { }
