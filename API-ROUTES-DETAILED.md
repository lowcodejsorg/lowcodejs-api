# LowCodeJS API - Mapeamento Detalhado de Rotas

> Documentação completa de todos os endpoints com payloads, responses e códigos HTTP

**Total de Endpoints**: 49 endpoints across 12 domínios
**Última Atualização**: 2025-09-30

---

## 📋 Índice por Domínio

1. [Authentication](#1-authentication-domain-8-endpoints) - 8 endpoints
2. [Collections](#2-collections-domain-7-endpoints) - 7 endpoints
3. [Fields](#3-fields-domain-5-endpoints) - 5 endpoints
4. [Rows](#4-rows-domain-9-endpoints) - 9 endpoints ⭐ **CORE**
5. [Users](#5-users-domain-4-endpoints) - 4 endpoints
6. [User Groups](#6-user-groups-domain-5-endpoints) - 5 endpoints
7. [Storage](#7-storage-domain-2-endpoints) - 2 endpoints
8. [Profile](#8-profile-domain-2-endpoints) - 2 endpoints
9. [Settings](#9-settings-domain-2-endpoints) - 2 endpoints
10. [Permissions](#10-permissions-domain-1-endpoint) - 1 endpoint
11. [Locales](#11-locales-domain-2-endpoints) - 2 endpoints
12. [System](#12-system-domain-3-endpoints) - 3 endpoints

---

## 1. Authentication Domain (8 endpoints)

### 1.1 POST /authentication/sign-in
**Autenticação**: Nenhuma
**Middleware**: Nenhum

#### Request
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Success Response
**Status**: `200 OK`
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "user@example.com",
  "status": "active",
  "group": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Admin",
    "slug": "admin",
    "description": "Administrator group"
  }
}
```
**Cookie Set**: `accessToken` (httpOnly, JWT token)

#### Error Responses
- **400 Bad Request** (`INVALID_PARAMETERS`): Email ou senha inválidos no formato
- **401 Unauthorized** (`INVALID_CREDENTIALS`): Email ou senha incorretos
- **404 Not Found** (`USER_NOT_FOUND`): Usuário não existe
- **500 Internal Server Error** (`SERVER_ERROR`): Erro ao processar login

---

### 1.2 POST /authentication/sign-up
**Autenticação**: Nenhuma
**Middleware**: Nenhum

#### Request
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "password123"
}
```

#### Success Response
**Status**: `201 Created`
```json
{
  "message": "User created successfully. Check your email for verification code.",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "user@example.com",
    "status": "inactive"
  }
}
```

#### Error Responses
- **400 Bad Request** (`INVALID_PARAMETERS`): Dados inválidos (email formato incorreto, senha curta)
- **409 Conflict** (`EMAIL_ALREADY_EXISTS`): Email já cadastrado
- **422 Unprocessable Entity** (`VALIDATION_ERROR`): Validação Zod falhou
- **500 Internal Server Error** (`SERVER_ERROR`): Erro ao criar usuário ou enviar email

---

### 1.3 POST /authentication/sign-out
**Autenticação**: Requerida (JWT Cookie)
**Middleware**: `AuthenticationMiddleware`

#### Request
Nenhum body necessário

#### Success Response
**Status**: `200 OK`
```json
{
  "message": "Signed out successfully"
}
```
**Cookie Cleared**: `accessToken`

#### Error Responses
- **401 Unauthorized** (`AUTHENTICATION_REQUIRED`): Token JWT ausente ou inválido
- **500 Internal Server Error** (`SERVER_ERROR`): Erro ao processar logout

---

### 1.4 POST /authentication/refresh-token
**Autenticação**: Requerida (JWT Cookie)
**Middleware**: `AuthenticationMiddleware`

#### Request
Nenhum body necessário

#### Success Response
**Status**: `200 OK`
```json
{
  "token": "new-jwt-token",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "user@example.com"
  }
}
```
**Cookie Refreshed**: `accessToken` (novo token JWT)

#### Error Responses
- **401 Unauthorized** (`AUTHENTICATION_REQUIRED`): Token JWT ausente ou inválido
- **401 Unauthorized** (`TOKEN_EXPIRED`): Token expirado
- **404 Not Found** (`USER_NOT_FOUND`): Usuário do token não existe mais
- **500 Internal Server Error** (`SERVER_ERROR`): Erro ao renovar token

---

### 1.5 GET /authentication/magic-link
**Autenticação**: Nenhuma
**Middleware**: Nenhum

#### Request (Query Parameters)
```
?code=ABC123
```

#### Success Response
**Status**: `200 OK`
```json
{
  "message": "Email verified successfully",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "user@example.com",
    "status": "active"
  }
}
```
**Cookie Set**: `accessToken` (httpOnly, JWT token)

#### Error Responses
- **400 Bad Request** (`INVALID_CODE`): Código inválido ou mal formatado
- **404 Not Found** (`CODE_NOT_FOUND`): Código não existe
- **410 Gone** (`CODE_EXPIRED`): Código expirado
- **409 Conflict** (`CODE_ALREADY_USED`): Código já foi usado
- **500 Internal Server Error** (`SERVER_ERROR`): Erro ao validar código

---

### 1.6 POST /authentication/recovery/request-code
**Autenticação**: Nenhuma
**Middleware**: Nenhum

#### Request
```json
{
  "email": "user@example.com"
}
```

#### Success Response
**Status**: `200 OK`
```json
{
  "message": "Recovery code sent to your email",
  "expiresIn": "15 minutes"
}
```

#### Error Responses
- **400 Bad Request** (`INVALID_EMAIL`): Email inválido
- **404 Not Found** (`USER_NOT_FOUND`): Usuário com esse email não existe
- **429 Too Many Requests** (`TOO_MANY_ATTEMPTS`): Muitas tentativas de recuperação
- **500 Internal Server Error** (`EMAIL_SEND_FAILED`): Erro ao enviar email
- **500 Internal Server Error** (`SERVER_ERROR`): Erro ao gerar código

---

### 1.7 POST /authentication/recovery/validate-code
**Autenticação**: Nenhuma
**Middleware**: Nenhum

#### Request
```json
{
  "code": "123456"
}
```

#### Success Response
**Status**: `200 OK`
```json
{
  "message": "Code validated successfully",
  "token": "temporary-reset-token",
  "expiresIn": "5 minutes"
}
```

#### Error Responses
- **400 Bad Request** (`INVALID_CODE`): Código mal formatado (deve ser 6 dígitos)
- **404 Not Found** (`CODE_NOT_FOUND`): Código não existe
- **410 Gone** (`CODE_EXPIRED`): Código expirado (mais de 15 minutos)
- **409 Conflict** (`CODE_ALREADY_USED`): Código já foi validado
- **500 Internal Server Error** (`SERVER_ERROR`): Erro ao validar código

---

### 1.8 PUT /authentication/recovery/update-password
**Autenticação**: Requerida (temporary reset token)
**Middleware**: Nenhum (usa token temporário do validate-code)

#### Request
```json
{
  "password": "newPassword123",
  "token": "temporary-reset-token"
}
```

#### Success Response
**Status**: `200 OK`
```json
{
  "message": "Password updated successfully"
}
```

#### Error Responses
- **400 Bad Request** (`INVALID_PASSWORD`): Senha não atende requisitos (mínimo 8 caracteres)
- **400 Bad Request** (`INVALID_TOKEN`): Token temporário inválido ou mal formatado
- **401 Unauthorized** (`TOKEN_EXPIRED`): Token temporário expirado
- **404 Not Found** (`USER_NOT_FOUND`): Usuário não encontrado
- **500 Internal Server Error** (`SERVER_ERROR`): Erro ao atualizar senha

---

## 2. Collections Domain (7 endpoints)

### 2.1 POST /collections
**Autenticação**: Requerida (JWT Cookie)
**Middleware**: `AuthenticationMiddleware`, `ResourceMiddleware('collections:write')`

#### Request
```json
{
  "name": "Users Collection",
  "description": "Collection for managing users",
  "type": "collection",
  "fields": [
    {
      "name": "Name",
      "type": "TEXT_SHORT",
      "configuration": {
        "required": true,
        "format": "ALPHA_NUMERIC"
      }
    }
  ],
  "configuration": {
    "style": "list",
    "visibility": "public",
    "collaboration": "open"
  }
}
```

#### Success Response
**Status**: `201 Created`
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Users Collection",
  "slug": "users-collection",
  "description": "Collection for managing users",
  "type": "collection",
  "_schema": {
    "name": { "type": "String", "required": true },
    "trashed": { "type": "Boolean", "default": false },
    "trashedAt": { "type": "Date", "default": null }
  },
  "fields": ["507f1f77bcf86cd799439012"],
  "configuration": {
    "style": "list",
    "visibility": "public",
    "collaboration": "open",
    "owner": "507f1f77bcf86cd799439010",
    "administrators": [],
    "fields": {
      "orderList": ["name"],
      "orderForm": ["name"]
    }
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### Error Responses
- **400 Bad Request** (`INVALID_PARAMETERS`): Parâmetros inválidos (nome vazio, tipo inválido)
- **401 Unauthorized** (`AUTHENTICATION_REQUIRED`): Token JWT ausente ou inválido
- **403 Forbidden** (`UNAUTHORIZED_RESOURCE`): Usuário sem permissão 'collections:write'
- **409 Conflict** (`SLUG_ALREADY_EXISTS`): Slug gerado já existe
- **422 Unprocessable Entity** (`VALIDATION_ERROR`): Validação Zod falhou
- **500 Internal Server Error** (`SCHEMA_BUILD_FAILED`): Erro ao construir schema dinâmico
- **500 Internal Server Error** (`SERVER_ERROR`): Erro ao criar collection

---

### 2.2 GET /collections/paginated
**Autenticação**: Requerida (JWT Cookie) ou Public
**Middleware**: `AuthenticationMiddleware`, `ResourceMiddleware('collections:read')`

#### Request (Query Parameters)
```
?page=1&perPage=20&search=user&trashed=false
```

#### Success Response
**Status**: `200 OK`
```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Users Collection",
      "slug": "users-collection",
      "description": "Collection for managing users",
      "logo": null,
      "type": "collection",
      "configuration": {
        "style": "list",
        "visibility": "public",
        "owner": {
          "_id": "507f1f77bcf86cd799439010",
          "name": "John Doe"
        }
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "perPage": 20,
    "lastPage": 5,
    "firstPage": 1
  }
}
```

#### Error Responses
- **400 Bad Request** (`INVALID_PAGINATION`): page ou perPage inválidos
- **401 Unauthorized** (`AUTHENTICATION_REQUIRED`): Quando não público e sem token
- **403 Forbidden** (`UNAUTHORIZED_RESOURCE`): Sem permissão 'collections:read'
- **500 Internal Server Error** (`SERVER_ERROR`): Erro ao buscar collections

---

### 2.3 GET /collections/:slug
**Autenticação**: Requerida (JWT Cookie) ou Public
**Middleware**: `AuthenticationMiddleware`, `ResourceMiddleware('collections:read')`

#### Request (URL Parameters)
```
/collections/users-collection
```

#### Success Response
**Status**: `200 OK`
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Users Collection",
  "slug": "users-collection",
  "description": "Collection for managing users",
  "logo": {
    "_id": "507f1f77bcf86cd799439020",
    "url": "/storage/logo.png",
    "filename": "logo.png"
  },
  "_schema": {
    "name": { "type": "String", "required": true }
  },
  "fields": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Name",
      "slug": "name",
      "type": "TEXT_SHORT",
      "configuration": {
        "required": true,
        "format": "ALPHA_NUMERIC"
      }
    }
  ],
  "configuration": {
    "style": "list",
    "visibility": "public",
    "collaboration": "open",
    "owner": {
      "_id": "507f1f77bcf86cd799439010",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "administrators": []
  },
  "trashed": false,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### Error Responses
- **400 Bad Request** (`INVALID_SLUG`): Slug mal formatado
- **401 Unauthorized** (`AUTHENTICATION_REQUIRED`): Quando não público e sem token
- **403 Forbidden** (`UNAUTHORIZED_RESOURCE`): Sem permissão para acessar
- **404 Not Found** (`COLLECTION_NOT_FOUND`): Collection com esse slug não existe
- **500 Internal Server Error** (`SERVER_ERROR`): Erro ao buscar collection

---

### 2.4 PUT /collections/:slug
**Autenticação**: Requerida (JWT Cookie)
**Middleware**: `AuthenticationMiddleware`, `ResourceMiddleware('collections:update')`

#### Request
**URL**: `/collections/users-collection`
```json
{
  "name": "Updated Users Collection",
  "description": "Updated description",
  "logo": "507f1f77bcf86cd799439020",
  "configuration": {
    "style": "gallery",
    "visibility": "restricted",
    "administrators": ["507f1f77bcf86cd799439030"]
  }
}
```

#### Success Response
**Status**: `200 OK`
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Updated Users Collection",
  "slug": "users-collection",
  "description": "Updated description",
  "logo": {
    "_id": "507f1f77bcf86cd799439020",
    "url": "/storage/logo.png"
  },
  "configuration": {
    "style": "gallery",
    "visibility": "restricted",
    "administrators": ["507f1f77bcf86cd799439030"]
  },
  "updatedAt": "2024-01-02T00:00:00.000Z"
}
```

#### Error Responses
- **400 Bad Request** (`INVALID_PARAMETERS`): Parâmetros inválidos
- **401 Unauthorized** (`AUTHENTICATION_REQUIRED`): Token ausente ou inválido
- **403 Forbidden** (`NOT_OWNER_OR_ADMIN`): Usuário não é owner nem administrador
- **403 Forbidden** (`UNAUTHORIZED_RESOURCE`): Sem permissão 'collections:update'
- **404 Not Found** (`COLLECTION_NOT_FOUND`): Collection não encontrada
- **422 Unprocessable Entity** (`VALIDATION_ERROR`): Validação falhou
- **500 Internal Server Error** (`SCHEMA_REBUILD_FAILED`): Erro ao reconstruir schema
- **500 Internal Server Error** (`SERVER_ERROR`): Erro ao atualizar

---

### 2.5 DELETE /collections/:slug
**Autenticação**: Requerida (JWT Cookie)
**Middleware**: `AuthenticationMiddleware`, `ResourceMiddleware('collections:delete')`

#### Request
**URL**: `/collections/users-collection`

#### Success Response
**Status**: `200 OK`
```json
{
  "message": "Collection deleted permanently",
  "deletedId": "507f1f77bcf86cd799439011"
}
```

#### Error Responses
- **401 Unauthorized** (`AUTHENTICATION_REQUIRED`): Token ausente ou inválido
- **403 Forbidden** (`NOT_OWNER`): Apenas o owner pode deletar permanentemente
- **403 Forbidden** (`UNAUTHORIZED_RESOURCE`): Sem permissão 'collections:delete'
- **404 Not Found** (`COLLECTION_NOT_FOUND`): Collection não encontrada
- **409 Conflict** (`HAS_RELATED_DATA`): Collection possui rows associadas
- **500 Internal Server Error** (`SERVER_ERROR`): Erro ao deletar

---

### 2.6 PATCH /collections/:slug/trash
**Autenticação**: Requerida (JWT Cookie)
**Middleware**: `AuthenticationMiddleware`, `ResourceMiddleware('collections:delete')`

#### Request
**URL**: `/collections/users-collection`

#### Success Response
**Status**: `200 OK`
```json
{
  "message": "Collection moved to trash",
  "collection": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Users Collection",
    "trashed": true,
    "trashedAt": "2024-01-02T00:00:00.000Z"
  }
}
```

#### Error Responses
- **401 Unauthorized** (`AUTHENTICATION_REQUIRED`): Token ausente ou inválido
- **403 Forbidden** (`NOT_OWNER_OR_ADMIN`): Apenas owner ou admin podem enviar para trash
- **403 Forbidden** (`UNAUTHORIZED_RESOURCE`): Sem permissão
- **404 Not Found** (`COLLECTION_NOT_FOUND`): Collection não encontrada
- **409 Conflict** (`ALREADY_TRASHED`): Collection já está na lixeira
- **500 Internal Server Error** (`SERVER_ERROR`): Erro ao mover para trash

---

### 2.7 PATCH /collections/:slug/restore
**Autenticação**: Requerida (JWT Cookie)
**Middleware**: `AuthenticationMiddleware`, `ResourceMiddleware('collections:update')`

#### Request
**URL**: `/collections/users-collection`

#### Success Response
**Status**: `200 OK`
```json
{
  "message": "Collection restored from trash",
  "collection": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Users Collection",
    "trashed": false,
    "trashedAt": null
  }
}
```

#### Error Responses
- **401 Unauthorized** (`AUTHENTICATION_REQUIRED`): Token ausente ou inválido
- **403 Forbidden** (`NOT_OWNER_OR_ADMIN`): Apenas owner ou admin podem restaurar
- **403 Forbidden** (`UNAUTHORIZED_RESOURCE`): Sem permissão
- **404 Not Found** (`COLLECTION_NOT_FOUND`): Collection não encontrada
- **409 Conflict** (`NOT_TRASHED`): Collection não está na lixeira
- **500 Internal Server Error** (`SERVER_ERROR`): Erro ao restaurar

---

## 3. Fields Domain (5 endpoints)

### 3.1 POST /collections/:slug/fields
**Autenticação**: Requerida (JWT Cookie)
**Middleware**: `AuthenticationMiddleware`, `ResourceMiddleware('fields:write')`

#### Request
**URL**: `/collections/users-collection/fields`
```json
{
  "name": "Email",
  "type": "TEXT_SHORT",
  "configuration": {
    "required": true,
    "format": "EMAIL",
    "listing": true,
    "filtering": true,
    "multiple": false,
    "defaultValue": null
  }
}
```

#### Success Response
**Status**: `201 Created`
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "name": "Email",
  "slug": "email",
  "type": "TEXT_SHORT",
  "configuration": {
    "required": true,
    "format": "EMAIL",
    "listing": true,
    "filtering": true,
    "multiple": false,
    "defaultValue": null,
    "relationship": null,
    "dropdown": [],
    "category": [],
    "group": null
  },
  "trashed": false,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```
**Side Effect**: Collection schema é reconstruído automaticamente

#### Error Responses
- **400 Bad Request** (`INVALID_FIELD_TYPE`): Tipo de campo inválido
- **400 Bad Request** (`INVALID_CONFIGURATION`): Configuração incompatível com o tipo
- **401 Unauthorized** (`AUTHENTICATION_REQUIRED`): Token ausente ou inválido
- **403 Forbidden** (`NOT_OWNER_OR_ADMIN`): Apenas owner ou admin podem criar fields
- **403 Forbidden** (`UNAUTHORIZED_RESOURCE`): Sem permissão 'fields:write'
- **404 Not Found** (`COLLECTION_NOT_FOUND`): Collection não encontrada
- **409 Conflict** (`FIELD_SLUG_EXISTS`): Já existe field com esse slug na collection
- **422 Unprocessable Entity** (`VALIDATION_ERROR`): Validação Zod falhou
- **500 Internal Server Error** (`SCHEMA_REBUILD_FAILED`): Erro ao reconstruir schema
- **500 Internal Server Error** (`SERVER_ERROR`): Erro ao criar field

---

### 3.2 GET /collections/:slug/fields/:_id
**Autenticação**: Requerida (JWT Cookie) ou Public
**Middleware**: `AuthenticationMiddleware`, `ResourceMiddleware('fields:read')`

#### Request
**URL**: `/collections/users-collection/fields/507f1f77bcf86cd799439012`

#### Success Response
**Status**: `200 OK`
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "name": "Email",
  "slug": "email",
  "type": "TEXT_SHORT",
  "configuration": {
    "required": true,
    "format": "EMAIL",
    "listing": true,
    "filtering": true,
    "multiple": false,
    "defaultValue": null,
    "relationship": null,
    "dropdown": [],
    "category": [],
    "group": null
  },
  "trashed": false,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### Error Responses
- **400 Bad Request** (`INVALID_ID`): ID mal formatado
- **401 Unauthorized** (`AUTHENTICATION_REQUIRED`): Quando não público e sem token
- **403 Forbidden** (`UNAUTHORIZED_RESOURCE`): Sem permissão 'fields:read'
- **404 Not Found** (`COLLECTION_NOT_FOUND`): Collection não encontrada
- **404 Not Found** (`FIELD_NOT_FOUND`): Field não encontrado
- **500 Internal Server Error** (`SERVER_ERROR`): Erro ao buscar field

---

### 3.3 PUT /collections/:slug/fields/:_id
**Autenticação**: Requerida (JWT Cookie)
**Middleware**: `AuthenticationMiddleware`, `ResourceMiddleware('fields:update')`

#### Request
**URL**: `/collections/users-collection/fields/507f1f77bcf86cd799439012`
```json
{
  "name": "Updated Email",
  "configuration": {
    "required": false,
    "listing": false,
    "filtering": true
  }
}
```

#### Success Response
**Status**: `200 OK`
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "name": "Updated Email",
  "slug": "email",
  "type": "TEXT_SHORT",
  "configuration": {
    "required": false,
    "format": "EMAIL",
    "listing": false,
    "filtering": true,
    "multiple": false
  },
  "updatedAt": "2024-01-02T00:00:00.000Z"
}
```
**Side Effect**: Collection schema é reconstruído automaticamente

#### Error Responses
- **400 Bad Request** (`INVALID_PARAMETERS`): Parâmetros inválidos
- **401 Unauthorized** (`AUTHENTICATION_REQUIRED`): Token ausente ou inválido
- **403 Forbidden** (`NOT_OWNER_OR_ADMIN`): Apenas owner ou admin podem atualizar
- **403 Forbidden** (`UNAUTHORIZED_RESOURCE`): Sem permissão 'fields:update'
- **404 Not Found** (`COLLECTION_NOT_FOUND`): Collection não encontrada
- **404 Not Found** (`FIELD_NOT_FOUND`): Field não encontrado
- **422 Unprocessable Entity** (`VALIDATION_ERROR`): Validação falhou
- **500 Internal Server Error** (`SCHEMA_REBUILD_FAILED`): Erro ao reconstruir schema
- **500 Internal Server Error** (`SERVER_ERROR`): Erro ao atualizar

---

### 3.4 PATCH /collections/:slug/fields/:_id/trash
**Autenticação**: Requerida (JWT Cookie)
**Middleware**: `AuthenticationMiddleware`, `ResourceMiddleware('fields:delete')`

#### Request
**URL**: `/collections/users-collection/fields/507f1f77bcf86cd799439012`

#### Success Response
**Status**: `200 OK`
```json
{
  "message": "Field moved to trash",
  "field": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Email",
    "trashed": true,
    "trashedAt": "2024-01-02T00:00:00.000Z"
  }
}
```
**Side Effect**: Collection schema é reconstruído (field removido)

#### Error Responses
- **401 Unauthorized** (`AUTHENTICATION_REQUIRED`): Token ausente ou inválido
- **403 Forbidden** (`NOT_OWNER_OR_ADMIN`): Apenas owner ou admin
- **403 Forbidden** (`UNAUTHORIZED_RESOURCE`): Sem permissão
- **404 Not Found** (`COLLECTION_NOT_FOUND`): Collection não encontrada
- **404 Not Found** (`FIELD_NOT_FOUND`): Field não encontrado
- **409 Conflict** (`ALREADY_TRASHED`): Field já está na lixeira
- **409 Conflict** (`HAS_DEPENDENT_DATA`): Field possui dados associados (rows)
- **500 Internal Server Error** (`SERVER_ERROR`): Erro ao mover para trash

---

### 3.5 PATCH /collections/:slug/fields/:_id/restore
**Autenticação**: Requerida (JWT Cookie)
**Middleware**: `AuthenticationMiddleware`, `ResourceMiddleware('fields:update')`

#### Request
**URL**: `/collections/users-collection/fields/507f1f77bcf86cd799439012`

#### Success Response
**Status**: `200 OK`
```json
{
  "message": "Field restored from trash",
  "field": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Email",
    "trashed": false,
    "trashedAt": null
  }
}
```
**Side Effect**: Collection schema é reconstruído (field readicionado)

#### Error Responses
- **401 Unauthorized** (`AUTHENTICATION_REQUIRED`): Token ausente ou inválido
- **403 Forbidden** (`NOT_OWNER_OR_ADMIN`): Apenas owner ou admin
- **403 Forbidden** (`UNAUTHORIZED_RESOURCE`): Sem permissão
- **404 Not Found** (`COLLECTION_NOT_FOUND`): Collection não encontrada
- **404 Not Found** (`FIELD_NOT_FOUND`): Field não encontrado
- **409 Conflict** (`NOT_TRASHED`): Field não está na lixeira
- **500 Internal Server Error** (`SERVER_ERROR`): Erro ao restaurar

---

## 4. Rows Domain (9 endpoints) ⭐ **CORE DATA LAYER**

### 4.1 POST /collections/:slug/rows
**Autenticação**: Requerida (JWT Cookie)
**Middleware**: `AuthenticationMiddleware`, `ResourceMiddleware('rows:write')`

#### Request
**URL**: `/collections/users-collection/rows`
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "age": 30,
  "tags": ["developer", "nodejs"],
  "profile-picture": ["507f1f77bcf86cd799439020"]
}
```
**Nota**: Campos dinâmicos baseados na collection schema

#### Success Response
**Status**: `201 Created`
```json
{
  "_id": "507f1f77bcf86cd799439050",
  "name": "John Doe",
  "email": "john@example.com",
  "age": 30,
  "tags": ["developer", "nodejs"],
  "profile-picture": [
    {
      "_id": "507f1f77bcf86cd799439020",
      "url": "/storage/profile.jpg",
      "filename": "profile.jpg"
    }
  ],
  "trashed": false,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### Error Responses
- **400 Bad Request** (`INVALID_PARAMETERS`): Parâmetros inválidos
- **401 Unauthorized** (`AUTHENTICATION_REQUIRED`): Token ausente ou inválido
- **403 Forbidden** (`UNAUTHORIZED_RESOURCE`): Sem permissão 'rows:write'
- **404 Not Found** (`COLLECTION_NOT_FOUND`): Collection não encontrada
- **422 Unprocessable Entity** (`REQUIRED_FIELD_MISSING`): Campo obrigatório ausente
- **422 Unprocessable Entity** (`INVALID_FIELD_TYPE`): Tipo de dado incompatível com field
- **422 Unprocessable Entity** (`VALIDATION_ERROR`): Validação Zod falhou
- **500 Internal Server Error** (`MODEL_BUILD_FAILED`): Erro ao construir modelo dinâmico
- **500 Internal Server Error** (`SERVER_ERROR`): Erro ao criar row

---

### 4.2 GET /collections/:slug/rows/paginated
**Autenticação**: Requerida (JWT Cookie) ou Public
**Middleware**: `AuthenticationMiddleware`, `ResourceMiddleware('rows:read')`

#### Request (Query Parameters)
**URL**: `/collections/users-collection/rows/paginated`
```
?page=1
&perPage=20
&search=john
&email=john@example.com
&age-initial=18
&age-final=65
&created-initial=2024-01-01
&created-final=2024-12-31
&order-name=asc
&trashed=false
```

**Query Parameters Dinâmicos**:
- `{field-slug}`: Filtro direto por campo
- `{date-field}-initial`: Data inicial para range
- `{date-field}-final`: Data final para range
- `order-{field-slug}`: Ordenação (asc/desc)

#### Success Response
**Status**: `200 OK`
```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439050",
      "name": "John Doe",
      "email": "john@example.com",
      "age": 30,
      "profile-picture": [
        {
          "_id": "507f1f77bcf86cd799439020",
          "url": "/storage/profile.jpg"
        }
      ],
      "likes": [
        {
          "_id": "507f1f77bcf86cd799439060",
          "type": "like",
          "user": {
            "_id": "507f1f77bcf86cd799439010",
            "name": "Jane Doe",
            "email": "jane@example.com"
          }
        }
      ],
      "rating": [
        {
          "_id": "507f1f77bcf86cd799439061",
          "value": 5,
          "user": {
            "_id": "507f1f77bcf86cd799439010",
            "name": "Jane Doe"
          }
        }
      ],
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "total": 500,
    "page": 1,
    "perPage": 20,
    "lastPage": 25,
    "firstPage": 1
  }
}
```
**Features**:
- Full-text search com normalização de acentos
- Filtros por campo específico
- Date range filtering
- Population de relationships, files, reactions, evaluations
- Population recursiva de nested relationships

#### Error Responses
- **400 Bad Request** (`INVALID_PAGINATION`): page ou perPage inválidos
- **400 Bad Request** (`INVALID_FILTER`): Filtro incompatível com tipo de campo
- **401 Unauthorized** (`AUTHENTICATION_REQUIRED`): Quando não público e sem token
- **403 Forbidden** (`UNAUTHORIZED_RESOURCE`): Sem permissão 'rows:read'
- **404 Not Found** (`COLLECTION_NOT_FOUND`): Collection não encontrada
- **500 Internal Server Error** (`MODEL_BUILD_FAILED`): Erro ao construir modelo
- **500 Internal Server Error** (`POPULATE_FAILED`): Erro na population strategy
- **500 Internal Server Error** (`SERVER_ERROR`): Erro ao buscar rows

---

### 4.3 GET /collections/:slug/rows/:_id
**Autenticação**: Requerida (JWT Cookie) ou Public
**Middleware**: `AuthenticationMiddleware`, `ResourceMiddleware('rows:read')`

#### Request
**URL**: `/collections/users-collection/rows/507f1f77bcf86cd799439050`

#### Success Response
**Status**: `200 OK`
```json
{
  "_id": "507f1f77bcf86cd799439050",
  "name": "John Doe",
  "email": "john@example.com",
  "age": 30,
  "tags": ["developer", "nodejs"],
  "profile-picture": [
    {
      "_id": "507f1f77bcf86cd799439020",
      "url": "/storage/profile.jpg",
      "filename": "profile.jpg",
      "type": "image/jpeg"
    }
  ],
  "company": {
    "_id": "507f1f77bcf86cd799439070",
    "name": "Tech Corp",
    "address": {
      "city": "San Francisco",
      "country": "USA"
    }
  },
  "likes": [
    {
      "_id": "507f1f77bcf86cd799439060",
      "type": "like",
      "user": {
        "_id": "507f1f77bcf86cd799439010",
        "name": "Jane Doe",
        "email": "jane@example.com"
      },
      "createdAt": "2024-01-01T12:00:00.000Z"
    }
  ],
  "rating": [
    {
      "_id": "507f1f77bcf86cd799439061",
      "value": 5,
      "user": {
        "_id": "507f1f77bcf86cd799439010",
        "name": "Jane Doe",
        "email": "jane@example.com"
      },
      "createdAt": "2024-01-01T12:30:00.000Z"
    }
  ],
  "trashed": false,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```
**Features**:
- Population completa de todos os relationships
- Population de files (Storage)
- Population de social features (Reactions, Evaluations) com user data
- Population recursiva de nested relationships e field groups

#### Error Responses
- **400 Bad Request** (`INVALID_ID`): ID mal formatado
- **401 Unauthorized** (`AUTHENTICATION_REQUIRED`): Quando não público e sem token
- **403 Forbidden** (`UNAUTHORIZED_RESOURCE`): Sem permissão 'rows:read'
- **404 Not Found** (`COLLECTION_NOT_FOUND`): Collection não encontrada
- **404 Not Found** (`ROW_NOT_FOUND`): Row não encontrado
- **500 Internal Server Error** (`MODEL_BUILD_FAILED`): Erro ao construir modelo
- **500 Internal Server Error** (`POPULATE_FAILED`): Erro na population
- **500 Internal Server Error** (`SERVER_ERROR`): Erro ao buscar row

---

### 4.4 PUT /collections/:slug/rows/:_id
**Autenticação**: Requerida (JWT Cookie)
**Middleware**: `AuthenticationMiddleware`, `ResourceMiddleware('rows:update')`

#### Request
**URL**: `/collections/users-collection/rows/507f1f77bcf86cd799439050`
```json
{
  "name": "John Updated Doe",
  "age": 31,
  "tags": ["developer", "nodejs", "typescript"]
}
```
**Nota**: Apenas campos fornecidos são atualizados (partial update)

#### Success Response
**Status**: `200 OK`
```json
{
  "_id": "507f1f77bcf86cd799439050",
  "name": "John Updated Doe",
  "email": "john@example.com",
  "age": 31,
  "tags": ["developer", "nodejs", "typescript"],
  "updatedAt": "2024-01-02T00:00:00.000Z"
}
```

#### Error Responses
- **400 Bad Request** (`INVALID_PARAMETERS`): Parâmetros inválidos
- **401 Unauthorized** (`AUTHENTICATION_REQUIRED`): Token ausente ou inválido
- **403 Forbidden** (`UNAUTHORIZED_RESOURCE`): Sem permissão 'rows:update'
- **403 Forbidden** (`NOT_OWNER`): Usuário não é owner do row (se collaboration: restricted)
- **404 Not Found** (`COLLECTION_NOT_FOUND`): Collection não encontrada
- **404 Not Found** (`ROW_NOT_FOUND`): Row não encontrado
- **422 Unprocessable Entity** (`VALIDATION_ERROR`): Validação falhou
- **422 Unprocessable Entity** (`INVALID_FIELD_TYPE`): Tipo incompatível
- **500 Internal Server Error** (`MODEL_BUILD_FAILED`): Erro ao construir modelo
- **500 Internal Server Error** (`SERVER_ERROR`): Erro ao atualizar

---

### 4.5 DELETE /collections/:slug/rows/:_id
**Autenticação**: Requerida (JWT Cookie)
**Middleware**: `AuthenticationMiddleware`, `ResourceMiddleware('rows:delete')`

#### Request
**URL**: `/collections/users-collection/rows/507f1f77bcf86cd799439050`

#### Success Response
**Status**: `200 OK`
```json
{
  "message": "Row deleted permanently",
  "deletedId": "507f1f77bcf86cd799439050"
}
```

#### Error Responses
- **401 Unauthorized** (`AUTHENTICATION_REQUIRED`): Token ausente ou inválido
- **403 Forbidden** (`UNAUTHORIZED_RESOURCE`): Sem permissão 'rows:delete'
- **403 Forbidden** (`NOT_OWNER`): Usuário não é owner do row
- **404 Not Found** (`COLLECTION_NOT_FOUND`): Collection não encontrada
- **404 Not Found** (`ROW_NOT_FOUND`): Row não encontrado
- **409 Conflict** (`HAS_REFERENCES`): Row possui referências de outras collections
- **500 Internal Server Error** (`MODEL_BUILD_FAILED`): Erro ao construir modelo
- **500 Internal Server Error** (`SERVER_ERROR`): Erro ao deletar

---

### 4.6 PATCH /collections/:slug/rows/:_id/trash
**Autenticação**: Requerida (JWT Cookie)
**Middleware**: `AuthenticationMiddleware`, `ResourceMiddleware('rows:delete')`

#### Request
**URL**: `/collections/users-collection/rows/507f1f77bcf86cd799439050`

#### Success Response
**Status**: `200 OK`
```json
{
  "message": "Row moved to trash",
  "row": {
    "_id": "507f1f77bcf86cd799439050",
    "name": "John Doe",
    "trashed": true,
    "trashedAt": "2024-01-02T00:00:00.000Z"
  }
}
```

#### Error Responses
- **401 Unauthorized** (`AUTHENTICATION_REQUIRED`): Token ausente ou inválido
- **403 Forbidden** (`UNAUTHORIZED_RESOURCE`): Sem permissão
- **403 Forbidden** (`NOT_OWNER`): Usuário não é owner do row
- **404 Not Found** (`COLLECTION_NOT_FOUND`): Collection não encontrada
- **404 Not Found** (`ROW_NOT_FOUND`): Row não encontrado
- **409 Conflict** (`ALREADY_TRASHED`): Row já está na lixeira
- **500 Internal Server Error** (`SERVER_ERROR`): Erro ao mover para trash

---

### 4.7 PATCH /collections/:slug/rows/:_id/restore
**Autenticação**: Requerida (JWT Cookie)
**Middleware**: `AuthenticationMiddleware`, `ResourceMiddleware('rows:update')`

#### Request
**URL**: `/collections/users-collection/rows/507f1f77bcf86cd799439050`

#### Success Response
**Status**: `200 OK`
```json
{
  "message": "Row restored from trash",
  "row": {
    "_id": "507f1f77bcf86cd799439050",
    "name": "John Doe",
    "trashed": false,
    "trashedAt": null
  }
}
```

#### Error Responses
- **401 Unauthorized** (`AUTHENTICATION_REQUIRED`): Token ausente ou inválido
- **403 Forbidden** (`UNAUTHORIZED_RESOURCE`): Sem permissão
- **403 Forbidden** (`NOT_OWNER`): Usuário não é owner do row
- **404 Not Found** (`COLLECTION_NOT_FOUND`): Collection não encontrada
- **404 Not Found** (`ROW_NOT_FOUND`): Row não encontrado
- **409 Conflict** (`NOT_TRASHED`): Row não está na lixeira
- **500 Internal Server Error** (`SERVER_ERROR`): Erro ao restaurar

---

### 4.8 PATCH /collections/:slug/rows/:_id/reaction
**Autenticação**: Requerida (JWT Cookie)
**Middleware**: `AuthenticationMiddleware`, `ResourceMiddleware('rows:update')`

#### Request
**URL**: `/collections/users-collection/rows/507f1f77bcf86cd799439050`
```json
{
  "type": "like",
  "field": "likes"
}
```
**Tipos**: `like` | `unlike`

#### Success Response
**Status**: `200 OK`
```json
{
  "message": "Reaction added",
  "reaction": {
    "_id": "507f1f77bcf86cd799439060",
    "type": "like",
    "user": {
      "_id": "507f1f77bcf86cd799439010",
      "name": "Jane Doe",
      "email": "jane@example.com"
    },
    "createdAt": "2024-01-02T00:00:00.000Z"
  },
  "row": {
    "_id": "507f1f77bcf86cd799439050",
    "likes": ["507f1f77bcf86cd799439060"]
  }
}
```
**Comportamento**:
- Se `type: "like"` e usuário já deu like → Remove o like anterior
- Se `type: "unlike"` → Remove qualquer like do usuário
- Se `type: "like"` e usuário não deu like → Cria novo reaction

#### Error Responses
- **400 Bad Request** (`INVALID_REACTION_TYPE`): Tipo inválido (não é 'like' ou 'unlike')
- **400 Bad Request** (`FIELD_NOT_REACTION_TYPE`): Campo não é do tipo REACTION
- **401 Unauthorized** (`AUTHENTICATION_REQUIRED`): Token ausente ou inválido
- **403 Forbidden** (`UNAUTHORIZED_RESOURCE`): Sem permissão
- **404 Not Found** (`COLLECTION_NOT_FOUND`): Collection não encontrada
- **404 Not Found** (`ROW_NOT_FOUND`): Row não encontrado
- **404 Not Found** (`FIELD_NOT_FOUND`): Field especificado não existe
- **500 Internal Server Error** (`MODEL_BUILD_FAILED`): Erro ao construir modelo
- **500 Internal Server Error** (`SERVER_ERROR`): Erro ao processar reaction

---

### 4.9 PATCH /collections/:slug/rows/:_id/evaluation
**Autenticação**: Requerida (JWT Cookie)
**Middleware**: `AuthenticationMiddleware`, `ResourceMiddleware('rows:update')`

#### Request
**URL**: `/collections/users-collection/rows/507f1f77bcf86cd799439050`
```json
{
  "value": 5,
  "field": "rating"
}
```
**Value**: Número (tipicamente 1-5 para rating de estrelas)

#### Success Response
**Status**: `200 OK`
```json
{
  "message": "Evaluation added",
  "evaluation": {
    "_id": "507f1f77bcf86cd799439061",
    "value": 5,
    "user": {
      "_id": "507f1f77bcf86cd799439010",
      "name": "Jane Doe",
      "email": "jane@example.com"
    },
    "createdAt": "2024-01-02T00:00:00.000Z"
  },
  "row": {
    "_id": "507f1f77bcf86cd799439050",
    "rating": ["507f1f77bcf86cd799439061"]
  },
  "statistics": {
    "average": 4.5,
    "count": 10,
    "total": 45
  }
}
```
**Comportamento**:
- Permite múltiplas avaliações do mesmo usuário (histórico)
- Calcula estatísticas (média, contagem, total)

#### Error Responses
- **400 Bad Request** (`INVALID_VALUE`): Value não é numérico ou fora do range permitido
- **400 Bad Request** (`FIELD_NOT_EVALUATION_TYPE`): Campo não é do tipo EVALUATION
- **401 Unauthorized** (`AUTHENTICATION_REQUIRED`): Token ausente ou inválido
- **403 Forbidden** (`UNAUTHORIZED_RESOURCE`): Sem permissão
- **404 Not Found** (`COLLECTION_NOT_FOUND`): Collection não encontrada
- **404 Not Found** (`ROW_NOT_FOUND`): Row não encontrado
- **404 Not Found** (`FIELD_NOT_FOUND`): Field especificado não existe
- **500 Internal Server Error** (`MODEL_BUILD_FAILED`): Erro ao construir modelo
- **500 Internal Server Error** (`SERVER_ERROR`): Erro ao processar evaluation

---

## 5. Users Domain (4 endpoints)

### 5.1 POST /users
**Autenticação**: Requerida (JWT Cookie)
**Middleware**: `AuthenticationMiddleware`, `ResourceMiddleware('users:write')`

#### Request
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "password123",
  "group": "507f1f77bcf86cd799439012",
  "status": "active"
}
```

#### Success Response
**Status**: `201 Created`
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "status": "active",
  "group": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Editor",
    "slug": "editor"
  },
  "trashed": false,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```
**Nota**: Password não é retornado na response

#### Error Responses
- **400 Bad Request** (`INVALID_PARAMETERS`): Parâmetros inválidos
- **400 Bad Request** (`INVALID_PASSWORD`): Senha não atende requisitos (mínimo 8 caracteres)
- **401 Unauthorized** (`AUTHENTICATION_REQUIRED`): Token ausente ou inválido
- **403 Forbidden** (`UNAUTHORIZED_RESOURCE`): Sem permissão 'users:write'
- **404 Not Found** (`GROUP_NOT_FOUND`): UserGroup especificado não existe
- **409 Conflict** (`EMAIL_ALREADY_EXISTS`): Email já cadastrado
- **422 Unprocessable Entity** (`VALIDATION_ERROR`): Validação Zod falhou
- **500 Internal Server Error** (`SERVER_ERROR`): Erro ao criar usuário

---

### 5.2 GET /users/paginated
**Autenticação**: Requerida (JWT Cookie)
**Middleware**: `AuthenticationMiddleware`, `ResourceMiddleware('users:read')`

#### Request (Query Parameters)
```
?page=1&perPage=20&search=jane&sub=507f1f77bcf86cd799439012&trashed=false
```
**Parameters**:
- `page`: Número da página
- `perPage`: Itens por página
- `search`: Busca por name ou email
- `sub`: Filtrar por grupo (UserGroup _id)
- `trashed`: Filtrar por status de trash

#### Success Response
**Status**: `200 OK`
```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "status": "active",
      "group": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Editor",
        "slug": "editor",
        "permissions": ["collections:read", "rows:read"]
      },
      "trashed": false,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "perPage": 20,
    "lastPage": 3,
    "firstPage": 1
  }
}
```

#### Error Responses
- **400 Bad Request** (`INVALID_PAGINATION`): page ou perPage inválidos
- **401 Unauthorized** (`AUTHENTICATION_REQUIRED`): Token ausente ou inválido
- **403 Forbidden** (`UNAUTHORIZED_RESOURCE`): Sem permissão 'users:read'
- **500 Internal Server Error** (`SERVER_ERROR`): Erro ao buscar usuários

---

### 5.3 GET /users/:_id
**Autenticação**: Requerida (JWT Cookie)
**Middleware**: `AuthenticationMiddleware`, `ResourceMiddleware('users:read')`

#### Request
**URL**: `/users/507f1f77bcf86cd799439011`

#### Success Response
**Status**: `200 OK`
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "status": "active",
  "group": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Editor",
    "slug": "editor",
    "description": "Editor group with limited permissions",
    "permissions": [
      {
        "_id": "507f1f77bcf86cd799439020",
        "name": "Read Collections",
        "slug": "collections:read"
      }
    ]
  },
  "trashed": false,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### Error Responses
- **400 Bad Request** (`INVALID_ID`): ID mal formatado
- **401 Unauthorized** (`AUTHENTICATION_REQUIRED`): Token ausente ou inválido
- **403 Forbidden** (`UNAUTHORIZED_RESOURCE`): Sem permissão 'users:read'
- **404 Not Found** (`USER_NOT_FOUND`): Usuário não encontrado
- **500 Internal Server Error** (`SERVER_ERROR`): Erro ao buscar usuário

---

### 5.4 PATCH /users/:_id
**Autenticação**: Requerida (JWT Cookie)
**Middleware**: `AuthenticationMiddleware`, `ResourceMiddleware('users:update')`

#### Request
**URL**: `/users/507f1f77bcf86cd799439011`
```json
{
  "name": "Jane Updated Doe",
  "email": "jane.updated@example.com",
  "group": "507f1f77bcf86cd799439013",
  "status": "inactive",
  "password": "newPassword123"
}
```
**Nota**: Todos os campos são opcionais (partial update)

#### Success Response
**Status**: `200 OK`
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Jane Updated Doe",
  "email": "jane.updated@example.com",
  "status": "inactive",
  "group": {
    "_id": "507f1f77bcf86cd799439013",
    "name": "Admin",
    "slug": "admin"
  },
  "updatedAt": "2024-01-02T00:00:00.000Z"
}
```

#### Error Responses
- **400 Bad Request** (`INVALID_PARAMETERS`): Parâmetros inválidos
- **400 Bad Request** (`INVALID_PASSWORD`): Senha não atende requisitos
- **401 Unauthorized** (`AUTHENTICATION_REQUIRED`): Token ausente ou inválido
- **403 Forbidden** (`UNAUTHORIZED_RESOURCE`): Sem permissão 'users:update'
- **403 Forbidden** (`CANNOT_UPDATE_SELF_GROUP`): Usuário não pode alterar próprio grupo
- **404 Not Found** (`USER_NOT_FOUND`): Usuário não encontrado
- **404 Not Found** (`GROUP_NOT_FOUND`): UserGroup especificado não existe
- **409 Conflict** (`EMAIL_ALREADY_EXISTS`): Email já existe (outro usuário)
- **422 Unprocessable Entity** (`VALIDATION_ERROR`): Validação falhou
- **500 Internal Server Error** (`SERVER_ERROR`): Erro ao atualizar

---

## 6. User Groups Domain (5 endpoints)

### 6.1 POST /user-group
**Autenticação**: Requerida (JWT Cookie)
**Middleware**: `AuthenticationMiddleware`, `ResourceMiddleware('user-group:write')`

#### Request
```json
{
  "name": "Moderator",
  "description": "Moderator group with limited admin permissions",
  "permissions": [
    "507f1f77bcf86cd799439020",
    "507f1f77bcf86cd799439021",
    "507f1f77bcf86cd799439022"
  ]
}
```

#### Success Response
**Status**: `201 Created`
```json
{
  "_id": "507f1f77bcf86cd799439015",
  "name": "Moderator",
  "slug": "moderator",
  "description": "Moderator group with limited admin permissions",
  "permissions": [
    {
      "_id": "507f1f77bcf86cd799439020",
      "name": "Read Collections",
      "slug": "collections:read"
    },
    {
      "_id": "507f1f77bcf86cd799439021",
      "name": "Update Collections",
      "slug": "collections:update"
    }
  ],
  "trashed": false,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### Error Responses
- **400 Bad Request** (`INVALID_PARAMETERS`): Parâmetros inválidos (nome vazio)
- **401 Unauthorized** (`AUTHENTICATION_REQUIRED`): Token ausente ou inválido
- **403 Forbidden** (`UNAUTHORIZED_RESOURCE`): Sem permissão 'user-group:write'
- **404 Not Found** (`PERMISSION_NOT_FOUND`): Uma ou mais permissões não existem
- **409 Conflict** (`SLUG_ALREADY_EXISTS`): Slug gerado já existe
- **422 Unprocessable Entity** (`VALIDATION_ERROR`): Validação Zod falhou
- **500 Internal Server Error** (`SERVER_ERROR`): Erro ao criar user group

---

### 6.2 GET /user-group
**Autenticação**: Requerida (JWT Cookie)
**Middleware**: `AuthenticationMiddleware`, `ResourceMiddleware('user-group:read')`

#### Request
Nenhum parâmetro necessário

#### Success Response
**Status**: `200 OK`
```json
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Admin",
    "slug": "admin",
    "description": "Administrator group",
    "permissions": [
      {
        "_id": "507f1f77bcf86cd799439020",
        "name": "Read Collections",
        "slug": "collections:read"
      }
    ]
  },
  {
    "_id": "507f1f77bcf86cd799439015",
    "name": "Moderator",
    "slug": "moderator",
    "description": "Moderator group"
  }
]
```

#### Error Responses
- **401 Unauthorized** (`AUTHENTICATION_REQUIRED`): Token ausente ou inválido
- **403 Forbidden** (`UNAUTHORIZED_RESOURCE`): Sem permissão 'user-group:read'
- **500 Internal Server Error** (`SERVER_ERROR`): Erro ao buscar grupos

---

### 6.3 GET /user-group/paginated
**Autenticação**: Requerida (JWT Cookie)
**Middleware**: `AuthenticationMiddleware`, `ResourceMiddleware('user-group:read')`

#### Request (Query Parameters)
```
?page=1&perPage=20&search=admin&trashed=false
```

#### Success Response
**Status**: `200 OK`
```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Admin",
      "slug": "admin",
      "description": "Administrator group",
      "permissions": ["collections:read", "collections:write"],
      "trashed": false,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "total": 10,
    "page": 1,
    "perPage": 20,
    "lastPage": 1,
    "firstPage": 1
  }
}
```

#### Error Responses
- **400 Bad Request** (`INVALID_PAGINATION`): page ou perPage inválidos
- **401 Unauthorized** (`AUTHENTICATION_REQUIRED`): Token ausente ou inválido
- **403 Forbidden** (`UNAUTHORIZED_RESOURCE`): Sem permissão 'user-group:read'
- **500 Internal Server Error** (`SERVER_ERROR`): Erro ao buscar grupos

---

### 6.4 GET /user-group/:_id
**Autenticação**: Requerida (JWT Cookie)
**Middleware**: `AuthenticationMiddleware`, `ResourceMiddleware('user-group:read')`

#### Request
**URL**: `/user-group/507f1f77bcf86cd799439012`

#### Success Response
**Status**: `200 OK`
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "name": "Admin",
  "slug": "admin",
  "description": "Administrator group with full permissions",
  "permissions": [
    {
      "_id": "507f1f77bcf86cd799439020",
      "name": "Read Collections",
      "slug": "collections:read",
      "description": "Permission to read collections"
    },
    {
      "_id": "507f1f77bcf86cd799439021",
      "name": "Write Collections",
      "slug": "collections:write",
      "description": "Permission to create collections"
    }
  ],
  "trashed": false,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### Error Responses
- **400 Bad Request** (`INVALID_ID`): ID mal formatado
- **401 Unauthorized** (`AUTHENTICATION_REQUIRED`): Token ausente ou inválido
- **403 Forbidden** (`UNAUTHORIZED_RESOURCE`): Sem permissão 'user-group:read'
- **404 Not Found** (`USER_GROUP_NOT_FOUND`): User group não encontrado
- **500 Internal Server Error** (`SERVER_ERROR`): Erro ao buscar grupo

---

### 6.5 PATCH /user-group/:_id
**Autenticação**: Requerida (JWT Cookie)
**Middleware**: `AuthenticationMiddleware`, `ResourceMiddleware('user-group:update')`

#### Request
**URL**: `/user-group/507f1f77bcf86cd799439012`
```json
{
  "description": "Updated description",
  "permissions": [
    "507f1f77bcf86cd799439020",
    "507f1f77bcf86cd799439022"
  ]
}
```
**Nota**: Nome não pode ser alterado (slug é imutável)

#### Success Response
**Status**: `200 OK`
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "name": "Admin",
  "slug": "admin",
  "description": "Updated description",
  "permissions": [
    {
      "_id": "507f1f77bcf86cd799439020",
      "name": "Read Collections",
      "slug": "collections:read"
    },
    {
      "_id": "507f1f77bcf86cd799439022",
      "name": "Delete Collections",
      "slug": "collections:delete"
    }
  ],
  "updatedAt": "2024-01-02T00:00:00.000Z"
}
```

#### Error Responses
- **400 Bad Request** (`INVALID_PARAMETERS`): Parâmetros inválidos
- **401 Unauthorized** (`AUTHENTICATION_REQUIRED`): Token ausente ou inválido
- **403 Forbidden** (`UNAUTHORIZED_RESOURCE`): Sem permissão 'user-group:update'
- **403 Forbidden** (`CANNOT_UPDATE_DEFAULT_GROUP`): Grupos padrão (admin, user) não podem ser alterados
- **404 Not Found** (`USER_GROUP_NOT_FOUND`): User group não encontrado
- **404 Not Found** (`PERMISSION_NOT_FOUND`): Uma ou mais permissões não existem
- **422 Unprocessable Entity** (`VALIDATION_ERROR`): Validação falhou
- **500 Internal Server Error** (`SERVER_ERROR`): Erro ao atualizar

---

## 7. Storage Domain (2 endpoints)

### 7.1 POST /storage
**Autenticação**: Requerida (JWT Cookie)
**Middleware**: `AuthenticationMiddleware`, `ResourceMiddleware('storage:write')`

#### Request
**Content-Type**: `multipart/form-data`
```
file: [binary file data]
```

#### Success Response
**Status**: `201 Created`
```json
{
  "_id": "507f1f77bcf86cd799439020",
  "url": "/storage/1704067200000-profile.jpg",
  "filename": "1704067200000-profile.jpg",
  "type": "image/jpeg",
  "size": 102400,
  "trashed": false,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```
**File Location**: `_storage/1704067200000-profile.jpg`

#### Error Responses
- **400 Bad Request** (`NO_FILE_UPLOADED`): Nenhum arquivo foi enviado
- **400 Bad Request** (`INVALID_FILE_TYPE`): Tipo de arquivo não permitido
- **401 Unauthorized** (`AUTHENTICATION_REQUIRED`): Token ausente ou inválido
- **403 Forbidden** (`UNAUTHORIZED_RESOURCE`): Sem permissão 'storage:write'
- **413 Payload Too Large** (`FILE_TOO_LARGE`): Arquivo excede tamanho máximo
- **500 Internal Server Error** (`FILE_SAVE_FAILED`): Erro ao salvar arquivo no disco
- **500 Internal Server Error** (`SERVER_ERROR`): Erro ao criar registro de storage

---

### 7.2 DELETE /storage/:_id
**Autenticação**: Requerida (JWT Cookie)
**Middleware**: `AuthenticationMiddleware`, `ResourceMiddleware('storage:delete')`

#### Request
**URL**: `/storage/507f1f77bcf86cd799439020`

#### Success Response
**Status**: `200 OK`
```json
{
  "message": "File deleted successfully",
  "deletedId": "507f1f77bcf86cd799439020"
}
```
**Side Effect**: Arquivo físico é removido de `_storage/`

#### Error Responses
- **400 Bad Request** (`INVALID_ID`): ID mal formatado
- **401 Unauthorized** (`AUTHENTICATION_REQUIRED`): Token ausente ou inválido
- **403 Forbidden** (`UNAUTHORIZED_RESOURCE`): Sem permissão 'storage:delete'
- **403 Forbidden** (`NOT_OWNER`): Usuário não é owner do arquivo
- **404 Not Found** (`FILE_NOT_FOUND`): Arquivo não encontrado no banco
- **409 Conflict** (`FILE_IN_USE`): Arquivo está sendo referenciado por rows
- **500 Internal Server Error** (`FILE_DELETE_FAILED`): Erro ao deletar arquivo do disco
- **500 Internal Server Error** (`SERVER_ERROR`): Erro ao deletar registro

---

## 8. Profile Domain (2 endpoints)

### 8.1 GET /profile
**Autenticação**: Requerida (JWT Cookie)
**Middleware**: `AuthenticationMiddleware`

#### Request
Nenhum parâmetro necessário

#### Success Response
**Status**: `200 OK`
```json
{
  "_id": "507f1f77bcf86cd799439010",
  "name": "John Doe",
  "email": "john@example.com",
  "status": "active",
  "group": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Admin",
    "slug": "admin",
    "description": "Administrator group",
    "permissions": [
      {
        "_id": "507f1f77bcf86cd799439020",
        "name": "Read Collections",
        "slug": "collections:read"
      }
    ]
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### Error Responses
- **401 Unauthorized** (`AUTHENTICATION_REQUIRED`): Token ausente ou inválido
- **404 Not Found** (`USER_NOT_FOUND`): Usuário do token não existe mais
- **500 Internal Server Error** (`SERVER_ERROR`): Erro ao buscar perfil

---

### 8.2 PUT /profile
**Autenticação**: Requerida (JWT Cookie)
**Middleware**: `AuthenticationMiddleware`

#### Request
```json
{
  "name": "John Updated Doe",
  "email": "john.updated@example.com",
  "currentPassword": "currentPassword123",
  "newPassword": "newPassword123"
}
```
**Nota**:
- `name` e `email` são opcionais
- Para alterar senha, `currentPassword` e `newPassword` são obrigatórios
- Grupo não pode ser alterado pelo próprio usuário

#### Success Response
**Status**: `200 OK`
```json
{
  "_id": "507f1f77bcf86cd799439010",
  "name": "John Updated Doe",
  "email": "john.updated@example.com",
  "status": "active",
  "group": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Admin",
    "slug": "admin"
  },
  "updatedAt": "2024-01-02T00:00:00.000Z"
}
```

#### Error Responses
- **400 Bad Request** (`INVALID_PARAMETERS`): Parâmetros inválidos
- **400 Bad Request** (`INVALID_PASSWORD`): Nova senha não atende requisitos
- **401 Unauthorized** (`AUTHENTICATION_REQUIRED`): Token ausente ou inválido
- **401 Unauthorized** (`INVALID_CURRENT_PASSWORD`): Senha atual incorreta
- **404 Not Found** (`USER_NOT_FOUND`): Usuário não encontrado
- **409 Conflict** (`EMAIL_ALREADY_EXISTS`): Email já existe (outro usuário)
- **422 Unprocessable Entity** (`VALIDATION_ERROR`): Validação falhou
- **422 Unprocessable Entity** (`PASSWORD_CHANGE_NOT_ALLOWED`): Mudança de senha desabilitada
- **500 Internal Server Error** (`SERVER_ERROR`): Erro ao atualizar perfil

---

## 9. Settings Domain (2 endpoints)

### 9.1 GET /setting
**Autenticação**: Requerida (JWT Cookie)
**Middleware**: `AuthenticationMiddleware`, `ResourceMiddleware('settings:read')`

#### Request
Nenhum parâmetro necessário

#### Success Response
**Status**: `200 OK`
```json
{
  "_id": "507f1f77bcf86cd799439100",
  "appName": "LowCodeJS",
  "defaultLanguage": "pt-BR",
  "allowUserRegistration": true,
  "emailVerificationRequired": true,
  "defaultUserGroup": "507f1f77bcf86cd799439012",
  "maintenanceMode": false,
  "maxUploadSize": 10485760,
  "allowedFileTypes": ["image/jpeg", "image/png", "application/pdf"],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### Error Responses
- **401 Unauthorized** (`AUTHENTICATION_REQUIRED`): Token ausente ou inválido
- **403 Forbidden** (`UNAUTHORIZED_RESOURCE`): Sem permissão 'settings:read'
- **404 Not Found** (`SETTINGS_NOT_FOUND`): Configurações não inicializadas
- **500 Internal Server Error** (`SERVER_ERROR`): Erro ao buscar configurações

---

### 9.2 PUT /setting
**Autenticação**: Requerida (JWT Cookie)
**Middleware**: `AuthenticationMiddleware`, `ResourceMiddleware('settings:update')`

#### Request
```json
{
  "appName": "LowCodeJS Updated",
  "defaultLanguage": "en-US",
  "allowUserRegistration": false,
  "maintenanceMode": true
}
```
**Nota**: Todos os campos são opcionais (partial update)

#### Success Response
**Status**: `200 OK`
```json
{
  "_id": "507f1f77bcf86cd799439100",
  "appName": "LowCodeJS Updated",
  "defaultLanguage": "en-US",
  "allowUserRegistration": false,
  "emailVerificationRequired": true,
  "maintenanceMode": true,
  "updatedAt": "2024-01-02T00:00:00.000Z"
}
```

#### Error Responses
- **400 Bad Request** (`INVALID_PARAMETERS`): Parâmetros inválidos
- **401 Unauthorized** (`AUTHENTICATION_REQUIRED`): Token ausente ou inválido
- **403 Forbidden** (`UNAUTHORIZED_RESOURCE`): Sem permissão 'settings:update'
- **404 Not Found** (`SETTINGS_NOT_FOUND`): Configurações não encontradas
- **422 Unprocessable Entity** (`VALIDATION_ERROR`): Validação falhou
- **500 Internal Server Error** (`SERVER_ERROR`): Erro ao atualizar configurações

---

## 10. Permissions Domain (1 endpoint)

### 10.1 GET /permissions
**Autenticação**: Requerida (JWT Cookie)
**Middleware**: `AuthenticationMiddleware`, `ResourceMiddleware('permissions:read')`

#### Request
Nenhum parâmetro necessário

#### Success Response
**Status**: `200 OK`
```json
[
  {
    "_id": "507f1f77bcf86cd799439020",
    "name": "Read Collections",
    "slug": "collections:read",
    "description": "Permission to view collections",
    "trashed": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  {
    "_id": "507f1f77bcf86cd799439021",
    "name": "Write Collections",
    "slug": "collections:write",
    "description": "Permission to create collections",
    "trashed": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  {
    "_id": "507f1f77bcf86cd799439022",
    "name": "Update Collections",
    "slug": "collections:update",
    "description": "Permission to update collections",
    "trashed": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  {
    "_id": "507f1f77bcf86cd799439023",
    "name": "Delete Collections",
    "slug": "collections:delete",
    "description": "Permission to delete collections",
    "trashed": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### Error Responses
- **401 Unauthorized** (`AUTHENTICATION_REQUIRED`): Token ausente ou inválido
- **403 Forbidden** (`UNAUTHORIZED_RESOURCE`): Sem permissão 'permissions:read'
- **500 Internal Server Error** (`SERVER_ERROR`): Erro ao buscar permissões

---

## 11. Locales Domain (2 endpoints)

### 11.1 GET /locales/
**Autenticação**: Nenhuma
**Middleware**: Nenhum

#### Request
Nenhum parâmetro necessário

#### Success Response
**Status**: `200 OK`
```json
{
  "locales": ["pt-br", "en-us"],
  "default": "pt-br"
}
```

#### Error Responses
- **500 Internal Server Error** (`SERVER_ERROR`): Erro ao ler diretório de locales

---

### 11.2 GET /locales/:locale
**Autenticação**: Nenhuma
**Middleware**: Nenhum

#### Request
**URL**: `/locales/pt-br`

#### Success Response
**Status**: `200 OK`
**Content-Type**: `text/plain`
```properties
app.name=LowCodeJS
app.welcome=Bem-vindo ao LowCodeJS
auth.login=Entrar
auth.register=Registrar
auth.logout=Sair
collection.create=Criar Coleção
collection.edit=Editar Coleção
collection.delete=Deletar Coleção
# ... mais traduções
```

#### Error Responses
- **404 Not Found** (`LOCALE_NOT_FOUND`): Locale não existe
- **500 Internal Server Error** (`FILE_READ_ERROR`): Erro ao ler arquivo de locale

---

## 12. System Domain (3 endpoints)

### 12.1 GET /
**Autenticação**: Nenhuma
**Middleware**: Nenhum

#### Request
Nenhum

#### Success Response
**Status**: `302 Found`
**Location**: `/documentation`

**Redirecionamento automático** para a documentação da API

---

### 12.2 GET /health-check
**Autenticação**: Nenhuma
**Middleware**: Nenhum

#### Request
Nenhum parâmetro necessário

#### Success Response
**Status**: `200 OK`
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "database": "connected",
  "version": "1.0.0"
}
```

#### Error Responses
- **503 Service Unavailable** (`DATABASE_DISCONNECTED`): Banco de dados desconectado
- **500 Internal Server Error** (`SERVER_ERROR`): Erro no health check

---

### 12.3 GET /documentation
**Autenticação**: Nenhuma
**Middleware**: Nenhum

#### Request
Nenhum parâmetro necessário

#### Success Response
**Status**: `200 OK`
**Content-Type**: `text/html`

Retorna página HTML com interface **Scalar** para documentação interativa da API OpenAPI/Swagger.

**Features**:
- Navegação por endpoints
- Try-it-out com autenticação
- Schema visualization
- Exemplos de request/response

---

## 📊 Resumo de HTTP Status Codes

### Success Codes
- **200 OK**: Operação bem-sucedida (GET, PUT, PATCH, DELETE)
- **201 Created**: Recurso criado com sucesso (POST)
- **302 Found**: Redirecionamento

### Client Error Codes (4xx)
- **400 Bad Request**: Parâmetros inválidos, dados malformados
- **401 Unauthorized**: Autenticação ausente, inválida ou expirada
- **403 Forbidden**: Sem permissão para acessar recurso
- **404 Not Found**: Recurso não encontrado
- **409 Conflict**: Conflito (email duplicado, slug existente, já na lixeira)
- **410 Gone**: Recurso expirado ou removido permanentemente
- **413 Payload Too Large**: Arquivo muito grande
- **422 Unprocessable Entity**: Validação Zod falhou
- **429 Too Many Requests**: Rate limiting

### Server Error Codes (5xx)
- **500 Internal Server Error**: Erro genérico do servidor
- **503 Service Unavailable**: Serviço indisponível (banco desconectado)

---

## 🔑 Common Error Causes

### Authentication Errors
- `AUTHENTICATION_REQUIRED`: Token JWT ausente ou inválido
- `TOKEN_EXPIRED`: Token JWT expirado
- `INVALID_CREDENTIALS`: Email ou senha incorretos

### Permission Errors
- `UNAUTHORIZED_RESOURCE`: Usuário sem permissão específica
- `ACCESS_DENIED`: Acesso negado
- `NOT_OWNER`: Usuário não é proprietário do recurso
- `NOT_OWNER_OR_ADMIN`: Usuário não é owner nem administrador

### Validation Errors
- `VALIDATION_ERROR`: Validação Zod falhou
- `INVALID_PARAMETERS`: Parâmetros inválidos ou malformados
- `REQUIRED_FIELD_MISSING`: Campo obrigatório ausente
- `INVALID_FIELD_TYPE`: Tipo de dado incompatível

### Resource Errors
- `RESOURCE_NOT_FOUND`: Recurso genérico não encontrado
- `COLLECTION_NOT_FOUND`: Collection não existe
- `FIELD_NOT_FOUND`: Field não existe
- `ROW_NOT_FOUND`: Row não existe
- `USER_NOT_FOUND`: Usuário não existe
- `GROUP_NOT_FOUND`: UserGroup não existe

### Conflict Errors
- `EMAIL_ALREADY_EXISTS`: Email já cadastrado
- `SLUG_ALREADY_EXISTS`: Slug já existe
- `ALREADY_TRASHED`: Recurso já está na lixeira
- `NOT_TRASHED`: Recurso não está na lixeira
- `HAS_REFERENCES`: Recurso possui referências (não pode deletar)
- `HAS_DEPENDENT_DATA`: Recurso possui dados dependentes

### Server Errors
- `SERVER_ERROR`: Erro genérico do servidor
- `DATABASE_ERROR`: Erro de banco de dados
- `MODEL_BUILD_FAILED`: Erro ao construir modelo dinâmico
- `SCHEMA_BUILD_FAILED`: Erro ao construir schema
- `POPULATE_FAILED`: Erro na população de relacionamentos
- `FILE_SAVE_FAILED`: Erro ao salvar arquivo
- `EMAIL_SEND_FAILED`: Erro ao enviar email

---

## 🎯 Padrões de Response

### Success Pattern
```json
{
  "_id": "ObjectId",
  "field1": "value",
  "field2": "value",
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601"
}
```

### Paginated Pattern
```json
{
  "data": [...],
  "meta": {
    "total": number,
    "page": number,
    "perPage": number,
    "lastPage": number,
    "firstPage": 1
  }
}
```

### Error Pattern
```json
{
  "message": "Human-readable error message",
  "code": 400,
  "cause": "MACHINE_READABLE_CAUSE"
}
```

---

**Fim do documento - LowCodeJS API Routes v1.0.0**
