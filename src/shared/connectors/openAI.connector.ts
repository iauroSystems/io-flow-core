import { HttpStatus, Injectable } from '@nestjs/common';
import { OpenAIConnectorDto } from '../dtos/connectors.dto';
import { Configuration, OpenAIApi } from 'openai';
import CustomError from 'src/common/exceptions';
import { firstValueFrom, from } from 'rxjs';
import { error } from 'console';
import { resolve } from 'path';

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
      try {
        // console.log('Before await', responsePromise);
        const response = await responsePromise;
        console.log('API Response:', response);
      
        return [response.toString()];
      } catch (error) {
        return [error.toString()];
      }
      // // console.log('::::::',responsePromise['choices'][0]['text']);
      // console.log('Before await',responsePromise);
      // const response = await firstValueFrom(from(responsePromise));
      // // console.log('after await',response)
      // console.log('API Response:', response);
      // return [response.toString()];
    } catch (error) {
        return [error.toString()];
    }
  }
}


// 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