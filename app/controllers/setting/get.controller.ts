import { AuthenticationMiddleware } from '@middlewares/authentication.middleware';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Controller, GET } from 'fastify-decorators';
import { readFile } from 'fs/promises';
import { join } from 'path';

@Controller({
  route: '/setting',
})
export default class {
  @GET({
    url: '',
    // url: '/:filename',
    options: {
      onRequest: [AuthenticationMiddleware],

      schema: {
        tags: ['Setting'],
        summary: 'System Setting Get Setting',
        description: 'System Setting Get Setting',
      },
    },
  })
  async handle(request: FastifyRequest, response: FastifyReply): Promise<void> {
    // const schema = z.object({
    //   filename: z.string(),
    // });
    // const { filename } = schema.parse(request.params);
    // const pathname = join(process.cwd(), '_system', `${filename}.properties`);
    const pathname = join(process.cwd(), '_system', `setting.properties`);

    const file = await readFile(pathname, 'utf-8');

    if (!file)
      return response.status(404).send({
        message: 'File not found',
      });

    const settings: Record<string, string | string[]> = {};

    for (const line of file.split('\n')) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (
          key &&
          valueParts.length > 0 &&
          !valueParts.join().trim().includes(',')
        )
          settings[key.trim()] = valueParts.join('=').trim();
        else
          settings[key.trim()] = valueParts
            .toString()
            .trim()
            .split(',')
            .filter(Boolean)
            .map((value) => value.trim());
      }
    }

    return response.send(settings);
  }
}
