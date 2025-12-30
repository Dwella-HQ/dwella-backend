/* eslint-disable @typescript-eslint/no-floating-promises */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureSwagger } from './config/swagger.config';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from './config/env.config';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new Logger(),
  });
  app.enableCors({
    origin: true,
  });
  await configureSwagger(app, 'documentation');
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(
    app.get(ConfigService<EnvironmentVariables>).get('PORT')!,
    '0.0.0.0',
    () =>
      new Logger('Documentation').log(
        `http://localhost:${app.get(ConfigService<EnvironmentVariables>).get('PORT')}/documentation`,
      ),
  );
}
bootstrap();
