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
      console.log('ListRowCollectionPaginatedUseCase', payload);
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

      let c;
      try {
        c = await buildCollection({
          ...collection?.toJSON({
            flattenObjectIds: true,
          }),
          _id: collection?._id.toString(),
        });
      } catch (error) {
        console.error('Model build error:', error);
        return left(
          ApplicationException.InternalServerError(
            'Failed to build collection model',
            'MODEL_BUILD_FAILED',
          ),
        );
      }

      const query = buildQuery(
        payload,
        collection?.fields as import('@core/entity.core').Field[],
      );

      const order = buildOrder(
        payload,
        collection?.fields as import('@core/entity.core').Field[],
      );

      let populate;
      try {
        populate = await buildPopulate(
          collection?.fields as import('@core/entity.core').Field[],
        );
      } catch (error) {
        console.error('Populate build error:', error);
        return left(
          ApplicationException.InternalServerError(
            'Failed to build populate strategy',
            'POPULATE_BUILD_FAILED',
          ),
        );
      }

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
          ...u?.toJSON({
            flattenObjectIds: true,
          }),
          _id: u?._id.toString(),
        })),
      });
    } catch (error) {
      console.error(error);
      return left(
        ApplicationException.InternalServerError(
          'Internal server error',
          'LIST_ROW_COLLECTION_PAGINATED_ERROR',
        ),
      );
    }
  }
}
