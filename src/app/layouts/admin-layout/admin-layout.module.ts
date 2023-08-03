import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdminLayoutRoutes } from './admin-layout.routing';
import { DashboardComponent } from '../../pages/dashboard/dashboard.component';
import { SalesDetailComponent } from '../../pages/sales-detail/sales-detail.component';
// import { UserProfileComponent } from '../../user-profile/user-profile.component';
import { TableListComponent } from '../../table-list/table-list.component';
import { TypographyComponent } from '../../typography/typography.component';
//import { MapsComponent } from '../../maps/maps.component';
import { NotificationsComponent } from '../../notifications/notifications.component';
import { ChartsModule } from 'ng2-charts';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastrModule } from 'ngx-toastr';
// import { UpgradeComponent } from '../../upgrade/upgrade.component';
import { LoginComponent } from '../../pages/login/login.component';
import { CustomerComponent } from '../../pages/customer/customer.component';
import { CutomerFilterComponent } from '../../pages/customer-filter/customer-filter.component';
import { CustomerSelectComponent } from '../../pages/customer-select/customer-select.component';
import { PatientComponent } from '../../pages/patient/patient.component';
import { InboxComponent } from '../../pages/inbox/inbox.component';
import { AccessioningComponent } from '../../pages/accessioning/accessioning.component';
import { LabOrderComponent } from '../../pages/lab-order/lab-order.component';
import { PhysicianPreferenceComponent } from '../../pages/physician-preference/physician-preference.component';
import { DashCustomerComponent } from '../../dashboard-components/dash-customer/dash-customer.component';
import { DashAccessioningComponent } from '../../dashboard-components/dash-accessioning/dash-accessioning.component';
import { DashSalesComponent } from '../../dashboard-components/dash-sales/dash-sales.component';
import { DashSalesIssuesComponent } from '../../dashboard-components/dash-sales-issues/dash-sales-issues.component';
import { DashDailysalesComponent } from '../../dashboard-components/dash-dailysales/dash-dailysales.component';
import { DashCetIssueComponent } from '../../dashboard-components/dash-cet-issue/dash-cet-issue.component';
import { DashCetRejectComponent } from '../../dashboard-components/dash-cet-reject/dash-cet-reject.component';
import { ManifestComponent } from '../../pages/manifest/manifest.component';
import { ShipLogComponent } from '../../pages/shipLog/shipLog.component';
import { ReceivingComponent } from '../../pages/receiving/receiving.component';
import { UserComponent } from '../../pages/user/user.component';
import { ParoleOfficerComponent } from '../../pages/parole-officer/parole-officer.component';
import { PhysicianSignatureComponent } from '../../pages/physician-signature/physician-signature.component';
import { IssueModalComponent } from '../../modal/issue-modal/issue-modal.component';
import { StatusModalComponent } from '../../modal/status-modal/status-modal.component';
import { AttachmentModalComponent } from '../../modal/attachment-modal/attachment-modal.component';
import { BarcodeModalComponent } from '../../modal/barcode-modal/barcode-modal.component';
import { PrinterModalComponent } from '../../modal/printer-modal/printer-modal.component';
import { HelpModalComponent } from '../../modal/help-modal/help-modal.component';
import { NoteModalComponent } from '../../modal/note-modal/note-modal.component';
import { AuditComponent } from '../../pages/audit/audit.component';
import { DelegatesComponent } from '../../pages/delegates/delegates.component';
import { InsuranceModalComponent } from '../../modal/insurance-modal/insurance-modal.component';
import { MessageModalComponent } from '../../modal/message-modal/message-modal.component';
import { PopupModalComponent } from '../../modal/popup-modal/popup-modal.component';
import { CustomerModalComponent } from '../../modal/customer-modal/customer-modal.component';
import { InsuranceComponent } from '../../pages/insurance/insurance.component';
import { LabComponent } from '../../pages/lab/lab.component';
import { PreauthComponent } from '../../pages/preauth/preauth.component';
import { AutoFocusDirective } from '../../directives/auto-focus.directive';



@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(AdminLayoutRoutes),
    FormsModule,
    ChartsModule,
    NgbModule,
    ToastrModule.forRoot()
  ],
  declarations: [
    DashboardComponent,
    SalesDetailComponent,
    // UserProfileComponent,
    TableListComponent,
    // UpgradeComponent,
    TypographyComponent,
    //MapsComponent,
    NotificationsComponent,
    LoginComponent,
    CustomerComponent,
    CutomerFilterComponent,
    CustomerSelectComponent,
    PatientComponent,
    InboxComponent,
    AccessioningComponent,
    LabOrderComponent,
    PhysicianPreferenceComponent,
    ParoleOfficerComponent,
    DashCustomerComponent,
    DashAccessioningComponent,
    DashSalesComponent,
    DashSalesIssuesComponent,    
    DashDailysalesComponent,
    DashCetIssueComponent,
    DashCetRejectComponent,
    ManifestComponent,
    ShipLogComponent,
    ReceivingComponent,
    UserComponent,
    PhysicianSignatureComponent,
    IssueModalComponent,
    StatusModalComponent,
    AttachmentModalComponent,
    BarcodeModalComponent,
    PrinterModalComponent,
    HelpModalComponent,
    NoteModalComponent,
    AuditComponent,
    DelegatesComponent,
    InsuranceModalComponent,
    MessageModalComponent,
    PopupModalComponent,
    CustomerModalComponent,
    InsuranceComponent,
    LabComponent,
    PreauthComponent,
    AutoFocusDirective
    
  ],
  entryComponents: [
    IssueModalComponent,
    StatusModalComponent,
    AttachmentModalComponent,
    BarcodeModalComponent,
    PrinterModalComponent,
    HelpModalComponent,
    NoteModalComponent,
    InsuranceModalComponent,
    MessageModalComponent,
    CustomerModalComponent,
  ],
})

export class AdminLayoutModule {}
