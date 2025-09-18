import type { FastifyReply, FastifyRequest } from 'fastify';
import { Controller, GET } from 'fastify-decorators';

@Controller()
export default class {
  @GET({
    url: '',
    options: {
      schema: {
        description: 'Redireciona para a documentação da API',
        tags: ['API'],
        summary: 'Redirect para documentação',
        response: {
          302: {
            description: 'Redirecionamento para /documentation',
            headers: {
              location: {
                type: 'string',
                description: 'URL de destino do redirecionamento'
              },
            },
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string'
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  async handle(_: FastifyRequest, response: FastifyReply): Promise<void> {
    return response.redirect('/documentation').send({
      message: 'LowCodeJs API',
    });
  }
}
