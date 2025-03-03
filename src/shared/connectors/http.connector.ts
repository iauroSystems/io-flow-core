import { HttpService } from '@nestjs/axios'
import { Injectable } from '@nestjs/common';
import { AxiosRequestConfig } from 'axios';
import qs from 'qs';
import { firstValueFrom, lastValueFrom, map } from 'rxjs';
import { HttpConnectorDto } from 'src/shared/dtos'

@Injectable()
export class HttpConnector {
    constructor (private httpService: HttpService) { }

    async call(httpConnectorConfig: HttpConnectorDto) {
        const axiosConfig = httpConnectorConfig;
        axiosConfig.paramsSerializer = params => {
            return qs.stringify(params);
        }
        axiosConfig.timeout = axiosConfig.timeout || 30000;
        return firstValueFrom(this.httpService.request(axiosConfig)).then((data) => [null, { status: data?.status, data: data?.data }])
            .catch((err) => [{ status: err.response?.status || 504, data: err.response?.data || err.message }]);
    }
}