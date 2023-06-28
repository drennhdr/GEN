//Page Name       : Dash-DailySales
//Date Created    : 02/28/2023
//Written By      : Stephen Farkas
//Description     : Daily Sales component for dashboard
//MM/DD/YYYY xxx  Description
//
//-----------------------------------------------------------------------------
// Data Passing
//-----------------------------------------------------------------------------
import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { LabOrderService } from '../../services/labOrder.service';

import {formatDate} from '@angular/common';
import {DatePipe} from '@angular/common';

@Component({
  selector: 'app-dash-dailysales',
  templateUrl: './dash-dailysales.component.html',
  styleUrls: ['./dash-dailysales.component.css']
})
export class DashDailysalesComponent implements OnInit {

  salesDailyData: any;
  userId: number = 0;

  public daily: number;
  public dailyDisp: string = "";


  constructor(
    private labOrderService: LabOrderService,
  ) { }

  ngOnInit(): void {
    this.userId = Number(sessionStorage.getItem('userId_Login'));

    const today = new Date();
    this.daily = today.setDate(today.getDate());
    this.dailyDisp = formatDate(this.daily , 'MM/dd/yy', 'en');
    this.loadDaily();

  }

  buttonPrevious(){
    this.daily = this.daily - (24 * 60 * 60 * 1000);
    this.dailyDisp = formatDate(this.daily , 'MM/dd/yy', 'en');
    this.loadDaily();
  }
  buttonNext(){
    this.daily = this.daily + (24 * 60 * 60 * 1000);
    this.dailyDisp = formatDate(this.daily , 'MM/dd/yy', 'en');
    this.loadDaily();
  }
  loadDaily(){
    this.labOrderService.salesDailyReport(this.userId, this.dailyDisp)
            .pipe(first())
            .subscribe(
                data => {
                  if (data.valid)
                  {
                    this.salesDailyData = data.items;
                  }
                  else{
                    this.salesDailyData = null;
                  }
                },
                error => {

                });
  }
}
