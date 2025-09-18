import { Collection } from '@model/collection.model';
import mongoose, { RootFilterQuery, SortOrder } from 'mongoose';
import {
  CollectionSchema,
  Field,
  FIELD_TYPE,
  Optional,
  Row,
  Schema,
} from './entity.core';

const FieldTypeMapper: Record<FIELD_TYPE, Schema['type']> = {
  [FIELD_TYPE.TEXT_SHORT]: 'String',
  [FIELD_TYPE.TEXT_LONG]: 'String',
  [FIELD_TYPE.DROPDOWN]: 'String',
  [FIELD_TYPE.FILE]: 'ObjectId',
  [FIELD_TYPE.DATE]: 'Date',
  [FIELD_TYPE.RELATIONSHIP]: 'ObjectId',
  [FIELD_TYPE.FIELD_GROUP]: 'ObjectId',
  [FIELD_TYPE.EVALUATION]: 'ObjectId',
  [FIELD_TYPE.REACTION]: 'ObjectId',
  [FIELD_TYPE.CATEGORY]: 'String',
};

function mapperSchema(field: Field): CollectionSchema {
  const mapper = {
    [FIELD_TYPE.TEXT_SHORT]: {
      [field.slug]: {
        type: FieldTypeMapper[field.type] || 'String',
        required: Boolean(field.configuration?.required || false),
      },
    },

    [FIELD_TYPE.TEXT_LONG]: {
      [field.slug]: {
        type: FieldTypeMapper[field.type] || 'String',
        required: Boolean(field.configuration?.required || false),
      },
    },

    [FIELD_TYPE.DROPDOWN]: {
      [field.slug]: [
        {
          type: FieldTypeMapper[field.type] || 'String',
          required: Boolean(field.configuration?.required || false),
        },
      ],
    },

    [FIELD_TYPE.FILE]: {
      [field.slug]: [
        {
          type: FieldTypeMapper[field.type] || 'String',
          required: Boolean(field.configuration?.required || false),
          ref: 'Storage',
        },
      ],
    },

    [FIELD_TYPE.RELATIONSHIP]: {
      [field.slug]: [
        {
          type: FieldTypeMapper[field.type] || 'String',
          required: Boolean(field.configuration?.required || false),
          ref:
            field?.configuration?.relationship?.collection?.slug ?? undefined,
        },
      ],
    },

    [FIELD_TYPE.FIELD_GROUP]: {
      [field.slug]: [
        {
          type: FieldTypeMapper[field.type] || 'String',
          required: Boolean(field.configuration?.required || false),
          ref: field?.configuration?.group?.slug ?? undefined,
        },
      ],
    },

    [FIELD_TYPE.CATEGORY]: {
      [field.slug]: [
        {
          type: FieldTypeMapper[field.type] || 'String',
          required: Boolean(field.configuration?.required || false),
        },
      ],
    },

    [FIELD_TYPE.EVALUATION]: {
      [field.slug]: [
        {
          type: FieldTypeMapper[field.type] || 'Number',
          required: false,
          ref: 'Evaluation',
        },
      ],
    },

    [FIELD_TYPE.REACTION]: {
      [field.slug]: [
        {
          type: FieldTypeMapper[field.type] || 'String',
          required: false,
          ref: 'Reaction',
        },
      ],
    },
  };

  if (!(field.type in mapper) && !field?.configuration?.multiple) {
    return {
      [field.slug]: {
        type: FieldTypeMapper[field.type] || 'String',
        required: Boolean(field.configuration?.required || false),
      },
    };
  }

  if (!(field.type in mapper) && field?.configuration?.multiple) {
    return {
      [field.slug]: [
        {
          type: FieldTypeMapper[field.type] || 'String',
          required: Boolean(field.configuration?.required || false),
        },
      ],
    };
  }

  return mapper[field.type as keyof typeof mapper];
}

export function buildSchema(fields: Field[]): CollectionSchema {
  const schema: CollectionSchema = {
    trashedAt: {
      type: 'Date',
      default: null,
    },
    trashed: {
      type: 'Boolean',
      default: false,
    },
  };

  for (const field of fields) {
    Object.assign(schema, mapperSchema(field));
  }

  return schema;
}

interface Entity extends Omit<Row, '_id'>, mongoose.Document<Omit<Row, '_id'>> {
  _id: mongoose.Types.ObjectId;
}

export async function buildCollection(
  collection: Optional<
    import('@core/entity.core').Collection,
    '_id' | 'createdAt' | 'updatedAt' | 'trashed' | 'trashedAt'
  >,
): Promise<mongoose.Model<Entity>> {
  if (!collection?.slug) throw new Error('Collection slug not found');

  if (!collection?._schema) throw new Error('Collection schema not found');

  if (mongoose.models[collection.slug]) delete mongoose.models[collection.slug];

  const schema = new mongoose.Schema(
    {
      ...collection?._schema,
      _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    },
    {
      timestamps: true,
      toJSON: { virtuals: true },
      toObject: { virtuals: true },
    },
  );

  const model = (mongoose.models[collection?.slug] ||
    mongoose.model<Entity>(
      collection?.slug,
      schema,
      collection?.slug,
    )) as mongoose.Model<Entity>;

  await model?.createCollection();

  return model;
}

export function getRelationship(fields: Field[] = []): Field[] {
  const types = [
    FIELD_TYPE.RELATIONSHIP,
    FIELD_TYPE.FILE,
    FIELD_TYPE.FIELD_GROUP,
    FIELD_TYPE.REACTION,
    FIELD_TYPE.EVALUATION,
  ];

  return fields?.filter((field) => field.type && types.includes(field.type));
}

export async function buildPopulate(
  fields?: Field[],
): Promise<{ path: string }[]> {
  const relacionamentos = getRelationship(fields);
  const populate = [];

  for await (const field of relacionamentos) {
    if (
      ![
        FIELD_TYPE.FIELD_GROUP,
        FIELD_TYPE.REACTION,
        FIELD_TYPE.EVALUATION,
      ].includes(field.type)
    ) {
      populate.push({
        path: field.slug,
      });
    }

    if (field.type === FIELD_TYPE.REACTION) {
      populate.push({
        path: field.slug,
        populate: {
          path: 'user',
          select: 'name email _id',
        },
      });
    }

    if (field.type === FIELD_TYPE.EVALUATION) {
      populate.push({
        path: field.slug,
        populate: {
          path: 'user',
          select: 'name email _id',
        },
      });
    }

    if (field.type === FIELD_TYPE.FIELD_GROUP) {
      const groupId = field?.configuration?.group?._id?.toString();
      const group = await Collection.findOne({
        _id: groupId,
      });

      if (group) {
        const groupRelationship = getRelationship(group?.fields as Field[]);

        const groupFields = await buildPopulate(groupRelationship);

        populate.push({
          path: field.slug,
          ...(groupFields.length > 0 && {
            populate: groupFields,
          }),
        });
      }
    }
  }

  return populate;
}

type Query = Record<string, any>;

export function buildQuery(
  { search, trashed, ...rest }: Partial<Query>,
  fields: Field[] = [],
) {
  let query = fields?.reduce((acc, col) => {
    if (!col?.type || !col.slug || rest[col.slug] === undefined) return acc;

    const slug = String(col.slug?.toString());

    if ([FIELD_TYPE.TEXT_SHORT, FIELD_TYPE.TEXT_LONG].includes(col.type)) {
      acc[slug] = {
        $regex: normalize(rest[slug]?.toString()),
        $options: 'i',
      };
    }

    if (
      [
        FIELD_TYPE.RELATIONSHIP,
        FIELD_TYPE.DROPDOWN,
        FIELD_TYPE.CATEGORY,
      ].includes(col.type)
    ) {
      acc[slug] = {
        $in: rest[slug]?.toString().split(','),
      };
    }

    if (col.type === FIELD_TYPE.DATE) {
      if (!String(rest[slug])?.includes(',')) {
        const date = new Date(String(rest[slug]));
        const initial = new Date(date.setUTCHours(0, 0, 0, 0));
        const final = new Date(date.setUTCHours(23, 59, 59, 0));
        acc[slug] = {
          $gte: initial,
          $lte: final,
        };
      }

      if (String(rest[slug])?.includes(',')) {
        const [part_initial, part_final] = String(rest[slug]).split(',');
        const initial = new Date(part_initial).setUTCHours(0, 0, 0, 0);
        const final = new Date(part_final).setUTCHours(23, 59, 59, 0);

        acc[slug] = {
          $gte: new Date(initial),
          $lte: new Date(final),
        };
      }
    }

    return acc;
  }, {} as Query);

  if (search) {
    query = {
      ...query,
      $or: [
        ...fields.map((col) => {
          if (
            [FIELD_TYPE.TEXT_SHORT, FIELD_TYPE.TEXT_LONG].includes(col?.type)
          ) {
            const slug = String(col.slug?.toString());
            return {
              [slug]: {
                $regex: normalize(search),
                $options: 'i',
              },
            };
          }

          return null;
        }),
      ],
    };
  }

  if (trashed && trashed === 'true') query.trashed = true;
  else query.trashed = false;

  console.info(JSON.stringify(query, null, 2));

  return query;
}

export type QueryOrder = Record<
  string,
  number | string | boolean | null | RootFilterQuery<Row> | QueryOrder[]
>;

export function buildOrder(
  query: Partial<QueryOrder>,
  fields: Field[] = [],
): {
  [key: string]: SortOrder;
} {
  if (Object.keys(query).length === 0) return {};

  const order = fields?.reduce(
    (acc, col) => {
      if (!col?.type || !col.slug || !('order-'.concat(col.slug) in query))
        return acc;

      const slug = String(col.slug?.toString());

      acc[slug] = query['order-'.concat(slug)]?.toString() as SortOrder;

      return acc;
    },
    {} as {
      [key: string]: SortOrder;
    },
  );

  return order;
}

export function normalize(search: string): string {
  const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return escapedSearch
    .replace(/a/gi, '[aáàâãä]')
    .replace(/e/gi, '[eéèêë]')
    .replace(/i/gi, '[iíìîï]')
    .replace(/o/gi, '[oóòôõö]')
    .replace(/u/gi, '[uúùûü]')
    .replace(/c/gi, '[cç]')
    .replace(/n/gi, '[nñ]');
}
