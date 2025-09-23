import { Either, left, right } from '@core/either.core';
import { buildCollection, buildSchema } from '@core/util.core';
import ApplicationException from '@exceptions/application.exception';
import { Collection } from '@model/collection.model';
import { Field } from '@model/field.model';
import { GetCollectionBySlugSchema } from '@validators/collections.validator';
import {
  GetFieldCollectionByIdSchema,
  UpdateFieldCollectionSchema,
} from '@validators/field-collection.validator';
import { Service } from 'fastify-decorators';
import slugify from 'slugify';
import z from 'zod';

type Response = Either<
  ApplicationException,
  import('@core/entity.core').Collection
>;

@Service()
export default class UpdateFieldCollectionUseCase {
  async execute(
    payload: z.infer<typeof UpdateFieldCollectionSchema> &
      z.infer<typeof GetFieldCollectionByIdSchema> &
      z.infer<typeof GetCollectionBySlugSchema>,
  ): Promise<Response> {
    try {
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

      const field = await Field.findOne({ _id: payload._id });

      if (!field)
        return left(
          ApplicationException.NotFound('Field not found', 'FIELD_NOT_FOUND'),
        );

      const oldSlug = field.slug;

      const slug = slugify(payload.name, { lower: true, trim: true });

      await field
        .set({
          ...field.toJSON({
            flattenObjectIds: true,
          }),
          ...payload,
          slug,
        })
        .save();

      const fields = (
        collection.fields as import('@core/entity.core').Field[]
      ).map((f) => {
        if (f._id?.toString() === field._id?.toString()) {
          return {
            ...field?.toJSON({
              flattenObjectIds: true,
            }),
            _id: field?._id?.toString(),
          };
        }

        return f;
      });

      const _schema = buildSchema(fields);

      await collection
        .set({
          ...collection.toJSON({
            flattenObjectIds: true,
          }),
          _schema,
          fields: fields.flatMap((f) => f._id?.toString()),
        })
        .save();

      if (oldSlug !== slug) {
        const c = await buildCollection({
          ...collection.toJSON({
            flattenObjectIds: true,
          }),
          _id: collection._id.toString(),
        });
        await c.updateMany(
          {},
          {
            $rename: {
              [oldSlug]: slug,
            },
          },
        );
      }

      return right({
        ...collection.toJSON({
          flattenObjectIds: true,
        }),
        _id: collection._id.toString(),
      });
    } catch (error) {
      return left(
        ApplicationException.InternalServerError(
          'Internal server error',
          'UPDATE_FIELD_COLLECTION_ERROR',
        ),
      );
    }
  }
}
