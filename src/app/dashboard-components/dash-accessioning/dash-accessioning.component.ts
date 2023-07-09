//Page Name       : Dash-Accessioning
//Date Created    : 02/27/2023
//Written By      : Stephen Farkas
//Description     : Accessioning component for dashboard
//MM/DD/YYYY xxx  Description
//
//-----------------------------------------------------------------------------
// Data Passing
//-----------------------------------------------------------------------------
import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { LabOrderService } from '../../services/labOrder.service';

import {formatDate} from '@angular/common';

import { AccessionedReportItemModel } from '../../models/ReportModel';


@Component({
  selector: 'app-dash-accessioning',
  templateUrl: './dash-accessioning.component.html',
  styleUrls: ['./dash-accessioning.component.css']
})
export class DashAccessioningComponent implements OnInit {

  accessionedData: any;
  userId_Accessioned: number = 0;
  searchStartDate: string = '';
  searchEndDate: string = '';

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
  ) { }

  ngOnInit(): void {
    console.log("Accessioning Dash Init");
    this.userId_Accessioned = Number(sessionStorage.getItem('userId_Login'));

    const ckDate = new Date();
    this.searchStartDate = formatDate(ckDate.setDate(ckDate.getDate() -6),'yyyy-MM-dd', 'en');
    //console.log("Start Date", this.searchStartDate);

    const ckDate2 = new Date();
    this.searchEndDate = formatDate(ckDate2.setDate(ckDate2.getDate()),'yyyy-MM-dd', 'en');

    //console.log("End Date", this.searchEndDate);


    this.chartColor = "#FFFFFF";

    this.gridConfigure();

    this.buttonRefresh();

  }

  buttonRefresh(){
    this.labels();
    this.getData();
  }

  labels(){

    const today = new Date();
    const timezoneOffset = today.getTimezoneOffset() / 60;

    //console.log("Hours", timezoneOffset);

    var ckDate = new Date(this.searchStartDate);
    ckDate.setTime(ckDate.getTime() + timezoneOffset*60*60*1000)
    //console.log("Start",ckDate);

    var ckDateEnd = new Date(this.searchEndDate);
    ckDateEnd.setTime(ckDateEnd.getTime() + timezoneOffset*60*60*1000);
    //console.log("End",ckDateEnd);

    var diff = Math.abs(ckDate.getTime() - ckDateEnd.getTime());
    //console.log("Diff",diff)
    
    this.diffDays = Math.ceil(diff / (1000 * 3600 * 24));
    //console.log("days",this.diffDays);

    this.cols = [];
    this.toxUrineData = [];
    this.toxOralData = [];
    this.rppData = [];
    this.utiData = [];
    this.gppData = [];

    for (let i = 0; i <= this.diffDays; i++){
      this.cols.push( formatDate(ckDate , 'MM/dd', 'en'));
      ckDate.setDate(ckDate.getDate() +1)
      this.toxUrineData.push(0);
      this.toxOralData.push(0);
      this.rppData.push(0);
      this.utiData.push(0);
      this.gppData.push(0);
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
          //display: 0,
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
        backgroundColor: this.gradientFill,
      }
    ];
    this.chartType = 'line';   

  }

  getData(){
    this.labOrderService.accessionedReport(this.userId_Accessioned, this.searchStartDate, this.searchEndDate)
            .pipe(first())
            .subscribe(
                data => {
                  if (data.valid)
                  {
                    this.accessionedData = data.items;
                    this.loadChartData(data.items);
                  }
                },
                error => {

                });
  }

  loadChartData(chartData: Array<AccessionedReportItemModel>){
    // Convert JSON data into an array.
    for (let item of chartData)
    {
      for (let i = 0; i <= this.diffDays; i++){
        if (this.cols[i] == formatDate(item.accessionedDate , 'MM/dd', 'en'))
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
