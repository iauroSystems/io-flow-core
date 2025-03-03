import { Injectable } from "@nestjs/common";

@Injectable()
export class ConnectorEvaluate {
    constructor(
    ) { }

    /**
    * Evaluate connector configuration data with given connector variables
    * @param connector {object} - connector configuration with data, e.g. {type: "rest", config: {},variables:{}}
    * @returns {object} - {connector}, e.g. {type: "rest", config: {}}
    */
    async replaceParametersInConnector ( connector ) {
        const config = await this.replaceRecursively( connector.config, connector.config?.variables );
        connector.config = config;
        return connector;
    }

    /**
    * Relaces the dynamic keys of connector configuration with matching variables value
    * @param config {object} - connector configuration data, e.g. config: {}
    * @param variables {object} - parameters data, e.g. parameters: {key:value}
    * @returns {object} - connector config object
    */
    private async replaceRecursively ( config, variables ) {

        // Regular expression to match placeholders like ${parameter_key}
        const placeholderRegex = /\${(.*?)}/g;

        config = JSON.stringify( config );
        let replacedConfig = config.replaceAll( placeholderRegex, ( _, key ) => variables[ key ] || '' );
        return JSON.parse( replacedConfig );

    }

}
