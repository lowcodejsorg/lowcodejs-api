import { AuthenticationMiddleware } from '@middlewares/authentication.middleware';
import GetCollectionBySlugUseCase from '@use-case/collections/get-by-slug.use-case';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Controller, GET, getInstanceByToken } from 'fastify-decorators';

@Controller({
  route: 'collections',
})
export default class {
  constructor(
    private readonly useCase: GetCollectionBySlugUseCase = getInstanceByToken(
      GetCollectionBySlugUseCase,
    ),
  ) {}

  @GET({
    url: '/:collectionSlug',
    options: {
      onRequest: [AuthenticationMiddleware],
      schema: {
        tags: ['Collections'],
        summary: 'Get collection by slug',
        description: 'Get a collection by its slug',
      },
    },
  })
  async handle(request: FastifyRequest, response: FastifyReply): Promise<void> {
    const { slug } = request.params as { slug: string };

    // @ts-ignore
    const result = await this.useCase.execute({ slug });

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
