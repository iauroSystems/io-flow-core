import { Injectable, Logger } from '@nestjs/common';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs';

export class ExecuteOnlyOnce {
    private readonly logger = new Logger(ExecuteOnlyOnce.name);

    exampleCron() {
        this.logger.debug(`Executing only one instance on only one core!`,);
    }
}