import { AuthenticationMiddleware } from '@middlewares/authentication.middleware';
import RemoveRowFromTrashUseCase from '@use-case/rows/remove-from-trash.use-case';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Controller, getInstanceByToken, PATCH } from 'fastify-decorators';

@Controller({
  route: 'collections',
})
export default class {
  constructor(
    private readonly useCase: RemoveRowFromTrashUseCase = getInstanceByToken(
      RemoveRowFromTrashUseCase,
    ),
  ) {}

  @PATCH({
    url: '/:collectionSlug/rows/:_id/restore',
    options: {
      onRequest: [AuthenticationMiddleware],
      schema: {
        tags: ['Rows'],
        summary: 'Remove row from trash',
        description: 'Restore a row from trash',
      },
    },
  })
  async handle(request: FastifyRequest, response: FastifyReply): Promise<void> {
    const { collectionSlug, id } = request.params as {
      collectionSlug: string;
      id: string;
    };

    // @ts-ignore
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
