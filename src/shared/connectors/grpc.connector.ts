import { resolve } from 'path';
import GRPCClient from 'src/common/providers/node-grpc-client';
import { GrpcConnectorDto } from 'src/shared/dtos'
import { Paths } from 'src/common/const/constants';

export class GrpcConnector {

    call(grpcConnectorConfig: GrpcConnectorDto) {

        return new Promise((_resolve, reject) => {
            try {
                const { serviceOptions, methodOptions } = grpcConnectorConfig;
                const protoPath = resolve(Paths.WORKFLOW_PROTO_DIR, serviceOptions.protoPath);
                const serviceClient = new GRPCClient(protoPath, serviceOptions.packageName || serviceOptions.serviceName, serviceOptions.serviceName, serviceOptions.url);
                // options is optional and is supported from version 1.5.0
                const options = {
                    metadata: methodOptions.metadata
                };
                serviceClient.runService(methodOptions.methodName, methodOptions.message, (err, res) => {
                    if (err) {
                        reject(err);
                    } else {
                        _resolve(res);
                    }
                }, options);
            } catch (err) {
                reject(err);
            }
        }).then((data) => [null, data])
            .catch((err) => [err]);
    }
};
