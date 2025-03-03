import { HttpStatus, Injectable, Scope } from "@nestjs/common";
import { CreateWebhookBodyDto, GetWebhookQueryDto, UpdateWebhookBodyDto } from "./dtos";
import CustomResponse from 'src/common/providers/custom-response.service';
import CustomError from "src/common/exceptions/custom-error";
import { CustomMessages } from "src/common/const/custom-messages";
import { WebhookRepositoryImpl } from "src/models/webhooks/repository/webhooks.repository.impl";

@Injectable()
export class WebhookService {
  constructor (
    private webhookRepositoryImpl: WebhookRepositoryImpl
  ) { }


  async create(createWebhookDto: CreateWebhookBodyDto): Promise<CustomResponse | CustomError> {
    let webhook = await this.webhookRepositoryImpl.findOne({ name: createWebhookDto.name });
    if (webhook) {
      throw new CustomError(HttpStatus.CONFLICT, CustomMessages.WEBHOOK_EXISTS);
    }

    const data = await this.webhookRepositoryImpl.create(createWebhookDto);
    return new CustomResponse(HttpStatus.CREATED, CustomMessages.WEBHOOK_CREATED, data);
  }

  async update(id: string, updateWebhookDto: UpdateWebhookBodyDto): Promise<CustomResponse | CustomError> {
    const workflow = await this.webhookRepositoryImpl.findOne({ _id: id });
    if (!workflow) {
      throw new CustomError(HttpStatus.BAD_REQUEST, CustomMessages.WEBHOOK_NOT_FOUND);
    }
    const data = await this.webhookRepositoryImpl.create(updateWebhookDto);
    return new CustomResponse(HttpStatus.OK, CustomMessages.WEBHOOK_UPDATED, data);
  }


  async findAll(query: GetWebhookQueryDto): Promise<CustomResponse | CustomError> {
    let condition = {};
    try {
      if (query.filters) {
        condition = JSON.parse(query.filters);
      }
      if (query.search) {
        const search = JSON.parse(query.search);
        condition = { $or: [] };
        for (let key in search) {
          if (search.hasOwnProperty(key)) {
            let obj = {};
            obj[key] = { $regex: new RegExp(search[key], 'i') }
            condition['$or'].push(obj);
          }
        }
      }
    } catch (err) {
      throw new CustomError(HttpStatus.BAD_REQUEST, ` [filters/search] ${CustomMessages.INVALID_JSON}`);
    }
    const count = await this.webhookRepositoryImpl.count(condition);
    const data = await this.webhookRepositoryImpl.find(condition, {}, query.page, query.size, { $natural: -1 });
    return new CustomResponse(HttpStatus.OK, CustomMessages.SUCCESS, { count, data });
  }

  async findOne(id: string): Promise<CustomResponse | CustomError> {
    const workflow = await this.webhookRepositoryImpl.findOne({ _id: id });
    if (!workflow) {
      throw new CustomError(HttpStatus.BAD_REQUEST, CustomMessages.WORKFLOW_NOT_FOUND);
    }
    return new CustomResponse(HttpStatus.OK, CustomMessages.SUCCESS, workflow);
  }

}