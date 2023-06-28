//Page Name       : Dash-Sales
//Date Created    : 02/28/2023
//Written By      : Stephen Farkas
//Description     : Sales component for dashboard
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

import { SalesReportItemModel } from '../../models/ReportModel';


@Component({
  selector: 'app-dash-sales',
  templateUrl: './dash-sales.component.html',
  styleUrls: ['./dash-sales.component.css'],
  providers: [DatePipe]
})

export class DashSalesComponent implements OnInit {

  salesData: any;
  userId: number = 0;
  dateRangeType: string = 'W';
  monthly: boolean = true;

  public gradientStroke;
  public chartColor;
  public canvas : any;
  public ctx;
  public gradientFill;

  public chartType;
  public chartData:Array<any>;
  public chartOptions:any;
  public chartLabels:Array<any>;
  public chartColors:Array<any>

  public cols: Array<any> = [];
  public week: Array<any> = [];
  public month: Array<any> = [];
  public year: Array<any> = [];
  public toxUrineData: Array<any> = [];
  public toxOralData: Array<any> = [];
  public rppData: Array<any> = [];
  public utiData: Array<any> = [];
  public gppData: Array<any> = [];
  public diffDays: number = 0;

 
    // events
    public chartClicked(e:any):void {
      //console.log(e);
    }
  
    public chartHovered(e:any):void {
      //console.log(e);
    }

  constructor(
    private labOrderService: LabOrderService,
    private datepipe: DatePipe,
  ) { }

  ngOnInit(): void {
    this.userId = Number(sessionStorage.getItem('userId_Login'));

    this.chartColor = "#FFFFFF";

    this.gridConfigure();

    this.buttonWeek();

  }

  buttonWeek(){
    this.dateRangeType = 'W';
    this.monthly = true;
    this.labels();
    this.getData();
  }

  buttonYear(){
    this.dateRangeType = 'Y';
    this.monthly = false;
    this.labels();
    this.getData();
  }

  labels(){

    const today = new Date();
  
    this.cols = [];
    this.toxUrineData = [];
    this.toxOralData = [];
    this.rppData = [];
    this.utiData = [];
    this.gppData = [];
    this.week = [];
    this.month = [];
    this.year = [];

    if (this.dateRangeType == 'W'){
      var dayOfWeek = today.getDay();

      var startDate = today.setDate(today.getDate()  - dayOfWeek  - (7 * 11));
    
      for (let i = 0; i < 12; i++){
        this.cols.push( formatDate(startDate , 'MM/dd/yy', 'en'));
        this.toxUrineData.push(0);
        this.toxOralData.push(0);
        this.rppData.push(0);
        this.utiData.push(0);
        this.gppData.push(0);
        this.week.push(this.datepipe.transform(startDate,'w'));
        this.year.push(formatDate(startDate , 'yyyy', 'en'));

        startDate = startDate + 7 * 24 * 60 * 60 * 1000;
      }
    }
    else if (this.dateRangeType == 'Y'){
      var startDate = today.setDate(today.getDate());
      var month = Number(formatDate(startDate,'MM','en'));
      var year = Number(formatDate(startDate,'yyyy','en')) - 1;
      month = month + 1;
      if (month > 12){
        month = 1;
        year = year + 1;
      }
      //const beginMonth = new Date(formatDate(startDate,'MM','en') + "/01/" + formatDate(startDate,'yyyy','en'));
      
      //var startdate = beginMonth.setDate(beginMonth.getDate()) - 11 * 24 * 60 * 60 * 1000
      //console.log("STart Date",startDate);
      for (let i = 0; i < 12; i++){
        this.cols.push( month + "/01/" + year);
        this.toxUrineData.push(0);
        this.toxOralData.push(0);
        this.rppData.push(0);
        this.utiData.push(0);
        this.gppData.push(0);
        //this.week.push(this.datepipe.transform(startDate,'w'));
        this.month.push(month);
        this.year.push(year);

        month = month + 1;
        if (month > 12){
          month = 1;
          year = year + 1;
        }
      }
    }


    this.chartLabels = this.cols;

    this.chartData = [
      {
        label: "Tox Urine",
        pointBorderWidth: 2,
        pointHoverRadius: 4,
        pointHoverBorderWidth: 1,
        pointRadius: 4,
        fill: true,
        borderWidth: 2,
        data: this.toxUrineData,        
      },
      {
        label: "Tox Oral",
        pointBorderWidth: 2,
        pointHoverRadius: 4,
        pointHoverBorderWidth: 1,
        pointRadius: 4,
        fill: true,
        borderWidth: 2,
        data: this.toxOralData,
      },
      {
        label: "RPP",
        pointBorderWidth: 2,
        pointHoverRadius: 4,
        pointHoverBorderWidth: 1,
        pointRadius: 4,
        fill: true,
        borderWidth: 2,
        data: this.rppData,
      },
      {
        label: "UTI/STI",
        pointBorderWidth: 2,
        pointHoverRadius: 4,
        pointHoverBorderWidth: 1,
        pointRadius: 4,
        fill: true,
        borderWidth: 2,
        data: this.utiData,
      },
      {
        label: "GPP",
        pointBorderWidth: 2,
        pointHoverRadius: 4,
        pointHoverBorderWidth: 1,
        pointRadius: 4,
        fill: true,
        borderWidth: 2,
        data: this.gppData,
      }
    ];
  }

  gridConfigure(){
    this.chartOptions = {
      maintainAspectRatio: false,
      legend: {
        display: false
      },
      tooltips: {
        bodySpacing: 4,
        mode: "nearest",
        intersect: 0,
        position: "nearest",
        xPadding: 10,
        yPadding: 10,
        caretPadding: 10
      },
      responsive: 1,
      scales: {

        yAxes: [{
          gridLines: {
            zeroLineColor: "transparent",
            drawBorder: false
          }
        }],
        xAxes: [{
          // display: 0,
          // ticks: {
          //   display: false
          // },
          gridLines: {
            zeroLineColor: "transparent",
            drawTicks: false,
            display: false,
            drawBorder: false
          }
        }]
      },
      layout: {
        padding: {
          left: 0,
          right: 0,
          top: 15,
          bottom: 15
        }
      }
    };

    this.canvas = document.getElementById("chart");
    this.ctx = this.canvas.getContext("2d");

    this.gradientStroke = this.ctx.createLinearGradient(500, 0, 100, 0);
    this.gradientStroke.addColorStop(0, '#80b6f4');
    this.gradientStroke.addColorStop(1, this.chartColor);

    this.gradientFill = this.ctx.createLinearGradient(0, 170, 0, 50);
    this.gradientFill.addColorStop(0, "rgba(128, 182, 244, 0)");
    this.gradientFill.addColorStop(1, "rgba(249, 99, 59, 0.40)");

    this.chartColors = [
      {
        borderColor: "#f96332",
        pointBorderColor: "#FFF",
        pointBackgroundColor: "#f96332",
        backgroundColor: this.gradientFill
      }
    ];
    this.chartType = 'line';   
  }

  getData(){
    this.labOrderService.salesReport(this.userId, this.dateRangeType)
            .pipe(first())
            .subscribe(
                data => {
                  if (data.valid)
                  {
                    this.salesData = data.items;
                    this.loadChartData(data.items);
                  }
                },
                error => {

                });
  }

  loadChartData(chartData: Array<SalesReportItemModel>){
    // Convert JSON data into an array.
    if (this.dateRangeType == 'W'){
      for (let item of chartData)
      {
        for (let i = 0; i < 12; i++){
          if (this.year[i] == item.year && this.week[i] == item.week)
          {
            this.toxUrineData[i] = this.toxUrineData[i] + item.toxUrine;
            this.toxOralData[i] = this.toxOralData[i] + item.toxOral;
            this.rppData[i] = this.rppData[i] + item.rpp;
            this.utiData[i] = this.utiData[i] + item.uti;
            this.gppData[i] = this.gppData[i] + item.gpp;
            break;
          }
        }
      }
    }
    else if (this.dateRangeType == 'Y'){
      for (let item of chartData)
      {
        for (let i = 0; i < 12; i++){
          if (this.year[i] == item.year && this.month[i] == item.month)
          {
            this.toxUrineData[i] = item.toxUrine;
            this.toxOralData[i] = item.toxOral;
            this.rppData[i] = item.rpp;
            this.utiData[i] = item.uti;
            this.gppData[i] = item.gpp;
            break;
          }
        }
      }

    }

    this.chartData = [

      {
        label: "Tox Urine",
        pointBorderWidth: 2,
        pointHoverRadius: 4,
        pointHoverBorderWidth: 1,
        pointRadius: 4,
        fill: true,
        borderWidth: 2,
        data: this.toxUrineData,
      },
      {
        label: "Tox Oral",
        pointBorderWidth: 2,
        pointHoverRadius: 4,
        pointHoverBorderWidth: 1,
        pointRadius: 4,
        fill: true,
        borderWidth: 2,
        data: this.toxOralData,
      },
      {
        label: "RPP",
        pointBorderWidth: 2,
        pointHoverRadius: 4,
        pointHoverBorderWidth: 1,
        pointRadius: 4,
        fill: true,
        borderWidth: 2,
        data: this.rppData,
      },
      {
        label: "UTI/STI",
        pointBorderWidth: 2,
        pointHoverRadius: 4,
        pointHoverBorderWidth: 1,
        pointRadius: 4,
        fill: true,
        borderWidth: 2,
        data: this.utiData,
        borderColor: 'pink'
      },
      {
        label: "GPP",
        pointBorderWidth: 2,
        pointHoverRadius: 4,
        pointHoverBorderWidth: 1,
        pointRadius: 4,
        fill: true,
        borderWidth: 2,
        data: this.gppData,
      }
    ];
  }
}


