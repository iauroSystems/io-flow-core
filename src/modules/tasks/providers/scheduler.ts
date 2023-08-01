import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Executor } from './executor';
@Injectable()
export class CronService {
    private readonly logger = new Logger();
    constructor (private execute: Executor) { }
    @Cron('5 * * * * *')
    handleCron() {
        this.logger.debug('Called when the current second is 5');
        this.execute.makeTimerEventEnd();
    }
}