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
                      type: 'string',
                      example: 'ok',
                    },
                    timestamp: {
                      type: 'string',
                      example: '2025-09-14T10:30:00.000Z',
                    },
                  },
                },
                example: {
                  status: 'ok',
                  timestamp: '2025-09-14T10:30:00.000Z',
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
