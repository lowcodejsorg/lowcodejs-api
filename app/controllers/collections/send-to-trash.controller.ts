import { AuthenticationMiddleware } from '@middlewares/authentication.middleware';
import SendCollectionToTrashUseCase from '@use-case/collections/send-to-trash.use-case';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Controller, getInstanceByToken, PATCH } from 'fastify-decorators';

@Controller({
  route: 'collections',
})
export default class {
  constructor(
    private readonly useCase: SendCollectionToTrashUseCase = getInstanceByToken(
      SendCollectionToTrashUseCase,
    ),
  ) {}

  @PATCH({
    url: '/:collectionSlug/trash',
    options: {
      onRequest: [AuthenticationMiddleware],
      schema: {
        tags: ['Collections'],
        summary: 'Send collection to trash',
        description: 'Move a collection to trash',
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
