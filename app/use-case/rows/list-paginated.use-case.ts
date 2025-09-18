import { Either, left, right } from '@core/either.core';
import { Meta, Paginated } from '@core/entity.core';
import {
  buildCollection,
  buildOrder,
  buildPopulate,
  buildQuery,
} from '@core/util.core';
import ApplicationException from '@exceptions/application.exception';
import { Collection } from '@model/collection.model';
import {
  GetRowCollectionQuerySchema,
  GetRowCollectionSlugSchema,
  ListRowCollectionPaginatedSchema,
} from '@validators/row-collection.validator';
import { Service } from 'fastify-decorators';
import z from 'zod';

type Response = Either<
  ApplicationException,
  Paginated<import('@core/entity.core').Row[]>
>;

@Service()
export default class ListRowCollectionPaginatedUseCase {
  async execute(
    payload: z.infer<typeof ListRowCollectionPaginatedSchema> &
      z.infer<typeof GetRowCollectionSlugSchema> &
      z.infer<typeof GetRowCollectionQuerySchema>,
  ): Promise<Response> {
    try {
      const skip = (payload.page - 1) * payload.perPage;

      const collection = await Collection.findOne({
        slug: payload.slug,
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

      const query = buildQuery(
        payload,
        collection?.fields as import('@core/entity.core').Field[],
      );

      const order = buildOrder(
        payload,
        collection?.fields as import('@core/entity.core').Field[],
      );

      const populate = await buildPopulate(
        collection?.fields as import('@core/entity.core').Field[],
      );

      const rows = await c
        .find(query)
        .populate(populate)
        .skip(skip)
        .limit(payload.perPage)
        .sort(order);

      const total = await c.countDocuments(query);

      const lastPage = Math.ceil(total / payload.perPage);

      const meta: Meta = {
        total,
        perPage: payload.perPage,
        page: payload.page,
        lastPage,
        firstPage: total > 0 ? 1 : 0,
      };

      // @ts-ignore
      return right({
        meta,
        data: rows?.map((u) => ({
          ...u?.toJSON(),
          _id: u?._id.toString(),
        })),
      });
    } catch (error) {
      return left(
        ApplicationException.InternalServerError(
          'Internal server error',
          'LIST_ROW_COLLECTION_PAGINATED_ERROR',
        ),
      );
    }
  }
}
