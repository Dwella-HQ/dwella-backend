import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import metadata from '../metadata';

export const configureSwagger = async (app: INestApplication, path: string) => {
  const config = new DocumentBuilder()
    .setTitle('Dwelliva NG Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  await SwaggerModule.loadPluginMetadata(metadata);
  const document = SwaggerModule.createDocument(app, config);
  app.use(
    path,
    apiReference({
      content: document,
      tagsSorter: 'alpha',
    }),
  );
  // SwaggerModule.setup(path, app, document, {
  //   swaggerOptions: {
  //     tagsSorter: 'alpha',
  //     persistAuthorization: true,
  //   },
  // });
};
