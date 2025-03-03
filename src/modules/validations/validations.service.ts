import { HttpStatus, Injectable, Logger, Scope, UseFilters } from '@nestjs/common';
import { ValidationsRepository } from 'src/models/validations/repository/validations.repository';
import { Validations } from 'src/models/validations/validations.schema';
import { CreateValidationsDto, GetValidationDto, PropertiesDto } from './dtos';
import CustomResponse from 'src/common/providers/custom-response.service';
import CustomError from 'src/common/exceptions';
import { CustomMessages } from 'src/common/const/custom-messages';
import { CommonHeadersDto } from 'src/shared/dtos';
import { ValidationsRepositoryImpl } from 'src/models/validations/repository/validations.repository.impl';
import * as _ from 'lodash';
const Joi = require( 'joi' );

@Injectable()
export class ValidationService {
  private readonly logger: Logger = new Logger( Validations.name );

  constructor(
    private validationRepositoryImpl: ValidationsRepositoryImpl
  ) { }


  /**
   * Create validation to validate parameters
   * @param headers {object} - Defined request headers  
   * @param updateProcessInstanceDto {object} - Input validation payload e.g. {name:'',properties:[{"key":'',dataType:'',required:''}]}
   * @returns {Promise} - CustomError or CustomResponse, e.g. {statusCode: 400, message: "", error: {}}/{statusCode: 200, message: "", result: {}}
   */
  async create ( headers: CommonHeadersDto, createValidationsDto: CreateValidationsDto ): Promise<CustomResponse | CustomError> {
    let createValidation = await this.validationRepositoryImpl.create( createValidationsDto );
    if ( !createValidation ) {
      throw new CustomError( HttpStatus.BAD_REQUEST, CustomMessages.VALIDATION_NOT_CREATED );
    }
    const data = await this.validationRepositoryImpl.create( createValidationsDto );
    return new CustomResponse( HttpStatus.CREATED, CustomMessages.VALIDATION_CREATED, data );
  }


  /**
   * Create validation to validate parameters 
   * @param id {string} - validationId
   * @param parameters {object} - parameters to validate against validationId
   * @returns {array} - [boolean/null, string], e.g. [false, '[firstName] must be of type [string]']
   */
  async validateParameters ( id: string, parameters: {} ) {
    let createValidation = await this.validationRepositoryImpl.findOne( { _id: id } );
    
    if ( !createValidation ) {
      return [ false, `[${ id }] validation not found.` ];

    } else {
      const validationSchema = await this.createJoiSchema( createValidation );
      const result = validationSchema.validate( parameters );

      if ( result.error ) {
       return [false,`${ result.error }`];
      }
      return [ true, null, parameters ];
    }
  }


  /**
   * Create validation to validate parameters 
   * @param validationObj {object} - validation schema for reference to create joi schema dynamically
   * @returns {array} - {Joi Object with its metadata and funtions}
   */
  async createJoiSchema ( validationObj ) {
    const schemaProps = {};

    validationObj.properties.forEach( property => {
      if ( property.key && property.datatype ) {

        let fieldSchema = Joi[ property.datatype ]();

        if ( property.required ) {
          fieldSchema = fieldSchema.required();
        }

        schemaProps[ property.key ] = fieldSchema;
      }
    } );

    return Joi.object( schemaProps ).required();
  }


  /**
  * Update validation by validation id and updated validation payload
  * @param id {string} - validationId
  * @param createValidationsDto {object} - updating validation object
  * @returns {Promise} - CustomError or CustomResponse, e.g. {statusCode: 400, message: "", error: {}}/{statusCode: 200, message: "", result: {}}
  */
  async update ( id: string, createValidationsDto: CreateValidationsDto ) {
    const validationData = await this.validationRepositoryImpl.findOne( { _id: id } );
    if ( !validationData ) {
      throw new CustomError( HttpStatus.BAD_REQUEST, CustomMessages.VALIDATION_NOT_FOUND );
    }
    const response = await this.validationRepositoryImpl.updateOne( { _id: id }, createValidationsDto );
    if ( !response ) {
      throw new CustomError( HttpStatus.BAD_REQUEST, CustomMessages.VALIDATION_UPDATE_ERROR );
    }
    return new CustomResponse( HttpStatus.BAD_REQUEST, CustomMessages.SUCCESS, response );
  }


  /**
  * Delete validation from collection by validationId
  * @param id {string} - validationId
  * @returns {Promise} - CustomError or CustomResponse, e.g. {statusCode: 400, message: "", error: {}}/{statusCode: 200, message: "", result: {}}
  */
  async remove ( id: string ) {
    const validationData = await this.validationRepositoryImpl.findOne( { _id: id } );
    if ( !validationData ) {
      throw new CustomError( HttpStatus.BAD_REQUEST, CustomMessages.VALIDATION_NOT_FOUND );
    }
    const response = await this.validationRepositoryImpl.deleteOne( { _id: id } );
    if ( !response ) {
      throw new CustomError( HttpStatus.BAD_REQUEST, CustomMessages.VALIDATION_DELETE_ERROR );
    }
    return new CustomResponse( HttpStatus.BAD_REQUEST, CustomMessages.SUCCESS, response );
  }

  /**
   * Find a list of validations with pagination, filters, search option
   * @param query {object} - Query params object
   * @returns {Promise} - CustomError or CustomResponse, e.g. {statusCode: 400, message: "", error: {}}/{statusCode: 200, message: "", result: {}}
   */
  async findAll ( query: GetValidationDto ): Promise<CustomResponse | CustomError> {
    let condition: any = { $and: [] };
    let sort = null;
    let filters = null;
    try {
      if ( query.filters ) {
        filters = JSON.parse( query.filters );
        condition.$and.push( filters );
      }


      if ( query.search ) {
        const search = JSON.parse( query.search );
        // condition.$and = [];
        const orCond = { $or: [] };
        for ( let key in search ) {
          if ( search.hasOwnProperty( key ) ) {
            let obj = {};
            const safeKey = _.escapeRegExp( search[ key ] );
            obj[ key ] = { $regex: new RegExp( safeKey, 'i' ) };
            orCond.$or.push( obj );
          }
        }
        condition.$and.push( orCond );
      }

      if ( query.sort ) {
        sort = JSON.parse( query.sort );
      }
    } catch ( err ) {
      this.logger.error( err );

      throw new CustomError( HttpStatus.BAD_REQUEST, ` [filters/customFilters/search] ${ CustomMessages.INVALID_JSON }` );
    }
    if ( !condition.$and.length ) {
      condition = {};
    }

    const count = await this.validationRepositoryImpl.count( condition );
    const data = await this.validationRepositoryImpl.find( condition, {}, query.page, query.size, sort || { $natural: -1 } );
    return new CustomResponse( HttpStatus.OK, CustomMessages.SUCCESS, { count, data } );
  }


  /**
   * Find a validation by validationId
   * @param id {string} - validationId
   * @returns {Promise} - CustomError or CustomResponse, e.g. {statusCode: 400, message: "", error: {}}/{statusCode: 200, message: "", result: {}}
   */
  async findOne ( id: string ) {
    const validationData = await this.validationRepositoryImpl.findOne( { _id: id } );
    if ( !validationData ) {
      throw new CustomError( HttpStatus.BAD_REQUEST, CustomMessages.VALIDATION_NOT_FOUND );
    }
    return new CustomResponse( HttpStatus.BAD_REQUEST, CustomMessages.SUCCESS, validationData );
  }

}


