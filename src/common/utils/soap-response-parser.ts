import { parseString } from 'xml2js';


export class SoapResponseParser {
    parseXmlResponse(xmlResponse: string): Promise<any> {
        return new Promise((resolve, reject) => {
            parseString(xmlResponse, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    // Extract the relevant data from the parsed XML
                    // const responseData = result['soap:Envelope']['soap:Body'][0]['web:GetDataResponse'][0];
                    resolve(result);
                }
            });
        });
    }
}


