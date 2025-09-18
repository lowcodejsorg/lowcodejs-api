import { AuthenticationMiddleware } from '@middlewares/authentication.middleware';
import CreateUserUseCase from '@use-case/users/create.use-case';
import { CreateUserSchema } from '@validators/users';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Controller, getInstanceByToken, POST } from 'fastify-decorators';

@Controller()
export default class {
  constructor(
    private readonly useCase: CreateUserUseCase = getInstanceByToken(
      CreateUserUseCase,
    ),
  ) {}

  @POST({
    url: '/users',
    options: {
      onRequest: [AuthenticationMiddleware],
      schema: {
        tags: ['Users'],
        summary: 'Create user',
        description: 'Create a new user',
      },
    },
  })
  async handle(request: FastifyRequest, response: FastifyReply): Promise<void> {
    const body = CreateUserSchema.parse(request.body);

    const result = await this.useCase.execute(body);

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
