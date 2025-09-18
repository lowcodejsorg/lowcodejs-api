import { Either, left, right } from '@core/either.core';
import { buildSchema } from '@core/util.core';
import ApplicationException from '@exceptions/application.exception';
import { Collection } from '@model/collection.model';
import { Field } from '@model/field.model';
import { GetFieldCollectionByIdSchema } from '@validators/field-collection.validator';
import { Service } from 'fastify-decorators';
import z from 'zod';

type Response = Either<ApplicationException, import('@core/entity.core').Field>;

@Service()
export default class RemoveFieldFromTrashUseCase {
  async execute(
    payload: z.infer<typeof GetFieldCollectionByIdSchema>,
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

      const field = await Field.findOne({ _id: payload._id });

      if (!field)
        return left(
          ApplicationException.NotFound('Field not found', 'FIELD_NOT_FOUND'),
        );

      await field
        .set({
          ...field.toJSON(),
          configuration: {
            ...field?.toJSON()?.configuration,
            listing: true,
            filtering: true,
            required: false,
          },
          trashedAt: null,
          trashed: false,
        })
        .save();

      const fields = (
        collection.fields as import('@core/entity.core').Field[]
      ).map((f) => {
        if (f._id?.toString() === field._id?.toString()) {
          return {
            ...field?.toJSON(),
            _id: field?._id?.toString(),
          };
        }

        return f;
      });

      const _schema = buildSchema(fields);

      await collection
        .set({
          ...collection.toJSON(),
          fields: fields.flatMap((f) => f?._id?.toString()),
          _schema,
        })
        .save();

      return right({
        ...field.toJSON(),
        _id: field._id?.toString(),
      });
    } catch (error) {
      return left(
        ApplicationException.InternalServerError(
          'Internal server error',
          'REMOVE_FIELD_FROM_TRASH_ERROR',
        ),
      );
    }
  }
}
