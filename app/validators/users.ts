import z from 'zod';

const BaseSchema = z.object({
  name: z.string().trim(),
  email: z.email(),
  group: z.string(),
});

export const GetUserByIdSchema = z.object({
  _id: z.string(),
});

export const CreateUserSchema = BaseSchema.extend({
  password: z.string(),
});

export const UpdateUserSchema = BaseSchema.extend({
  password: z.string().optional(),
  status: z.enum(['active', 'inactive']),
});

export const ListUserPaginatedSchema = z.object({
  page: z.coerce.number().default(1),
  perPage: z.coerce.number().default(50),
  search: z.string().optional(),
  sub: z.string().optional(),
});

export const UpdateUserProfileSchema = z.object({
  name: z.string().trim(),
  email: z.email(),
  group: z.string(),

  currentPassword: z.string().trim().optional(),
  newPassword: z.string().trim().optional(),
  allowPasswordChange: z.coerce.boolean().default(false),
});
