import { AuthenticationMiddleware } from '@middlewares/authentication.middleware';
import ListCollectionPaginatedUseCase from '@use-case/collections/list-paginated.use-case';
import { ListCollectionPaginatedSchema } from '@validators/collections.validator';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Controller, GET, getInstanceByToken } from 'fastify-decorators';

@Controller({
  route: 'collections',
})
export default class {
  constructor(
    private readonly useCase: ListCollectionPaginatedUseCase = getInstanceByToken(
      ListCollectionPaginatedUseCase,
    ),
  ) {}

  @GET({
    url: '/:collectionSlug/paginated',
    options: {
      onRequest: [AuthenticationMiddleware],
      schema: {
        tags: ['Collections'],
        summary: 'List collections paginated',
        description: 'Get a paginated list of collections with optional search and filtering',
        security: [{ cookieAuth: [] }],
        params: {
          type: 'object',
          required: ['collectionSlug'],
          properties: {
            collectionSlug: {
              type: 'string',
              description: 'Slug of the collection to list items from',
              examples: ['users', 'products', 'blog-posts']
            }
          },
          additionalProperties: false
        },
        querystring: {
          type: 'object',
          properties: {
            page: {
              type: 'number',
              minimum: 1,
              default: 1,
              description: 'Page number (starts from 1)',
              examples: [1, 2, 5]
            },
            perPage: {
              type: 'number',
              minimum: 1,
              maximum: 100,
              default: 50,
              description: 'Number of items per page (max 100)',
              examples: [10, 25, 50, 100]
            },
            search: {
              type: 'string',
              minLength: 1,
              description: 'Search term for filtering collections by name or slug (optional)',
              examples: ['user', 'product', 'blog']
            },
            trashed: {
              type: 'string',
              enum: ['true', 'false'],
              default: 'false',
              description: 'Include trashed items (optional)',
              examples: ['true', 'false']
            },
            public: {
              type: 'string',
              enum: ['true', 'false'],
              default: 'false',
              description: 'Filter by public visibility (optional)',
              examples: ['true', 'false']
            },
            type: {
              type: 'string',
              enum: ['collection', 'field-group'],
              description: 'Filter by collection type (optional)',
              examples: ['collection', 'field-group']
            },
            name: {
              type: 'string',
              description: 'Filter by exact collection name (optional)',
              examples: ['Users', 'Products']
            },
            slug: {
              type: 'string',
              description: 'Filter by exact collection slug (optional)',
              examples: ['users', 'products']
            }
          },
          additionalProperties: false
        },
        response: {
          200: {
            description: 'Paginated list of collections',
            type: 'object',
            properties: {
              data: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    _id: { type: 'string' },
                    name: { type: 'string' },
                    description: { type: 'string', nullable: true },
                    slug: { type: 'string' },
                    logo: { type: 'string', nullable: true },
                    configuration: {
                      type: 'object',
                      properties: {
                        style: { type: 'string', enum: ['gallery', 'list'] },
                        visibility: { type: 'string', enum: ['public', 'restricted'] },
                        collaboration: { type: 'string', enum: ['open', 'restricted'] }
                      }
                    },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' }
                  }
                }
              },
              pagination: {
                type: 'object',
                properties: {
                  page: { type: 'number' },
                  perPage: { type: 'number' },
                  total: { type: 'number' },
                  totalPages: { type: 'number' }
                }
              }
            }
          },
          401: {
            description: 'Unauthorized - Authentication required',
            type: 'object',
            properties: {
              message: { type: 'string', enum: ['Unauthorized'] },
              code: { type: 'number', enum: [401] },
              cause: { type: 'string', enum: ['AUTHENTICATION_REQUIRED'] }
            },
            examples: [
              {
                message: 'Unauthorized',
                code: 401,
                cause: 'AUTHENTICATION_REQUIRED'
              }
            ]
          },
          500: {
            description: 'Internal server error',
            type: 'object',
            properties: {
              message: { type: 'string', enum: ['Internal server error'] },
              code: { type: 'number', enum: [500] },
              cause: { type: 'string', enum: ['LIST_COLLECTIONS_ERROR'] }
            },
            examples: [
              {
                message: 'Internal server error',
                code: 500,
                cause: 'LIST_COLLECTIONS_ERROR'
              }
            ]
          }
        }
      },
    },
  })
  async handle(request: FastifyRequest, response: FastifyReply): Promise<void> {
    const query = ListCollectionPaginatedSchema.parse(request.query);

    const result = await this.useCase.execute(query);

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
