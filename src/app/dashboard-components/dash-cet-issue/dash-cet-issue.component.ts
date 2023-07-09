//Page Name       : Dash-CET-Issue
//Date Created    : 03/29/2023
//Written By      : Stephen Farkas
//Description     : CET component for dashboard
//MM/DD/YYYY xxx  Description
//
//-----------------------------------------------------------------------------
// Data Passing
//-----------------------------------------------------------------------------
import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { LabOrderService } from '../../services/labOrder.service';

import { CETIssueReportItemModel, CETIssueReportModel } from '../../models/ReportModel';

@Component({
  selector: 'app-dash-cet-issue',
  templateUrl: './dash-cet-issue.component.html',
  styleUrls: ['./dash-cet-issue.component.css']
})


export class DashCetIssueComponent implements OnInit {

  public issueData: any;

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
  public missingNameData: Array<any> = [];
  public mismatchNameData: Array<any> = [];
  public missingAddress: Array<any> = [];
  public missingDOB: Array<any> = [];
  public mismatchDOB: Array<any> = [];
  public mismatchPregnant: Array<any> = [];
  public patientSignature: Array<any> = [];
  public providerSignature: Array<any> = [];
  public mismatchDate: Array<any> = [];
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
    this.labOrderService.cetIssueReport()
            .pipe(first())
            .subscribe(
                data => {
                  console.log("Issue Data",data);
                  if (data.valid)
                  {
                    this.issueData = data;
                    console.log("IssueData",this.issueData);
                    this.loadChartData(data.items);
                  }
                  else{
                    this.issueData = new CETIssueReportModel();
                    this.issueData.openTickets = 0;
                    this.issueData.currentTickets = 0;
                    this.issueData.lastMonthTickets = 0;
                    this.issueData.secondMonthTickets = 0;
                  }
                },
                error => {

                });
  }

  loadChartData(chartData: Array<CETIssueReportItemModel>){

    this.cols = [];
    this.missingNameData = [];
    this.mismatchNameData = [];
    this.missingAddress = [];
    this.missingDOB = [];
    this.mismatchDOB = [];
    this.mismatchPregnant = [];
    this.patientSignature = [];
    this.providerSignature = [];
    this.mismatchDate = [];

    // Convert JSON data into an array.
    for (let item of chartData)
    {
      this.cols.push(item.customer);
      this.missingNameData.push(item.missingName);
      this.mismatchNameData.push(item.mismatchName);
      this.missingAddress.push(item.missingAddress);
      this.missingDOB.push(item.missingDOB);
      this.mismatchDOB.push(item.mismatchDOB);
      this.mismatchPregnant.push(item.mismatchPregnant);
      this.patientSignature.push(item.patientSignature);
      this.providerSignature.push(item.providerSignature);
      this.mismatchDate.push(item.mismatchDate);
    }

    this.chartLabels = this.cols;

    this.chartData = [
        {
          label: "Missing Name",
          pointBorderWidth: 2,
          pointHoverRadius: 4,
          pointHoverBorderWidth: 1,
          pointRadius: 4,
          fill: true,
          borderWidth: 2,
          data: this.missingNameData,   
          backgroundColor: 'navy'       
        },
        {
          label: "Mismatch Name",
          pointBorderWidth: 2,
          pointHoverRadius: 4,
          pointHoverBorderWidth: 1,
          pointRadius: 4,
          fill: true,
          borderWidth: 2,
          data: this.mismatchNameData,
          backgroundColor: 'cyan'
        },
        {
          label: "Missing Address",
          pointBorderWidth: 2,
          pointHoverRadius: 4,
          pointHoverBorderWidth: 1,
          pointRadius: 4,
          fill: true,
          borderWidth: 2,
          data: this.missingAddress,
          backgroundColor: 'orange'
        },
        {
          label: "Missing DOB",
          pointBorderWidth: 2,
          pointHoverRadius: 4,
          pointHoverBorderWidth: 1,
          pointRadius: 4,
          fill: true,
          borderWidth: 2,
          data: this.missingDOB,
          backgroundColor: 'red'
        },
        {
          label: "Mismatch DOB",
          pointBorderWidth: 2,
          pointHoverRadius: 4,
          pointHoverBorderWidth: 1,
          pointRadius: 4,
          fill: true,
          borderWidth: 2,
          data: this.mismatchDOB,
          backgroundColor: 'maroon'
        },
        {
          label: "Mismatch Pregnant",
          pointBorderWidth: 2,
          pointHoverRadius: 4,
          pointHoverBorderWidth: 1,
          pointRadius: 4,
          fill: true,
          borderWidth: 2,
          data: this.mismatchPregnant,
          backgroundColor: 'pink'
        },
        {
          label: "Patient Signature",
          pointBorderWidth: 2,
          pointHoverRadius: 4,
          pointHoverBorderWidth: 1,
          pointRadius: 4,
          fill: true,
          borderWidth: 2,
          data: this.patientSignature,
          backgroundColor: 'green'
        },
        {
          label: "Provider Signature",
          pointBorderWidth: 2,
          pointHoverRadius: 4,
          pointHoverBorderWidth: 1,
          pointRadius: 4,
          fill: true,
          borderWidth: 2,
          data: this.providerSignature,
          backgroundColor: 'olive'
        },
        {
          label: "Mismatch Date",
          pointBorderWidth: 2,
          pointHoverRadius: 4,
          pointHoverBorderWidth: 1,
          pointRadius: 4,
          fill: true,
          borderWidth: 2,
          data: this.mismatchDate,
          backgroundColor: 'grey'
        }
      ];
      
  }
}
