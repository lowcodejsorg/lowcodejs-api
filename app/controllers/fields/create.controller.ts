import { AuthenticationMiddleware } from '@middlewares/authentication.middleware';
import CreateFieldUseCase from '@use-case/fields/create.use-case';
import { CreateFieldCollectionSchema } from '@validators/field-collection.validator';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Controller, getInstanceByToken, POST } from 'fastify-decorators';

@Controller({
  route: 'collections',
})
export default class {
  constructor(
    private readonly useCase: CreateFieldUseCase = getInstanceByToken(
      CreateFieldUseCase,
    ),
  ) {}

  @POST({
    url: '/:collectionSlug/fields',
    options: {
      onRequest: [AuthenticationMiddleware],
      schema: {
        tags: ['Fields'],
        summary: 'Create field',
        description: 'Create a new field in a collection',
      },
    },
  })
  async handle(request: FastifyRequest, response: FastifyReply): Promise<void> {
    const body = CreateFieldCollectionSchema.parse(request.body);
    const { collectionSlug } = request.params as { collectionSlug: string };

    // @ts-ignore
    const result = await this.useCase.execute({ ...body, collectionSlug });

    if (result.isLeft()) {
      const error = result.value;

      return response.status(error.code).send({
        message: error.message,
        code: error.code,
        cause: error.cause,
      });
    }

    return response.status(201).send(result.value);
  }
}
