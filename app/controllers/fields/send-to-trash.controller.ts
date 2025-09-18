import { AuthenticationMiddleware } from '@middlewares/authentication.middleware';
import SendFieldToTrashUseCase from '@use-case/fields/send-to-trash.use-case';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Controller, getInstanceByToken, PATCH } from 'fastify-decorators';

@Controller({
  route: 'collections',
})
export default class {
  constructor(
    private readonly useCase: SendFieldToTrashUseCase = getInstanceByToken(
      SendFieldToTrashUseCase,
    ),
  ) {}

  @PATCH({
    url: '/:collectionSlug/fields/:_id/trash',
    options: {
      onRequest: [AuthenticationMiddleware],
      schema: {
        tags: ['Fields'],
        summary: 'Send field to trash',
        description: 'Move a field to trash',
      },
    },
  })
  async handle(request: FastifyRequest, response: FastifyReply): Promise<void> {
    const { collectionSlug, id } = request.params as {
      collectionSlug: string;
      id: string;
    };

    const result = await this.useCase.execute({ _id: id, collectionSlug });

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
