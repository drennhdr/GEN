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
import _ from 'lodash';

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
                    this.salesDailyData = this.calculateSaleTotals(data.items);
                  }
                  else{
                    this.salesDailyData = null;
                  }
                },
                error => {

                });
  }

  calculateSaleTotals(salesData){
    let dataSet = salesData.map(order=>
      {
          order['total'] = order['toxOral'] + order['toxUrine'] + order['rpp'] +  order['uti'] + order['gpp'];
          return order;
      });
      let orderDetailsByPeriod = {}
      orderDetailsByPeriod['customer'] = 'Daily Total'
      orderDetailsByPeriod['isCustomRowData'] = true; 
      orderDetailsByPeriod = dataSet.reduce((a, b) =>{ 
              a['toxOral'] = (a['toxOral'] || 0) + (b['toxOral'] || 0);
              a['toxUrine'] = (a['toxUrine'] || 0) + (b['toxUrine'] || 0);
              a['rpp']= (a['rpp'] || 0) + (b['rpp'] || 0)
              a['uti']= (a['uti'] || 0) + (b['uti'] || 0)
              a['gpp']= (a['gpp'] || 0) + (b['gpp'] || 0)
              a['total']= (a['total'] || 0) + (b['total'] || 0)
          return a;
      },orderDetailsByPeriod);
      dataSet.push(orderDetailsByPeriod);
    return dataSet;
  }
}
