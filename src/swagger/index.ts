import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const config = new DocumentBuilder()
  .setTitle('Blog-Server')
  .setDescription('Blog API description')
  .setVersion('0.0.1')
  .addTag('用户系统')
  .addTag('博客系统')
  .addTag('管理系统')
  .build();

export function useSwagger(app) {
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/api', app, document);
}
