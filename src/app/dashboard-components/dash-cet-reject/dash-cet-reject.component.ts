//Page Name       : Dash-CET-reject
//Date Created    : 03/29/2023
//Written By      : Stephen Farkas
//Description     : CET Reject component for dashboard
//MM/DD/YYYY xxx  Description
//
//-----------------------------------------------------------------------------
// Data Passing
//-----------------------------------------------------------------------------
import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { LabOrderService } from '../../services/labOrder.service';

import { CETRejectReportItemModel } from '../../models/ReportModel';

@Component({
  selector: 'app-dash-cet-reject',
  templateUrl: './dash-cet-reject.component.html',
  styleUrls: ['./dash-cet-reject.component.css']
})


export class DashCetRejectComponent implements OnInit {

  public rejectData: any;

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
  public stabilityData: Array<any> = [];
  public quantityData: Array<any> = [];
  public identifierData: Array<any> = [];
  public deviceData: Array<any> = [];

  public diffDays: number = 0;

  public curMonthName: string = "";
  public lastMonthName: string = "";
  public secondMonthName: string = "";
  
 
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

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var today = new Date();
    var today = new Date(today.getMonth()+1 + "/01/" + today.getFullYear());
    this.curMonthName = monthNames[today.getMonth()];
    const last = new Date(new Date(today).setMonth(today.getMonth()-1));
    this.lastMonthName = monthNames[last.getMonth()];
    const second = new Date(new Date(today).setMonth(today.getMonth()-2));
    this.secondMonthName = monthNames[second.getMonth()];


    this.chartColor = "#FFFFFF";

    this.getData();

    this.gridConfigure();

  }

  gridConfigure(){
    this.chartOptions = {
      maintainAspectRatio: false,
      legend: {
        display: true
      },
      // labelColor: 'black',
      // labels: {
      //   display: true,
      //   color: 'black',
      //   backcolor: 'red'
      // },
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
          },
          stacked: true
        }],
        xAxes: [{
          // display: 0,
          // ticks: {
          //   display: true
          // },
          gridLines: {
            zeroLineColor: "transparent",
            drawTicks: false,
            display: false,
            drawBorder: false
          },
          stacked: true
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
    this.chartType = 'bar';   

  }

  getData(){
    this.labOrderService.cetRejectReport()
            .pipe(first())
            .subscribe(
                data => {
                  if (data.valid)
                  {
                    this.rejectData = data;
                    console.log("RejectData",this.rejectData);
                    this.loadChartData(data.items);
                  }
                },
                error => {
console.log("error",error);
                });
  }

  loadChartData(chartData: Array<CETRejectReportItemModel>){

    this.cols = [];
    this.stabilityData = [];
    this.quantityData = [];
    this.identifierData = [];
    this.deviceData = [];


    // Convert JSON data into an array.
    for (let item of chartData)
    {
      this.cols.push(item.customer);
      this.stabilityData.push(item.stability);
      this.quantityData.push(item.quantity);
      this.identifierData.push(item.identifier);
      this.deviceData.push(item.device);
    }

    this.chartLabels = this.cols;

    this.chartData = [
        {
          label: "Stability",
          pointBorderWidth: 2,
          pointHoverRadius: 4,
          pointHoverBorderWidth: 1,
          pointRadius: 4,
          fill: true,
          borderWidth: 2,
          data: this.stabilityData,   
          backgroundColor: 'blue'       
        },
        {
          label: "Quantity/Quality",
          pointBorderWidth: 2,
          pointHoverRadius: 4,
          pointHoverBorderWidth: 1,
          pointRadius: 4,
          fill: true,
          borderWidth: 2,
          data: this.quantityData,
          backgroundColor: 'red'
        },
        {
          label: "Missing Identifier",
          pointBorderWidth: 2,
          pointHoverRadius: 4,
          pointHoverBorderWidth: 1,
          pointRadius: 4,
          fill: true,
          borderWidth: 2,
          data: this.identifierData,
          backgroundColor: 'greed'
        },
        {
          label: "Missing Device",
          pointBorderWidth: 2,
          pointHoverRadius: 4,
          pointHoverBorderWidth: 1,
          pointRadius: 4,
          fill: true,
          borderWidth: 2,
          data: this.deviceData,
          backgroundColor: 'yellow'
        },

      ];
      
  }
}
