import { Injectable } from "@nestjs/common";
import { GrpcConnector } from "src/shared/connectors";

@Injectable()
export class Audits {
    constructor (
        private grpc: GrpcConnector,
    ) { }
    async pushAuditLogs(metadata, entity, data, operation) {
        const { AUDIT_SERVICE_GRPC_HOST, AUDIT_SERVICE_GRPC_PORT } = process.env;
        const config = {
            serviceOptions: {
                protoPath: 'audit-service/audits.proto',
                serviceName: 'AuditServices',
                packageName: 'audits',
                url: `${AUDIT_SERVICE_GRPC_HOST}:${AUDIT_SERVICE_GRPC_PORT}`
            },
            methodOptions: {
                methodName: 'Create',
                message: {
                    entity,
                    operation,
                    entityId: data?._id.valueOf(),
                    type: 'business-process',
                    subType: 'rest-api',
                    oldValue: JSON.stringify(data),
                    newValue: JSON.stringify(data),
                    createdBy: { userId: 'business process service' }
                },
                metadata: {
                    ...(metadata['x-tenant-id'] && { 'x-tenant-id': metadata['x-tenant-id'] }),
                    ...(metadata.authorization && { authorization: metadata.authorization }),
                }
            }
        };
        const [err, response] = await this.grpc.call(config);

    }
}