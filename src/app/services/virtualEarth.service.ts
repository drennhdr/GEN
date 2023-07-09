// Service Name  : virtualEarth.service.ts
// Date Created  : 10/24/2022
// Written By    : Stephen Farkas
// Description   : Interface to virtual earth to validate address info
// MM/DD/YYYY XXX Description
//
//------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Config } from "../models/Config";

import { from, Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { VirtualEartTrafficModel } from '../models/VirtualEarthModel';

@Injectable({
    providedIn: 'root'
  })
  export class VirtualEarthService {

    constructor(private httpClient: HttpClient) {}
 

  postalCode( postal: string ) {

    var output = "json&maxResults";
    var key = "Ao6sp0SGsGWJh7h7X91gHtcA2j-DTzgX0tzLUdk6SpuNXhYwxidZXwS_CgigOO5h";
    var url = "https://dev.virtualearth.net/REST/v1/Locations?countryCode=USA&postalCode=" + postal + "&output=" + output + "&key=" + key;

    return this.httpClient.get(url)
        .pipe(

           map((data: VirtualEartTrafficModel) => {
             return data;
           }), catchError( error => {
             return throwError(  error );//'Something went wrong!' );
           })
        )
    }
}