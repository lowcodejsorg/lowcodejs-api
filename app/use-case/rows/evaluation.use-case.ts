import { Either, left, right } from '@core/either.core';
import { buildCollection, buildPopulate } from '@core/util.core';
import ApplicationException from '@exceptions/application.exception';
import { Collection } from '@model/collection.model';
import { Evaluation } from '@model/evaluation.model';
import {
  EvaluationRowCollectionSchema,
  GetRowCollectionByIdSchema,
} from '@validators/row-collection.validator';
import { Service } from 'fastify-decorators';
import z from 'zod';

type Response = Either<ApplicationException, import('@core/entity.core').Row>;

@Service()
export default class EvaluationRowCollectionUseCase {
  async execute(
    payload: z.infer<typeof EvaluationRowCollectionSchema> &
      z.infer<typeof GetRowCollectionByIdSchema>,
  ): Promise<Response> {
    try {
      const collection = await Collection.findOne({
        slug: payload.collectionSlug,
      });

      if (!collection)
        return left(
          ApplicationException.NotFound(
            'Collection not found',
            'COLLECTION_NOT_FOUND',
          ),
        );

      const c = await buildCollection({
        ...collection.toJSON(),
        _id: collection._id.toString(),
      });

      const populate = await buildPopulate(
        collection.fields as import('@core/entity.core').Field[],
      );

      const row = await c
        .findOne({
          _id: payload._id,
        })
        .populate(populate);

      if (!row)
        return left(
          ApplicationException.NotFound('Row not found', 'ROW_NOT_FOUND'),
        );

      let evaluation = await Evaluation.findOne({
        user: payload.userId,
      });

      if (!evaluation) {
        evaluation = await Evaluation.create({
          value: payload.value,
          user: payload.userId,
        });
      }

      if (evaluation) {
        await evaluation
          .set({
            ...evaluation.toJSON(),
            value: payload.value,
          })
          .save();
      }

      const evaluations = row[payload.fieldSlug] ?? [];
      const evaluationId = evaluation?._id?.toString();

      if (!evaluations.includes(evaluationId))
        await row
          ?.set({
            ...row?.toJSON(),
            [payload.fieldSlug]: [...evaluations, evaluationId],
          })
          .save();

      const populated = await row?.populate(populate);

      return right({
        ...populated?.toJSON(),
        _id: populated?._id?.toString(),
      });
    } catch (error) {
      return left(
        ApplicationException.InternalServerError(
          'Internal server error',
          'EVALUATION_ROW_COLLECTION_ERROR',
        ),
      );
    }
  }
}
