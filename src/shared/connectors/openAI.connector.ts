import { Injectable } from '@nestjs/common';
import { OpenAIConnectorDto } from '../dtos/connectors.dto';
import { Configuration, OpenAIApi } from 'openai';

@Injectable()
export class OpenAIConnector {
  private openai: OpenAIApi;

  async call(openAIConnectorConfig: OpenAIConnectorDto): Promise<any> {
    try {
      const configuration = new Configuration({
        apiKey: openAIConnectorConfig.apiKey,
      });
      this.openai = new OpenAIApi(configuration);
      const prompt = openAIConnectorConfig.prompt;
      const responsePromise = this.openai.createCompletion(
        {
          model: 'gpt-3.5-turbo',
          prompt: prompt,
          // messages: [{role: "user", content: prompt}],
        },
        {
          timeout: 10000,
        },
      );
        const response = await responsePromise;
        return [response];
    } catch (error) {
        return [error.toString()];
    }
  }
}