import { AuthenticationMiddleware } from '@middlewares/authentication.middleware';
import UpdateFieldUseCase from '@use-case/fields/update.use-case';
import { UpdateFieldCollectionSchema } from '@validators/field-collection.validator';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Controller, getInstanceByToken, PUT } from 'fastify-decorators';

@Controller({
  route: 'collections',
})
export default class {
  constructor(
    private readonly useCase: UpdateFieldUseCase = getInstanceByToken(
      UpdateFieldUseCase,
    ),
  ) {}

  @PUT({
    url: '/:collectionSlug/fields/:_id',
    options: {
      onRequest: [AuthenticationMiddleware],
      schema: {
        tags: ['Fields'],
        summary: 'Update field',
        description: 'Update an existing field in a collection',
      },
    },
  })
  async handle(request: FastifyRequest, response: FastifyReply): Promise<void> {
    const body = UpdateFieldCollectionSchema.parse(request.body);
    const { collectionSlug, id } = request.params as {
      collectionSlug: string;
      id: string;
    };

    const result = await this.useCase.execute({
      ...body,
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
