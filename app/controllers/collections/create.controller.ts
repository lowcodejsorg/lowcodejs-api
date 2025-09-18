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
        description: 'Creates a new collection with fields, configuration and permissions settings',
        security: [{ cookieAuth: [] }],
        body: {
          type: 'object',
          required: ['name', 'configuration'],
          properties: {
            name: {
              type: 'string',
              description: 'Collection name'
            },
            description: {
              type: 'string',
              nullable: true,
              description: 'Collection description'
            },
            logo: {
              type: 'string',
              nullable: true,
              description: 'Collection logo URL'
            },
            fields: {
              type: 'array',
              description: 'Array of field definitions for the collection',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  type: { type: 'string' },
                  required: { type: 'boolean' }
                }
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
                  description: 'Display style'
                },
                visibility: {
                  type: 'string',
                  enum: ['public', 'restricted'],
                  default: 'public',
                  description: 'Visibility setting'
                },
                collaboration: {
                  type: 'string',
                  enum: ['open', 'restricted'],
                  default: 'open',
                  description: 'Collaboration setting'
                },
                administrators: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Array of administrator user IDs',
                    },
                fields: {
                  type: 'object',
                  properties: {
                    order_list: {
                      type: 'array',
                      items: { type: 'string' },
                      description: 'Field order for list view',
                            },
                    order_form: {
                      type: 'array',
                      items: { type: 'string' },
                      description: 'Field order for form view',
                            }
                  }
                }
              }
            }
          }
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
              fields: { type: 'array', items: { type: 'object' } },
              configuration: { type: 'object' },
              owner: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' }
            }
          },
          400: {
            description: 'Bad request - Validation error',
            type: 'object',
            properties: {
              message: { type: 'string', enum: ['Invalid collection name', 'Invalid field configuration', 'Required fields missing'] },
              code: { type: 'number', enum: [400] },
              cause: { type: 'string', enum: ['INVALID_PARAMETERS', 'INVALID_FIELD_CONFIG'] }
            },
            examples: [
              {
                message: 'Invalid collection name',
                code: 400,
                cause: 'INVALID_PARAMETERS'
              },
              {
                message: 'Invalid field configuration',
                code: 400,
                cause: 'INVALID_FIELD_CONFIG'
              }
            ]
          },
          401: {
            description: 'Unauthorized - Authentication required',
            type: 'object',
            properties: {
              message: { type: 'string', enum: ['Authentication required'] },
              code: { type: 'number', enum: [401] },
              cause: { type: 'string', enum: ['AUTHENTICATION_REQUIRED'] }
            },
            examples: [
              {
                message: 'Authentication required',
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
              cause: { type: 'string', enum: ['INTERNAL_SERVER_ERROR'] }
            },
            examples: [
              {
                message: 'Internal server error',
                code: 500,
                cause: 'INTERNAL_SERVER_ERROR'
              }
            ]
          }
        }
      },
    },
  })
  async handle(request: FastifyRequest, response: FastifyReply): Promise<void> {
    const body = CreateCollectionSchema.parse(request.body);

    const result = await this.useCase.execute(body);

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
