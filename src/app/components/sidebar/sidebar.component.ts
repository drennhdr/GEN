import { Component, OnInit, OnChanges, SimpleChanges } from '@angular/core';

import { ActivatedRoute } from '@angular/router'; // SJF Added
import { Subscription ,  Observable } from 'rxjs';// SJF Added
import { Location, PopStateEvent } from '@angular/common';// SJF Added
import { Router, NavigationStart } from '@angular/router';// SJF Added
import { Config } from "../../models/Config"; // SJF Added
import { DataShareService } from '../../services/data-share.service';

declare interface RouteInfo {
    path: string;
    title: string;
    icon: string;
    class: string;
    image: string;
}
export const ROUTES: RouteInfo[] = [
    { path: '/login', title: 'Login',  icon: 'objects_key-25', class: '', image:'Configuration.png' },
    { path: '/dashboard', title: 'Dashboard',  icon: 'design_app', class: '', image:'Dashboard.png' },
    { path: '/salesDetail', title: 'Sales Detail',  icon: 'design_app', class: '', image:'Dashboard.png' },
    { path: '/customer', title: 'Account Information',  icon:'health_ambulance', class: '', image:'Customers.png' },
    { path: '/customer-filter', title: 'Account Filter',  icon:'health_ambulance', class: '', image:'Customer Filter.png' },
    { path: '/customer-select', title: 'Account Select',  icon:'health_ambulance', class: '', image:'Customer Filter.png' },
    { path: '/customer-issue', title: 'Account Issue',  icon:'health_ambulance', class: '', image:'Customer.png' },
    { path: '/patient', title: 'Patient',  icon:'users_single-02', class: '', image:'Patient.png' },
    { path: '/inbox', title: 'Inbox',  icon:'ui-1_email-85', class: '', image:'Inbox.png' },
    { path: '/accessioning', title: 'Accessioning',  icon:'shopping_delivery-fast', class: '', image:'Configuration.png' },
    { path: '/lab-order', title: 'Lab Order',  icon:'design_bullet-list-67', class: '', image:'Lab Order.png' },
    { path: '/manifest', title: 'Manifest',  icon:'files_paper', class: '', image:'Manifest.png' },
    { path: '/shipLog', title: 'ShipLog',  icon:'files_paper', class: '', image:'Manifest.png' },
    { path: '/receiving', title: 'Receiving',  icon:'shopping_delivery-fast', class: '', image:'Receiving.png' },
    { path: '/user', title: 'Users',  icon:'shopping_delivery-fast', class: '', image:'Users.png' },
    { path: '/parole-officer', title: 'Parole Officer',  icon:'shopping_delivery-fast', class: '', image:'Users.png' },
    { path: '/audit', title: 'Accessioning Audit',  icon:'shopping_delivery-fast', class: '', image:'Configuration.png' },
    { path: '/physician-preference', title: 'Physician Preference',  icon:'ui-2_settings-90', class: '', image:'Physician Preference.png' },
    { path: '/physician-signature', title: 'Physician Signature',  icon:'ui-1_check', class: '', image:'Physician Signature.png' },
    { path: '/delegates', title: 'Delegates',  icon:'ui-1_check', class: '', image:'Configuration.png' },
    { path: '/insurance', title: 'Insurance',  icon:'ui-1_check', class: '', image:'Configuration.png' },
    { path: '/lab', title: 'Lab',  icon:'ui-1_check', class: '', image:'Configuration.png' },
    { path: '/preauth', title: 'Pre Authorization',  icon:'ui-1_check', class: '', image:'Configuration.png' },
    { path: '/icons', title: 'Icons',  icon:'education_atom', class: '', image:'Configuration.png' },
    // { path: '/maps', title: 'Maps',  icon:'location_map-big', class: '', image:'Configuration.png' },
    { path: '/notifications', title: 'Notifications',  icon:'ui-1_bell-53', class: '', image:'Configuration.png' },
    { path: '/table-list', title: 'Table List',  icon:'design_bullet-list-67', class: '', image:'Configuration.png' },
    { path: '/typography', title: 'Typography',  icon:'text_caps-small', class: '', image:'Configuration.png' },

];

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})

export class SidebarComponent implements OnInit, OnChanges {
  private _router: Subscription; // SJF Added
  menuItems: any[];
  private lastPoppedUrl: string; // SJF Added

  // Define a variable to use for if the user is logged in
  isUserLoggedIn: boolean;  // SJF Added

  constructor(
    private activeRoute: ActivatedRoute, // SJF Added
    public location: Location,// SJF Added
    private router: Router,// SJF Added
    private dataShareService: DataShareService, // SJF Added
  ) {
    // SJF Added Router Event 4/5/2023
    router.events.forEach((event) => {
      if(event instanceof NavigationStart) {
        var unsave = false;
        this.dataShareService.unsaved.subscribe(data=>{
          unsave = data;
        });
    
        console.log ('side',unsave);
        if (unsave){
          if (!confirm("WARNING: You have unsaved changes. Press Cancel to go back and save these changes, or OK to lose these changes."  )){
            const currentRoute = this.router.routerState;

            this.router.navigateByUrl(currentRoute.snapshot.url, { skipLocationChange: true });
            
          }
          else{
            this.dataShareService.changeUnsaved(false);
          }
        }

      }
      // NavigationEnd
      // NavigationCancel
      // NavigationError
      // RoutesRecognized
    });
   }
  ngOnChanges(changes: SimpleChanges): void {
}
  ngOnInit() {
    // this.menuItems = ROUTES.filter(menuItem => menuItem);

    // 1	Admin
    // 2	Customer User
    // 3	Customer Admin
    // 4	Executive
    // 5	Lab Assistants
    // 6	Accessioning
    // 7	CET
    // 8	CET Supervisor
    // 9	AM
    // 10	TM
    // 11	RM
    // 12	LCS
    // 13 LCS Plus
    // 14 Parol Officer
    // 15 Billing Review

    this.router.events.subscribe((event:any) => {
      if (event instanceof NavigationStart) {
        // Get user and security setting to define the sidebar options
        var userType = Number(sessionStorage.getItem('userType'));
        var loginEntity = Number(sessionStorage.getItem('entityId_Login'));
        var physician = sessionStorage.getItem('physician');
        var useShipLog = sessionStorage.getItem('shipLog');
        var multiLogin = Number(sessionStorage.getItem('multilogin'));
        var dashboard = true;
        var customer = false;
        var customerFilter = false;
        var patient = false;
        var labOrder = false;
        var accessioning = false;
        var physicianPreference = false;
        var manifest = false;
        var shipLog = false;
        var insurance = false;
        var sales = false;
        var parole = false;
    
        if (userType == 14 || userType == 15){
          dashboard = false;
        }
        if (userType != 2 && userType != 14 && userType != 15){
          customer = true;
        }

        if (userType == 1 || userType == 4 || userType == 5 || userType == 6 || userType == 7 || userType == 8 || userType == 12 || userType == 13){
          customerFilter = true;
        }
        
        if (userType == 1 || userType == 2 || userType == 3 || userType == 4 || userType == 6 || userType == 7 || userType == 8 || userType == 12 || userType == 13 || userType == 14  || userType == 15) {
          patient = true;
        }
        if (userType == 1 || userType == 2 || userType == 3 || userType == 4 || userType == 6 || userType == 7 || userType == 8 || userType == 12 || userType == 13  || userType == 15) {
          labOrder = true;
        }
        if (userType == 6  || userType == 7 || userType == 8) {
          accessioning = true;
        }
        if ((userType == 2 || userType == 3) && physician == 'true') {
          physicianPreference = true;
        }
        if (useShipLog=="true" && (userType == 2 || userType == 3)){
          shipLog = true;
        }
        if (userType == 12 || userType == 13) {
          shipLog = true;
        }
        if (userType == 1 || userType == 6 || userType == 7 || userType == 8) {
          manifest = true;
        }

        if (userType == 1 || userType == 8) {
          insurance = true;
        }

        if (userType == 9 || userType == 10 || userType == 11) {
          sales = true;
        }

        if (userType == 1 || userType == 7 || userType == 8 || userType == 13) {
          parole = true;
        }
        
        
        if (event.url != this.lastPoppedUrl){
          this.menuItems = [];
          for (let item of ROUTES)
          {
            //console.log ('route', item);
            if (sessionStorage['userId_Login']){
              if (item.path == '/dashboard' && dashboard){
                this.menuItems.push(item);
              }
              if (item.path == '/salesDetail' && sales ){
                this.menuItems.push(item);
              }
              if (item.path == '/inbox' && shipLog){
                this.menuItems.push(item);
              }
              if (item.path == '/customer' && customer){
                this.menuItems.push(item);
              }
              if (item.path == '/customer-filter' && customerFilter && loginEntity == 0){
                this.menuItems.push(item);
              }
              if (item.path == '/customer-select' && multiLogin == 1){
                this.menuItems.push(item);
              }
              if (item.path == '/patient' && patient){
                this.menuItems.push(item);
              }
              if (item.path == '/accessioning' && accessioning){
                this.menuItems.push(item);
              }
              if (item.path == '/lab-order' && labOrder){
                this.menuItems.push(item);
              }
              if (item.path == '/shipLog' && (shipLog || userType == 1)){
                this.menuItems.push(item);
              }
              if (item.path == '/manifest' && manifest){
                this.menuItems.push(item);
              }
              if (item.path == '/receiving' && accessioning){
                this.menuItems.push(item);
              }
              if (item.path == '/physician-preference' && physicianPreference){
                this.menuItems.push(item);
              }
              if (item.path == '/physician-signature' && physicianPreference){
                this.menuItems.push(item);
              }
              if (item.path == '/delegates' && physicianPreference){
                this.menuItems.push(item);
              }
              if (item.path == '/user' && userType == 1){
                this.menuItems.push(item);
              }
              if (item.path == '/parole-officer' && parole){
                this.menuItems.push(item);
              }
              if (item.path == '/audit' && accessioning){
                this.menuItems.push(item);
              }

              if (item.path == '/insurance' && insurance){
                this.menuItems.push(item);
              }

              if (item.path == '/lab' && userType == 1){
                this.menuItems.push(item);
              }

              if (item.path == '/preauth' && userType == 1){
                this.menuItems.push(item);
              }
            }
          }
        }
      }
     });
  }
  // isMobileMenu() {
  //     if ( window.innerWidth > 991) {
  //         return false;
  //     }
  //     return true;
  // };
}
