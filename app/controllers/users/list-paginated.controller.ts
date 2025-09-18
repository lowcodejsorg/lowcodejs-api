import { AuthenticationMiddleware } from '@middlewares/authentication.middleware';
import ListUserPaginatedUseCase from '@use-case/users/list-paginated.use-case';
import { ListUserPaginatedSchema } from '@validators/users';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Controller, GET, getInstanceByToken } from 'fastify-decorators';

@Controller({
  route: '/users',
})
export default class {
  constructor(
    private readonly useCase: ListUserPaginatedUseCase = getInstanceByToken(
      ListUserPaginatedUseCase,
    ),
  ) {}

  @GET({
    url: '/paginated',
    options: {
      onRequest: [AuthenticationMiddleware],
      schema: {
        tags: ['Users'],
        summary: 'Paginated list users',
        description: 'Paginated list users',
      },
    },
  })
  async handle(request: FastifyRequest, response: FastifyReply): Promise<void> {
    const query = ListUserPaginatedSchema.parse(request.query);

    const result = await this.useCase.execute({
      ...query,
      sub: request?.user?.sub,
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
