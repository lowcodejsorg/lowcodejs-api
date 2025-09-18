import { AuthenticationMiddleware } from '@middlewares/authentication.middleware';
import UploadStorageUseCase from '@use-case/storage/upload.use-case';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Controller, getInstanceByToken, POST } from 'fastify-decorators';

@Controller({
  route: '/storage',
})
export default class {
  constructor(
    private readonly useCase: UploadStorageUseCase = getInstanceByToken(
      UploadStorageUseCase,
    ),
  ) {}

  @POST({
    url: '',
    options: {
      onRequest: [AuthenticationMiddleware],

      schema: {
        tags: ['Storage'],
        summary: 'Storage upload',
        description: 'Storage upload',
      },
    },
  })
  async handle(request: FastifyRequest, response: FastifyReply): Promise<void> {
    const result = await this.useCase.execute(request.files());

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
