import { HttpStatus, Injectable } from "@nestjs/common";
import { CreateConnectorBodyDto, UpdateConnectorBodyDto, GetConnectorQueryDto } from "./dtos";
import CustomResponse from 'src/common/providers/custom-response.service';
import CustomError from "src/common/exceptions/custom-error";
import { CustomMessages } from "src/common/const/custom-messages";
import { ConnectorRepositoryImpl } from "src/models/connectors/repository/connectors.repository.impl";

@Injectable()
export class ConnectorService {
  constructor(
    private connectorRepositoryImpl: ConnectorRepositoryImpl
  ) { }

  /**
  * Create connector
  * @param createConnectorBodyDto {object} - Input connector payload e.g. {"name": "string","description": "string","type": "string","config": {},"parameters": {}}
  * @returns {Promise} - CustomError or CustomResponse, e.g. {statusCode: 400, message: "", error: {}}/{statusCode: 200, message: "", result: {}}
  */
  async create ( createConnectorBodyDto: CreateConnectorBodyDto ): Promise<CustomResponse | CustomError> {
    const data = await this.connectorRepositoryImpl.create( createConnectorBodyDto );
    if ( !data ) {
      throw new CustomError( HttpStatus.BAD_REQUEST, CustomMessages.CONNECTOR_NOT_CREATED );
    }
    return new CustomResponse( HttpStatus.CREATED, CustomMessages.CONNECTOR_CREATED, data );
  }

  /**
  * Update connector by connector id and updated connector payload
  * @param id {string} - connectorId
  * @param createConnectorBodyDto {object} - updating createConnectorBodyDto object
  * @returns {Promise} - CustomError or CustomResponse, e.g. {statusCode: 400, message: "", error: {}}/{statusCode: 200, message: "", result: {}}
  */
  async update ( id: string, updateConnectorBodyDto: UpdateConnectorBodyDto ): Promise<CustomResponse | CustomError> {
    const connector = await this.connectorRepositoryImpl.findOne( { _id: id } );
    if ( !connector ) {
      throw new CustomError( HttpStatus.BAD_REQUEST, CustomMessages.CONNECTOR_NOT_FOUND );
    }
    const data = await this.connectorRepositoryImpl.update( { _id: id }, updateConnectorBodyDto );
    return new CustomResponse( HttpStatus.OK, CustomMessages.CONNECTOR_UPDATED, data );
  }

  /**
  * Find a list of connectors with pagination, filters, search option
  * @param query {object} - Query params object
  * @returns {Promise} - CustomError or CustomResponse, e.g. {statusCode: 400, message: "", error: {}}/{statusCode: 200, message: "", result: {}}
  */
  async findAll ( query: GetConnectorQueryDto ): Promise<CustomResponse | CustomError> {
    let condition = {};
    try {
      if ( query.filters ) {
        condition = JSON.parse( query.filters );
      }
      if ( query.search ) {
        const search = JSON.parse( query.search );
        condition = { $or: [] };
        for ( let key in search ) {
          if ( search.hasOwnProperty( key ) ) {
            let obj = {};
            obj[ key ] = { $regex: new RegExp( search[ key ], 'i' ) };
            condition[ '$or' ].push( obj );
          }
        }
      }
    } catch ( err ) {
      throw new CustomError( HttpStatus.BAD_REQUEST, ` [filters/search] ${ CustomMessages.INVALID_JSON }` );
    }
    const count = await this.connectorRepositoryImpl.count( condition );
    const data = await this.connectorRepositoryImpl.find( condition, {}, query.page, query.size,{$natural:-1} );
    return new CustomResponse( HttpStatus.OK, CustomMessages.SUCCESS, { count, data } );
  }

  /**
  * Find a connector by connectorId
  * @param id {string} - connectorId
  * @returns {Promise} - CustomError or CustomResponse, e.g. {statusCode: 400, message: "", error: {}}/{statusCode: 200, message: "", result: {}}
  */
  async findOne ( id: string ): Promise<CustomResponse | CustomError> {
    const response = await this.connectorRepositoryImpl.findOne( { _id: id } );
    if ( !response ) {
      throw new CustomError( HttpStatus.BAD_REQUEST, CustomMessages.CONNECTOR_NOT_FOUND );
    }
    return new CustomResponse( HttpStatus.OK, CustomMessages.SUCCESS, response );
  }

  /**
  * Delete connector from collection by connectorId
  * @param id {string} - connectorId
  * @returns {Promise} - CustomError or CustomResponse, e.g. {statusCode: 400, message: "", error: {}}/{statusCode: 200, message: "", result: {}}
  */
  async remove ( id: string ) {
    const validationData = await this.connectorRepositoryImpl.findOne( { _id: id } );
    if ( !validationData ) {
      throw new CustomError( HttpStatus.BAD_REQUEST, CustomMessages.VALIDATION_NOT_FOUND );
    }
    const response = await this.connectorRepositoryImpl.deleteOne( { _id: id } );
    if ( !response ) {
      throw new CustomError( HttpStatus.BAD_REQUEST, CustomMessages.VALIDATION_DELETE_ERROR );
    }
    return new CustomResponse( HttpStatus.BAD_REQUEST, CustomMessages.SUCCESS, response );
  }


}
