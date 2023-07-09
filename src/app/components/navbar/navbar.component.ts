import { Component, OnInit, ElementRef } from '@angular/core';
import { ROUTES } from '../sidebar/sidebar.component';
import { Location, LocationStrategy, PathLocationStrategy} from '@angular/common';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../services/authentication.service';
import { PrinterModalComponent } from '../../modal/printer-modal/printer-modal.component';
import { HelpModalComponent } from '../../modal/help-modal/help-modal.component';
import { CustomerModalComponent } from '../../modal/customer-modal/customer-modal.component';
import { LocationModalComponent } from '../../modal/location-modal/location-modal.component';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { CodeItemModel } from '../../models/CodeModel';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})


export class NavbarComponent implements OnInit {
    private listTitles: any[];
    location: Location;
      mobile_menu_visible: any = 0;
    private toggleButton: any;
    private sidebarVisible: boolean;

    public isCollapsed = true;

    labList: any;

    // Modal Dialog
    modalRef: BsModalRef;

    constructor(location: Location,  private element: ElementRef, private router: Router, private authenticationService: AuthenticationService, private modalService: BsModalService,) {
      this.location = location;
          this.sidebarVisible = false;
    }

    
    ngOnInit(){
      this.listTitles = ROUTES.filter(listTitle => listTitle);
      const navbar: HTMLElement = this.element.nativeElement;
      this.toggleButton = navbar.getElementsByClassName('navbar-toggler')[0];
      this.router.events.subscribe((event) => {
        "Call sidebar close";
        this.sidebarClose();
         var $layer: any = document.getElementsByClassName('close-layer')[0];
         if ($layer) {
           $layer.remove();
           this.mobile_menu_visible = 0;
         }
     });
    }
    

    collapse(){
      this.isCollapsed = !this.isCollapsed;
      const navbar = document.getElementsByTagName('nav')[0];
      if (!this.isCollapsed) {
        navbar.classList.remove('navbar-transparent');
        navbar.classList.add('bg-white');
      }else{
        navbar.classList.add('navbar-transparent');
        navbar.classList.remove('bg-white');
      }

    }

    labChanged(id){

    }

    sidebarOpen() {
        const toggleButton = this.toggleButton;
        const mainPanel =  <HTMLElement>document.getElementsByClassName('main-panel')[0];
        const html = document.getElementsByTagName('html')[0];
        if (window.innerWidth < 991) {
          mainPanel.style.position = 'fixed';
        }

        setTimeout(function(){
            toggleButton.classList.add('toggled');
        }, 500);

        html.classList.add('nav-open');

        this.sidebarVisible = true;
    };
    sidebarClose() {
        const html = document.getElementsByTagName('html')[0];
        this.toggleButton.classList.remove('toggled');
        const mainPanel =  <HTMLElement>document.getElementsByClassName('main-panel')[0];

        if (window.innerWidth < 991) {
          setTimeout(function(){
            mainPanel.style.position = '';
          }, 500);
        }
        this.sidebarVisible = false;
        html.classList.remove('nav-open');
    };
    sidebarToggle() {
        // const toggleButton = this.toggleButton;
        // const html = document.getElementsByTagName('html')[0];
        var $toggle = document.getElementsByClassName('navbar-toggler')[0];

        if (this.sidebarVisible === false) {
            this.sidebarOpen();
        } else {
            this.sidebarClose();
        }
        const html = document.getElementsByTagName('html')[0];

        if (this.mobile_menu_visible == 1) {
            // $('html').removeClass('nav-open');
            html.classList.remove('nav-open');
            if ($layer) {
                $layer.remove();
            }
            setTimeout(function() {
                $toggle.classList.remove('toggled');
            }, 400);

            this.mobile_menu_visible = 0;
        } else {
            setTimeout(function() {
                $toggle.classList.add('toggled');
            }, 430);

            var $layer = document.createElement('div');
            $layer.setAttribute('class', 'close-layer');


            if (html.querySelectorAll('.main-panel')) {
                document.getElementsByClassName('main-panel')[0].appendChild($layer);
            }else if (html.classList.contains('off-canvas-sidebar')) {
                document.getElementsByClassName('wrapper-full-page')[0].appendChild($layer);
            }

            setTimeout(function() {
                $layer.classList.add('visible');
            }, 100);

            $layer.onclick = function() { //asign a function
              html.classList.remove('nav-open');
              this.mobile_menu_visible = 0;
              $layer.classList.remove('visible');
              setTimeout(function() {
                  $layer.remove();
                  $toggle.classList.remove('toggled');
              }, 400);
            }.bind(this);

            html.classList.add('nav-open');
            this.mobile_menu_visible = 1;

        }
    };

    getTitle(){
      return '';

      //var titlee = this.location.prepareExternalUrl(this.location.path());
      // if(titlee.charAt(0) === '#'){
      //     titlee = titlee.slice( 2 );
      // }
      // titlee = titlee.split('/').pop();


      // for(var item = 0; item < this.listTitles.length; item++){
      //     if(this.listTitles[item].path === titlee){
      //         return this.listTitles[item].title;
      //     }
      // }
      // return 'Dashboard';
      //return titlee;
    }

    getCustomerName(valid){
      if (valid){
        var filter = sessionStorage.getItem('customerName');

        if (sessionStorage.getItem('entityId_Login') == "0"){
          filter = "Customer Filter:  " + filter;
        }
        return filter;
      }
      else{
        return "";
      }
    }

    getUserName(){
      return sessionStorage.getItem('userName');
    }

    setupPrinter(){
      const initialState: ModalOptions = {
        initialState: {
          
        }
      };
      this.modalRef = this.modalService.show(PrinterModalComponent, {
        initialState 
      });
    }

    helpPopup(){
      const initialState: ModalOptions = {
        initialState: {
          
        }
      };
      this.modalRef = this.modalService.show(HelpModalComponent, {
        initialState 
      });
    }

    customerPopup(){
      if(Number(sessionStorage.getItem('customerId'))  > 0){
        const initialState: ModalOptions = {
          initialState: {
            
          }
        };
        this.modalRef = this.modalService.show(CustomerModalComponent, {
          initialState
        });
        //this.modalRef.setClass('max-width: 559px !important;');
        this.modalRef.setClass('modal-lg');
      }
    }

    logout(){
      this.authenticationService.logout();
      this.router.navigate(['']);
    }

    getMessage(valid){
      if (valid){
        return sessionStorage.getItem('topMessage');
      }
      else{
        return "";
      }
    }

    getLocationName(valid){
      if (valid){
        var filter = sessionStorage.getItem('locationName');
        if (filter == 'All Locations'){
          filter = '';
        }
        else if (filter != ""){
          filter = "Location: " + filter;
        }
        return filter;
      }
      else{
        return "";
      }
    }

    locationPopup(){
      if(Number(sessionStorage.getItem('locationId'))  > 0){
        const initialState: ModalOptions = {
          initialState: {
            
          }
        };
        this.modalRef = this.modalService.show(LocationModalComponent, {
          initialState
        });
        //this.modalRef.setClass('max-width: 559px !important;');
        this.modalRef.setClass('modal-lg');
      }
    }
}
