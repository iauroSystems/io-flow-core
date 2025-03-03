import { Injectable } from '@nestjs/common';
import * as soap from 'soap';
import { SoapConnectorDto } from '../dtos';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { SoapResponseParser } from 'src/common/utils';

@Injectable()
export class SoapConnector {
    constructor (
        private httpService: HttpService,
        private soapResponseParser: SoapResponseParser,
    ) { }

    async call(soapConnectorConfig: SoapConnectorDto): Promise<any> {
        if (typeof soapConnectorConfig?.data === 'string' && soapConnectorConfig?.data.includes('xml')) {
            soapConnectorConfig['headers'] = soapConnectorConfig['headers'] || { "Content-Type": "application/soap+xml" };
            return firstValueFrom(this.httpService.request(soapConnectorConfig)).then(async (data) => {
                const parsed = await this.soapResponseParser.parseXmlResponse(data?.data);
                return [null, { status: data?.status, data: parsed }]
            }).catch((err) => {
                return [{ status: err.response?.status, error: err?.response }]
            });
        }
        return new Promise((resolve, reject) => {
            soap.createClient(soapConnectorConfig.url, (err, client) => {
                if (err) {
                    reject(err);
                } else {
                    client[soapConnectorConfig.method](soapConnectorConfig.data, (err, result) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(result);
                        }
                    });
                }
            });
        }).then((data) => [null, data]).catch((err) => [err]);
    }
}

// import { Injectable } from '@nestjs/common';
// import { SoapClient } from 'src/common/providers/soap-client';
// import { SoapConnectorDto } from '../dtos/connectors.dto';
// import { Paths } from 'src/common/const/constants';

// @Injectable()
// export class SoapConnector {
//   private soapClient: SoapClient;

//   constructor () {
//     this.soapClient = new SoapClient();
//   }

//   async call(SoapConnectorConfig: SoapConnectorDto): Promise<any> {
//     try {
//       const wsdlPath = Paths.WORKFLOW_SOAP_DIR; // Path to the WSDL file

//       // Dynamically create the SOAP client
//       await this.soapClient.createClient(wsdlPath);

//       const operation = SoapConnectorConfig.methodName; // Replace with the actual operation name
//       const args = SoapConnectorConfig.data; // Provide the arguments for the SOAP call

//       const data = await this.soapClient.call(operation, args);
//       return [null, data];
//     } catch (err) {
//       return [err];
//     }
//   }
// }

