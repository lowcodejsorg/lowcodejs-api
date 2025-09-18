import { AuthenticationMiddleware } from '@middlewares/authentication.middleware';
import ListRowPaginatedUseCase from '@use-case/rows/list-paginated.use-case';
import { ListRowCollectionPaginatedSchema } from '@validators/row-collection.validator';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Controller, GET, getInstanceByToken } from 'fastify-decorators';

@Controller({
  route: 'collections',
})
export default class {
  constructor(
    private readonly useCase: ListRowPaginatedUseCase = getInstanceByToken(
      ListRowPaginatedUseCase,
    ),
  ) {}

  @GET({
    url: '/:collectionSlug/rows/paginated',
    options: {
      onRequest: [AuthenticationMiddleware],
      schema: {
        tags: ['Rows'],
        summary: 'List rows paginated',
        description:
          'Get a paginated list of rows in a collection with optional search and filtering',
        security: [{ cookieAuth: [] }],
        params: {
          type: 'object',
          required: ['collectionSlug'],
          properties: {
            collectionSlug: {
              type: 'string',
              description: 'Slug of the collection to list rows from',
              examples: ['users', 'products', 'blog-posts'],
            },
          },
          additionalProperties: false,
        },
        querystring: {
          type: 'object',
          properties: {
            page: {
              type: 'number',
              minimum: 1,
              default: 1,
              description: 'Page number (starts from 1)',
              examples: [1, 2, 5],
            },
            perPage: {
              type: 'number',
              minimum: 1,
              maximum: 100,
              default: 50,
              description: 'Number of items per page (max 100)',
              examples: [10, 25, 50, 100],
            },
            search: {
              type: 'string',
              minLength: 1,
              description: 'Search term for filtering rows (optional)',
              examples: ['john', 'product', 'category'],
            },
            trashed: {
              type: 'string',
              enum: ['true', 'false'],
              default: 'false',
              description: 'Include trashed rows (optional)',
              examples: ['true', 'false'],
            },
          },
          additionalProperties: false,
        },
        response: {
          200: {
            description: 'Paginated list of rows in the collection',
            type: 'object',
            properties: {
              data: {
                type: 'array',
                items: {
                  type: 'object',
                  description:
                    'Row data structure varies based on collection fields',
                  additionalProperties: true,
                },
              },
              pagination: {
                type: 'object',
                properties: {
                  page: { type: 'number' },
                  perPage: { type: 'number' },
                  total: { type: 'number' },
                  totalPages: { type: 'number' },
                },
              },
            },
          },
          401: {
            description: 'Unauthorized - Authentication required',
            type: 'object',
            properties: {
              message: { type: 'string', enum: ['Unauthorized'] },
              code: { type: 'number', enum: [401] },
              cause: { type: 'string', enum: ['AUTHENTICATION_REQUIRED'] },
            },
            examples: [
              {
                message: 'Unauthorized',
                code: 401,
                cause: 'AUTHENTICATION_REQUIRED',
              },
            ],
          },
          404: {
            description: 'Collection not found',
            type: 'object',
            properties: {
              message: { type: 'string', enum: ['Collection not found'] },
              code: { type: 'number', enum: [404] },
              cause: { type: 'string', enum: ['COLLECTION_NOT_FOUND'] },
            },
            examples: [
              {
                message: 'Collection not found',
                code: 404,
                cause: 'COLLECTION_NOT_FOUND',
              },
            ],
          },
          500: {
            description: 'Internal server error',
            type: 'object',
            properties: {
              message: { type: 'string', enum: ['Internal server error'] },
              code: { type: 'number', enum: [500] },
              cause: { type: 'string', enum: ['LIST_ROWS_ERROR'] },
            },
            examples: [
              {
                message: 'Internal server error',
                code: 500,
                cause: 'LIST_ROWS_ERROR',
              },
            ],
          },
        },
      },
    },
  })
  async handle(request: FastifyRequest, response: FastifyReply): Promise<void> {
    const query = ListRowCollectionPaginatedSchema.parse(request.query);
    const { collectionSlug } = request.params as { collectionSlug: string };

    // @ts-ignore
    const result = await this.useCase.execute({ ...query, collectionSlug });

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
