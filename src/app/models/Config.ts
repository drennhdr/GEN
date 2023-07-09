export class Config {

    apiRoot: string;
    version: string;
    apiUser: string;
    apiReport: string;
    corpTranSource: number;
    warehouseTranSource: number;
    manufacturerTranSource: number;
    unsavedChanges: boolean;
    constructor(){
          this.apiRoot = "https://genesisportalapi.azurewebsites.net/"   // Azure Test
          //this.apiRoot = "https://genuinportalapi.azurewebsites.net/"   // Azure Production
          //this.apiRoot = "http://192.168.0.103/GenesisAPI/"   // Local IIS
          //this.apiRoot = "http://172.16.4.67/GenesisAPI/"
          //this.apiRoot = "http://localhost:44357/"  // Local .NET Core 

          this.version = "2022.0.1"   // Test 
          this.corpTranSource = 11;
          this.warehouseTranSource = 12;
          this.manufacturerTranSource = 13;

          this.unsavedChanges = false;
        
    }
}
