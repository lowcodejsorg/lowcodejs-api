import { AuthenticationMiddleware } from '@middlewares/authentication.middleware';
import SendCollectionToTrashUseCase from '@use-case/collections/send-to-trash.use-case';
import { GetCollectionBySlugSchema } from '@validators/collections.validator';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Controller, getInstanceByToken, PATCH } from 'fastify-decorators';

@Controller({
  route: 'collections',
})
export default class {
  constructor(
    private readonly useCase: SendCollectionToTrashUseCase = getInstanceByToken(
      SendCollectionToTrashUseCase,
    ),
  ) {}

  @PATCH({
    url: '/:slug/trash',
    options: {
      onRequest: [AuthenticationMiddleware],
      schema: {
        tags: ['Collections'],
        summary: 'Send collection to trash',
        description: 'Moves a collection to trash. The collection can be restored later or permanently deleted.',
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
            description: 'Collection moved to trash successfully',
            type: 'object',
            properties: {
              _id: { type: 'string', description: 'Collection ID' },
              name: { type: 'string', description: 'Collection name' },
              slug: { type: 'string', description: 'Collection URL slug' },
              trashed: { type: 'boolean', enum: [true], description: 'Collection is now in trash' },
              trashedAt: { type: 'string', format: 'date-time', description: 'Timestamp when moved to trash' },
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
            description: 'Not found - Collection with specified slug does not exist',
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
              cause: { type: 'string', enum: ['SEND_COLLECTION_TO_TRASH_ERROR'] }
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
