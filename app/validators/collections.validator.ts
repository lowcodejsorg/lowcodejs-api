import z from 'zod';
import {
  CreateFieldCollectionSchema,
  UpdateFieldCollectionSchema,
} from './field-collection.validator';

const Configuration = z.object({
  style: z.enum(['gallery', 'list']).default('list'),
  visibility: z.enum(['public', 'restricted']).default('public'),
  collaboration: z.enum(['open', 'restricted']).default('open'),
  administrators: z.array(z.string()).default([]),
  fields: z.object({
    order_list: z.array(z.string()).default([]),
    order_form: z.array(z.string()).default([]),
  }),
});

export const GetCollectionByIdSchema = z.object({
  _id: z.string(),
});

export const GetCollectionBySlugSchema = z.object({
  slug: z.string(),
});

export const ListCollectionPaginatedSchema = z.object({
  page: z.coerce.number().default(1),
  perPage: z.coerce.number().default(50),
  search: z.string().optional(),
  trashed: z.enum(['true', 'false']).default('false').optional(),
  public: z.enum(['true', 'false']).default('false').optional(),
  type: z.enum(['collection', 'field-group']).optional(),
  name: z.string().optional(),
  slug: z.string().optional(),
});

export const CreateCollectionSchema = z.object({
  name: z.string().trim(),
  description: z.string().trim().nullable(),
  logo: z.string().trim().nullable(),
  fields: z.array(CreateFieldCollectionSchema).default([]),
  configuration: Configuration,
  owner: z.string().optional(),
});

export const UpdateCollectionSchema = z.object({
  name: z.string().trim(),
  description: z.string().trim().nullable(),
  logo: z.string().trim().nullable(),
  fields: z.array(UpdateFieldCollectionSchema).default([]),
  configuration: Configuration,
  _id: z.string().optional(),
  owner: z.string().optional(),
});
