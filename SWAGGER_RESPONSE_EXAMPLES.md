# Swagger Response Examples Implementation

## Overview
All API endpoints now include comprehensive response body examples in the Swagger documentation. This allows developers to see exactly what the API responses look like before making requests.

## Changes Made

### 1. Comments Routes (`src/routes/comments.ts`)
Added response examples to all 5 endpoints:
- **GET /comments** - Returns list of comments with pagination support
- **GET /comments/:id** - Returns single comment by ID
- **POST /comments** - Creates new comment with example response
- **PUT /comments/:id** - Updates comment with example response
- **DELETE /comments/:id** - Deletes comment with example response

Example response structure:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "content": "Great post!",
    "postId": 1,
    "authorId": 1,
    "parentId": null,
    "createdAt": "2026-05-14T13:20:36.000Z",
    "updatedAt": "2026-05-14T13:20:36.000Z"
  },
  "message": "Comments retrieved successfully"
}
```

### 2. Users Routes (`src/routes/users.ts`)
Added response examples to all 7 endpoints:
- **GET /users** - Returns list of all users
- **GET /users/:id** - Returns single user by ID
- **POST /users** - Creates new user (201 status)
- **PUT /users/:id** - Updates user with example response
- **DELETE /users/:id** - Soft deletes user (sets isActive to false)
- **GET /users/current** - Returns current logged-in user info
- **DELETE /users/logout** - Logs out user and deletes session

Example user response:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "john@example.com",
    "username": "john_doe",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user",
    "isActive": true,
    "createdAt": "2026-05-14T13:20:36.000Z",
    "updatedAt": "2026-05-14T13:20:36.000Z"
  },
  "message": "User retrieved successfully"
}
```

### 3. Posts Routes (`src/routes/posts.ts`)
Added response examples to all 5 endpoints:
- **GET /posts** - Returns list of all posts
- **GET /posts/:id** - Returns single post by ID
- **POST /posts** - Creates new post with example response
- **PUT /posts/:id** - Updates post with example response
- **DELETE /posts/:id** - Deletes post permanently

Example post response:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "My First Post",
    "content": "This is the content of my first post",
    "authorId": 1,
    "status": "published",
    "publishedAt": "2026-05-14T13:20:36.000Z",
    "createdAt": "2026-05-14T13:20:36.000Z",
    "updatedAt": "2026-05-14T13:20:36.000Z"
  },
  "message": "Post retrieved successfully"
}
```

### 4. Auth Routes (`src/routes/auth.ts`)
Added response examples to both endpoints:
- **POST /auth/register** - User registration (201 status)
- **POST /auth/login** - User login with token response

Example login response:
```json
{
  "data": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
}
```

## How to View in Swagger UI

1. Start the development server:
   ```bash
   bun run dev
   ```

2. Open Swagger UI in your browser:
   ```
   http://localhost:3000/docs
   ```

3. Click on any endpoint to expand it
4. Scroll down to see the "Responses" section
5. Each response now includes a complete example with all fields populated

## Response Example Format

All responses follow the OpenAPI 3.0 specification with:
- **description**: Human-readable description of the response
- **content**: Content type (application/json)
- **example**: Complete example response body with realistic data

## Status Codes Documented

- **200**: Successful GET, PUT, DELETE operations
- **201**: Successful POST operations (resource created)
- **400**: Bad request or validation errors
- **401**: Unauthorized (missing or invalid token)
- **404**: Resource not found
- **409**: Conflict (duplicate entry)
- **500**: Server error

## Benefits

✅ Developers can see exact response structure before making requests
✅ Reduces API integration time and errors
✅ Provides clear examples of all fields and data types
✅ Shows realistic data examples for testing
✅ Improves API documentation quality
✅ Helps with frontend development and testing

## Testing

All endpoints have been tested and are working correctly. The Swagger UI now displays:
- Complete request/response schemas
- Example response bodies for each endpoint
- Proper HTTP status codes
- Field descriptions and types
