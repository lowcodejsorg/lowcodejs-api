import { Collection } from '@model/collection.model';

export default async function Seed(): Promise<void> {
  await Collection.deleteMany({});

  console.log('🌱 \x1b[32m collection reset \x1b[0m');
}
