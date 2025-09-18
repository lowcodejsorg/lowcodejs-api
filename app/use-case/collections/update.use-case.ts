import { Either, left, right } from '@core/either.core';
import { Field } from '@core/entity.core';
import { buildCollection, buildSchema } from '@core/util.core';
import ApplicationException from '@exceptions/application.exception';
import { Collection as Model } from '@model/collection.model';
import {
  GetCollectionByIdSchema,
  UpdateCollectionSchema,
} from '@validators/collections.validator';
import { Service } from 'fastify-decorators';
import slugify from 'slugify';
import z from 'zod';

type Response = Either<
  ApplicationException,
  import('@core/entity.core').Collection
>;

@Service()
export default class UpdateCollectionUseCase {
  async execute(
    payload: z.infer<typeof UpdateCollectionSchema> &
      z.infer<typeof GetCollectionByIdSchema>,
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

      const fields =
        payload?.fields?.map(
          (field) =>
            ({
              ...field,
              slug: slugify(field.name, { lower: true, trim: true }),
            }) as Field,
        ) || [];

      const _schema = buildSchema(fields);

      await collection
        .set({
          ...collection.toJSON(),
          ...payload,
          fields,
          _schema: {
            ...collection._schema,
            ..._schema,
          },
          configuration: {
            ...collection?.toJSON()?.configuration,
            ...payload.configuration,
            administrators: payload.configuration?.administrators || [],
          },
        })
        .save();

      await buildCollection({
        ...collection.toJSON(),
        _id: collection._id.toString(),
      });

      return right({
        ...collection.toJSON(),
        _id: collection._id.toString(),
      });
    } catch (error) {
      return left(
        ApplicationException.InternalServerError(
          'Internal server error',
          'UPDATE_COLLECTION_ERROR',
        ),
      );
    }
  }
}
