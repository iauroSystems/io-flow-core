import { Injectable } from '@nestjs/common';
import { OpenAIConnectorDto } from '../dtos/connectors.dto';
import { OpenAI } from 'openai';

@Injectable()
export class OpenAIConnector {

  async call(openAIConnectorConfig: OpenAIConnectorDto): Promise<any> {
    try {

      const openai = new OpenAI({ apiKey: openAIConnectorConfig.apiKey, });
      const prompt = openAIConnectorConfig.prompt;
      const responsePromise = openai.chat.completions.create(
        {
          model: 'gpt-3.5-turbo',
          messages: [{ role: "user", content: prompt }],
        },
        {
          timeout: 10000,
        },
      );
      const response = await responsePromise;
      return [null, response];
    } catch (error) {
      return [error.toString(), null];
    }
  }
}