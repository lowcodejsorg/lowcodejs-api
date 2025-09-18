import { AuthenticationMiddleware } from '@middlewares/authentication.middleware';
import GetFieldByIdUseCase from '@use-case/fields/get-by-id.use-case';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Controller, GET, getInstanceByToken } from 'fastify-decorators';

@Controller({
  route: 'collections',
})
export default class {
  constructor(
    private readonly useCase: GetFieldByIdUseCase = getInstanceByToken(
      GetFieldByIdUseCase,
    ),
  ) {}

  @GET({
    url: '/:collectionSlug/fields/:_id',
    options: {
      onRequest: [AuthenticationMiddleware],
      schema: {
        tags: ['Fields'],
        summary: 'Get field by ID',
        description: 'Get a field by its ID',
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
