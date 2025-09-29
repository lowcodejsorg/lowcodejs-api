# LowCodeJS API Documentation

> Comprehensive API reference for LowCodeJS platform with detailed endpoint documentation, request/response formats, and authentication requirements.

## Table of Contents

1. [Authentication](#authentication)
2. [Collections](#collections)
3. [Fields](#fields)
4. [Rows](#rows)
5. [Users](#users)
6. [User Groups](#user-groups)
7. [Storage](#storage)
8. [Profile](#profile)
9. [Settings](#settings)
10. [System Endpoints](#system-endpoints)
11. [Common Error Responses](#common-error-responses)

## Base URL

- **Development**: `http://localhost:3000`
- **Demo**: `https://api.demo.lowcodejs.org`
- **Development Server**: `https://api.develop.lowcodejs.org`

## Authentication

The API uses JWT cookie-based authentication. Cookies are HTTP-only and include both `accessToken` and `refreshToken`.

### Common Headers

```http
Content-Type: application/json
Cookie: accessToken=<jwt_token>; refreshToken=<refresh_token>
```

---

## Authentication

Authentication endpoints for user registration, login, logout, password recovery, and token management.

### 1. Sign In

**POST** `/authentication/sign-in`

Authenticates a user with email and password, returning JWT tokens as HTTP-only cookies.

#### Request Body

```json
{
  "email": "user@example.com",
  "password": "userpassword123"
}
```

#### Success Response (200)

```json
{
  "message": "Authentication successful"
}
```

**Response Headers:**
```http
Set-Cookie: accessToken=<jwt_token>; Path=/; HttpOnly; SameSite=lax; Max-Age=86400
Set-Cookie: refreshToken=<refresh_token>; Path=/; HttpOnly; SameSite=lax; Max-Age=604800
```

#### Error Responses

**400 - Bad Request:**
```json
{
  "message": "Invalid email format",
  "code": 400,
  "cause": "INVALID_PARAMETERS"
}
```

**400 - Missing Required Fields:**
```json
{
  "message": "Email and password are required",
  "code": 400,
  "cause": "INVALID_PARAMETERS"
}
```

**401 - Invalid Credentials:**
```json
{
  "message": "Credenciais invalidas",
  "code": 401,
  "cause": "AUTHENTICATION_REQUIRED"
}
```

**401 - User Inactive:**
```json
{
  "message": "Unauthorized",
  "code": 401,
  "cause": "AUTHENTICATION_REQUIRED"
}
```

**429 - Too Many Requests:**
```json
{
  "message": "Too many requests",
  "code": 429,
  "cause": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 60
}
```

**500 - Internal Server Error:**
```json
{
  "message": "Internal server error",
  "code": 500,
  "cause": "SIGN_IN_ERROR"
}
```

---

### 2. Sign Up

**POST** `/authentication/sign-up`

Creates a new user account with name, email and password.

#### Request Body

```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "securepassword123"
}
```

#### Success Response (201)

```json
{
  "message": "User created successfully"
}
```

#### Error Responses

**400 - Bad Request:**
```json
{
  "message": "Invalid email format",
  "code": 400,
  "cause": "INVALID_PARAMETERS"
}
```

**400 - Missing Required Fields:**
```json
{
  "message": "Name, email and password are required",
  "code": 400,
  "cause": "INVALID_PARAMETERS"
}
```

**400 - Password Too Short:**
```json
{
  "message": "Password must be at least 8 characters",
  "code": 400,
  "cause": "INVALID_PARAMETERS"
}
```

**409 - User Already Exists:**
```json
{
  "message": "User already exists",
  "code": 409,
  "cause": "USER_ALREADY_EXISTS"
}
```

**409 - Required Group Not Found:**
```json
{
  "message": "Group not found",
  "code": 409,
  "cause": "GROUP_NOT_FOUND"
}
```

**429 - Too Many Requests:**
```json
{
  "message": "Too many requests",
  "code": 429,
  "cause": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 60
}
```

**500 - Internal Server Error:**
```json
{
  "message": "Internal server error",
  "code": 500,
  "cause": "SIGN_UP_ERROR"
}
```

---

### 3. Sign Out

**POST** `/authentication/sign-out`

Signs out the current user by clearing authentication cookies.

**Authentication Required:** Yes

#### Success Response (200)

```json
{
  "message": "Successfully signed out"
}
```

**Response Headers:**
```http
Set-Cookie: accessToken=; Path=/; HttpOnly; SameSite=lax; Max-Age=0
Set-Cookie: refreshToken=; Path=/; HttpOnly; SameSite=lax; Max-Age=0
```

#### Error Responses

**401 - Authentication Required:**
```json
{
  "message": "Authentication required",
  "code": 401,
  "cause": "AUTHENTICATION_REQUIRED"
}
```

**500 - Internal Server Error:**
```json
{
  "message": "Internal server error",
  "code": 500,
  "cause": "SERVER_ERROR"
}
```

---

### 4. Refresh Token

**POST** `/authentication/refresh-token`

Refreshes access and refresh tokens using the current refresh token from cookies.

**Authentication Required:** Yes

#### Success Response (200)

```json
{
  "message": "Tokens refreshed successfully"
}
```

**Response Headers:**
```http
Set-Cookie: accessToken=<new_jwt_token>; Path=/; HttpOnly; SameSite=lax; Max-Age=86400
Set-Cookie: refreshToken=<new_refresh_token>; Path=/; HttpOnly; SameSite=lax; Max-Age=604800
```

#### Error Responses

**401 - Missing Refresh Token:**
```json
{
  "message": "Missing refresh token",
  "code": 401,
  "cause": "MISSING_REFRESH_TOKEN"
}
```

**401 - Invalid Refresh Token:**
```json
{
  "message": "Invalid refresh token",
  "code": 401,
  "cause": "AUTHENTICATION_REQUIRED"
}
```

**401 - Expired Refresh Token:**
```json
{
  "message": "Refresh token has expired",
  "code": 401,
  "cause": "AUTHENTICATION_REQUIRED"
}
```

**429 - Too Many Requests:**
```json
{
  "message": "Too many requests",
  "code": 429,
  "cause": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 60
}
```

**500 - Internal Server Error:**
```json
{
  "message": "Internal server error",
  "code": 500,
  "cause": "SERVER_ERROR"
}
```

---

### 5. Magic Link Authentication

**GET** `/authentication/magic-link?code={code}`

Authenticates user via magic link and redirects to dashboard with authentication cookies set.

#### Query Parameters

- `code` (required): Magic link authentication code

#### Success Response (302)

Redirects to: `{CLIENT_URL}/dashboard?authentication=success`

**Response Headers:**
```http
Set-Cookie: accessToken=<jwt_token>; Path=/; HttpOnly; SameSite=strict; Max-Age=86400
Set-Cookie: refreshToken=<refresh_token>; Path=/; HttpOnly; SameSite=strict; Max-Age=604800
Location: https://app.lowcodejs.org/dashboard?authentication=success
```

#### Error Responses

**400 - Missing Code:**
```json
{
  "message": "Authentication code is required",
  "code": 400,
  "cause": "INVALID_PARAMETERS"
}
```

**400 - Invalid Code:**
```json
{
  "message": "Invalid authentication code",
  "code": 400,
  "cause": "INVALID_PARAMETERS"
}
```

**400 - Expired Code:**
```json
{
  "message": "Magic link has expired",
  "code": 400,
  "cause": "CODE_EXPIRED"
}
```

**404 - User Not Found:**
```json
{
  "message": "User not found for this magic link",
  "code": 404,
  "cause": "RESOURCE_NOT_FOUND"
}
```

**429 - Too Many Requests:**
```json
{
  "message": "Too many requests",
  "code": 429,
  "cause": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 60
}
```

**500 - Internal Server Error:**
```json
{
  "message": "Internal server error",
  "code": 500,
  "cause": "SERVER_ERROR"
}
```

---

### 6. Request Password Recovery Code

**POST** `/authentication/recovery/request-code`

Sends a password recovery code to the specified email address.

#### Request Body

```json
{
  "email": "user@example.com"
}
```

#### Success Response (200)

```json
{
  "message": "Recovery code sent to your email"
}
```

#### Error Responses

**400 - Invalid Email Format:**
```json
{
  "message": "Invalid email format",
  "code": 400,
  "cause": "INVALID_PARAMETERS"
}
```

**400 - Missing Email:**
```json
{
  "message": "Email is required",
  "code": 400,
  "cause": "INVALID_PARAMETERS"
}
```

**409 - Invalid Credentials:**
```json
{
  "message": "Invalid credentials",
  "code": 409,
  "cause": "INVALID_CREDENTIALS"
}
```

**429 - Too Many Requests:**
```json
{
  "message": "Too many recovery attempts. Please wait before trying again",
  "code": 429,
  "cause": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 300
}
```

**500 - Internal Server Error:**
```json
{
  "message": "Internal server error",
  "code": 500,
  "cause": "REQUEST_CODE_ERROR"
}
```

---

### 7. Validate Recovery Code

**POST** `/authentication/recovery/validate-code`

Validates a password recovery code and returns a temporary token for password reset.

#### Request Body

```json
{
  "code": "123456"
}
```

#### Success Response (200)

```json
{
  "token": "temp_reset_token_here",
  "message": "Code validated successfully"
}
```

#### Error Responses

**400 - Missing Code:**
```json
{
  "message": "Recovery code is required",
  "code": 400,
  "cause": "INVALID_PARAMETERS"
}
```

**400 - Invalid Code Format:**
```json
{
  "message": "Recovery code must be 6 digits",
  "code": 400,
  "cause": "INVALID_PARAMETERS"
}
```

**400 - Invalid Code:**
```json
{
  "message": "Invalid recovery code",
  "code": 400,
  "cause": "INVALID_PARAMETERS"
}
```

**400 - Expired Code:**
```json
{
  "message": "Recovery code has expired",
  "code": 400,
  "cause": "CODE_EXPIRED"
}
```

**400 - Code Already Used:**
```json
{
  "message": "Recovery code has already been used",
  "code": 400,
  "cause": "CODE_ALREADY_USED"
}
```

**429 - Too Many Requests:**
```json
{
  "message": "Too many validation attempts",
  "code": 429,
  "cause": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 300
}
```

**500 - Internal Server Error:**
```json
{
  "message": "Internal server error",
  "code": 500,
  "cause": "SERVER_ERROR"
}
```

---

### 8. Update Password After Recovery

**PUT** `/authentication/recovery/update-password`

Updates user password using a valid recovery token obtained from code validation.

#### Request Body

```json
{
  "password": "newpassword123"
}
```

#### Success Response (200)

```json
{
  "message": "Password updated successfully"
}
```

#### Error Responses

**400 - Missing Password:**
```json
{
  "message": "Password is required",
  "code": 400,
  "cause": "INVALID_PARAMETERS"
}
```

**400 - Password Too Short:**
```json
{
  "message": "Password must be at least 8 characters",
  "code": 400,
  "cause": "INVALID_PARAMETERS"
}
```

**401 - Missing Token:**
```json
{
  "message": "Recovery token is required",
  "code": 401,
  "cause": "AUTHENTICATION_REQUIRED"
}
```

**401 - Invalid Token:**
```json
{
  "message": "Invalid or expired recovery token",
  "code": 401,
  "cause": "AUTHENTICATION_REQUIRED"
}
```

**401 - Expired Token:**
```json
{
  "message": "Recovery token has expired",
  "code": 401,
  "cause": "AUTHENTICATION_REQUIRED"
}
```

**429 - Too Many Requests:**
```json
{
  "message": "Too many password update attempts",
  "code": 429,
  "cause": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 300
}
```

**500 - Internal Server Error:**
```json
{
  "message": "Internal server error",
  "code": 500,
  "cause": "SERVER_ERROR"
}
```

---

## Collections

Collection management endpoints for creating, reading, updating, and managing collections.

### 1. Create Collection

**POST** `/collections`

Creates a new collection with fields, configuration and permissions settings.

**Authentication Required:** Yes

#### Request Body

```json
{
  "name": "Products"
}
```

#### Success Response (201)

```json
{
  "_id": "64f123456789abcdef012345",
  "name": "Products",
  "description": null,
  "slug": "products",
  "logo": null,
  "fields": [
    {
      "_id": "64f123456789abcdef012346",
      "name": "Name",
      "slug": "name",
      "type": "TEXT_SHORT",
      "configuration": {},
      "trashed": false,
      "trashedAt": null,
      "createdAt": "2023-09-01T10:00:00.000Z",
      "updatedAt": "2023-09-01T10:00:00.000Z"
    }
  ],
  "configuration": {
    "style": "list",
    "visibility": "public",
    "collaboration": "open",
    "administrators": [],
    "owner": {
      "_id": "64f123456789abcdef012347",
      "name": "John Doe"
    },
    "fields": {
      "orderList": ["name"],
      "orderForm": ["name"]
    }
  },
  "type": "collection",
  "_schema": {
    "name": { "type": "String", "required": true },
    "trashed": { "type": "Boolean", "default": false },
    "trashedAt": { "type": "Date", "default": null }
  },
  "trashed": false,
  "trashedAt": null,
  "createdAt": "2023-09-01T10:00:00.000Z",
  "updatedAt": "2023-09-01T10:00:00.000Z"
}
```

#### Error Responses

**400 - Missing Required Fields:**
```json
{
  "message": "Collection name is required",
  "code": 400,
  "cause": "INVALID_PARAMETERS"
}
```

**400 - Invalid Name Format:**
```json
{
  "message": "Collection name must be a valid string",
  "code": 400,
  "cause": "INVALID_PARAMETERS"
}
```

**400 - Missing Owner:**
```json
{
  "message": "Owner required",
  "code": 400,
  "cause": "OWNER_REQUIRED"
}
```

**401 - Authentication Required:**
```json
{
  "message": "Authentication required",
  "code": 401,
  "cause": "AUTHENTICATION_REQUIRED"
}
```

**403 - Access Denied:**
```json
{
  "message": "Insufficient permissions to create collections",
  "code": 403,
  "cause": "ACCESS_DENIED"
}
```

**409 - Collection Already Exists:**
```json
{
  "message": "Collection already exists",
  "code": 409,
  "cause": "COLLECTION_ALREADY_EXISTS"
}
```

**422 - Validation Error:**
```json
{
  "message": "Collection name contains invalid characters",
  "code": 422,
  "cause": "UNPROCESSABLE_ENTITY"
}
```

**500 - Internal Server Error:**
```json
{
  "message": "Internal server error",
  "code": 500,
  "cause": "CREATE_COLLECTION_ERROR"
}
```

---

### 2. List Collections (Paginated)

**GET** `/collections/paginated`

Get a paginated list of collections with optional search and filtering.

**Authentication Required:** Yes

#### Query Parameters

- `page` (optional): Page number (default: 1)
- `perPage` (optional): Items per page (max 100, default: 50)
- `search` (optional): Search term for filtering by name or slug
- `trashed` (optional): Include trashed items ("true"/"false", default: "false")
- `public` (optional): Filter by public visibility ("true"/"false", default: "false")
- `type` (optional): Filter by collection type ("collection"/"field-group")
- `name` (optional): Filter by exact collection name

#### Example Request

```http
GET /collections/paginated?page=1&perPage=10&search=product&trashed=false
```

#### Success Response (200)

```json
{
  "data": [
    {
      "_id": "64f123456789abcdef012345",
      "name": "Products",
      "description": "Product catalog management",
      "slug": "products",
      "logo": {
        "_id": "64f123456789abcdef012348",
        "url": "/storage/logos/product-logo.png",
        "filename": "product-logo.png",
        "type": "image/png"
      },
      "fields": [
        {
          "_id": "64f123456789abcdef012346",
          "name": "Name",
          "slug": "name",
          "type": "TEXT_SHORT",
          "configuration": {},
          "trashed": false,
          "trashedAt": null,
          "createdAt": "2023-09-01T10:00:00.000Z",
          "updatedAt": "2023-09-01T10:00:00.000Z"
        }
      ],
      "configuration": {
        "style": "gallery",
        "visibility": "public",
        "collaboration": "open",
        "administrators": [
          {
            "_id": "64f123456789abcdef012349",
            "name": "Jane Admin"
          }
        ],
        "owner": {
          "_id": "64f123456789abcdef012347",
          "name": "John Doe"
        },
        "fields": {
          "orderList": ["name", "price"],
          "orderForm": ["name", "description", "price"]
        }
      },
      "type": "collection",
      "_schema": {
        "name": { "type": "String", "required": true },
        "price": { "type": "Number" }
      },
      "trashed": false,
      "trashedAt": null,
      "createdAt": "2023-09-01T10:00:00.000Z",
      "updatedAt": "2023-09-01T10:00:00.000Z"
    }
  ],
  "meta": {
    "total": 25,
    "perPage": 10,
    "page": 1,
    "lastPage": 3,
    "firstPage": 1
  }
}
```

#### Error Responses

**400 - Invalid Query Parameters:**
```json
{
  "message": "Invalid pagination parameters",
  "code": 400,
  "cause": "INVALID_PARAMETERS"
}
```

**400 - Invalid Search Format:**
```json
{
  "message": "Search query must be at least 2 characters",
  "code": 400,
  "cause": "INVALID_PARAMETERS"
}
```

**401 - Authentication Required:**
```json
{
  "message": "Authentication required",
  "code": 401,
  "cause": "AUTHENTICATION_REQUIRED"
}
```

**403 - Access Denied:**
```json
{
  "message": "Insufficient permissions to list collections",
  "code": 403,
  "cause": "ACCESS_DENIED"
}
```

**422 - Invalid Filter Values:**
```json
{
  "message": "Invalid filter values provided",
  "code": 422,
  "cause": "UNPROCESSABLE_ENTITY"
}
```

**500 - Internal Server Error:**
```json
{
  "message": "Internal server error",
  "code": 500,
  "cause": "SERVER_ERROR"
}
```

---

### 3. Get Collection by Slug

**GET** `/collections/{slug}`

Retrieves a collection by its slug with populated fields and administrators.

**Authentication Required:** Yes

#### URL Parameters

- `slug` (required): Collection slug identifier (e.g., "users", "products", "blog-posts")

#### Query Parameters

- `trashed` (optional): Include trashed collections ("true"/"false", default: "false")
- `public` (optional): Filter by public visibility ("true"/"false")

#### Example Request

```http
GET /collections/products?trashed=false&public=true
```

#### Success Response (200)

*Same structure as Create Collection response*

#### Error Responses

**400 - Invalid Slug Format:**
```json
{
  "message": "Invalid collection slug format",
  "code": 400,
  "cause": "INVALID_PARAMETERS"
}
```

**401 - Authentication Required:**
```json
{
  "message": "Authentication required",
  "code": 401,
  "cause": "AUTHENTICATION_REQUIRED"
}
```

**403 - Access Denied:**
```json
{
  "message": "Insufficient permissions to access this collection",
  "code": 403,
  "cause": "ACCESS_DENIED"
}
```

**404 - Collection Not Found:**
```json
{
  "message": "Collection not found",
  "code": 404,
  "cause": "COLLECTION_NOT_FOUND"
}
```

**500 - Internal Server Error:**
```json
{
  "message": "Internal server error",
  "code": 500,
  "cause": "SERVER_ERROR"
}
```

---

### 4. Update Collection

**PUT** `/collections/{id}`

Updates an existing collection's properties, fields, and configuration.

**Authentication Required:** Yes

#### URL Parameters

- `id` (required): Collection ID

#### Request Body

```json
{
  "name": "Updated Products",
  "description": "Updated product catalog",
  "configuration": {
    "style": "gallery",
    "visibility": "restricted",
    "collaboration": "restricted"
  }
}
```

#### Success Response (200)

*Same structure as Create Collection response with updated data*

#### Error Responses

**400 - Invalid ID Format:**
```json
{
  "message": "Invalid collection ID format",
  "code": 400,
  "cause": "INVALID_PARAMETERS"
}
```

**400 - Invalid Request Body:**
```json
{
  "message": "Request body contains invalid data",
  "code": 400,
  "cause": "INVALID_PARAMETERS"
}
```

**401 - Authentication Required:**
```json
{
  "message": "Authentication required",
  "code": 401,
  "cause": "AUTHENTICATION_REQUIRED"
}
```

**403 - Access Denied:**
```json
{
  "message": "Insufficient permissions to update this collection",
  "code": 403,
  "cause": "ACCESS_DENIED"
}
```

**404 - Collection Not Found:**
```json
{
  "message": "Collection not found",
  "code": 404,
  "cause": "COLLECTION_NOT_FOUND"
}
```

**409 - Collection Name Conflict:**
```json
{
  "message": "Collection with this name already exists",
  "code": 409,
  "cause": "COLLECTION_ALREADY_EXISTS"
}
```

**422 - Validation Error:**
```json
{
  "message": "Invalid configuration values provided",
  "code": 422,
  "cause": "UNPROCESSABLE_ENTITY"
}
```

**500 - Internal Server Error:**
```json
{
  "message": "Internal server error",
  "code": 500,
  "cause": "SERVER_ERROR"
}
```

---

### 5. Send Collection to Trash

**PATCH** `/collections/{id}/trash`

Moves a collection to trash (soft delete).

**Authentication Required:** Yes

#### Success Response (200)

```json
{
  "message": "Collection moved to trash successfully"
}
```

#### Error Responses

**400 - Invalid ID Format:**
```json
{
  "message": "Invalid collection ID format",
  "code": 400,
  "cause": "INVALID_PARAMETERS"
}
```

**401 - Authentication Required:**
```json
{
  "message": "Authentication required",
  "code": 401,
  "cause": "AUTHENTICATION_REQUIRED"
}
```

**403 - Access Denied:**
```json
{
  "message": "Insufficient permissions to trash this collection",
  "code": 403,
  "cause": "ACCESS_DENIED"
}
```

**404 - Collection Not Found:**
```json
{
  "message": "Collection not found",
  "code": 404,
  "cause": "COLLECTION_NOT_FOUND"
}
```

**409 - Collection In Use:**
```json
{
  "message": "Cannot trash collection with existing data",
  "code": 409,
  "cause": "COLLECTION_IN_USE"
}
```

**500 - Internal Server Error:**
```json
{
  "message": "Internal server error",
  "code": 500,
  "cause": "SERVER_ERROR"
}
```

---

### 6. Remove Collection from Trash

**PATCH** `/collections/{id}/restore`

Restores a collection from trash.

**Authentication Required:** Yes

#### Success Response (200)

```json
{
  "message": "Collection restored successfully"
}
```

#### Error Responses

**400 - Invalid ID Format:**
```json
{
  "message": "Invalid collection ID format",
  "code": 400,
  "cause": "INVALID_PARAMETERS"
}
```

**401 - Authentication Required:**
```json
{
  "message": "Authentication required",
  "code": 401,
  "cause": "AUTHENTICATION_REQUIRED"
}
```

**403 - Access Denied:**
```json
{
  "message": "Insufficient permissions to restore this collection",
  "code": 403,
  "cause": "ACCESS_DENIED"
}
```

**404 - Collection Not Found:**
```json
{
  "message": "Collection not found in trash",
  "code": 404,
  "cause": "COLLECTION_NOT_FOUND"
}
```

**409 - Name Conflict:**
```json
{
  "message": "Cannot restore: collection name already exists",
  "code": 409,
  "cause": "COLLECTION_ALREADY_EXISTS"
}
```

**500 - Internal Server Error:**
```json
{
  "message": "Internal server error",
  "code": 500,
  "cause": "SERVER_ERROR"
}
```

---

### 7. Delete Collection

**DELETE** `/collections/{id}`

Permanently deletes a collection (hard delete).

**Authentication Required:** Yes

#### Success Response (200)

```json
{
  "message": "Collection deleted successfully"
}
```

#### Error Responses

**400 - Invalid ID Format:**
```json
{
  "message": "Invalid collection ID format",
  "code": 400,
  "cause": "INVALID_PARAMETERS"
}
```

**401 - Authentication Required:**
```json
{
  "message": "Authentication required",
  "code": 401,
  "cause": "AUTHENTICATION_REQUIRED"
}
```

**403 - Access Denied:**
```json
{
  "message": "Insufficient permissions to delete this collection",
  "code": 403,
  "cause": "ACCESS_DENIED"
}
```

**404 - Collection Not Found:**
```json
{
  "message": "Collection not found",
  "code": 404,
  "cause": "COLLECTION_NOT_FOUND"
}
```

**409 - Collection Has Dependencies:**
```json
{
  "message": "Cannot delete collection with existing relationships",
  "code": 409,
  "cause": "COLLECTION_IN_USE"
}
```

**500 - Internal Server Error:**
```json
{
  "message": "Internal server error",
  "code": 500,
  "cause": "DELETE_COLLECTION_ERROR"
}
```

---

## Fields

Field management endpoints for creating, updating, and managing collection fields.

### 1. Create Field

**POST** `/fields`

Creates a new field for a collection.

**Authentication Required:** Yes

#### Request Body

```json
{
  "name": "Product Price",
  "type": "TEXT_SHORT",
  "collection": "64f123456789abcdef012345",
  "configuration": {
    "required": true,
    "placeholder": "Enter product price"
  }
}
```

#### Success Response (201)

```json
{
  "_id": "64f123456789abcdef012350",
  "name": "Product Price",
  "slug": "product-price",
  "type": "TEXT_SHORT",
  "collection": "64f123456789abcdef012345",
  "configuration": {
    "required": true,
    "placeholder": "Enter product price"
  },
  "trashed": false,
  "trashedAt": null,
  "createdAt": "2023-09-01T11:00:00.000Z",
  "updatedAt": "2023-09-01T11:00:00.000Z"
}
```

#### Error Responses

**400 - Missing Required Fields:**
```json
{
  "message": "Field name and type are required",
  "code": 400,
  "cause": "INVALID_PARAMETERS"
}
```

**400 - Invalid Field Type:**
```json
{
  "message": "Invalid field type specified",
  "code": 400,
  "cause": "INVALID_PARAMETERS"
}
```

**400 - Invalid Collection ID:**
```json
{
  "message": "Invalid collection ID format",
  "code": 400,
  "cause": "INVALID_PARAMETERS"
}
```

**401 - Authentication Required:**
```json
{
  "message": "Authentication required",
  "code": 401,
  "cause": "AUTHENTICATION_REQUIRED"
}
```

**403 - Access Denied:**
```json
{
  "message": "Insufficient permissions to create fields in this collection",
  "code": 403,
  "cause": "ACCESS_DENIED"
}
```

**404 - Collection Not Found:**
```json
{
  "message": "Target collection not found",
  "code": 404,
  "cause": "COLLECTION_NOT_FOUND"
}
```

**409 - Field Already Exists:**
```json
{
  "message": "Field with this name already exists in collection",
  "code": 409,
  "cause": "FIELD_ALREADY_EXISTS"
}
```

**422 - Invalid Configuration:**
```json
{
  "message": "Invalid field configuration provided",
  "code": 422,
  "cause": "UNPROCESSABLE_ENTITY"
}
```

**500 - Internal Server Error:**
```json
{
  "message": "Internal server error",
  "code": 500,
  "cause": "SERVER_ERROR"
}
```

### Field Types

Available field types:
- `TEXT_SHORT`: Short text input
- `TEXT_LONG`: Long text/textarea
- `DROPDOWN`: Select dropdown
- `DATE`: Date picker
- `RELATIONSHIP`: Relationship to another collection
- `FILE`: File upload
- `FIELD_GROUP`: Group of fields
- `REACTION`: Reaction/rating field
- `EVALUATION`: Evaluation field
- `CATEGORY`: Category selection

---

### 2. Get Field by ID

**GET** `/fields/{id}`

Retrieves a specific field by its ID.

**Authentication Required:** Yes

#### Success Response (200)

*Same structure as Create Field response*

#### Error Responses

**400 - Invalid ID Format:**
```json
{
  "message": "Invalid field ID format",
  "code": 400,
  "cause": "INVALID_PARAMETERS"
}
```

**401 - Authentication Required:**
```json
{
  "message": "Authentication required",
  "code": 401,
  "cause": "AUTHENTICATION_REQUIRED"
}
```

**403 - Access Denied:**
```json
{
  "message": "Insufficient permissions to access this field",
  "code": 403,
  "cause": "ACCESS_DENIED"
}
```

**404 - Field Not Found:**
```json
{
  "message": "Field not found",
  "code": 404,
  "cause": "FIELD_NOT_FOUND"
}
```

**500 - Internal Server Error:**
```json
{
  "message": "Internal server error",
  "code": 500,
  "cause": "SERVER_ERROR"
}
```

---

### 3. Update Field

**PUT** `/fields/{id}`

Updates an existing field's properties and configuration.

**Authentication Required:** Yes

#### Request Body

```json
{
  "name": "Updated Product Price",
  "configuration": {
    "required": false,
    "placeholder": "Enter price (optional)"
  }
}
```

#### Success Response (200)

*Same structure as Create Field response with updated data*

#### Error Responses

**400 - Invalid ID Format:**
```json
{
  "message": "Invalid field ID format",
  "code": 400,
  "cause": "INVALID_PARAMETERS"
}
```

**400 - Invalid Request Body:**
```json
{
  "message": "Request body contains invalid data",
  "code": 400,
  "cause": "INVALID_PARAMETERS"
}
```

**401 - Authentication Required:**
```json
{
  "message": "Authentication required",
  "code": 401,
  "cause": "AUTHENTICATION_REQUIRED"
}
```

**403 - Access Denied:**
```json
{
  "message": "Insufficient permissions to update this field",
  "code": 403,
  "cause": "ACCESS_DENIED"
}
```

**404 - Field Not Found:**
```json
{
  "message": "Field not found",
  "code": 404,
  "cause": "FIELD_NOT_FOUND"
}
```

**409 - Field Name Conflict:**
```json
{
  "message": "Field with this name already exists",
  "code": 409,
  "cause": "FIELD_ALREADY_EXISTS"
}
```

**409 - Field In Use:**
```json
{
  "message": "Cannot change field type: field contains data",
  "code": 409,
  "cause": "FIELD_IN_USE"
}
```

**422 - Invalid Configuration:**
```json
{
  "message": "Invalid field configuration provided",
  "code": 422,
  "cause": "UNPROCESSABLE_ENTITY"
}
```

**500 - Internal Server Error:**
```json
{
  "message": "Internal server error",
  "code": 500,
  "cause": "SERVER_ERROR"
}
```

---

### 4. Send Field to Trash

**PATCH** `/fields/{id}/trash`

Moves a field to trash (soft delete).

**Authentication Required:** Yes

#### Success Response (200)

```json
{
  "message": "Field moved to trash successfully"
}
```

#### Error Responses

**400 - Invalid ID Format:**
```json
{
  "message": "Invalid field ID format",
  "code": 400,
  "cause": "INVALID_PARAMETERS"
}
```

**401 - Authentication Required:**
```json
{
  "message": "Authentication required",
  "code": 401,
  "cause": "AUTHENTICATION_REQUIRED"
}
```

**403 - Access Denied:**
```json
{
  "message": "Insufficient permissions to trash this field",
  "code": 403,
  "cause": "ACCESS_DENIED"
}
```

**404 - Field Not Found:**
```json
{
  "message": "Field not found",
  "code": 404,
  "cause": "FIELD_NOT_FOUND"
}
```

**409 - Field In Use:**
```json
{
  "message": "Cannot trash field: contains data in collection",
  "code": 409,
  "cause": "FIELD_IN_USE"
}
```

**409 - Required Field:**
```json
{
  "message": "Cannot trash required field",
  "code": 409,
  "cause": "REQUIRED_FIELD"
}
```

**500 - Internal Server Error:**
```json
{
  "message": "Internal server error",
  "code": 500,
  "cause": "SERVER_ERROR"
}
```

---

### 5. Remove Field from Trash

**PATCH** `/fields/{id}/restore`

Restores a field from trash.

**Authentication Required:** Yes

#### Success Response (200)

```json
{
  "message": "Field restored successfully"
}
```

#### Error Responses

**400 - Invalid ID Format:**
```json
{
  "message": "Invalid field ID format",
  "code": 400,
  "cause": "INVALID_PARAMETERS"
}
```

**401 - Authentication Required:**
```json
{
  "message": "Authentication required",
  "code": 401,
  "cause": "AUTHENTICATION_REQUIRED"
}
```

**403 - Access Denied:**
```json
{
  "message": "Insufficient permissions to restore this field",
  "code": 403,
  "cause": "ACCESS_DENIED"
}
```

**404 - Field Not Found:**
```json
{
  "message": "Field not found in trash",
  "code": 404,
  "cause": "FIELD_NOT_FOUND"
}
```

**409 - Field Name Conflict:**
```json
{
  "message": "Cannot restore: field name already exists in collection",
  "code": 409,
  "cause": "FIELD_ALREADY_EXISTS"
}
```

**500 - Internal Server Error:**
```json
{
  "message": "Internal server error",
  "code": 500,
  "cause": "SERVER_ERROR"
}
```

---

## Rows

Row management endpoints for creating, reading, updating, and managing collection data records.

### 1. Create Row

**POST** `/rows`

Creates a new data record in a collection.

**Authentication Required:** Yes

#### Request Body

```json
{
  "collection": "64f123456789abcdef012345",
  "data": {
    "name": "iPhone 15 Pro",
    "price": 999.99,
    "category": "Electronics"
  }
}
```

#### Success Response (201)

```json
{
  "_id": "64f123456789abcdef012351",
  "collection": "64f123456789abcdef012345",
  "data": {
    "name": "iPhone 15 Pro",
    "price": 999.99,
    "category": "Electronics"
  },
  "trashed": false,
  "trashedAt": null,
  "createdAt": "2023-09-01T12:00:00.000Z",
  "updatedAt": "2023-09-01T12:00:00.000Z"
}
```

#### Error Responses

**400 - Missing Required Fields:**
```json
{
  "message": "Collection ID and data are required",
  "code": 400,
  "cause": "INVALID_PARAMETERS"
}
```

**400 - Invalid Collection ID:**
```json
{
  "message": "Invalid collection ID format",
  "code": 400,
  "cause": "INVALID_PARAMETERS"
}
```

**400 - Invalid Data Format:**
```json
{
  "message": "Row data must be a valid object",
  "code": 400,
  "cause": "INVALID_PARAMETERS"
}
```

**401 - Authentication Required:**
```json
{
  "message": "Authentication required",
  "code": 401,
  "cause": "AUTHENTICATION_REQUIRED"
}
```

**403 - Access Denied:**
```json
{
  "message": "Insufficient permissions to create rows in this collection",
  "code": 403,
  "cause": "ACCESS_DENIED"
}
```

**404 - Collection Not Found:**
```json
{
  "message": "Target collection not found",
  "code": 404,
  "cause": "COLLECTION_NOT_FOUND"
}
```

**422 - Validation Failed:**
```json
{
  "message": "Required field 'name' is missing",
  "code": 422,
  "cause": "UNPROCESSABLE_ENTITY"
}
```

**422 - Invalid Field Value:**
```json
{
  "message": "Invalid value for field 'price': must be a number",
  "code": 422,
  "cause": "UNPROCESSABLE_ENTITY"
}
```

**500 - Internal Server Error:**
```json
{
  "message": "Internal server error",
  "code": 500,
  "cause": "SERVER_ERROR"
}
```

---

### 2. Get Row by ID

**GET** `/rows/{id}`

Retrieves a specific row by its ID.

**Authentication Required:** Yes

#### Success Response (200)

*Same structure as Create Row response*

#### Error Responses

**400 - Invalid ID Format:**
```json
{
  "message": "Invalid row ID format",
  "code": 400,
  "cause": "INVALID_PARAMETERS"
}
```

**401 - Authentication Required:**
```json
{
  "message": "Authentication required",
  "code": 401,
  "cause": "AUTHENTICATION_REQUIRED"
}
```

**403 - Access Denied:**
```json
{
  "message": "Insufficient permissions to access this row",
  "code": 403,
  "cause": "ACCESS_DENIED"
}
```

**404 - Row Not Found:**
```json
{
  "message": "Row not found",
  "code": 404,
  "cause": "ROW_NOT_FOUND"
}
```

**500 - Internal Server Error:**
```json
{
  "message": "Internal server error",
  "code": 500,
  "cause": "SERVER_ERROR"
}
```

---

### 3. Update Row

**PUT** `/rows/{id}`

Updates an existing row's data.

**Authentication Required:** Yes

#### Request Body

```json
{
  "data": {
    "name": "iPhone 15 Pro Max",
    "price": 1099.99,
    "category": "Electronics"
  }
}
```

#### Success Response (200)

*Same structure as Create Row response with updated data*

#### Error Responses

**400 - Invalid ID Format:**
```json
{
  "message": "Invalid row ID format",
  "code": 400,
  "cause": "INVALID_PARAMETERS"
}
```

**400 - Invalid Data Format:**
```json
{
  "message": "Row data must be a valid object",
  "code": 400,
  "cause": "INVALID_PARAMETERS"
}
```

**401 - Authentication Required:**
```json
{
  "message": "Authentication required",
  "code": 401,
  "cause": "AUTHENTICATION_REQUIRED"
}
```

**403 - Access Denied:**
```json
{
  "message": "Insufficient permissions to update this row",
  "code": 403,
  "cause": "ACCESS_DENIED"
}
```

**404 - Row Not Found:**
```json
{
  "message": "Row not found",
  "code": 404,
  "cause": "ROW_NOT_FOUND"
}
```

**422 - Validation Failed:**
```json
{
  "message": "Required field 'name' cannot be empty",
  "code": 422,
  "cause": "UNPROCESSABLE_ENTITY"
}
```

**422 - Invalid Field Value:**
```json
{
  "message": "Invalid value for field 'status': must be one of [active, inactive]",
  "code": 422,
  "cause": "UNPROCESSABLE_ENTITY"
}
```

**500 - Internal Server Error:**
```json
{
  "message": "Internal server error",
  "code": 500,
  "cause": "SERVER_ERROR"
}
```

---

### 4. List Rows (Paginated)

**GET** `/rows/paginated`

Get a paginated list of rows from collections.

**Authentication Required:** Yes

#### Query Parameters

- `collection` (required): Collection ID to filter rows
- `page` (optional): Page number (default: 1)
- `perPage` (optional): Items per page (max 100, default: 50)
- `search` (optional): Search term for filtering rows
- `trashed` (optional): Include trashed rows ("true"/"false", default: "false")

#### Example Request

```http
GET /rows/paginated?collection=64f123456789abcdef012345&page=1&perPage=20
```

#### Success Response (200)

```json
{
  "data": [
    {
      "_id": "64f123456789abcdef012351",
      "collection": "64f123456789abcdef012345",
      "data": {
        "name": "iPhone 15 Pro",
        "price": 999.99,
        "category": "Electronics"
      },
      "trashed": false,
      "trashedAt": null,
      "createdAt": "2023-09-01T12:00:00.000Z",
      "updatedAt": "2023-09-01T12:00:00.000Z"
    }
  ],
  "meta": {
    "total": 150,
    "perPage": 20,
    "page": 1,
    "lastPage": 8,
    "firstPage": 1
  }
}
```

#### Error Responses

**400 - Missing Collection Parameter:**
```json
{
  "message": "Collection ID is required",
  "code": 400,
  "cause": "INVALID_PARAMETERS"
}
```

**400 - Invalid Collection ID:**
```json
{
  "message": "Invalid collection ID format",
  "code": 400,
  "cause": "INVALID_PARAMETERS"
}
```

**400 - Invalid Query Parameters:**
```json
{
  "message": "Invalid pagination parameters",
  "code": 400,
  "cause": "INVALID_PARAMETERS"
}
```

**401 - Authentication Required:**
```json
{
  "message": "Authentication required",
  "code": 401,
  "cause": "AUTHENTICATION_REQUIRED"
}
```

**403 - Access Denied:**
```json
{
  "message": "Insufficient permissions to list rows in this collection",
  "code": 403,
  "cause": "ACCESS_DENIED"
}
```

**404 - Collection Not Found:**
```json
{
  "message": "Collection not found",
  "code": 404,
  "cause": "COLLECTION_NOT_FOUND"
}
```

**500 - Internal Server Error:**
```json
{
  "message": "Internal server error",
  "code": 500,
  "cause": "SERVER_ERROR"
}
```

---

### 5. Send Row to Trash

**PATCH** `/rows/{id}/trash`

Moves a row to trash (soft delete).

**Authentication Required:** Yes

#### Success Response (200)

```json
{
  "message": "Row moved to trash successfully"
}
```

#### Error Responses

**400 - Invalid ID Format:**
```json
{
  "message": "Invalid row ID format",
  "code": 400,
  "cause": "INVALID_PARAMETERS"
}
```

**401 - Authentication Required:**
```json
{
  "message": "Authentication required",
  "code": 401,
  "cause": "AUTHENTICATION_REQUIRED"
}
```

**403 - Access Denied:**
```json
{
  "message": "Insufficient permissions to trash this row",
  "code": 403,
  "cause": "ACCESS_DENIED"
}
```

**404 - Row Not Found:**
```json
{
  "message": "Row not found",
  "code": 404,
  "cause": "ROW_NOT_FOUND"
}
```

**500 - Internal Server Error:**
```json
{
  "message": "Internal server error",
  "code": 500,
  "cause": "SERVER_ERROR"
}
```

---

### 6. Remove Row from Trash

**PATCH** `/rows/{id}/restore`

Restores a row from trash.

**Authentication Required:** Yes

#### Success Response (200)

```json
{
  "message": "Row restored successfully"
}
```

#### Error Responses

**400 - Invalid ID Format:**
```json
{
  "message": "Invalid row ID format",
  "code": 400,
  "cause": "INVALID_PARAMETERS"
}
```

**401 - Authentication Required:**
```json
{
  "message": "Authentication required",
  "code": 401,
  "cause": "AUTHENTICATION_REQUIRED"
}
```

**403 - Access Denied:**
```json
{
  "message": "Insufficient permissions to restore this row",
  "code": 403,
  "cause": "ACCESS_DENIED"
}
```

**404 - Row Not Found:**
```json
{
  "message": "Row not found in trash",
  "code": 404,
  "cause": "ROW_NOT_FOUND"
}
```

**500 - Internal Server Error:**
```json
{
  "message": "Internal server error",
  "code": 500,
  "cause": "SERVER_ERROR"
}
```

---

### 7. Delete Row

**DELETE** `/rows/{id}`

Permanently deletes a row (hard delete).

**Authentication Required:** Yes

#### Success Response (200)

```json
{
  "message": "Row deleted successfully"
}
```

#### Error Responses

**400 - Invalid ID Format:**
```json
{
  "message": "Invalid row ID format",
  "code": 400,
  "cause": "INVALID_PARAMETERS"
}
```

**401 - Authentication Required:**
```json
{
  "message": "Authentication required",
  "code": 401,
  "cause": "AUTHENTICATION_REQUIRED"
}
```

**403 - Access Denied:**
```json
{
  "message": "Insufficient permissions to delete this row",
  "code": 403,
  "cause": "ACCESS_DENIED"
}
```

**404 - Row Not Found:**
```json
{
  "message": "Row not found",
  "code": 404,
  "cause": "ROW_NOT_FOUND"
}
```

**409 - Row Has Dependencies:**
```json
{
  "message": "Cannot delete row: referenced by other records",
  "code": 409,
  "cause": "ROW_IN_USE"
}
```

**500 - Internal Server Error:**
```json
{
  "message": "Internal server error",
  "code": 500,
  "cause": "SERVER_ERROR"
}
```

---

### 8. Add Reaction to Row

**POST** `/rows/{id}/reaction`

Adds a reaction (like, dislike, etc.) to a row.

**Authentication Required:** Yes

#### Request Body

```json
{
  "reaction": "like"
}
```

#### Success Response (200)

```json
{
  "message": "Reaction added successfully",
  "reactions": {
    "like": 5,
    "dislike": 1
  }
}
```

#### Error Responses

**400 - Invalid ID Format:**
```json
{
  "message": "Invalid row ID format",
  "code": 400,
  "cause": "INVALID_PARAMETERS"
}
```

**400 - Missing Reaction:**
```json
{
  "message": "Reaction type is required",
  "code": 400,
  "cause": "INVALID_PARAMETERS"
}
```

**400 - Invalid Reaction Type:**
```json
{
  "message": "Invalid reaction type. Must be one of: like, dislike, love, wow, angry",
  "code": 400,
  "cause": "INVALID_PARAMETERS"
}
```

**401 - Authentication Required:**
```json
{
  "message": "Authentication required",
  "code": 401,
  "cause": "AUTHENTICATION_REQUIRED"
}
```

**403 - Access Denied:**
```json
{
  "message": "Insufficient permissions to react to this row",
  "code": 403,
  "cause": "ACCESS_DENIED"
}
```

**404 - Row Not Found:**
```json
{
  "message": "Row not found",
  "code": 404,
  "cause": "ROW_NOT_FOUND"
}
```

**409 - Already Reacted:**
```json
{
  "message": "You have already reacted to this row",
  "code": 409,
  "cause": "REACTION_ALREADY_EXISTS"
}
```

**500 - Internal Server Error:**
```json
{
  "message": "Internal server error",
  "code": 500,
  "cause": "SERVER_ERROR"
}
```

---

### 9. Add Evaluation to Row

**POST** `/rows/{id}/evaluation`

Adds an evaluation/rating to a row.

**Authentication Required:** Yes

#### Request Body

```json
{
  "rating": 4.5,
  "comment": "Great product!"
}
```

#### Success Response (200)

```json
{
  "message": "Evaluation added successfully",
  "averageRating": 4.3,
  "totalEvaluations": 12
}
```

#### Error Responses

**400 - Invalid ID Format:**
```json
{
  "message": "Invalid row ID format",
  "code": 400,
  "cause": "INVALID_PARAMETERS"
}
```

**400 - Missing Rating:**
```json
{
  "message": "Rating is required for evaluation",
  "code": 400,
  "cause": "INVALID_PARAMETERS"
}
```

**400 - Invalid Rating:**
```json
{
  "message": "Rating must be between 1 and 5",
  "code": 400,
  "cause": "INVALID_PARAMETERS"
}
```

**400 - Invalid Comment Length:**
```json
{
  "message": "Comment must be less than 1000 characters",
  "code": 400,
  "cause": "INVALID_PARAMETERS"
}
```

**401 - Authentication Required:**
```json
{
  "message": "Authentication required",
  "code": 401,
  "cause": "AUTHENTICATION_REQUIRED"
}
```

**403 - Access Denied:**
```json
{
  "message": "Insufficient permissions to evaluate this row",
  "code": 403,
  "cause": "ACCESS_DENIED"
}
```

**404 - Row Not Found:**
```json
{
  "message": "Row not found",
  "code": 404,
  "cause": "ROW_NOT_FOUND"
}
```

**409 - Already Evaluated:**
```json
{
  "message": "You have already evaluated this row",
  "code": 409,
  "cause": "EVALUATION_ALREADY_EXISTS"
}
```

**500 - Internal Server Error:**
```json
{
  "message": "Internal server error",
  "code": 500,
  "cause": "SERVER_ERROR"
}
```

---

## Users

User management endpoints for creating, reading, updating, and listing users.

### 1. Create User

**POST** `/users`

Creates a new user account with name, email, password and assigns to a group.

**Authentication Required:** Yes

#### Request Body

```json
{
  "name": "Jane Smith",
  "email": "jane.smith@example.com",
  "password": "securepassword123",
  "group": "64f123456789abcdef012360"
}
```

#### Success Response (201)

```json
{
  "_id": "64f123456789abcdef012355",
  "name": "Jane Smith",
  "email": "jane.smith@example.com",
  "group": {
    "_id": "64f123456789abcdef012360",
    "name": "Editors",
    "description": "Content editors group",
    "slug": "editors",
    "permissions": [
      {
        "_id": "64f123456789abcdef012361",
        "name": "Create Content",
        "slug": "create-content"
      }
    ]
  },
  "active": true,
  "createdAt": "2023-09-01T13:00:00.000Z",
  "updatedAt": "2023-09-01T13:00:00.000Z"
}
```

#### Error Responses

**400 - Missing Required Fields:**
```json
{
  "message": "Name, email, password and group are required",
  "code": 400,
  "cause": "INVALID_PARAMETERS"
}
```

**400 - Invalid Email Format:**
```json
{
  "message": "Invalid email format",
  "code": 400,
  "cause": "INVALID_PARAMETERS"
}
```

**400 - Password Too Short:**
```json
{
  "message": "Password must be at least 8 characters",
  "code": 400,
  "cause": "INVALID_PARAMETERS"
}
```

**400 - Invalid Group ID:**
```json
{
  "message": "Invalid group ID format",
  "code": 400,
  "cause": "INVALID_PARAMETERS"
}
```

**401 - Authentication Required:**
```json
{
  "message": "Authentication required",
  "code": 401,
  "cause": "AUTHENTICATION_REQUIRED"
}
```

**403 - Access Denied:**
```json
{
  "message": "Insufficient permissions to create users",
  "code": 403,
  "cause": "ACCESS_DENIED"
}
```

**404 - Group Not Found:**
```json
{
  "message": "Specified user group not found",
  "code": 404,
  "cause": "GROUP_NOT_FOUND"
}
```

**409 - User Already Exists:**
```json
{
  "message": "User with this email already exists",
  "code": 409,
  "cause": "USER_ALREADY_EXISTS"
}
```

**500 - Internal Server Error:**
```json
{
  "message": "Internal server error",
  "code": 500,
  "cause": "SERVER_ERROR"
}
```

---

### 2. Get User by ID

**GET** `/users/{id}`

Retrieves a specific user by their ID with populated group information.

**Authentication Required:** Yes

#### Success Response (200)

*Same structure as Create User response*

#### Error Responses

**400 - Invalid ID Format:**
```json
{
  "message": "Invalid user ID format",
  "code": 400,
  "cause": "INVALID_PARAMETERS"
}
```

**401 - Authentication Required:**
```json
{
  "message": "Authentication required",
  "code": 401,
  "cause": "AUTHENTICATION_REQUIRED"
}
```

**403 - Access Denied:**
```json
{
  "message": "Insufficient permissions to access user details",
  "code": 403,
  "cause": "ACCESS_DENIED"
}
```

**404 - User Not Found:**
```json
{
  "message": "User not found",
  "code": 404,
  "cause": "USER_NOT_FOUND"
}
```

**500 - Internal Server Error:**
```json
{
  "message": "Internal server error",
  "code": 500,
  "cause": "SERVER_ERROR"
}
```

---

### 3. Update User

**PUT** `/users/{id}`

Updates an existing user's information.

**Authentication Required:** Yes

#### Request Body

```json
{
  "name": "Jane Updated Smith",
  "group": "64f123456789abcdef012362"
}
```

#### Success Response (200)

*Same structure as Create User response with updated data*

#### Error Responses

**400 - Invalid ID Format:**
```json
{
  "message": "Invalid user ID format",
  "code": 400,
  "cause": "INVALID_PARAMETERS"
}
```

**400 - Invalid Request Body:**
```json
{
  "message": "Request body contains invalid data",
  "code": 400,
  "cause": "INVALID_PARAMETERS"
}
```

**400 - Invalid Email Format:**
```json
{
  "message": "Invalid email format",
  "code": 400,
  "cause": "INVALID_PARAMETERS"
}
```

**401 - Authentication Required:**
```json
{
  "message": "Authentication required",
  "code": 401,
  "cause": "AUTHENTICATION_REQUIRED"
}
```

**403 - Access Denied:**
```json
{
  "message": "Insufficient permissions to update this user",
  "code": 403,
  "cause": "ACCESS_DENIED"
}
```

**404 - User Not Found:**
```json
{
  "message": "User not found",
  "code": 404,
  "cause": "USER_NOT_FOUND"
}
```

**404 - Group Not Found:**
```json
{
  "message": "Specified user group not found",
  "code": 404,
  "cause": "GROUP_NOT_FOUND"
}
```

**409 - Email Already Exists:**
```json
{
  "message": "Email already in use by another user",
  "code": 409,
  "cause": "EMAIL_ALREADY_EXISTS"
}
```

**500 - Internal Server Error:**
```json
{
  "message": "Internal server error",
  "code": 500,
  "cause": "SERVER_ERROR"
}
```

---

### 4. List Users (Paginated)

**GET** `/users/paginated`

Get a paginated list of users with optional filtering.

**Authentication Required:** Yes

#### Query Parameters

- `page` (optional): Page number (default: 1)
- `perPage` (optional): Items per page (max 100, default: 50)
- `search` (optional): Search term for filtering by name or email
- `group` (optional): Filter by user group ID
- `active` (optional): Filter by active status ("true"/"false")

#### Example Request

```http
GET /users/paginated?page=1&perPage=25&search=john&active=true
```

#### Success Response (200)

```json
{
  "data": [
    {
      "_id": "64f123456789abcdef012355",
      "name": "Jane Smith",
      "email": "jane.smith@example.com",
      "group": {
        "_id": "64f123456789abcdef012360",
        "name": "Editors",
        "slug": "editors"
      },
      "active": true,
      "createdAt": "2023-09-01T13:00:00.000Z",
      "updatedAt": "2023-09-01T13:00:00.000Z"
    }
  ],
  "meta": {
    "total": 45,
    "perPage": 25,
    "page": 1,
    "lastPage": 2,
    "firstPage": 1
  }
}
```

#### Error Responses

**400 - Invalid Query Parameters:**
```json
{
  "message": "Invalid pagination parameters",
  "code": 400,
  "cause": "INVALID_PARAMETERS"
}
```

**400 - Invalid Search Format:**
```json
{
  "message": "Search query must be at least 2 characters",
  "code": 400,
  "cause": "INVALID_PARAMETERS"
}
```

**400 - Invalid Group ID:**
```json
{
  "message": "Invalid group ID format",
  "code": 400,
  "cause": "INVALID_PARAMETERS"
}
```

**401 - Authentication Required:**
```json
{
  "message": "Authentication required",
  "code": 401,
  "cause": "AUTHENTICATION_REQUIRED"
}
```

**403 - Access Denied:**
```json
{
  "message": "Insufficient permissions to list users",
  "code": 403,
  "cause": "ACCESS_DENIED"
}
```

**500 - Internal Server Error:**
```json
{
  "message": "Internal server error",
  "code": 500,
  "cause": "SERVER_ERROR"
}
```

---

## User Groups

User group management endpoints for creating, reading, updating, and managing user groups and permissions.

### 1. Create User Group

**POST** `/user-groups`

Creates a new user group with permissions.

**Authentication Required:** Yes

#### Request Body

```json
{
  "name": "Administrators",
  "description": "System administrators with full access",
  "permissions": [
    "64f123456789abcdef012370",
    "64f123456789abcdef012371"
  ]
}
```

#### Success Response (201)

```json
{
  "_id": "64f123456789abcdef012365",
  "name": "Administrators",
  "description": "System administrators with full access",
  "slug": "administrators",
  "permissions": [
    {
      "_id": "64f123456789abcdef012370",
      "name": "Manage Users",
      "slug": "manage-users",
      "description": "Can create, update and delete users"
    },
    {
      "_id": "64f123456789abcdef012371",
      "name": "Manage Collections",
      "slug": "manage-collections",
      "description": "Can create, update and delete collections"
    }
  ],
  "createdAt": "2023-09-01T14:00:00.000Z",
  "updatedAt": "2023-09-01T14:00:00.000Z"
}
```

#### Error Responses

**400 - Missing Required Fields:**
```json
{
  "message": "Group name is required",
  "code": 400,
  "cause": "INVALID_PARAMETERS"
}
```

**400 - Invalid Permission IDs:**
```json
{
  "message": "Invalid permission ID format",
  "code": 400,
  "cause": "INVALID_PARAMETERS"
}
```

**401 - Authentication Required:**
```json
{
  "message": "Authentication required",
  "code": 401,
  "cause": "AUTHENTICATION_REQUIRED"
}
```

**403 - Access Denied:**
```json
{
  "message": "Insufficient permissions to create user groups",
  "code": 403,
  "cause": "ACCESS_DENIED"
}
```

**404 - Permission Not Found:**
```json
{
  "message": "One or more permissions not found",
  "code": 404,
  "cause": "PERMISSION_NOT_FOUND"
}
```

**409 - Group Already Exists:**
```json
{
  "message": "Group with this name already exists",
  "code": 409,
  "cause": "GROUP_ALREADY_EXISTS"
}
```

**500 - Internal Server Error:**
```json
{
  "message": "Internal server error",
  "code": 500,
  "cause": "SERVER_ERROR"
}
```

---

### 2. List User Groups

**GET** `/user-groups`

Get a list of all user groups.

**Authentication Required:** Yes

#### Success Response (200)

```json
[
  {
    "_id": "64f123456789abcdef012365",
    "name": "Administrators",
    "description": "System administrators with full access",
    "slug": "administrators",
    "permissions": [
      {
        "_id": "64f123456789abcdef012370",
        "name": "Manage Users",
        "slug": "manage-users"
      }
    ],
    "createdAt": "2023-09-01T14:00:00.000Z",
    "updatedAt": "2023-09-01T14:00:00.000Z"
  }
]
```

#### Error Responses

**401 - Authentication Required:**
```json
{
  "message": "Authentication required",
  "code": 401,
  "cause": "AUTHENTICATION_REQUIRED"
}
```

**403 - Access Denied:**
```json
{
  "message": "Insufficient permissions to list user groups",
  "code": 403,
  "cause": "ACCESS_DENIED"
}
```

**500 - Internal Server Error:**
```json
{
  "message": "Internal server error",
  "code": 500,
  "cause": "SERVER_ERROR"
}
```

---

### 3. List User Groups (Paginated)

**GET** `/user-groups/paginated`

Get a paginated list of user groups.

**Authentication Required:** Yes

#### Query Parameters

- `page` (optional): Page number (default: 1)
- `perPage` (optional): Items per page (max 100, default: 50)
- `search` (optional): Search term for filtering by name or description

#### Success Response (200)

```json
{
  "data": [
    {
      "_id": "64f123456789abcdef012365",
      "name": "Administrators",
      "description": "System administrators with full access",
      "slug": "administrators",
      "permissions": [
        {
          "_id": "64f123456789abcdef012370",
          "name": "Manage Users",
          "slug": "manage-users"
        }
      ],
      "createdAt": "2023-09-01T14:00:00.000Z",
      "updatedAt": "2023-09-01T14:00:00.000Z"
    }
  ],
  "meta": {
    "total": 5,
    "perPage": 50,
    "page": 1,
    "lastPage": 1,
    "firstPage": 1
  }
}
```

#### Error Responses

**400 - Invalid Query Parameters:**
```json
{
  "message": "Invalid pagination parameters",
  "code": 400,
  "cause": "INVALID_PARAMETERS"
}
```

**400 - Invalid Search Format:**
```json
{
  "message": "Search query must be at least 2 characters",
  "code": 400,
  "cause": "INVALID_PARAMETERS"
}
```

**401 - Authentication Required:**
```json
{
  "message": "Authentication required",
  "code": 401,
  "cause": "AUTHENTICATION_REQUIRED"
}
```

**403 - Access Denied:**
```json
{
  "message": "Insufficient permissions to list user groups",
  "code": 403,
  "cause": "ACCESS_DENIED"
}
```

**500 - Internal Server Error:**
```json
{
  "message": "Internal server error",
  "code": 500,
  "cause": "SERVER_ERROR"
}
```

---

### 4. Get User Group by ID

**GET** `/user-groups/{id}`

Retrieves a specific user group by its ID.

**Authentication Required:** Yes

#### Success Response (200)

*Same structure as Create User Group response*

#### Error Responses

**400 - Invalid ID Format:**
```json
{
  "message": "Invalid user group ID format",
  "code": 400,
  "cause": "INVALID_PARAMETERS"
}
```

**401 - Authentication Required:**
```json
{
  "message": "Authentication required",
  "code": 401,
  "cause": "AUTHENTICATION_REQUIRED"
}
```

**403 - Access Denied:**
```json
{
  "message": "Insufficient permissions to access user group details",
  "code": 403,
  "cause": "ACCESS_DENIED"
}
```

**404 - Group Not Found:**
```json
{
  "message": "User group not found",
  "code": 404,
  "cause": "GROUP_NOT_FOUND"
}
```

**500 - Internal Server Error:**
```json
{
  "message": "Internal server error",
  "code": 500,
  "cause": "SERVER_ERROR"
}
```

---

### 5. Update User Group

**PUT** `/user-groups/{id}`

Updates an existing user group.

**Authentication Required:** Yes

#### Request Body

```json
{
  "name": "Super Administrators",
  "description": "Updated description",
  "permissions": [
    "64f123456789abcdef012370",
    "64f123456789abcdef012371",
    "64f123456789abcdef012372"
  ]
}
```

#### Success Response (200)

*Same structure as Create User Group response with updated data*

#### Error Responses

**400 - Invalid ID Format:**
```json
{
  "message": "Invalid user group ID format",
  "code": 400,
  "cause": "INVALID_PARAMETERS"
}
```

**400 - Invalid Request Body:**
```json
{
  "message": "Request body contains invalid data",
  "code": 400,
  "cause": "INVALID_PARAMETERS"
}
```

**400 - Invalid Permission IDs:**
```json
{
  "message": "Invalid permission ID format",
  "code": 400,
  "cause": "INVALID_PARAMETERS"
}
```

**401 - Authentication Required:**
```json
{
  "message": "Authentication required",
  "code": 401,
  "cause": "AUTHENTICATION_REQUIRED"
}
```

**403 - Access Denied:**
```json
{
  "message": "Insufficient permissions to update user groups",
  "code": 403,
  "cause": "ACCESS_DENIED"
}
```

**404 - Group Not Found:**
```json
{
  "message": "User group not found",
  "code": 404,
  "cause": "GROUP_NOT_FOUND"
}
```

**404 - Permission Not Found:**
```json
{
  "message": "One or more permissions not found",
  "code": 404,
  "cause": "PERMISSION_NOT_FOUND"
}
```

**409 - Group Name Conflict:**
```json
{
  "message": "Group with this name already exists",
  "code": 409,
  "cause": "GROUP_ALREADY_EXISTS"
}
```

**409 - Group In Use:**
```json
{
  "message": "Cannot modify group: has assigned users",
  "code": 409,
  "cause": "GROUP_IN_USE"
}
```

**500 - Internal Server Error:**
```json
{
  "message": "Internal server error",
  "code": 500,
  "cause": "SERVER_ERROR"
}
```

---

## Storage

File storage endpoints for uploading and managing files.

### 1. Upload File

**POST** `/storage/upload`

Uploads a file to the storage system.

**Authentication Required:** Yes

#### Request Body

- **Content-Type**: `multipart/form-data`
- **Field**: `file` (File)

#### Example Request

```http
POST /storage/upload
Content-Type: multipart/form-data

--boundary
Content-Disposition: form-data; name="file"; filename="document.pdf"
Content-Type: application/pdf

[file binary data]
--boundary--
```

#### Success Response (201)

```json
{
  "_id": "64f123456789abcdef012380",
  "filename": "document.pdf",
  "originalName": "document.pdf",
  "size": 1048576,
  "type": "application/pdf",
  "url": "/storage/files/64f123456789abcdef012380/document.pdf",
  "createdAt": "2023-09-01T15:00:00.000Z",
  "updatedAt": "2023-09-01T15:00:00.000Z"
}
```

#### Error Responses

**400 - No File Provided:**
```json
{
  "message": "No file provided for upload",
  "code": 400,
  "cause": "INVALID_PARAMETERS"
}
```

**400 - Invalid File Type:**
```json
{
  "message": "File type not allowed",
  "code": 400,
  "cause": "INVALID_FILE_TYPE"
}
```

**400 - Invalid File Format:**
```json
{
  "message": "File format is not supported",
  "code": 400,
  "cause": "INVALID_PARAMETERS"
}
```

**400 - Corrupted File:**
```json
{
  "message": "File appears to be corrupted",
  "code": 400,
  "cause": "INVALID_PARAMETERS"
}
```

**401 - Authentication Required:**
```json
{
  "message": "Authentication required",
  "code": 401,
  "cause": "AUTHENTICATION_REQUIRED"
}
```

**403 - Access Denied:**
```json
{
  "message": "Insufficient permissions to upload files",
  "code": 403,
  "cause": "ACCESS_DENIED"
}
```

**413 - File Too Large:**
```json
{
  "message": "File size exceeds maximum allowed",
  "code": 413,
  "cause": "FILE_TOO_LARGE"
}
```

**422 - Validation Failed:**
```json
{
  "message": "File failed virus scan",
  "code": 422,
  "cause": "UNPROCESSABLE_ENTITY"
}
```

**429 - Too Many Requests:**
```json
{
  "message": "Upload rate limit exceeded",
  "code": 429,
  "cause": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 60
}
```

**507 - Insufficient Storage:**
```json
{
  "message": "Storage quota exceeded",
  "code": 507,
  "cause": "INSUFFICIENT_STORAGE"
}
```

**500 - Internal Server Error:**
```json
{
  "message": "Internal server error",
  "code": 500,
  "cause": "STORAGE_UPLOAD_ERROR"
}
```

---

### 2. Delete File

**DELETE** `/storage/{id}`

Permanently deletes a file from storage.

**Authentication Required:** Yes

#### Success Response (200)

```json
{
  "message": "File deleted successfully"
}
```

#### Error Responses

**400 - Invalid ID Format:**
```json
{
  "message": "Invalid file ID format",
  "code": 400,
  "cause": "INVALID_PARAMETERS"
}
```

**401 - Authentication Required:**
```json
{
  "message": "Authentication required",
  "code": 401,
  "cause": "AUTHENTICATION_REQUIRED"
}
```

**403 - Access Denied:**
```json
{
  "message": "Insufficient permissions to delete this file",
  "code": 403,
  "cause": "ACCESS_DENIED"
}
```

**404 - File Not Found:**
```json
{
  "message": "File not found",
  "code": 404,
  "cause": "FILE_NOT_FOUND"
}
```

**409 - File In Use:**
```json
{
  "message": "Cannot delete file: referenced by other records",
  "code": 409,
  "cause": "FILE_IN_USE"
}
```

**500 - Internal Server Error:**
```json
{
  "message": "Internal server error",
  "code": 500,
  "cause": "SERVER_ERROR"
}
```

---

## Profile

User profile management endpoints.

### 1. Get Profile

**GET** `/profile`

Retrieves the current user's profile information.

**Authentication Required:** Yes

#### Success Response (200)

```json
{
  "_id": "64f123456789abcdef012355",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "group": {
    "_id": "64f123456789abcdef012360",
    "name": "Administrators",
    "slug": "administrators",
    "permissions": [
      {
        "_id": "64f123456789abcdef012370",
        "name": "Manage Users",
        "slug": "manage-users"
      }
    ]
  },
  "active": true,
  "createdAt": "2023-09-01T10:00:00.000Z",
  "updatedAt": "2023-09-01T16:00:00.000Z"
}
```

#### Error Responses

**401 - Authentication Required:**
```json
{
  "message": "Authentication required",
  "code": 401,
  "cause": "AUTHENTICATION_REQUIRED"
}
```

**403 - Access Denied:**
```json
{
  "message": "Insufficient permissions to access profile",
  "code": 403,
  "cause": "ACCESS_DENIED"
}
```

**404 - Profile Not Found:**
```json
{
  "message": "User profile not found",
  "code": 404,
  "cause": "USER_NOT_FOUND"
}
```

**500 - Internal Server Error:**
```json
{
  "message": "Internal server error",
  "code": 500,
  "cause": "SERVER_ERROR"
}
```

---

### 2. Update Profile

**PUT** `/profile`

Updates the current user's profile information.

**Authentication Required:** Yes

#### Request Body

```json
{
  "name": "John Updated Doe",
  "email": "john.updated@example.com"
}
```

#### Success Response (200)

*Same structure as Get Profile response with updated data*

#### Error Responses

**400 - Invalid Request Body:**
```json
{
  "message": "Request body contains invalid data",
  "code": 400,
  "cause": "INVALID_PARAMETERS"
}
```

**400 - Invalid Email Format:**
```json
{
  "message": "Invalid email format",
  "code": 400,
  "cause": "INVALID_PARAMETERS"
}
```

**400 - Name Too Short:**
```json
{
  "message": "Name must be at least 2 characters",
  "code": 400,
  "cause": "INVALID_PARAMETERS"
}
```

**401 - Authentication Required:**
```json
{
  "message": "Authentication required",
  "code": 401,
  "cause": "AUTHENTICATION_REQUIRED"
}
```

**403 - Access Denied:**
```json
{
  "message": "Insufficient permissions to update profile",
  "code": 403,
  "cause": "ACCESS_DENIED"
}
```

**404 - Profile Not Found:**
```json
{
  "message": "User profile not found",
  "code": 404,
  "cause": "USER_NOT_FOUND"
}
```

**409 - Email Already Exists:**
```json
{
  "message": "Email already in use",
  "code": 409,
  "cause": "EMAIL_ALREADY_EXISTS"
}
```

**422 - Validation Failed:**
```json
{
  "message": "Profile data validation failed",
  "code": 422,
  "cause": "UNPROCESSABLE_ENTITY"
}
```

**500 - Internal Server Error:**
```json
{
  "message": "Internal server error",
  "code": 500,
  "cause": "SERVER_ERROR"
}
```

---

## Settings

Application settings management endpoints.

### 1. Get Settings

**GET** `/settings`

Retrieves application settings.

**Authentication Required:** Yes

#### Success Response (200)

```json
{
  "_id": "64f123456789abcdef012390",
  "appName": "LowCodeJS Platform",
  "appDescription": "A powerful low-code platform",
  "appLogo": {
    "_id": "64f123456789abcdef012391",
    "url": "/storage/app-logo.png",
    "filename": "app-logo.png",
    "type": "image/png"
  },
  "theme": {
    "primaryColor": "#007bff",
    "secondaryColor": "#6c757d"
  },
  "features": {
    "allowRegistration": true,
    "emailVerification": false,
    "magicLinkLogin": true
  },
  "updatedAt": "2023-09-01T17:00:00.000Z"
}
```

#### Error Responses

**401 - Authentication Required:**
```json
{
  "message": "Authentication required",
  "code": 401,
  "cause": "AUTHENTICATION_REQUIRED"
}
```

**403 - Access Denied:**
```json
{
  "message": "Insufficient permissions to access settings",
  "code": 403,
  "cause": "ACCESS_DENIED"
}
```

**500 - Internal Server Error:**
```json
{
  "message": "Internal server error",
  "code": 500,
  "cause": "SERVER_ERROR"
}
```

---

### 2. Update Settings

**PUT** `/settings`

Updates application settings.

**Authentication Required:** Yes

#### Request Body

```json
{
  "appName": "My Custom Platform",
  "theme": {
    "primaryColor": "#28a745",
    "secondaryColor": "#dc3545"
  },
  "features": {
    "allowRegistration": false,
    "emailVerification": true,
    "magicLinkLogin": true
  }
}
```

#### Success Response (200)

*Same structure as Get Settings response with updated data*

#### Error Responses

**400 - Invalid Request Body:**
```json
{
  "message": "Request body contains invalid data",
  "code": 400,
  "cause": "INVALID_PARAMETERS"
}
```

**400 - Invalid Configuration:**
```json
{
  "message": "Invalid settings configuration provided",
  "code": 400,
  "cause": "INVALID_PARAMETERS"
}
```

**400 - Invalid Theme Colors:**
```json
{
  "message": "Invalid color format for theme settings",
  "code": 400,
  "cause": "INVALID_PARAMETERS"
}
```

**401 - Authentication Required:**
```json
{
  "message": "Authentication required",
  "code": 401,
  "cause": "AUTHENTICATION_REQUIRED"
}
```

**403 - Access Denied:**
```json
{
  "message": "Insufficient permissions to update settings",
  "code": 403,
  "cause": "ACCESS_DENIED"
}
```

**422 - Validation Failed:**
```json
{
  "message": "Settings validation failed",
  "code": 422,
  "cause": "UNPROCESSABLE_ENTITY"
}
```

**500 - Internal Server Error:**
```json
{
  "message": "Internal server error",
  "code": 500,
  "cause": "SERVER_ERROR"
}
```

---

## System Endpoints

System utility endpoints for health checks, locales, and permissions.

### 1. Health Check

**GET** `/health`

Checks the API health status.

**Authentication Required:** No

#### Success Response (200)

```json
{
  "status": "ok",
  "timestamp": "2023-09-01T18:00:00.000Z",
  "uptime": 86400,
  "version": "1.0.0"
}
```

#### Error Responses

**500 - Service Unhealthy:**
```json
{
  "message": "Service is experiencing issues",
  "code": 500,
  "cause": "SERVER_ERROR"
}
```

**503 - Service Unavailable:**
```json
{
  "message": "Service temporarily unavailable",
  "code": 503,
  "cause": "SERVICE_UNAVAILABLE"
}
```

---

### 2. Welcome

**GET** `/welcome`

Welcome endpoint with basic API information.

**Authentication Required:** No

#### Success Response (200)

```json
{
  "message": "Welcome to LowCodeJS API",
  "version": "1.0.0",
  "documentation": "/documentation"
}
```

#### Error Responses

**500 - Internal Server Error:**
```json
{
  "message": "Internal server error",
  "code": 500,
  "cause": "SERVER_ERROR"
}
```

---

### 3. List Permissions

**GET** `/permissions`

Get a list of all available permissions.

**Authentication Required:** Yes

#### Success Response (200)

```json
[
  {
    "_id": "64f123456789abcdef012370",
    "name": "Manage Users",
    "slug": "manage-users",
    "description": "Can create, update and delete users",
    "category": "User Management"
  },
  {
    "_id": "64f123456789abcdef012371",
    "name": "Manage Collections",
    "slug": "manage-collections",
    "description": "Can create, update and delete collections",
    "category": "Content Management"
  }
]
```

#### Error Responses

**401 - Authentication Required:**
```json
{
  "message": "Authentication required",
  "code": 401,
  "cause": "AUTHENTICATION_REQUIRED"
}
```

**403 - Access Denied:**
```json
{
  "message": "Insufficient permissions to list permissions",
  "code": 403,
  "cause": "ACCESS_DENIED"
}
```

**500 - Internal Server Error:**
```json
{
  "message": "Internal server error",
  "code": 500,
  "cause": "SERVER_ERROR"
}
```

---

### 4. List Locales

**GET** `/locales`

Get a list of all available locales.

**Authentication Required:** No

#### Success Response (200)

```json
[
  {
    "_id": "64f123456789abcdef012395",
    "code": "en",
    "name": "English",
    "flag": "🇺🇸",
    "active": true
  },
  {
    "_id": "64f123456789abcdef012396",
    "code": "pt-BR",
    "name": "Português (Brasil)",
    "flag": "🇧🇷",
    "active": true
  }
]
```

#### Error Responses

**500 - Internal Server Error:**
```json
{
  "message": "Internal server error",
  "code": 500,
  "cause": "SERVER_ERROR"
}
```

---

### 5. Get Locale by Code

**GET** `/locales/{locale}`

Get translations for a specific locale.

**Authentication Required:** No

#### URL Parameters

- `locale` (required): Locale code (e.g., "en", "pt-BR")

#### Success Response (200)

```json
{
  "locale": "en",
  "translations": {
    "common": {
      "save": "Save",
      "cancel": "Cancel",
      "delete": "Delete"
    },
    "auth": {
      "login": "Login",
      "logout": "Logout",
      "register": "Register"
    },
    "collections": {
      "create": "Create Collection",
      "edit": "Edit Collection",
      "delete": "Delete Collection"
    }
  }
}
```

#### Error Responses

**400 - Invalid Locale Code:**
```json
{
  "message": "Invalid locale code format",
  "code": 400,
  "cause": "INVALID_PARAMETERS"
}
```

**404 - Locale Not Found:**
```json
{
  "message": "Locale not found or not supported",
  "code": 404,
  "cause": "LOCALE_NOT_FOUND"
}
```

**500 - Internal Server Error:**
```json
{
  "message": "Internal server error",
  "code": 500,
  "cause": "SERVER_ERROR"
}
```

---

## Common Error Responses

### Authentication Errors

**401 - Unauthorized:**
```json
{
  "message": "Authentication required",
  "code": 401,
  "cause": "AUTHENTICATION_REQUIRED"
}
```

### Validation Errors

**400 - Bad Request:**
```json
{
  "message": "Validation failed",
  "code": 400,
  "cause": "INVALID_PARAMETERS"
}
```

### Not Found Errors

**404 - Not Found:**
```json
{
  "message": "Resource not found",
  "code": 404,
  "cause": "RESOURCE_NOT_FOUND"
}
```

### Conflict Errors

**409 - Conflict:**
```json
{
  "message": "Resource already exists",
  "code": 409,
  "cause": "RESOURCE_ALREADY_EXISTS"
}
```

### Server Errors

**500 - Internal Server Error:**
```json
{
  "message": "Internal server error",
  "code": 500,
  "cause": "SERVER_ERROR"
}
```

---

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Authentication endpoints**: 5 requests per minute per IP
- **File upload endpoints**: 10 requests per minute per authenticated user
- **General endpoints**: 100 requests per minute per authenticated user

When rate limit is exceeded:

**429 - Too Many Requests:**
```json
{
  "message": "Too many requests",
  "code": 429,
  "cause": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 60
}
```

---

## Pagination

All paginated endpoints follow the same pattern:

### Request Parameters
- `page`: Page number (starts from 1)
- `perPage`: Number of items per page (max 100)

### Response Format
```json
{
  "data": [...],
  "meta": {
    "total": 150,
    "perPage": 20,
    "page": 1,
    "lastPage": 8,
    "firstPage": 1
  }
}
```

---

## OpenAPI Documentation

Interactive API documentation is available at:
- **Local**: `http://localhost:3000/documentation`
- **Demo**: `https://api.demo.lowcodejs.org/documentation`

The OpenAPI specification can be accessed at:
- **Local**: `http://localhost:3000/openapi.json`
- **Demo**: `https://api.demo.lowcodejs.org/openapi.json`