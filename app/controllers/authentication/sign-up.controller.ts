import SignUpUseCase from '@use-case/authentication/sign-up.use-case';
import { AuthenticationSignUpSchema } from '@validators/authentication.validator';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Controller, getInstanceByToken, POST } from 'fastify-decorators';

@Controller({
  route: 'authentication',
})
export default class {
  constructor(
    private readonly useCase: SignUpUseCase = getInstanceByToken(SignUpUseCase),
  ) {}

  @POST({
    url: '/sign-up',
    options: {
      schema: {
        tags: ['Authentication'],
        summary: 'Authentication Sign Up',
        description: 'Authentication Sign Up',
      },
    },
  })
  async handle(request: FastifyRequest, response: FastifyReply): Promise<void> {
    const payload = AuthenticationSignUpSchema.parse(request.body);
    const result = await this.useCase.execute(payload);

    if (result.isLeft()) {
      const error = result.value;
      return response.status(error.code).send({
        message: error.message,
        code: error.code,
        cause: error.cause,
      });
    }

    return response.status(201).send();
  }
}
