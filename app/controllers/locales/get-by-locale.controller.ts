import { AuthenticationMiddleware } from '@middlewares/authentication.middleware';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Controller, GET } from 'fastify-decorators';
import { readFile } from 'fs/promises';
import { join } from 'path';
import z from 'zod';

@Controller({
  route: '/locales',
})
export default class {
  @GET({
    url: '/:locale',
    options: {
      onRequest: [AuthenticationMiddleware],
      schema: {
        tags: ['Locale'],
        summary: 'System Locale Get By Locale',
        description: 'System Locale Get By Locale',
      },
    },
  })
  async handle(request: FastifyRequest, response: FastifyReply): Promise<void> {
    const schema = z.object({
      locale: z.string(),
    });
    const { locale } = schema.parse(request.params);
    const pathname = join(
      process.cwd(),
      '_system',
      'locales',
      `${locale}.properties`,
    );
    const file = await readFile(pathname, 'utf-8');

    if (!file)
      return response.status(404).send({
        message: 'Locale not found',
      });

    const translations: Record<string, string | string[]> = {};

    for (const line of file.split('\n')) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (
          key &&
          valueParts.length > 0 &&
          !valueParts.join().trim().includes(',')
        )
          translations[key.trim()] = valueParts.join('=').trim();
        else
          translations[key.trim()] = valueParts
            .toString()
            .trim()
            .split(',')
            .filter(Boolean)
            .map((value) => value.trim());
      }
    }

    return response.send(translations);
  }
}
