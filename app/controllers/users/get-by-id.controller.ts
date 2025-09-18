import { AuthenticationMiddleware } from '@middlewares/authentication.middleware';
import GetUserByIdUseCase from '@use-case/users/get-by-id.use-case';
import { GetUserByIdSchema } from '@validators/users';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Controller, GET, getInstanceByToken } from 'fastify-decorators';

@Controller({
  route: '/users',
})
export default class {
  constructor(
    private readonly useCase: GetUserByIdUseCase = getInstanceByToken(
      GetUserByIdUseCase,
    ),
  ) {}

  @GET({
    url: '/:_id',
    options: {
      onRequest: [AuthenticationMiddleware],
      schema: {
        tags: ['Users'],
        summary: 'Get user',
        description: 'Get user by id',
        params: {
          type: 'object',
          required: ['_id'],
          properties: {
            _id: { type: 'string' },
          },
        },
      },
    },
  })
  async handle(request: FastifyRequest, response: FastifyReply): Promise<void> {
    const params = GetUserByIdSchema.parse(request.params);

    const result = await this.useCase.execute(params);

    if (result.isLeft()) {
      const error = result.value;

      return response.status(error.code).send({
        message: error.message,
        code: error.code,
        cause: error.cause,
      });
    }

    return response.status(200).send({
      ...result?.value,
      password: undefined,
    });
  }
}
