import { Injectable, Logger } from '@nestjs/common';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs';

export class ExecuteOnlyOnce {
    private readonly logger = new Logger(ExecuteOnlyOnce.name);

    handleTimerEventCron ( name, seconds ) {
        const job = new CronJob( `0/${ seconds } * * * * *`, () => {
            const url = `http://localhost:${ process.env.TCP_PORT }${ process.env.APP_BASEPATH ? `/${ process.env.APP_BASEPATH }` : '' }/timer`;
            const httpService = new HttpService();
            const axiosConfig = {
                url,
                method: 'get'
            };
            firstValueFrom( httpService.request( axiosConfig ) );

        } );
        const schedulerRegistry = new SchedulerRegistry();
        schedulerRegistry.addCronJob( name, job );
        job.start();

        this.logger.debug(
            `job [${ name }] added for every ${ seconds } seconds!`,
        );
    }
}
