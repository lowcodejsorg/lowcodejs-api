import { AuthenticationMiddleware } from '@middlewares/authentication.middleware';
import RemoveCollectionFromTrashUseCase from '@use-case/collections/remove-from-trash.use-case';
import { GetCollectionBySlugSchema } from '@validators/collections.validator';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Controller, getInstanceByToken, PATCH } from 'fastify-decorators';

@Controller({
  route: 'collections',
})
export default class {
  constructor(
    private readonly useCase: RemoveCollectionFromTrashUseCase = getInstanceByToken(
      RemoveCollectionFromTrashUseCase,
    ),
  ) {}

  @PATCH({
    url: '/:slug/restore',
    options: {
      onRequest: [AuthenticationMiddleware],
      schema: {
        tags: ['Collections'],
        summary: 'Remove collection from trash',
        description: 'Restores a collection from trash, making it active again with all its original functionality.',
        security: [{ cookieAuth: [] }],
        params: {
          type: 'object',
          required: ['slug'],
          properties: {
            slug: {
              type: 'string',
              description: 'Collection slug identifier',
              examples: ['users', 'products', 'blog-posts']
            }
          },
          additionalProperties: false
        },
        response: {
          200: {
            description: 'Collection restored from trash successfully',
            type: 'object',
            properties: {
              _id: { type: 'string', description: 'Collection ID' },
              name: { type: 'string', description: 'Collection name' },
              slug: { type: 'string', description: 'Collection URL slug' },
              trashed: { type: 'boolean', enum: [false], description: 'Collection is no longer in trash' },
              trashedAt: { type: 'string', nullable: true, description: 'Timestamp when moved to trash (now null)' },
              updatedAt: { type: 'string', format: 'date-time', description: 'Last update timestamp' }
            }
          },
          401: {
            description: 'Unauthorized - Authentication required',
            type: 'object',
            properties: {
              message: { type: 'string', enum: ['Unauthorized'] },
              code: { type: 'number', enum: [401] },
              cause: { type: 'string', enum: ['AUTHENTICATION_REQUIRED'] }
            }
          },
          404: {
            description: 'Not found - Collection with specified slug does not exist or is not in trash',
            type: 'object',
            properties: {
              message: { type: 'string', enum: ['Collection not found'] },
              code: { type: 'number', enum: [404] },
              cause: { type: 'string', enum: ['COLLECTION_NOT_FOUND'] }
            },
            examples: [
              {
                message: 'Collection not found',
                code: 404,
                cause: 'COLLECTION_NOT_FOUND'
              }
            ]
          },
          500: {
            description: 'Internal server error - Database or server issues',
            type: 'object',
            properties: {
              message: { type: 'string', enum: ['Internal server error'] },
              code: { type: 'number', enum: [500] },
              cause: { type: 'string', enum: ['REMOVE_COLLECTION_FROM_TRASH_ERROR'] }
            }
          }
        }
      },
    },
  })
  async handle(request: FastifyRequest, response: FastifyReply): Promise<void> {
    const params = GetCollectionBySlugSchema.parse(request.params);

    const result = await this.useCase.execute(params);

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
