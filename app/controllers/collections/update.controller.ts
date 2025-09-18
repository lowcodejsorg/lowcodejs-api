import { AuthenticationMiddleware } from '@middlewares/authentication.middleware';
import UpdateCollectionUseCase from '@use-case/collections/update.use-case';
import {
  GetCollectionBySlugSchema,
  UpdateCollectionSchema,
} from '@validators/collections.validator';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Controller, getInstanceByToken, PUT } from 'fastify-decorators';

@Controller({
  route: 'collections',
})
export default class {
  constructor(
    private readonly useCase: UpdateCollectionUseCase = getInstanceByToken(
      UpdateCollectionUseCase,
    ),
  ) {}

  @PUT({
    url: '/:slug',
    options: {
      onRequest: [AuthenticationMiddleware],
      schema: {
        tags: ['Collections'],
        summary: 'Update collection',
        description:
          'Updates an existing collection with new data, fields, and configuration settings',
        security: [{ cookieAuth: [] }],
        params: {
          type: 'object',
          required: ['slug'],
          properties: {
            slug: {
              type: 'string',
              description: 'Collection slug identifier',
              examples: ['users', 'products', 'blog-posts'],
            },
          },
          additionalProperties: false,
        },
        body: {
          type: 'object',
          required: ['name', 'configuration'],
          properties: {
            name: {
              type: 'string',
              description: 'Collection name',
            },
            description: {
              type: 'string',
              nullable: true,
              description: 'Collection description',
            },
            logo: {
              type: 'string',
              nullable: true,
              description: 'Collection logo URL or storage ID',
            },
            fields: {
              type: 'array',
              description: 'Array of field definitions for the collection',
              items: {
                type: 'object',
                required: ['name', 'type', 'configuration'],
                properties: {
                  name: {
                    type: 'string',
                    description:
                      'Field name (will be slugified for internal use)',
                  },
                  type: {
                    type: 'string',
                    enum: [
                      'TEXT_SHORT',
                      'TEXT_LONG',
                      'DROPDOWN',
                      'DATE',
                      'RELATIONSHIP',
                      'FILE',
                      'FIELD_GROUP',
                      'REACTION',
                      'EVALUATION',
                      'CATEGORY',
                    ],
                    description: 'Field type from FIELD_TYPE enum',
                  },
                  configuration: {
                    type: 'object',
                    required: ['required', 'multiple'],
                    description:
                      'Field configuration including required, multiple, format, etc.',
                  },
                },
              },
            },
            configuration: {
              type: 'object',
              required: ['style', 'visibility', 'collaboration'],
              properties: {
                style: {
                  type: 'string',
                  enum: ['gallery', 'list'],
                  default: 'list',
                  description: 'Display style',
                },
                visibility: {
                  type: 'string',
                  enum: ['public', 'restrict'],
                  default: 'public',
                  description:
                    'Visibility setting (note: restrict not restricted)',
                },
                collaboration: {
                  type: 'string',
                  enum: ['open', 'restrict'],
                  default: 'open',
                  description:
                    'Collaboration setting (note: restrict not restricted)',
                },
                administrators: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Array of administrator user IDs',
                },
                fields: {
                  type: 'object',
                  properties: {
                    orderList: {
                      type: 'array',
                      items: { type: 'string' },
                      description: 'Field order for list view',
                    },
                    orderForm: {
                      type: 'array',
                      items: { type: 'string' },
                      description: 'Field order for form view',
                    },
                  },
                },
              },
            },
          },
        },
        response: {
          200: {
            description: 'Collection updated successfully',
            type: 'object',
            properties: {
              _id: { type: 'string', description: 'Collection ID' },
              name: { type: 'string', description: 'Collection name' },
              description: {
                type: 'string',
                nullable: true,
                description: 'Collection description',
              },
              slug: { type: 'string', description: 'Collection URL slug' },
              logo: {
                type: 'string',
                nullable: true,
                description: 'Collection logo URL',
              },
              fields: {
                type: 'array',
                items: { type: 'object' },
                description: 'Collection fields with generated slugs',
              },
              configuration: {
                type: 'object',
                description: 'Collection configuration settings',
              },
              type: {
                type: 'string',
                enum: ['collection', 'field-group'],
                description: 'Collection type',
              },
              _schema: {
                type: 'object',
                description: 'Generated schema for the collection',
              },
              createdAt: {
                type: 'string',
                format: 'date-time',
                description: 'Creation timestamp',
              },
              updatedAt: {
                type: 'string',
                format: 'date-time',
                description: 'Last update timestamp',
              },
            },
          },
          400: {
            description: 'Bad request - Validation error',
            type: 'object',
            properties: {
              message: {
                type: 'string',
                enum: [
                  'Invalid collection name',
                  'Invalid field configuration',
                  'Required fields missing',
                ],
              },
              code: { type: 'number', enum: [400] },
              cause: {
                type: 'string',
                enum: ['INVALID_PARAMETERS', 'INVALID_FIELD_CONFIG'],
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
          },
          404: {
            description:
              'Not found - Collection with specified slug does not exist',
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
            description: 'Internal server error - Database or server issues',
            type: 'object',
            properties: {
              message: { type: 'string', enum: ['Internal server error'] },
              code: { type: 'number', enum: [500] },
              cause: { type: 'string', enum: ['UPDATE_COLLECTION_ERROR'] },
            },
          },
        },
      },
    },
  })
  async handle(request: FastifyRequest, response: FastifyReply): Promise<void> {
    const payload = UpdateCollectionSchema.parse(request.body);
    const params = GetCollectionBySlugSchema.parse(request.params);

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
