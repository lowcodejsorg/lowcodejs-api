import { Service } from 'fastify-decorators';

import { Either, left, right } from '@core/either.core';
import { buildCollection, buildPopulate } from '@core/util.core';
import ApplicationException from '@exceptions/application.exception';
import { Collection } from '@model/collection.model';
import { GetRowCollectionByIdSchema } from '@validators/row-collection.validator';
import z from 'zod';

type Response = Either<ApplicationException, import('@core/entity.core').Row>;

@Service()
export default class GetRowCollectionByIdUseCase {
  async execute(
    payload: z.infer<typeof GetRowCollectionByIdSchema>,
  ): Promise<Response> {
    try {
      const collection = await Collection.findOne({
        slug: payload.collectionSlug,
      }).populate([
        {
          path: 'fields',
          model: 'Field',
        },
      ]);

      if (!collection)
        return left(
          ApplicationException.NotFound(
            'Collection not found',
            'COLLECTION_NOT_FOUND',
          ),
        );

      if (
        payload.public &&
        payload.public === 'true' &&
        collection?.configuration?.visibility !== 'public'
      ) {
        return left(
          ApplicationException.BadRequest(
            'Collection is not public',
            'COLLECTION_NOT_PUBLIC',
          ),
        );
      }

      const c = await buildCollection({
        ...collection?.toJSON(),
        _id: collection?._id.toString(),
      });

      const populate = await buildPopulate(
        collection.fields as import('@core/entity.core').Field[],
      );

      const row = await c.findOne({
        _id: payload._id,
      });

      if (!row)
        return left(
          ApplicationException.NotFound('Row not found', 'ROW_NOT_FOUND'),
        );

      const populated = await row.populate(populate);

      return right({
        ...populated?.toJSON(),
        _id: populated?._id?.toString(),
      });
    } catch (error) {
      return left(
        ApplicationException.InternalServerError(
          'Internal server error',
          'GET_ROW_COLLECTION_BY_ID_ERROR',
        ),
      );
    }
  }
}
