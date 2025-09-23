import { Either, left, right } from '@core/either.core';
import { FIELD_TYPE } from '@core/entity.core';
import { buildCollection, buildPopulate } from '@core/util.core';
import ApplicationException from '@exceptions/application.exception';
import { Collection } from '@model/collection.model';
import {
  GetRowCollectionByIdSchema,
  GetRowCollectionSlugSchema,
  UpdateRowCollectionSchema,
} from '@validators/row-collection.validator';
import { Service } from 'fastify-decorators';
import z from 'zod';

type Response = Either<ApplicationException, import('@core/entity.core').Row>;

@Service()
export default class UpdateRowCollectionUseCase {
  async execute(
    payload: z.infer<typeof UpdateRowCollectionSchema> &
      z.infer<typeof GetRowCollectionByIdSchema> &
      z.infer<typeof GetRowCollectionSlugSchema>,
  ): Promise<Response> {
    try {
      const collection = await Collection.findOne({
        slug: payload.slug,
      });

      if (!collection)
        return left(
          ApplicationException.NotFound(
            'LCollection not found',
            'COLLECTION_NOT_FOUND',
          ),
        );

      const c = await buildCollection({
        ...collection?.toJSON({
          flattenObjectIds: true,
        }),
        _id: collection?._id.toString(),
      });

      const row = await c.findOne({
        _id: payload._id,
      });

      if (!row)
        return left(
          ApplicationException.NotFound('Row not found', 'ROW_NOT_FOUND'),
        );

      const groupPayload = [];

      const groups = (
        collection.fields as import('@core/entity.core').Field[]
      )?.filter((c) => c.type === FIELD_TYPE.FIELD_GROUP);

      for await (const group of groups) {
        const groupCollection = await Collection.findOne({
          slug: group.configuration?.group?.slug?.toString(),
        }).populate([
          {
            path: 'fields',
            model: 'Field',
          },
        ]);

        if (!groupCollection) continue;

        const cGroup = await buildCollection({
          ...groupCollection?.toJSON({
            flattenObjectIds: true,
          }),
          _id: groupCollection?._id?.toString(),
        });

        for (const item of payload[
          group.slug
        ] as import('@core/entity.core').Row[]) {
          groupPayload.push({
            collection: cGroup,
            payload: item,
            group: group.slug,
          });
        }
      }

      for await (const item of groupPayload) {
        const row = await item.collection.findOne({
          _id: item.payload._id,
        });

        if (!row) {
          const created = await item.collection.create({
            ...item.payload,
          });

          (payload[item.group] as string[])?.push(created?._id?.toString());
        }

        if (row) {
          await row
            .set({
              ...row.toJSON({
                flattenObjectIds: true,
              }),
              ...item.payload,
            })
            .save();

          (payload[item.group] as string[])?.push(row?._id?.toString());
        }
      }

      const populate = await buildPopulate(
        collection?.fields as import('@core/entity.core').Field[],
      );

      await row
        .set({
          ...row.toJSON({
            flattenObjectIds: true,
          }),
          ...payload,
        })
        .save();

      const updated = await row.populate(populate);

      return right({
        ...updated?.toJSON({
          flattenObjectIds: true,
        }),
        _id: updated?._id?.toString(),
      });
    } catch (error) {
      return left(
        ApplicationException.InternalServerError(
          'Internal server error',
          'UPDATE_ROW_COLLECTION_ERROR',
        ),
      );
    }
  }
}
