import { AuthenticationMiddleware } from '@middlewares/authentication.middleware';
import UpdateCollectionUseCase from '@use-case/collections/update.use-case';
import { UpdateCollectionSchema } from '@validators/collections.validator';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Controller, getInstanceByToken, PUT } from 'fastify-decorators';

@Controller({
  route: 'collections',
})
export default class {
  constructor(
    private readonly useCase: UpdateCollectionUseCase = getInstanceByToken(
      UpdateCollectionUseCase,
    ),
  ) {}

  @PUT({
    url: '/:collectionSlug',
    options: {
      onRequest: [AuthenticationMiddleware],
      schema: {
        tags: ['Collections'],
        summary: 'Update collection',
        description: 'Update an existing collection',
      },
    },
  })
  async handle(request: FastifyRequest, response: FastifyReply): Promise<void> {
    const body = UpdateCollectionSchema.parse(request.body);
    const { id } = request.params as { id: string };

    const result = await this.useCase.execute({ ...body, _id: id });

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
