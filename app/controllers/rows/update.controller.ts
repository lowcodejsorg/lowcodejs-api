import { AuthenticationMiddleware } from '@middlewares/authentication.middleware';
import UpdateRowUseCase from '@use-case/rows/update.use-case';
import { UpdateRowCollectionSchema } from '@validators/row-collection.validator';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Controller, getInstanceByToken, PUT } from 'fastify-decorators';

@Controller({
  route: 'collections',
})
export default class {
  constructor(
    private readonly useCase: UpdateRowUseCase = getInstanceByToken(
      UpdateRowUseCase,
    ),
  ) {}

  @PUT({
    url: '/:collectionSlug/rows/:_id',
    options: {
      onRequest: [AuthenticationMiddleware],
      schema: {
        tags: ['Rows'],
        summary: 'Update row',
        description: 'Update an existing row in a collection',
      },
    },
  })
  async handle(request: FastifyRequest, response: FastifyReply): Promise<void> {
    const body = UpdateRowCollectionSchema.parse(request.body);
    const { collectionSlug, id } = request.params as {
      collectionSlug: string;
      id: string;
    };

    const result = await this.useCase.execute({
      data: body,
      _id: id,
      collectionSlug,
    });

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
