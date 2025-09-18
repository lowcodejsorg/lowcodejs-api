import { AuthenticationMiddleware } from '@middlewares/authentication.middleware';
import DeleteCollectionUseCase from '@use-case/collections/delete.use-case';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Controller, DELETE, getInstanceByToken } from 'fastify-decorators';

@Controller({
  route: 'collections',
})
export default class {
  constructor(
    private readonly useCase: DeleteCollectionUseCase = getInstanceByToken(
      DeleteCollectionUseCase,
    ),
  ) {}

  @DELETE({
    url: '/:collectionSlug',
    options: {
      onRequest: [AuthenticationMiddleware],
      schema: {
        tags: ['Collections'],
        summary: 'Delete collection',
        description: 'Delete a collection permanently',
      },
    },
  })
  async handle(request: FastifyRequest, response: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };

    const result = await this.useCase.execute({ _id: id });

    if (result.isLeft()) {
      const error = result.value;

      return response.status(error.code).send({
        message: error.message,
        code: error.code,
        cause: error.cause,
      });
    }

    return response.status(200).send(result.value);
  }
}
