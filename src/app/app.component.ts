import { Component, HostListener} from '@angular/core';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { AuthenticationService } from './services/authentication.service';
//import {ngxZendeskWebwidgetModule, ngxZendeskWebwidgetConfig} from 'ngx-zendesk-webwidget';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  constructor(
    private router: Router, 
    private authenticationService: AuthenticationService,
  ) { 
    this.setTimeout();
    this.userInactive.subscribe(() => this.logout());
  }

  userActivity:any;
  userInactive: Subject<any> = new Subject();
  
  setTimeout() {
    // 30 minutes
    this.userActivity = setTimeout(() => this.userInactive.next(undefined), 1800000);
  }

  @HostListener('window:mousemove') refreshUserState() {
    clearTimeout(this.userActivity);
    this.setTimeout();
  }
  logout(){
    this.authenticationService.logout();
    this.router.navigate(['']);
  }
}
