import { AuthenticationMiddleware } from '@middlewares/authentication.middleware';
import UpdateProfileUseCase from '@use-case/profile/update.use-case';
import { CreateUserSchema } from '@validators/users';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Controller, getInstanceByToken, PUT } from 'fastify-decorators';

@Controller({
  route: 'profile',
})
export default class {
  constructor(
    private readonly useCase: UpdateProfileUseCase = getInstanceByToken(
      UpdateProfileUseCase,
    ),
  ) {}

  @PUT({
    url: '',
    options: {
      onRequest: [AuthenticationMiddleware],
      schema: {
        tags: ['Profile'],
        summary: 'Update profile',
        description: 'Update user profile information',
      },
    },
  })
  async handle(request: FastifyRequest, response: FastifyReply): Promise<void> {
    const body = CreateUserSchema.parse(request.body);

    // @ts-ignore
    const result = await this.useCase.execute(body);

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
