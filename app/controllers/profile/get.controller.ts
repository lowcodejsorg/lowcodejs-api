import { AuthenticationMiddleware } from '@middlewares/authentication.middleware';
import GetProfileUseCase from '@use-case/profile/get.use-case';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Controller, GET, getInstanceByToken } from 'fastify-decorators';

@Controller({
  route: 'profile',
})
export default class {
  constructor(
    private readonly useCase: GetProfileUseCase = getInstanceByToken(
      GetProfileUseCase,
    ),
  ) {}

  @GET({
    url: '',
    options: {
      onRequest: [AuthenticationMiddleware],
      schema: {
        tags: ['Profile'],
        summary: 'Get profile',
        description: 'Get user profile information',
      },
    },
  })
  async handle(request: FastifyRequest, response: FastifyReply): Promise<void> {
    // @ts-ignore
    const result = await this.useCase.execute();

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
