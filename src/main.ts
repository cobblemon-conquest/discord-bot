import { NestFactory } from '@nestjs/core';
import { RootModule } from './RootModule';

async function bootstrap() {
  const app = await NestFactory.create(RootModule);
  await app.listen(process.env.PORT ?? 3000);
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
