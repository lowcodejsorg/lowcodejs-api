import { Either, left, right } from '@core/either.core';
import { Meta, Paginated } from '@core/entity.core';
import { normalize } from '@core/util.core';
import ApplicationException from '@exceptions/application.exception';
import { Collection as Model } from '@model/collection.model';
import { ListCollectionPaginatedSchema } from '@validators/collections.validator';
import { Service } from 'fastify-decorators';
import z from 'zod';

type Response = Either<
  ApplicationException,
  Paginated<import('@core/entity.core').Collection[]>
>;

@Service()
export default class ListCollectionPaginatedUseCase {
  async execute(
    payload: z.infer<typeof ListCollectionPaginatedSchema>,
  ): Promise<Response> {
    try {
      const skip = (payload.page - 1) * payload.perPage;

      const query: Record<string, unknown> = {
        type: 'collection',
      };

      if (payload.search) {
        query.$or = [
          { name: { $regex: normalize(payload.search), $options: 'i' } },
          { description: { $regex: normalize(payload.search), $options: 'i' } },
          { slug: { $regex: normalize(payload.search), $options: 'i' } },
        ];
      }

      if (payload.name)
        query.name = { $regex: normalize(payload.name), $options: 'i' };

      if (payload.slug)
        query.slug = { $regex: normalize(payload.slug), $options: 'i' };

      if (payload.type) query.type = payload.type;

      if (payload.trashed && payload.trashed === 'true') query.trashed = true;
      else query.trashed = false;

      const collections = await Model.find(query)
        .skip(skip)
        .limit(payload.perPage)
        .sort({ createdAt: 'asc' });

      const total = await Model.countDocuments(query);

      const lastPage = Math.ceil(total / payload.perPage);

      const meta: Meta = {
        total,
        perPage: payload.perPage,
        page: payload.page,
        lastPage,
        firstPage: total > 0 ? 1 : 0,
      };

      return right({
        meta,
        data: collections?.map((u) => ({
          ...u?.toJSON(),
          _id: u?._id.toString(),
        })),
      });
    } catch (error) {
      return left(
        ApplicationException.InternalServerError(
          'Internal server error',
          'COLLECTION_LIST_PAGINATED_ERROR',
        ),
      );
    }
  }
}
