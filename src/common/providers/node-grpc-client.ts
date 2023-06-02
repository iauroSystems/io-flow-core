import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { ServiceClientConstructor, GrpcObject, ServiceDefinition } from '@grpc/grpc-js/build/src/make-client';

interface Options {
    metadata?: any;
    keepCase?: boolean;
    longs?: string;
    enums?: string;
    default?: boolean;
}

export default class GRPCClient {
    private packageDefinition: any;
    private client: any;
    private listNameMethods: string[];
    constructor (protoPath, packageName, _service, host, options?: Options) {

        this.packageDefinition = protoLoader.loadSync(protoPath);

        const proto = ((packageName) => {

            const packagePath = packageName.split('.');
            let _proto = grpc.loadPackageDefinition(this.packageDefinition);

            for (let $i = 0; $i <= packagePath.length - 1; $i++) {

                _proto = _proto[packagePath[$i]] as GrpcObject;

            }

            return _proto;

        })(packageName);

        const listMethods = this.packageDefinition[`${packageName}.${_service}`];
        const serviceObj = proto[_service] as ServiceClientConstructor;
        this.client = new serviceObj(host, grpc.credentials.createInsecure());
        this.listNameMethods = [];

        for (const key in listMethods) {

            const methodName = listMethods[key].originalName;
            this.listNameMethods.push(methodName);

            this[`${methodName}Async`] = (data, fnAnswer, options?: Options) => {

                let metadataGrpc = {};

                if (('metadata' in options) && (typeof options?.metadata == 'object')) {

                    metadataGrpc = this.generateMetadata(options?.metadata)

                }
                this.client[methodName](data, metadataGrpc, fnAnswer);

            }

            this[`${methodName}Stream`] = (data, options?: Options) => {

                let metadataGrpc = {};

                if (('metadata' in options) && (typeof options?.metadata == 'object')) {

                    metadataGrpc = this.generateMetadata(options?.metadata)

                }

                return this.client[methodName](data, metadataGrpc)

            }

            this[`${methodName}Sync`] = (data, options?: Options) => {

                let metadataGrpc = {};

                if (('metadata' in options) && (typeof options?.metadata == 'object')) {

                    metadataGrpc = this.generateMetadata(options?.metadata)

                }

                const client = this.client;

                return new Promise(function (resolve, reject) {
                    client[methodName](data, metadataGrpc, (err, dat) => {

                        if (err) {
                            return reject(err);
                        }

                        resolve(dat);

                    });

                })

            }

        }

    }

    generateMetadata = (metadata) => {

        let metadataGrpc = new grpc.Metadata();

        for (let [key, val] of Object.entries(metadata)) {
            metadataGrpc.add(key, val as any);

        }

        return metadataGrpc

    };

    runService(fnName, data, fnAnswer, options?: Options) {

        let metadataGrpc = {};

        if (('metadata' in options) && (typeof options?.metadata == 'object')) {

            metadataGrpc = this.generateMetadata(options?.metadata)

        }

        this.client[fnName](data, metadataGrpc, fnAnswer);

    }

    listMethods() {

        return this.listNameMethods;

    }

} // End GRPCClient