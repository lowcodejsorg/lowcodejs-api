import { AuthenticationMiddleware } from '@middlewares/authentication.middleware';
import GetUserGroupById from '@use-case/user-group/get-by-id.use-case';
import { GetUserGroupByIdSchema } from '@validators/user-group.validator';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Controller, GET, getInstanceByToken } from 'fastify-decorators';

@Controller({
  route: '/user-group',
})
export default class {
  constructor(
    private readonly useCase: GetUserGroupById = getInstanceByToken(
      GetUserGroupById,
    ),
  ) {}

  @GET({
    url: '/:_id',
    options: {
      onRequest: [AuthenticationMiddleware],

      schema: {
        tags: ['User Group'],
        summary: 'Get User Group',
        description: 'Get User Group',
      },
    },
  })
  async handle(request: FastifyRequest, response: FastifyReply): Promise<void> {
    const params = GetUserGroupByIdSchema.parse(request.params);
    const result = await this.useCase.execute(params);

    if (result.isLeft()) {
      const error = result.value;

      return response.status(error.code).send({
        message: error.message,
        code: error.code,
        cause: error.cause,
      });
    }

    return response.status(200).send(result?.value);
  }
}
