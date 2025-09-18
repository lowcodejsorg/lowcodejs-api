import { AuthenticationMiddleware } from '@middlewares/authentication.middleware';
import ReactionRowUseCase from '@use-case/rows/reaction.use-case';
import { ReactionRowCollectionSchema } from '@validators/row-collection.validator';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Controller, getInstanceByToken, POST } from 'fastify-decorators';

@Controller({
  route: 'collections',
})
export default class {
  constructor(
    private readonly useCase: ReactionRowUseCase = getInstanceByToken(
      ReactionRowUseCase,
    ),
  ) {}

  @POST({
    url: '/:collectionSlug/rows/:_id/reaction',
    options: {
      onRequest: [AuthenticationMiddleware],
      schema: {
        tags: ['Rows'],
        summary: 'Add reaction to row',
        description: 'Add a reaction (like/unlike) to a row',
      },
    },
  })
  async handle(request: FastifyRequest, response: FastifyReply): Promise<void> {
    const body = ReactionRowCollectionSchema.parse(request.body);
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
