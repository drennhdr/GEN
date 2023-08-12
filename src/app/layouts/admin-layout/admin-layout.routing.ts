import { Routes } from '@angular/router';

import { DashboardComponent } from '../../pages/dashboard/dashboard.component';
import { SalesDetailComponent } from '../../pages/sales-detail/sales-detail.component';
// import { UserProfileComponent } from '../../user-profile/user-profile.component';
import { TableListComponent } from '../../table-list/table-list.component';
import { TypographyComponent } from '../../typography/typography.component';
//import { MapsComponent } from '../../maps/maps.component';
import { NotificationsComponent } from '../../notifications/notifications.component';
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
import { ManifestComponent } from '../../pages/manifest/manifest.component';
import { ShipLogComponent } from '../../pages/shipLog/shipLog.component';
import { ReceivingComponent } from '../../pages/receiving/receiving.component';
import { UserComponent } from '../../pages/user/user.component';
import { ParoleOfficerComponent } from '../../pages/parole-officer/parole-officer.component';
import { PhysicianSignatureComponent } from '../../pages/physician-signature/physician-signature.component';
import { AuditComponent } from '../../pages/audit/audit.component';
import { DelegatesComponent } from '../../pages/delegates/delegates.component';
import { InsuranceComponent } from '../../pages/insurance/insurance.component';
import { LabComponent } from '../../pages/lab/lab.component';
import { PreauthComponent } from '../../pages/preauth/preauth.component';
import { CustomerIssueComponent } from '../../pages/customer-issue/customer-issue.component';
import { PatientMergeComponent } from '../../pages/patient-merge/patient-merge.component';


export const AdminLayoutRoutes: Routes = [
    { path: 'dashboard',      component: DashboardComponent },
    { path: 'salesDetail',       component: SalesDetailComponent },
    // { path: 'user-profile',   component: UserProfileComponent },
    // { path: 'table-list',     component: TableListComponent },
    // { path: 'typography',     component: TypographyComponent },
    // { path: 'icons',          component: IconsComponent },
    // { path: 'maps',           component: MapsComponent },
    // { path: 'notifications',  component: NotificationsComponent },
    // { path: 'upgrade',        component: UpgradeComponent },
    { path: 'login',                    component: LoginComponent },
    { path: 'customer',                 component: CustomerComponent },
    { path: 'patient',                  component: PatientComponent },
    { path: 'accessioning',             component: AccessioningComponent },
    { path: 'inbox',                    component: InboxComponent },
    { path: 'lab-order',                component: LabOrderComponent },
    { path: 'manifest',                 component: ManifestComponent },
    { path: 'shipLog',                  component: ShipLogComponent },
    { path: 'receiving',                component: ReceivingComponent },
    { path: 'user',                     component: UserComponent },
    { path: 'parole-officer',           component: ParoleOfficerComponent },
    { path: 'physician-preference',     component: PhysicianPreferenceComponent },
    { path: 'physician-signature',      component: PhysicianSignatureComponent },
    { path: 'customer-filter',          component: CutomerFilterComponent },
    { path: 'customer-select',          component: CustomerSelectComponent },
    { path: 'customer-issue',           component: CustomerIssueComponent },
    { path: 'audit',                    component: AuditComponent },
    { path: 'delegates',                component: DelegatesComponent },
    { path: 'insurance',                component: InsuranceComponent },
    { path: 'lab',                      component: LabComponent },
    { path: 'preauth',                  component: PreauthComponent },
    { path: 'patient-merge',            component: PatientMergeComponent},
];
