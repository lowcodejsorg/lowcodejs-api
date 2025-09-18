import { AuthenticationMiddleware } from '@middlewares/authentication.middleware';
import DeleteStorageUseCase from '@use-case/storage/delete.use-case';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Controller, DELETE, getInstanceByToken } from 'fastify-decorators';
import z from 'zod';

const Schema = z.object({
  _id: z.string(),
});

@Controller({
  route: '/storage',
})
export default class {
  constructor(
    private readonly useCase: DeleteStorageUseCase = getInstanceByToken(
      DeleteStorageUseCase,
    ),
  ) {}

  @DELETE({
    url: '/:_id',
    options: {
      onRequest: [AuthenticationMiddleware],

      schema: {
        tags: ['Storage'],
        summary: 'Storage delete',
        description: 'Storage delete',
      },
    },
  })
  async handle(request: FastifyRequest, response: FastifyReply): Promise<void> {
    const params = Schema.parse(request.params);

    const result = await this.useCase.execute(params);

    if (result.isLeft()) {
      const error = result.value;

      return response.status(error.code).send({
        message: error.message,
        code: error.code,
        cause: error.cause,
      });
    }

    return response.status(200).send();
  }
}
