import { Injectable } from '@nestjs/common';
import { decrypt } from 'src/common/utils/encryption';
import { PostgesConnectorDto } from '../dtos';
import { DataSource, DataSourceOptions } from 'typeorm';
import { Constants } from 'src/common/const/constants';
import { Parser } from 'node-sql-parser';

@Injectable()
export class PostgresConnector {
    constructor() { }

    async call(postgresConnectorConfig: PostgesConnectorDto) {
        return new Promise(async (_resolve, reject) => {

            let decryptedQuery = "";
            let decryptedPassword = "";
            let limitExceeded = false;
            let totalRecords = 0;

            if(postgresConnectorConfig?.encryptedQuery && postgresConnectorConfig?.encryptedQuery !== "") {
                decryptedQuery = await decrypt(postgresConnectorConfig.encryptedQuery);
            } else {
                decryptedQuery = postgresConnectorConfig.query;
            }
            

            if(decryptedQuery.trim() === "") {
                reject('query should not have empty value');
            }

            if(postgresConnectorConfig?.encryptedPassword && postgresConnectorConfig?.encryptedPassword !== "") {
                decryptedPassword = await decrypt(postgresConnectorConfig.encryptedPassword);
            } else {
                decryptedPassword = postgresConnectorConfig.password;
            }

            const dataSourceOptions: DataSourceOptions = {
                type: 'postgres',
                host: postgresConnectorConfig.hostname,
                port: postgresConnectorConfig.port,
                username: postgresConnectorConfig.user,
                password: decryptedPassword,
                database: postgresConnectorConfig.databaseName,
            };

            const dataSource = new DataSource(dataSourceOptions);

            try {
                await dataSource.initialize();

                decryptedQuery = decryptedQuery.replace(/;/g, '');
                const parser = new Parser();
                let ast: any = parser.astify(decryptedQuery, Constants.DB_PARSER_CONFIG.postgres);
                // Check if the query is a SELECT query
                if (this.isSelectQuery(ast)) {
                    // Ensure the main query has a WHERE clause
                    if (!this.hasWhereClause(ast)) {
                        reject('SELECT query should have a WHERE clause');
                    }

                    if(!this.hasLimitClause(ast)) {
                        // First, execute a count query
                        let countQuery = this.constructCountQuery(ast, decryptedQuery);
                        countQuery = this.replaceBackticks(countQuery);
                        const countResult = await dataSource.query(countQuery);
                        totalRecords = countResult[0]?.count;

                    } else {
                        totalRecords = ast?.limit?.value[0].value;
                    }

                    // If total records exceed 100, adjust the main query
                    if (totalRecords > Constants.DEFAULT_QUERY_LIMIT) {
                        limitExceeded = true;
                        ast = this.addLimitClause(ast, Constants.DEFAULT_QUERY_LIMIT);
                    }
                }

                decryptedQuery = parser.sqlify(ast, Constants.DB_PARSER_CONFIG.postgres);
                decryptedQuery = this.replaceBackticks(decryptedQuery);
                const result = await dataSource.query(decryptedQuery);
                const response = {
                    message: limitExceeded ? `Fetched only a maximum of ${Constants.DEFAULT_QUERY_LIMIT} records.` : '',
                    data: result,
                };
                _resolve(response);
            }
            catch (error) {
                reject(error);
            }
            finally {
                if (dataSource.isInitialized) {
                    await dataSource.destroy();
                }
            }
        }).then((data) => [null, data])
            .catch((err) => [err]);
    }

    private isSelectQuery(ast: any): boolean {
        return ast.type === 'select';
    }

    private hasWhereClause(ast: any): boolean {
        return ast.where !== null;
    }

    private hasLimitClause(ast: any): boolean {
        return ast.limit.value[0]?.value !== undefined;
    }

    private constructCountQuery(ast: any, query: string): string {
        const parser = new Parser();
        const clonedAst = JSON.parse(JSON.stringify(ast));
        clonedAst.columns = [{
            expr: {
              type: 'aggr_func',
              name: 'COUNT',
              args: { expr: { type: 'star', value: '*' } },
              over: null
            },
            as: 'count'
          }];
        clonedAst.limit = null;
        return parser.sqlify(clonedAst);
    }

    private addLimitClause(ast: any, limit: number): any {
        ast.limit.value = [ { type: 'number', value: limit } ];
        return ast;
    }

    private replaceBackticks(query:string): string {
        return query.replace(/`/g, '"');
    }
}