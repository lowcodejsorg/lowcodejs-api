import type { FastifyReply, FastifyRequest } from 'fastify';
import { Controller, GET } from 'fastify-decorators';

@Controller()
export default class {
  @GET({
    url: '/health-check',
    options: {
      schema: {
        description: 'Verifica o status da aplicação',
        tags: ['Health'],
        summary: 'Health Check',
        response: {
          200: {
            description: 'Aplicação funcionando corretamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: {
                      type: 'string'
                    },
                    timestamp: {
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
    return response.status(200).send({
      status: 'ok',
      timestamp: new Date().toISOString(),
    });
  }
}
