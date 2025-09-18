import { AuthenticationMiddleware } from '@middlewares/authentication.middleware';
import CreateRowUseCase from '@use-case/rows/create.use-case';
import { CreateRowCollectionSchema } from '@validators/row-collection.validator';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Controller, getInstanceByToken, POST } from 'fastify-decorators';

@Controller({
  route: 'collections',
})
export default class {
  constructor(
    private readonly useCase: CreateRowUseCase = getInstanceByToken(
      CreateRowUseCase,
    ),
  ) {}

  @POST({
    url: '/:collectionSlug/rows',
    options: {
      onRequest: [AuthenticationMiddleware],
      schema: {
        tags: ['Rows'],
        summary: 'Create row',
        description: 'Create a new row in a collection',
      },
    },
  })
  async handle(request: FastifyRequest, response: FastifyReply): Promise<void> {
    const body = CreateRowCollectionSchema.parse(request.body);
    const { collectionSlug } = request.params as { collectionSlug: string };

    // @ts-ignore
    const result = await this.useCase.execute({ data: body, collectionSlug });

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
