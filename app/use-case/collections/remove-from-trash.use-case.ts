import { Either, left, right } from '@core/either.core';
import ApplicationException from '@exceptions/application.exception';
import { Collection } from '@model/collection.model';
import { GetCollectionBySlugSchema } from '@validators/collections.validator';
import { Service } from 'fastify-decorators';
import z from 'zod';

type Response = Either<
  ApplicationException,
  import('@core/entity.core').Collection
>;

@Service()
export default class RemoveCollectionFromTrashUseCase {
  async execute(
    payload: z.infer<typeof GetCollectionBySlugSchema>,
  ): Promise<Response> {
    try {
      const collection = await Collection.findOne({ slug: payload.slug });

      if (!collection)
        return left(
          ApplicationException.NotFound(
            'Collection not found',
            'COLLECTION_NOT_FOUND',
          ),
        );

      await collection
        .set({ ...collection.toJSON(), trashed: false, trashedAt: null })
        .save();
      return right({
        ...collection.toJSON(),
        _id: collection._id.toString(),
      });
    } catch (error) {
      return left(
        ApplicationException.InternalServerError(
          'Internal server error',
          'REMOVE_COLLECTION_FROM_TRASH_ERROR',
        ),
      );
    }
  }
}
