import { AuthenticationMiddleware } from '@middlewares/authentication.middleware';
import UpdateUserGroupUseCase from '@use-case/user-group/update.use-case';
import {
  GetUserGroupByIdSchema,
  UpdateUserGroupSchema,
} from '@validators/user-group.validator';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Controller, getInstanceByToken, PATCH } from 'fastify-decorators';

@Controller({
  route: '/user-group',
})
export default class {
  constructor(
    private readonly useCase: UpdateUserGroupUseCase = getInstanceByToken(
      UpdateUserGroupUseCase,
    ),
  ) {}

  @PATCH({
    url: '/:_id',
    options: {
      onRequest: [AuthenticationMiddleware],

      schema: {
        tags: ['User Group'],
        summary: 'User Group upload',
        description: 'User Group upload',
      },
    },
  })
  async handle(request: FastifyRequest, response: FastifyReply): Promise<void> {
    const params = GetUserGroupByIdSchema.parse(request.params);
    const payload = UpdateUserGroupSchema.parse(request.body);

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
