import z from 'zod';

export const CreateRowCollectionSchema = z.record(
  z.string(),
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(z.string()),
    z.array(z.number()),
    z.array(
      z
        .object({
          _id: z.string().optional(),
        })
        .loose(),
    ),
    z.object({}).loose(),
  ]),
);

export const UpdateRowCollectionSchema = CreateRowCollectionSchema.clone();

export const GetRowCollectionByIdSchema = z.object({
  _id: z.string(),
  collectionSlug: z.string(),
  public: z.enum(['true', 'false']).default('false'),
});

export const ListRowCollectionPaginatedSchema = z.object({
  page: z.coerce.number().default(1),
  perPage: z.coerce.number().default(50),
  search: z.string().optional(),
  trashed: z.enum(['true', 'false']).default('false').optional(),
});

export const ReactionRowCollectionSchema = z.object({
  type: z.enum(['like', 'unlike']),
  fieldSlug: z.string(),
  userId: z.string(),
});

export const EvaluationRowCollectionSchema = z.object({
  value: z.number(),
  fieldSlug: z.string(),
  userId: z.string(),
});
