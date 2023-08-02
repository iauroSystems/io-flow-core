import * as cluster from 'cluster';
import * as os from 'os';
import { Injectable, Logger } from '@nestjs/common';
import { ExecuteOnlyOnce } from './execute-only-once';

const numCPUs = os.cpus().length;
const Cluster: any = cluster;
@Injectable()
export class AppClusterService {
    static logger: Logger = new Logger(AppClusterService.name);
    constructor () { }
    static clusterize(callback: Function): void {

        if (Cluster.isMaster) {
            this.logger.log(`Master server started on process [${process.pid}]`);
            for (let i = 0; i < numCPUs; i++) {
                Cluster.fork();
            }
            Cluster.on('exit', (worker, code, signal) => {
                this.logger.log(`Worker ${worker.process.pid} died. Restarting`);
                Cluster.fork();
            })

            let mainWorkerId = null;
            Cluster.on('listening', (worker, address) => {

                this.logger.log(`cluster listening new worker id [${worker.id}]`);
                if (mainWorkerId === null) {

                    this.logger.log(`Making worker ${worker.id} to main worker`);
                    mainWorkerId = worker.id;
                    worker.send({ order: 'executeOnlyOnce' });
                }
            });
        } else {
            process.on('message', (msg) => {

                this.logger.log(`Worker ${process.pid} received message from master. ${msg}`);
                if (msg['order'] === 'executeOnlyOnce') {
                    const executeOnlyOnce = new ExecuteOnlyOnce();
                    executeOnlyOnce.handleTimerEventCron('timerCron', 10);
                }
            });
            this.logger.log(`Cluster server started on ${process.pid}`)
            callback();
        }
    }
}
