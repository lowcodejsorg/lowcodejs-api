import { AuthenticationMiddleware } from '@middlewares/authentication.middleware';
import CreateCollectionUseCase from '@use-case/collections/create.use-case';
import { CreateCollectionSchema } from '@validators/collections.validator';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Controller, getInstanceByToken, POST } from 'fastify-decorators';

@Controller({
  route: 'collections',
})
export default class {
  constructor(
    private readonly useCase: CreateCollectionUseCase = getInstanceByToken(
      CreateCollectionUseCase,
    ),
  ) {}

  @POST({
    url: '',
    options: {
      onRequest: [AuthenticationMiddleware],
      schema: {
        tags: ['Collections'],
        summary: 'Create a new collection',
        description:
          'Creates a new collection with fields, configuration and permissions settings',
        security: [{ cookieAuth: [] }],
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
              description: 'Collection logo URL',
            },
            fields: {
              type: 'array',
              description: 'Array of field definitions for the collection',
              default: [],
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
                    properties: {
                      required: {
                        type: 'boolean',
                        description: 'Field is required',
                      },
                      multiple: {
                        type: 'boolean',
                        description: 'Field accepts multiple values',
                      },
                      listing: {
                        type: 'boolean',
                        description: 'Show field in list view',
                      },
                      filtering: {
                        type: 'boolean',
                        description: 'Allow filtering by this field',
                      },
                      format: {
                        type: 'string',
                        nullable: true,
                        description:
                          'Field format (for TEXT_SHORT and DATE types)',
                      },
                      default_value: {
                        type: 'string',
                        nullable: true,
                        description: 'Default field value',
                      },
                      dropdown: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Options for DROPDOWN type',
                      },
                      relationship: {
                        type: 'object',
                        nullable: true,
                        description: 'Configuration for RELATIONSHIP type',
                        properties: {
                          collection: {
                            type: 'object',
                            properties: {
                              _id: { type: 'string' },
                              slug: { type: 'string' },
                            },
                          },
                          field: {
                            type: 'object',
                            properties: {
                              _id: { type: 'string' },
                              slug: { type: 'string' },
                            },
                          },
                          order: { type: 'string', enum: ['asc', 'desc'] },
                        },
                      },
                      group: {
                        type: 'object',
                        nullable: true,
                        description: 'Configuration for FIELD_GROUP type',
                        properties: {
                          _id: { type: 'string' },
                          slug: { type: 'string' },
                        },
                      },
                      category: {
                        type: 'array',
                        description: 'Categories for CATEGORY type',
                        items: {
                          type: 'object',
                          properties: {
                            id: { type: 'string' },
                            label: { type: 'string' },
                            children: { type: 'array' },
                          },
                        },
                      },
                    },
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
          201: {
            description: 'Collection created successfully',
            type: 'object',
            properties: {
              _id: { type: 'string' },
              name: { type: 'string' },
              description: { type: 'string' },
              slug: { type: 'string' },
              logo: { type: 'string' },
              fields: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    _id: { type: 'string', description: 'Field ID' },
                    name: { type: 'string', description: 'Field name' },
                    slug: {
                      type: 'string',
                      description: 'Field slug (generated from name)',
                    },
                    type: {
                      type: 'string',
                      description: 'Field type from FIELD_TYPE enum',
                    },
                    configuration: {
                      type: 'object',
                      description: 'Field configuration',
                    },
                  },
                },
                description: 'Collection fields (processed with slugs)',
              },
              configuration: {
                type: 'object',
                properties: {
                  style: { type: 'string', enum: ['gallery', 'list'] },
                  visibility: { type: 'string', enum: ['public', 'restrict'] },
                  collaboration: { type: 'string', enum: ['open', 'restrict'] },
                  administrators: { type: 'array', items: { type: 'string' } },
                  owner: { type: 'string', description: 'Owner user ID' },
                  fields: {
                    type: 'object',
                    properties: {
                      orderList: { type: 'array', items: { type: 'string' } },
                      orderForm: { type: 'array', items: { type: 'string' } },
                    },
                  },
                },
                description: 'Collection configuration with populated owner',
              },
              type: {
                type: 'string',
                enum: ['collection'],
                description: 'Collection type (always collection)',
              },
              _schema: {
                type: 'object',
                description: 'Generated MongoDB schema based on fields',
              },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
          400: {
            description: 'Bad request - Owner required or validation error',
            type: 'object',
            properties: {
              message: {
                type: 'string',
                enum: [
                  'Owner required',
                  'Invalid collection name',
                  'Invalid field configuration',
                  'Required fields missing',
                ],
              },
              code: { type: 'number', enum: [400] },
              cause: {
                type: 'string',
                enum: [
                  'OWNER_REQUIRED',
                  'INVALID_PARAMETERS',
                  'INVALID_FIELD_CONFIG',
                ],
              },
            },
            examples: [
              {
                message: 'Owner required',
                code: 400,
                cause: 'OWNER_REQUIRED',
              },
              {
                message: 'Invalid collection name',
                code: 400,
                cause: 'INVALID_PARAMETERS',
              },
            ],
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
          409: {
            description: 'Conflict - Collection with this name already exists',
            type: 'object',
            properties: {
              message: { type: 'string', enum: ['Collection already exists'] },
              code: { type: 'number', enum: [409] },
              cause: { type: 'string', enum: ['COLLECTION_ALREADY_EXISTS'] },
            },
            examples: [
              {
                message: 'Collection already exists',
                code: 409,
                cause: 'COLLECTION_ALREADY_EXISTS',
              },
            ],
          },
          500: {
            description: 'Internal server error - Database or server issues',
            type: 'object',
            properties: {
              message: { type: 'string', enum: ['Internal server error'] },
              code: { type: 'number', enum: [500] },
              cause: { type: 'string', enum: ['CREATE_COLLECTION_ERROR'] },
            },
          },
        },
      },
    },
  })
  async handle(request: FastifyRequest, response: FastifyReply): Promise<void> {
    const payload = CreateCollectionSchema.parse(request.body);

    const result = await this.useCase.execute(payload);

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
