import { AuthenticationMiddleware } from '@middlewares/authentication.middleware';
import EvaluationRowUseCase from '@use-case/rows/evaluation.use-case';
import { EvaluationRowCollectionSchema } from '@validators/row-collection.validator';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Controller, getInstanceByToken, POST } from 'fastify-decorators';

@Controller({
  route: 'collections',
})
export default class {
  constructor(
    private readonly useCase: EvaluationRowUseCase = getInstanceByToken(
      EvaluationRowUseCase,
    ),
  ) {}

  @POST({
    url: '/:collectionSlug/rows/:_id/evaluation',
    options: {
      onRequest: [AuthenticationMiddleware],
      schema: {
        tags: ['Rows'],
        summary: 'Add evaluation to row',
        description: 'Add an evaluation (rating) to a row',
      },
    },
  })
  async handle(request: FastifyRequest, response: FastifyReply): Promise<void> {
    const body = EvaluationRowCollectionSchema.parse(request.body);
    const { collectionSlug, id } = request.params as {
      collectionSlug: string;
      id: string;
    };

    const result = await this.useCase.execute({
      ...body,
      _id: id,
      collectionSlug,
      public: 'false',
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
