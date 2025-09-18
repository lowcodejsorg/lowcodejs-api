import { AuthenticationMiddleware } from '@middlewares/authentication.middleware';
import UpdateUserUseCase from '@use-case/users/update.use-case';
import { GetUserByIdSchema, UpdateUserSchema } from '@validators/users';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Controller, getInstanceByToken, PATCH } from 'fastify-decorators';

@Controller({
  route: '/users',
})
export default class {
  constructor(
    private readonly useCase: UpdateUserUseCase = getInstanceByToken(
      UpdateUserUseCase,
    ),
  ) {}

  @PATCH({
    url: '/:_id',
    options: {
      onRequest: [AuthenticationMiddleware],
      schema: {
        tags: ['Users'],
        summary: 'Update user',
        description: 'Update user',
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
    const payload = UpdateUserSchema.parse(request.body);

    const result = await this.useCase.execute({
      ...params,
      ...payload,
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
