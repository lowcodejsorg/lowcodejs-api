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

- create.controller.ts - POST /collections/:slug/fields
- update.controller.ts - PUT /collections/:slug/fields/:id
- get-by-id.controller.ts - GET /collections/:slug/fields/:id
- send-to-trash.controller.ts - PATCH /collections/:slug/fields/:id/trash
- remove-from-trash.controller.ts - PATCH /collections/:slug/fields/:id/restore

Rows (9 controllers)

- create.controller.ts - POST /collections/:slug/rows
- update.controller.ts - PUT /collections/:slug/rows/:id
- get-by-id.controller.ts - GET /collections/:slug/rows/:id
- list-paginated.controller.ts - GET /collections/:slug/rows
- delete.controller.ts - DELETE /collections/:slug/rows/:id
- send-to-trash.controller.ts - PATCH /collections/:slug/rows/:id/trash
- remove-from-trash.controller.ts - PATCH /collections/:slug/rows/:id/restore
- reaction.controller.ts - POST /collections/:slug/rows/:id/reaction
- evaluation.controller.ts - POST /collections/:slug/rows/:id/evaluation

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
