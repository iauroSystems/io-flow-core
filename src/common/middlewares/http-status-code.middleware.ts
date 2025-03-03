import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { Counter } from 'prom-client';

@Injectable()
export class MetricsMiddleware implements NestMiddleware {
    private counter: Counter<string>;

    constructor() {
        this.counter = new Counter( {
            name: 'http_status_codes',
            help: 'HTTP status codes',
            labelNames: [ 'status', 'method', 'url' ],
        } );
    }

    use ( req: Request, res: Response, next: () => void ) {
        res.on( 'finish', () => {
            const status = res.statusCode.toString();
            const method = req.method.toString();
            const url = req.url.toString();
            this.counter.inc( { status, method, url } );
        } );
        next();
    }
}
