import { HttpService } from '@nestjs/axios'
import { Injectable } from '@nestjs/common';
import { AxiosRequestConfig } from 'axios';
import { firstValueFrom, lastValueFrom, map } from 'rxjs';
import { HttpConnectorDto } from 'src/shared/dtos'

@Injectable()
export class HttpConnector {
    constructor (private httpService: HttpService) { }

    async call(httpConnectorConfig: HttpConnectorDto) {
        const axiosConfig = httpConnectorConfig;
        return firstValueFrom(this.httpService.request(axiosConfig)).then((data) => [null, { status: data?.status, data: data?.data }])
            .catch((err) => [{ status: err.response?.status, data: err.response?.data }]);
    }
}