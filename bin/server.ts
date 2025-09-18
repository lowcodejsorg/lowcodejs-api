import { MongooseConnect } from '@config/database.config';
import { Env } from '@start/env';
import { kernel } from '@start/kernel';

async function start(): Promise<void> {
  kernel.listen({ port: Env.PORT, host: '0.0.0.0' }).then(() => {
    console.info(`HTTP Server running on http://localhost:${Env.PORT}`);
  });
}

MongooseConnect().then(() => {
  console.info('Mongoose connected');
  console.info('url: ', Env.DATABASE_URL);
  start();
});
