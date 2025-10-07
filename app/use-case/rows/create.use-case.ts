/* eslint-disable @typescript-eslint/consistent-type-imports */
import { Service } from 'fastify-decorators';
import type z from 'zod';

import type { Either } from '@core/either.core';
import { left, right } from '@core/either.core';
import { FIELD_TYPE } from '@core/entity.core';
import { buildCollection, buildPopulate } from '@core/util.core';
import ApplicationException from '@exceptions/application.exception';
import { Collection } from '@model/collection.model';
import type {
  CreateRowCollectionSchema,
  GetRowCollectionSlugSchema,
} from '@validators/row-collection.validator';

type Response = Either<ApplicationException, import('@core/entity.core').Row>;
@Service()
export default class CreateRowUseCase {
  async execute(
    payload: z.infer<typeof CreateRowCollectionSchema> &
      z.infer<typeof GetRowCollectionSlugSchema>,
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

        const hasGroupPayload = payload[group.slug];

        console.log('hasGroupPayload', hasGroupPayload);

        if (!hasGroupPayload) continue;

        const c = await buildCollection({
          ...groupCollection?.toJSON({
            flattenObjectIds: true,
          }),
          _id: groupCollection?._id?.toString(),
        });

        for (const item of payload[
          group.slug
        ] as import('@core/entity.core').Row[]) {
          groupPayload.push({
            collection: c,
            payload: item,
            group: group.slug,
          });
        }
      }

      const processedGroupIds: { [key: string]: string[] } = {};

      for await (const item of groupPayload) {
        if (!processedGroupIds[item.group]) {
          processedGroupIds[item.group] = [];
        }

        const row = await item.collection.findOne({
          _id: item.payload._id,
        });

        if (!row) {
          const created = await item.collection.create({
            ...item.payload,
          });

          processedGroupIds[item.group].push(created?._id?.toString());
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

          processedGroupIds[item.group].push(row?._id?.toString());
        }
      }

      for (const groupSlug in processedGroupIds) {
        payload[groupSlug] = processedGroupIds[groupSlug];
      }

      let c;
      try {
        c = await buildCollection({
          ...collection?.toJSON({
            flattenObjectIds: true,
          }),
          _id: collection?._id?.toString(),
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

      const created = await c.create(payload);

      const row = await created.populate(populate);

      return right({
        ...row?.toJSON({
          flattenObjectIds: true,
        }),
        _id: row?._id?.toString(),
      });
    } catch (error) {
      console.error(error);
      return left(
        ApplicationException.InternalServerError(
          'Internal server error',
          'CREATE_ROW_ERROR',
        ),
      );
    }
  }
}
