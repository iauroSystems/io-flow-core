process.env.NODE_ENV === 'local' ? require('dotenv').config({ path: `envs/.env.${process.env.NODE_ENV}`, override: true }) : '';

process.env.NODE_OPTIONS = "--max-old-space-size=1024";

import { NestFactory } from '@nestjs/core'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { ValidationPipe } from '@nestjs/common'
import { Transport } from '@nestjs/microservices'
import { join } from 'path'
import { AppModule } from './app.module'
import { AppClusterService } from './common/providers/app-cluster.service';
import { Logger } from '@nestjs/common';
import { json } from 'body-parser';

const {
  TCP_PORT = 30009,
  GRPC_HOST,
  GRPC_PORT = 40009,
  SWAGGER_BASEPATH = '',
  SWAGGER_TITLE,
  SWAGGER_DESC,
  SWAGGER_VERSION,
  SWAGGER_TAG = '',
  SWAGGER_DOC_PATH = '',
  APP_BASEPATH,
} = process.env;

declare const module: any

// const microserviceOptions = {
//   // transport: Transport.REDIS,  <-- Change this
//   transport: Transport.GRPC, //  <-- to this
//   options: {
//     // url: 'redis://localhost:6379',                  <-- remove this
//     package: 'app', //                                 <-- add this
//     protoPath: [
//       join(__dirname, '../src/shared/proto/common-requests/common-requests.proto')
//     ], // <-- & this
//     host: GRPC_HOST,
//     port: GRPC_PORT,
//   },
// }



async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'debug', 'log', 'verbose']
  })
  app.setGlobalPrefix(APP_BASEPATH);
  app.use(json({ limit: '5mb' }));
  app.enableCors();

  // Swagger configuration
  const swaggerConfig = new DocumentBuilder()
    .addServer(SWAGGER_BASEPATH)
    .setTitle(SWAGGER_TITLE)
    .setDescription(SWAGGER_DESC)
    .setVersion(SWAGGER_VERSION)
    .addTag(SWAGGER_TAG)
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, swaggerConfig)

  SwaggerModule.setup(SWAGGER_DOC_PATH, app, document)
  // enable validations
  app.useGlobalPipes(new ValidationPipe({
    transform: true, whitelist: true, forbidNonWhitelisted: true
  }))
  // app.useGlobalFilters(new ErrorFilter())
  // microservice grpc #1
  // app.connectMicroservice(microserviceOptions)
  // await app.startAllMicroservices()
  // await app.listen(microserviceOptions.options.port)
  // await app.listen(TCP_PORT)
  await app.init()
  await app.listen(TCP_PORT);
  Logger.log(`[main] Business Process Engine is running on: ${await app.getUrl()}`);
  if (module.hot) {
    module.hot.accept()
    module.hot.dispose(() => app.close())
  }

  process.on('SIGINT', () => {
    app.close()
    Logger.warn(`[main] Server has been closed due to the signal [SIGINT]`);
  });
}

AppClusterService.clusterize(bootstrap);

// bootstrap()
