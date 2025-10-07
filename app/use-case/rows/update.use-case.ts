/* eslint-disable @typescript-eslint/consistent-type-imports */
import { Service } from 'fastify-decorators';
import type z from 'zod';

import type { Either } from '@core/either.core';
import { left, right } from '@core/either.core';
import { FIELD_TYPE, Row } from '@core/entity.core';
import { buildCollection, buildPopulate } from '@core/util.core';
import ApplicationException from '@exceptions/application.exception';
import { Collection } from '@model/collection.model';
import type {
  GetRowCollectionByIdSchema,
  GetRowCollectionSlugSchema,
  UpdateRowCollectionSchema,
} from '@validators/row-collection.validator';

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
      }).populate([
        {
          path: 'fields',
          model: 'Field',
        },
      ]);

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

        const hasGroupPayload = payload[group.slug];

        console.log('hasGroupPayload on update', hasGroupPayload);

        if (!hasGroupPayload) continue;

        const groupItems = hasGroupPayload as Row[];

        for (const item of groupItems) {
          if (typeof item === 'string') {
            groupPayload.push({
              collection: cGroup,
              payload: null,
              group: group.slug,
              existingId: item,
            });
          } else if (item._id && (item.createdAt || item.updatedAt)) {
            groupPayload.push({
              collection: cGroup,
              payload: null,
              group: group.slug,
              existingId: item._id,
            });
          } else if (item._id) {
            groupPayload.push({
              collection: cGroup,
              payload: item,
              group: group.slug,
              existingId: item._id,
            });
          } else {
            groupPayload.push({
              collection: cGroup,
              payload: item,
              group: group.slug,
              existingId: null,
            });
          }
        }
      }

      const processedGroupIds: { [key: string]: string[] } = {};

      for await (const item of groupPayload) {
        if (!processedGroupIds[item.group]) {
          processedGroupIds[item.group] = [];
        }

        if (item.existingId && !item.payload) {
          processedGroupIds[item.group].push(item.existingId);
          continue;
        }

        if (item.existingId && item.payload) {
          const row = await item.collection.findOne({
            _id: item.existingId,
          });

          if (row) {
            await row
              .set({
                ...row.toJSON({
                  flattenObjectIds: true,
                }),
                ...item.payload,
              })
              .save();
          }

          processedGroupIds[item.group].push(item.existingId);
          continue;
        }

        const created = await item.collection.create({
          ...item.payload,
        });

        processedGroupIds[item.group].push(created?._id?.toString());
      }

      for (const groupSlug in processedGroupIds) {
        payload[groupSlug] = processedGroupIds[groupSlug];
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
      console.error(error);
      return left(
        ApplicationException.InternalServerError(
          'Internal server error',
          'UPDATE_ROW_COLLECTION_ERROR',
        ),
      );
    }
  }
}
