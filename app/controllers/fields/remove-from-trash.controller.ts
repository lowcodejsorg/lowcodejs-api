import { AuthenticationMiddleware } from '@middlewares/authentication.middleware';
import RemoveFieldFromTrashUseCase from '@use-case/fields/remove-from-trash.use-case';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Controller, getInstanceByToken, PATCH } from 'fastify-decorators';

@Controller({
  route: 'collections',
})
export default class {
  constructor(
    private readonly useCase: RemoveFieldFromTrashUseCase = getInstanceByToken(
      RemoveFieldFromTrashUseCase,
    ),
  ) {}

  @PATCH({
    url: '/:collectionSlug/fields/:_id/restore',
    options: {
      onRequest: [AuthenticationMiddleware],
      schema: {
        tags: ['Fields'],
        summary: 'Remove field from trash',
        description: 'Restore a field from trash',
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
