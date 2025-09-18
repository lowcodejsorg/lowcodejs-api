Controllers Criados:

Collections (7 controllers)

- create.controller.ts - POST /collections
- update.controller.ts - PUT /collections/:id
- delete.controller.ts - DELETE /collections/:id
- list-paginated.controller.ts - GET /collections
- get-by-slug.controller.ts - GET /collections/slug/:slug
- send-to-trash.controller.ts - PATCH /collections/:id/trash
- remove-from-trash.controller.ts - PATCH /collections/:id/restore

Fields (5 controllers)

- create.controller.ts - POST /collections/:collectionSlug/fields
- update.controller.ts - PUT /collections/:collectionSlug/fields/:id
- get-by-id.controller.ts - GET /collections/:collectionSlug/fields/:id
- send-to-trash.controller.ts - PATCH
  /collections/:collectionSlug/fields/:id/trash
- remove-from-trash.controller.ts - PATCH
  /collections/:collectionSlug/fields/:id/restore

Rows (9 controllers)

- create.controller.ts - POST /collections/:collectionSlug/rows
- update.controller.ts - PUT /collections/:collectionSlug/rows/:id
- get-by-id.controller.ts - GET /collections/:collectionSlug/rows/:id
- list-paginated.controller.ts - GET /collections/:collectionSlug/rows
- delete.controller.ts - DELETE /collections/:collectionSlug/rows/:id
- send-to-trash.controller.ts - PATCH
  /collections/:collectionSlug/rows/:id/trash
- remove-from-trash.controller.ts - PATCH
  /collections/:collectionSlug/rows/:id/restore
- reaction.controller.ts - POST /collections/:collectionSlug/rows/:id/reaction
- evaluation.controller.ts - POST
  /collections/:collectionSlug/rows/:id/evaluation

Profile (2 controllers)

- get.controller.ts - GET /profile
- update.controller.ts - PUT /profile

Permissions (1 controller)

- list.controller.ts - GET /permissions

User Groups (2 controllers adicionais)

- list.controller.ts - GET /user-group/list
- list-paginated.controller.ts - GET /user-group

Authentication Recovery (3 controllers)

- request-code.controller.ts - POST /authentication/recovery/request-code
- validate-code.controller.ts - POST /authentication/recovery/validate-code
- update-password.controller.ts - PUT /authentication/recovery/update-password

Todos os controllers seguem o padrão estabelecido no projeto:

- Usam decorators do fastify-decorators
- Implementam autenticação via AuthenticationMiddleware onde necessário
- Utilizam os validators adequados para validação de entrada
- Seguem o padrão de resposta com Either para tratamento de erros
- Mantêm consistência nos códigos de status HTTP
- Incluem documentação OpenAPI com tags e descrições
