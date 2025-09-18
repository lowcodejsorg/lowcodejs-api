import { AuthenticationMiddleware } from '@middlewares/authentication.middleware';
import GetRowByIdUseCase from '@use-case/rows/get-by-id.use-case';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Controller, GET, getInstanceByToken } from 'fastify-decorators';

@Controller({
  route: 'collections',
})
export default class {
  constructor(
    private readonly useCase: GetRowByIdUseCase = getInstanceByToken(
      GetRowByIdUseCase,
    ),
  ) {}

  @GET({
    url: '/:collectionSlug/rows/:_id',
    options: {
      onRequest: [AuthenticationMiddleware],
      schema: {
        tags: ['Rows'],
        summary: 'Get row by ID',
        description: 'Get a row by its ID',
      },
    },
  })
  async handle(request: FastifyRequest, response: FastifyReply): Promise<void> {
    const { collectionSlug, id } = request.params as {
      collectionSlug: string;
      id: string;
    };
    const { public: isPublic } = request.query as { public?: string };

    const result = await this.useCase.execute({
      _id: id,
      collectionSlug,
      // @ts-ignore
      public: isPublic || 'false',
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
