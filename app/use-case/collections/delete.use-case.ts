import { Service } from 'fastify-decorators';

import { Either, left, right } from '@core/either.core';
import ApplicationException from '@exceptions/application.exception';
import { Collection } from '@model/collection.model';
import { GetCollectionBySlugSchema } from '@validators/collections.validator';
import z from 'zod';

type Response = Either<ApplicationException, null>;

@Service()
export default class DeleteCollectionUseCase {
  async execute(
    payload: z.infer<typeof GetCollectionBySlugSchema>,
  ): Promise<Response> {
    try {
      const collection = await Collection.findByIdAndDelete({
        slug: payload.slug,
      });

      if (!collection)
        return left(
          ApplicationException.NotFound(
            'Collection not found',
            'COLLECTION_NOT_FOUND',
          ),
        );

      return right(null);
    } catch (error) {
      return left(
        ApplicationException.InternalServerError(
          'Internal server error',
          'DELETE_COLLECTION_ERROR',
        ),
      );
    }
  }
}
