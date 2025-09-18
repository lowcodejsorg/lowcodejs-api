import { Service } from 'fastify-decorators';

import { Either, left, right } from '@core/either.core';
import ApplicationException from '@exceptions/application.exception';
import { Collection as Model } from '@model/collection.model';
import { GetCollectionByIdSchema } from '@validators/collections.validator';
import z from 'zod';

type Response = Either<
  ApplicationException,
  import('@core/entity.core').Collection
>;

@Service()
export default class SendCollectionToTrashUseCase {
  async execute(
    payload: z.infer<typeof GetCollectionByIdSchema>,
  ): Promise<Response> {
    try {
      const collection = await Model.findOne({ _id: payload._id });

      if (!collection)
        return left(
          ApplicationException.NotFound(
            'Collection not found',
            'COLLECTION_NOT_FOUND',
          ),
        );

      await collection
        .set({ ...collection.toJSON(), trashed: true, trashedAt: new Date() })
        .save();

      return right({
        ...collection.toJSON(),
        _id: collection._id.toString(),
      });
    } catch (error) {
      return left(
        ApplicationException.InternalServerError(
          'Internal server error',
          'SEND_COLLECTION_TO_TRASH_ERROR',
        ),
      );
    }
  }
}
