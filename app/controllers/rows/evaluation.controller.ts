import { AuthenticationMiddleware } from '@middlewares/authentication.middleware';
import EvaluationRowUseCase from '@use-case/rows/evaluation.use-case';
import {
  EvaluationRowCollectionSchema,
  GetRowCollectionByIdSchema,
  GetRowCollectionSlugSchema,
} from '@validators/row-collection.validator';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Controller, getInstanceByToken, POST } from 'fastify-decorators';

@Controller({
  route: 'collections',
})
export default class {
  constructor(
    private readonly useCase: EvaluationRowUseCase = getInstanceByToken(
      EvaluationRowUseCase,
    ),
  ) {}

  @POST({
    url: '/:slug/rows/:_id/evaluation',
    options: {
      onRequest: [AuthenticationMiddleware],
      schema: {
        tags: ['Rows'],
        summary: 'Add evaluation to row',
        description: 'Adds a numeric evaluation (rating) to a specific field in a row. Creates or updates evaluation record linked to user and field.',
        security: [{ cookieAuth: [] }],
        params: {
          type: 'object',
          required: ['slug', '_id'],
          properties: {
            slug: {
              type: 'string',
              description: 'Collection slug containing the row',
              examples: ['users', 'products', 'blog-posts']
            },
            _id: {
              type: 'string',
              description: 'Row ID to add evaluation to',
              examples: ['507f1f77bcf86cd799439011']
            }
          },
          additionalProperties: false
        },
        body: {
          type: 'object',
          required: ['value', 'field', 'user'],
          properties: {
            value: {
              type: 'number',
              description: 'Numeric evaluation value (rating)',
              examples: [1, 2, 3, 4, 5]
            },
            field: {
              type: 'string',
              description: 'Field slug that accepts evaluations (must be EVALUATION type field)',
              examples: ['rating', 'score', 'quality']
            },
            user: {
              type: 'string',
              description: 'User ID adding the evaluation',
              examples: ['507f1f77bcf86cd799439012']
            }
          },
          additionalProperties: false
        },
        response: {
          200: {
            description: 'Evaluation added successfully',
            type: 'object',
            properties: {
              _id: { type: 'string', description: 'Evaluation ID' },
              value: { type: 'number', description: 'Evaluation value' },
              user: {
                type: 'object',
                description: 'User who made the evaluation (populated)',
                properties: {
                  _id: { type: 'string' },
                  name: { type: 'string' },
                  email: { type: 'string' }
                }
              },
              createdAt: { type: 'string', format: 'date-time', description: 'Creation timestamp' },
              updatedAt: { type: 'string', format: 'date-time', description: 'Last update timestamp' }
            }
          },
          400: {
            description: 'Bad request - Invalid field type or validation error',
            type: 'object',
            properties: {
              message: {
                type: 'string',
                enum: ['Field is not an evaluation field', 'Invalid evaluation value', 'User not found']
              },
              code: { type: 'number', enum: [400] },
              cause: { type: 'string', enum: ['INVALID_FIELD_TYPE', 'INVALID_PARAMETERS'] }
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
            description: 'Not found - Collection, row, or field does not exist',
            type: 'object',
            properties: {
              message: {
                type: 'string',
                enum: ['Collection not found', 'Row not found', 'Field not found']
              },
              code: { type: 'number', enum: [404] },
              cause: {
                type: 'string',
                enum: ['COLLECTION_NOT_FOUND', 'ROW_NOT_FOUND', 'FIELD_NOT_FOUND']
              }
            }
          },
          500: {
            description: 'Internal server error - Database or server issues',
            type: 'object',
            properties: {
              message: { type: 'string', enum: ['Internal server error'] },
              code: { type: 'number', enum: [500] },
              cause: { type: 'string', enum: ['EVALUATION_ROW_ERROR'] }
            }
          }
        }
      },
    },
  })
  async handle(request: FastifyRequest, response: FastifyReply): Promise<void> {
    const payload = EvaluationRowCollectionSchema.parse(request.body);
    const params = {
      ...GetRowCollectionSlugSchema.parse(request.params),
      ...GetRowCollectionByIdSchema.parse(request.params),
    };

    const result = await this.useCase.execute({
      ...payload,
      ...params,
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
