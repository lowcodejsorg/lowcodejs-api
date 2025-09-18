import { AuthenticationMiddleware } from '@middlewares/authentication.middleware';
import RemoveCollectionFromTrashUseCase from '@use-case/collections/remove-from-trash.use-case';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Controller, getInstanceByToken, PATCH } from 'fastify-decorators';

@Controller({
  route: 'collections',
})
export default class {
  constructor(
    private readonly useCase: RemoveCollectionFromTrashUseCase = getInstanceByToken(
      RemoveCollectionFromTrashUseCase,
    ),
  ) {}

  @PATCH({
    url: '/:collectionSlug/restore',
    options: {
      onRequest: [AuthenticationMiddleware],
      schema: {
        tags: ['Collections'],
        summary: 'Remove collection from trash',
        description: 'Restore a collection from trash',
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
